// Smoke tests for every registered theme: it must mount into the stage and render a range of
// models (demo, all-zero, exporting at night, missing data, odd scales) without throwing.

function models() {
  var B = HC.model.build;
  var noon = new Date(2026, 5, 21, 12, 0), night = new Date(2026, 11, 24, 23, 30);
  return [
    ['demo', B(HC.sources.demo.readingsAt(0), { now: noon, link: 'demo' })],
    ['empty', B({}, { now: noon })],
    ['night export', B({ pv: 0, load: 0.4, gridOut: 2, batt: -2.4, soc: 55, dailyLoad: 9, dailyImport: 1 }, { now: night, link: 'ok' })],
    ['bad token', B({}, { now: night, link: 'bad token' })],
    ['huge system', B({ pv: 30, load: 12, gridIn: 9, batt: 15, soc: 100, strings: [8, 8, 7, 7] }, { now: noon, link: 'ok', max: { pv: 32, load: 15 } })],
  ];
}

HC.themes.names().forEach(function (name) {
  test('theme ' + name + ': registers with a label', function () {
    var theme = HC.themes.get(name);
    assert.ok(theme.label && theme.label.length > 1);
  });

  test('theme ' + name + ': mounts and updates without errors', function () {
    var theme = HC.themes.get(name), stage = document.createElement('div');
    stage.style.cssText = 'position:absolute; left:-2000px; width:1280px; height:800px; overflow:hidden';
    document.body.appendChild(stage);
    try {
      theme.mount(stage);
      assert.ok(stage.querySelectorAll('*').length > 10, 'renders some DOM');
      models().forEach(function (pair) {
        try { theme.update(pair[1]); theme.update(pair[1]); } catch (e) { throw new Error(pair[0] + ': ' + e.message); }
      });
    } finally {
      document.body.removeChild(stage); // also stops theme animation loops
    }
  });
});
