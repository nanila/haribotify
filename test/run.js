var test = require('tape');
var retrieve = require('../utils/retrieve');
var fs = require('fs');
var browserify = require('browserify');
var haribotify = require('../');
var vm = require('vm');

test('retrieve', function(t) {
  t.plan(1);

  var expected = fs.readFileSync('./expected.html', 'utf8');
  var result = retrieve('./data/base.html');
  t.equal(result, expected);
});

test('haribotify', function(t) {
  t.plan(1);

  var b = browserify('./entry.js');
  b.transform(haribotify);
  b.on('transform', function (tr, file) {
    if (tr.constructor.name !== 'Haribotify') { return; }
    tr.once('haribotify', function (result) {
      var html = fs.readFileSync('./expected.html', 'utf8');
      var replaced = html.replace(/\r\n|\r/g, "\\n");
      var expected = "module.exports = '" + replaced + "';";
      t.equal(result, expected);
    });
  });
  b.bundle();
});

test('browserify', function(t) {
  t.plan(1);

  var b = browserify('./entry.js');
  b.transform(haribotify);
  b.bundle(function(err, src) {
    var c = {};
    vm.runInNewContext(src, c);
    var expected = fs.readFileSync('./expected.html', 'utf8');
    var expectedJs = expected.replace(/\r\n|\r/g, "\n");
    t.equal(c.result, expectedJs);
  });
});