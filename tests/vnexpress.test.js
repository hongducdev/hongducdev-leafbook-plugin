const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const elements = {
  title: { textContent: "Bài viết mới" },
  link: { textContent: "https://vnexpress.net/bai-viet-moi.html" },
  description: { textContent: '<img src="https://i1-vnexpress.vnecdn.net/cover.jpg">Tóm tắt' }
};
globalThis.LeafBook = Object.freeze({
  httpGet(url) {
    assert.equal(url, "https://vnexpress.net/rss/tin-moi-nhat.rss");
    return "<rss />";
  },
  parseXml() {
    return {
      querySelector() { return null; },
      querySelectorAll() { return [{ querySelector: (name) => elements[name] }]; }
    };
  },
  parseHtml() {
    return { querySelector: () => ({ getAttribute: () => "https://i1-vnexpress.vnecdn.net/cover.jpg" }) };
  }
});

vm.runInThisContext(fs.readFileSync("plugins/vnexpress.js", "utf8"), { filename: "vnexpress.js" });

assert.deepEqual(globalThis.LeafBookPlugin.popular(1), [{
  name: "Bài viết mới",
  path: "https://vnexpress.net/bai-viet-moi.html",
  cover: "https://i1-vnexpress.vnecdn.net/cover.jpg"
}]);
assert.deepEqual(globalThis.LeafBookPlugin.popular(2), []);
console.log("VnExpress RSS plugin test passed");
