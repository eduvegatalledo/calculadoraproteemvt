const assert = require('assert');

function escapeHtml(s) {
  return (s || '').replace(/[&<>"'\/]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }[c]));
}

assert.strictEqual(escapeHtml('&'), '&amp;');
assert.strictEqual(escapeHtml('<'), '&lt;');
assert.strictEqual(escapeHtml('>'), '&gt;');
assert.strictEqual(escapeHtml('"'), '&quot;');
assert.strictEqual(escapeHtml("'"), '&#x27;');
assert.strictEqual(escapeHtml('/'), '&#x2F;');
assert.strictEqual(escapeHtml("&<>\"'/"), '&amp;&lt;&gt;&quot;&#x27;&#x2F;');

console.log('escapeHtml tests passed');
