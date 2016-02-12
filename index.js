'use strict';

var fs = require('fs');
var path = require('path');
var stream = require('stream');
var through2 = require('through2');
var requireFromString = require('require-from-string');
var getCss = require('csjs/get-css');

module.exports = function(browserify, options) {
  var extension = options.extension || '.csjs.js';
  var output = options.output || options.o;
  var files = [];
  var contents = {};
  var cssStream;

  var extensionSubstr = extension.length * -1;

  function extractionTransform(filename) {
    if (filename.substr(extensionSubstr) !== extension) {
      return through2();
    }

    var transform = through2(function(buf, enc, next) {
      var source = buf.toString('utf8');

      var css;
      try {
        css = getCss(requireFromString(source, filename));
      } catch (err) {
        return error(err);
      }

      if (css) {
        contents[filename] = css;
        files.push(filename);
      }

      this.push(source);
      next();
    });

    function error(msg) {
      var err = typeof msg === 'string' ? new Error(msg) : msg;
      transform.emit('error', err);
    }

    return transform;
  }

  browserify.transform(extractionTransform, {
    global: true
  });

  browserify.on('bundle', function (bundle) {
    // on each bundle, create a new stream b/c the old one might have ended
    cssStream = new stream.Readable();
    cssStream._read = function() {};

    bundle.emit('extracted_csjs_stream', cssStream);
    bundle.on('end', function () {
      var contentString = '';

      files.forEach(function(file) {
        contentString += contents[file];
      });

      cssStream.push(contentString);
      cssStream.push(null);

      if (output) {
        fs.writeFile(output, contentString, 'utf8', function (error) {
          // bundle was destroyed, emit new events on `browserify`
          if (error) browserify.emit('error', error);
          browserify.emit('extracted_csjs_stream_end', output);
        });
      }
    });
  });
};
