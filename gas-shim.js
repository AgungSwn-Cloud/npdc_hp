/* gas-shim.js
 * Meniru google.script.run supaya Index asli (yang memanggil google.script.run...)
 * bisa dipakai apa adanya di GitHub Pages. Panggilan dikirim lewat fetch ke Apps Script (doPost).
 * Pasang di <head> index.html SEBELUM script aplikasi:  <script src="gas-shim.js"></script>
 */
(function () {
  // === GANTI jika URL deployment Apps Script berubah ===
  var APP_URL = "https://script.google.com/macros/s/AKfycbxAx53J3J8X4qf50BR1uAnAjLote7avq9rK6uzaZgS8LnAL5V0maQm7ml3Mpf8F3VGlSA/exec";

  function kirim(nama, args) {
    // Content-Type dibiarkan text/plain (default untuk string) agar tidak memicu preflight CORS.
    var body = (nama === 'api')
      ? {fn: 'api', token: args[0], f: args[1], args: args[2] || []}
      : {fn: nama, args: args};
    return fetch(APP_URL, {method: 'POST', body: JSON.stringify(body), redirect: 'follow'})
      .then(function (r) { return r.text(); })
      .then(function (t) {
        var j;
        try { j = JSON.parse(t); }
        catch (e) { throw new Error('Server tidak mengembalikan data. Pastikan deployment diatur "Siapa saja" dan sudah versi baru.'); }
        if (!j.ok) throw new Error(j.error || 'Terjadi kesalahan di server.');
        return j.data;
      });
  }

  function runner(ok, fail, uo) {
    return new Proxy({}, {
      get: function (_, nama) {
        if (nama === 'withSuccessHandler') return function (f) { return runner(f, fail, uo); };
        if (nama === 'withFailureHandler') return function (f) { return runner(ok, f, uo); };
        if (nama === 'withUserObject') return function (o) { return runner(ok, fail, o); };
        return function () {
          var args = Array.prototype.slice.call(arguments);
          kirim(String(nama), args).then(
            function (d) { if (ok) ok(d, uo); },
            function (e) { if (fail) fail(e, uo); else console.error(e); }
          );
        };
      }
    });
  }

  window.google = window.google || {};
  window.google.script = window.google.script || {};
  window.google.script.run = runner(null, null, undefined);
  window.google.script.host = {close: function () {}, setHeight: function () {}, setWidth: function () {}, editor: {focus: function () {}}};
})();
