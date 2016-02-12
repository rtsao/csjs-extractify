# csjs-extractify

[![build status][build-badge]][build-href]
[![coverage status][coverage-badge]][coverage-href]
[![dependencies status][deps-badge]][deps-href]

Browserify plugin to extract [csjs](https://github.com/rtsao/csjs) into an external css bundle at build time

### Usage

To use this plugin, create a seperate files for each CSJS module. For example:

**main.csjs.js**
```javascript
const csjs = require('csjs');

module.exports = csjs`

.foo {
  color: red;
}

`;
```

When bundling your app, all exported CSJS will be extracted into a single, static CSS bundle.

### Options
```
  --extension    [default: '.csjs.js']
  The file extension of your CSJS modules

  --output
  The path to write the output css bundle

```

### CLI usage

```
browserify -p [ csjs-extractify -o dist/main.css ] index.js
```

### API usage

Write to file:
```javascript
const browserify = require('browserify');
const extractify = require('csjs-extractify');

const b = browserify('./main.js');
b.plugin(extractify, {output: './dist/scoped.css'});
b.bundle();
```

Or grab output stream:
```javascript
const fs = require('fs');
const browserify = require('browserify');
const extractify = require('csjs-extractify');

const b = browserify('./main.js');
b.plugin(extractify);

const bundle = b.bundle();
bundle.on('extracted_csjs_stream', css => {
  css.pipe(fs.createWriteStream('scoped.css'));
});
```

### Limitations

* Your CSJS files must export the result of a CSJS tagged template string
* Your CSJS files (and any dependencies) must be executable natively on your version of Node without any transpilation or browserify transforms

More sophisticated extraction is being worked on, but this should cover many use cases for now.

[build-badge]: https://travis-ci.org/rtsao/csjs-extractify.svg?branch=master
[build-href]: https://travis-ci.org/rtsao/csjs-extractify
[coverage-badge]: https://coveralls.io/repos/rtsao/csjs-extractify/badge.svg?branch=master&service=github
[coverage-href]: https://coveralls.io/github/rtsao/csjs-extractify?branch=master
[deps-badge]: https://david-dm.org/rtsao/csjs-extractify.svg
[deps-href]: https://david-dm.org/rtsao/csjs-extractify
