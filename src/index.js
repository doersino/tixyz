const count = 8;
const size = 24;
const spacing = 2;
const width = Math.sqrt(3) * (count * (size + spacing) - spacing);

import Zdog from "zdog";

import examples from './examples.json';

const runner = document.getElementById('code-runner').contentWindow;
const input = document.getElementById('input');
const editor = document.getElementById('editor');
const comment = document.getElementById('comment');
const output = document.getElementById('output');

let callback = function () {};
let loadTime = new Date();  // time at which the site was loaded, used to continue spinning the dots when changing the callback
let startTime = null;
let code = '';

output.style.width = output.style.height = `${width}px`;  // zdog will take care of retina-izing things

function readURL() {
  const url = new URL(document.location);

  if (url.searchParams.has('code')) {
    input.value = url.searchParams.get('code');
  }
}

readURL();

function checkLength() {
  if (code.length > 32) {
    editor.classList.add('over-limit');
  } else {
    editor.classList.remove('over-limit');
  }
}

function updateCallback() {
  code = input.value;
  startTime = null;

  checkLength();

  try {
    callback = runner.eval(`
      (function f(t,i,x,y,z) {
        try {
          with (Math) {
            return ${code.replace(/\\/g, ';')};
          }
        } catch (error) {
          return error;
        }
      })
    `);
  } catch (error) {
    callback = null;
  }
}

input.addEventListener('input', updateCallback);
updateCallback();

input.addEventListener('focus', function () {
  editor.classList.add('focus');
  updateComments([
    'hit "enter" to save in URL',
    'or get <a href="https://twitter.com/doersino/status/1325494757779513344">more info here</a>'
  ]);
});

input.addEventListener('blur', function () {
  updateCommentsForCode();
  editor.classList.remove('focus');
});

editor.addEventListener('submit', (event) => {
  event.preventDefault();
  const url = new URL(document.location);
  url.searchParams.set('code', code);
  history.replaceState(null, code, url);
});


let illo = new Zdog.Illustration({
  element: output,
  zoom: size,
  resize: true,
});

let isSpinning = true;
let dragInitiated = false;
let hasBeenDragged = false;
let clickStartTime = 0;
let clickTime = 0;  // used to pause spinning during clicks
let viewRotation = new Zdog.Vector();
let dragStartRX, dragStartRY;

new Zdog.Dragger({
  startElement: output,
  onDragStart: function() {
    dragInitiated = true;
    hasBeenDragged = false;
    clickStartTime = new Date();
    dragStartRX = viewRotation.x;
    dragStartRY = viewRotation.y;
  },
  onDragMove: function( pointer, moveX, moveY ) {
    if (moveX != 0 && moveY != 0) {
      let moveRX = moveY / illo.width * Zdog.TAU;
      let moveRY = moveX / illo.width * Zdog.TAU;
      viewRotation.x = dragStartRX - moveRX;
      viewRotation.y = dragStartRY - moveRY;
      hasBeenDragged = true;
    }
  },
  onDragEnd: function() {
    dragInitiated = false;
    clickTime += (new Date() - clickStartTime) / 1000;
    if (hasBeenDragged) {
      isSpinning = false;
    } else {
      nextExample();
    }
  },
});

let spheres = [];
for (let x = 0; x < count; x++) {
  for (let y = 0; y < count; y++) {
    for (let z = 0; z < count; z++) {
      spheres.push({
        x: x,
        y: y,
        z: z,
        zdog: new Zdog.Shape({
          addTo: illo,
          stroke: 1,
          color: '#fff',
          translate: {
            x: ((size + spacing) / size) * (x - count/2 + 0.5),
            y: ((size + spacing) / size) * (y - count/2 + 0.5),
            z: ((size + spacing) / size) * (z - count/2 + 0.5) },
        })
      });
    }
  }
}

function render() {
  let time = 0;

  if (startTime) {
    time = (new Date() - startTime) / 1000;
  } else {
    startTime = new Date();
  }

  if (!!callback) {
    let index = 0;
    spheres.forEach((sphere, index) => {
      const value = callback(time, index, sphere.x, sphere.y, sphere.z);

      sphere.zdog.stroke = Math.min(1, Math.abs(value));

      sphere.zdog.color = '#FFF';
      if (value < 0) {
        sphere.zdog.color = '#F24';
      }
    });
  }

  if (isSpinning && !dragInitiated) {
    const timeSinceLoad = (new Date() - loadTime) / 1000;
    viewRotation.x = 1/4 * Math.sin(timeSinceLoad - clickTime);
    viewRotation.y = timeSinceLoad / 2;
  }
  illo.rotate.set(viewRotation);
  illo.updateRenderGraph();

  window.requestAnimationFrame(render);
}

render();

function updateComments(comments) {
  const lines = comment.querySelectorAll('label');

  if (comments.length === 1) {
    lines[0].innerHTML = '&nbsp;';
    lines[1].innerHTML = `// ${comments[0]}`;
  } else {
    lines[0].innerHTML = `// ${comments[0]}`;
    lines[1].innerHTML = `// ${comments[1]}`;
  }
}

function updateCommentsForCode() {
  const code = input.value;

  const snippets = Object.values(examples);
  const comments = Object.keys(examples);
  const index = snippets.indexOf(code);
  const newComment = comments[index];

  if (!newComment) {
    return;
  }

  const newComments = newComment.split('\n');

  updateComments(newComments);
}

function nextExample() {
  const snippets = Object.values(examples);

  let index = snippets.indexOf(code);

  if (snippets[index + 1]) {
    index = index + 1;
  } else {
    return;
  }

  const newCode = snippets[index];
  input.value = newCode;

  updateCommentsForCode();

  updateCallback();
}

window.onpopstate = function (event) {
  readURL();
  updateCallback();
};

updateCommentsForCode();
