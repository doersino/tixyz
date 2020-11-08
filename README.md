# tixyz



## Development

### Setup

TODO Fairly typical.

```bash
npm install
```

If you don't regularly work with Node.js, make sure `./node_modules/.bin/` is on your path:

```bash
export PATH="./node_modules/.bin:$PATH
```

Then:

### Workin' it

```
npm run start
```

TODO will open in browser, can now edit, will refresh on save. nifty.


### Build & Deploy

To generate a static version, TOOD

```bash
npm run build
```

TODO github pages

```sh
npm run deploy
```

This will execute `npm run build` and then use the `gh-pages` package to commit the now-current `dist/` directory to the gh-pages brachn (it will create it if it doesn't already exist).
