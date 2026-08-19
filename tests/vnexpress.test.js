const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const elements = {
  title: { textContent: "Bài viết mới" },
  link: { textContent: "https://vnexpress.net/bai-viet-moi.html" },
  description: { textContent: '<img src="https://i1-vnexpress.vnecdn.net/cover.jpg">Tóm tắt' }
};
const imageAttributes = new Map([
  ["data-src", "/article.jpg"],
  ["src", "placeholder.jpg"],
  ["srcset", "article-2x.jpg 2x"]
]);
const image = {
  getAttribute(name) { return imageAttributes.get(name) || null; },
  setAttribute(name, value) { imageAttributes.set(name, value); },
  removeAttribute(name) { imageAttributes.delete(name); }
};
const linkAttributes = new Map([["href", "/bai-lien-quan.html"]]);
const link = {
  getAttribute(name) { return linkAttributes.get(name) || null; },
  setAttribute(name, value) { linkAttributes.set(name, value); }
};
const articleBody = {
  innerHTML: "<p>Nội dung đầy đủ</p>",
  querySelectorAll(selector) {
    if (selector === "img") return [image];
    if (selector === "a[href]") return [link];
    return [];
  }
};
globalThis.LeafBook = Object.freeze({
  httpGet(url) {
    if (url === "https://vnexpress.net/rss/tin-moi-nhat.rss") return "<rss />";
    assert.equal(url, "https://vnexpress.net/bai-viet-moi.html");
    return "<article />";
  },
  parseXml() {
    return {
      querySelector() { return null; },
      querySelectorAll() { return [{ querySelector: (name) => elements[name] }]; }
    };
  },
  parseHtml(html) {
    if (html === "<article />") {
      return {
        querySelector(selector) {
          if (selector === "article.fck_detail, .fck_detail") return articleBody;
          if (selector === "h1.title-detail") return { textContent: "Bài viết mới" };
          if (selector === ".description") return { innerHTML: "Mở bài" };
          return null;
        }
      };
    }
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
assert.deepEqual(globalThis.LeafBookPlugin.article("https://vnexpress.net/bai-viet-moi.html"), {
  title: "Bài viết mới",
  content: '<p class="description">Mở bài</p><p>Nội dung đầy đủ</p>'
});
assert.equal(imageAttributes.get("src"), "https://vnexpress.net/article.jpg");
assert.equal(imageAttributes.has("srcset"), false);
assert.equal(linkAttributes.get("href"), "https://vnexpress.net/bai-lien-quan.html");
assert.throws(
  () => globalThis.LeafBookPlugin.article("https://example.com/bai-viet.html"),
  /không hợp lệ/
);
console.log("VnExpress RSS plugin test passed");
