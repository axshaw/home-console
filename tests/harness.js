// A deliberately tiny test harness: no dependencies, runs in any browser (including headless
// Chrome/Edge via tests/run.sh). Results go to #results and to document.title ("PASS 42" /
// "FAIL 3 of 42") so scripts can read them with --dump-dom.
(function () {
  'use strict';
  var tests = [];

  window.test = function (name, fn) { tests.push({ name: name, fn: fn }); };

  function fail(msg) { throw new Error(msg); }
  function show(v) { try { return JSON.stringify(v); } catch (e) { return String(v); } }

  window.assert = {
    ok: function (v, msg) { if (!v) fail(msg || 'expected truthy, got ' + show(v)); },
    equal: function (a, b, msg) { if (a !== b) fail((msg ? msg + ': ' : '') + 'expected ' + show(b) + ', got ' + show(a)); },
    near: function (a, b, eps, msg) { if (!(Math.abs(a - b) <= (eps || 1e-9))) fail((msg ? msg + ': ' : '') + 'expected ~' + b + ', got ' + a); },
    deepEqual: function (a, b, msg) { if (show(a) !== show(b)) fail((msg ? msg + ': ' : '') + 'expected ' + show(b) + ', got ' + show(a)); },
    throws: function (fn, msg) { try { fn(); } catch (e) { return; } fail(msg || 'expected an exception'); },
  };

  window.runTests = function () {
    var out = [], failed = 0;
    tests.forEach(function (t) {
      try { t.fn(); out.push('ok   ' + t.name); } catch (e) { failed++; out.push('FAIL ' + t.name + '\n       ' + e.message); }
    });
    var summary = failed ? 'FAIL ' + failed + ' of ' + tests.length : 'PASS ' + tests.length;
    document.title = summary;
    var pre = document.getElementById('results');
    pre.textContent = out.join('\n') + '\n\n' + summary;
    pre.className = failed ? 'fail' : 'pass';
    if (window.console) console.log(pre.textContent);
  };
})();
