'use strict';

var fs = require('fs');
var path = require('path');
var test = require('tape');
var browserify = require('browserify');
var plugin = require('../');

var tests = [
  {
    name: 'basic'
  }
];

tests.forEach(testFromConfig);

function testFromConfig(config) {
  var fixtures = getFixtures(config.name);
  runTest(config.name, fixtures.sourcePath, fixtures.expectedCss, config.opts);
}

function runTest(name, sourcePath, expectedCss, opts) {
  test('test ' + name, function t(assert) {
    var b = browserify('./test/basic.source.csjs.js');
    b.plugin(plugin);

    var bundle = b.bundle(function(){});
    bundle.on('extracted_csjs_stream', function (css) {
      var output = '';
      css.on('data', function(buffer) {
        output += buffer;
      });
      css.on('end', function() {
        assert.equal(output, expectedCss, 'css matches expected');
        assert.end();
      });
    });
  });
}

function getFixtures(name) {
  var sourcePath = './test/' + name + '.source.js';
  var cssPath = path.join(__dirname, name + '.expected.css');

  return {
    sourcePath: sourcePath,
    expectedCss: fs.readFileSync(cssPath, 'utf8')
  }
}
