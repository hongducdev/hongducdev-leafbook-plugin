const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const mockStoryList = JSON.stringify({
  stories: [
    { id: 12345, title: "Câu chuyện hay", cover: "https://img.wattpad.com/cover/12345.jpg", user: { name: "Author1" }, numParts: 3, completed: true },
    { id: 67890, title: "Truyện mới", cover: null, user: { name: "Author2" }, numParts: 1, completed: false }
  ]
});

const mockStoryDetail = JSON.stringify({
  id: 12345,
  title: "Câu chuyện hay",
  cover: "https://img.wattpad.com/cover/12345.jpg",
  user: { name: "Author1" },
  description: "Mô tả truyện",
  numParts: 2,
  completed: true,
  parts: [
    { id: 111, title: "Khởi đầu", length: 1000, url: "https://www.wattpad.com/111" },
    { id: 222, title: "Kết thúc", length: 800, url: "https://www.wattpad.com/222" }
  ]
});

globalThis.LeafBook = Object.freeze({
  httpGet(url) {
    if (url.startsWith("https://www.wattpad.com/api/v3/stories?")) return mockStoryList;
    if (url.startsWith("https://www.wattpad.com/api/v3/stories/12345")) return mockStoryDetail;
    if (url === "https://www.wattpad.com/apiv2/storytext?id=111") return "<p>Nội dung chương 1</p>";
    if (url === "https://www.wattpad.com/apiv2/storytext?id=222") return "<p>Nội dung chương 2</p>";
    throw new Error("Unexpected URL: " + url);
  },
  parseXml() { throw new Error("Should not be called"); },
  parseHtml() { throw new Error("Should not be called"); }
});

vm.runInThisContext(fs.readFileSync("plugins/wattpad.js", "utf8"), { filename: "wattpad.js" });

// Test popular()
const popular = globalThis.LeafBookPlugin.popular(1);
assert.equal(popular.length, 2);
assert.deepEqual(popular[0], {
  name: "Câu chuyện hay",
  path: "wattpad://story/12345",
  cover: "https://img.wattpad.com/cover/12345.jpg"
});
assert.deepEqual(popular[1], {
  name: "Truyện mới",
  path: "wattpad://story/67890",
  cover: undefined
});

// Test popular() page 2
const popular2 = globalThis.LeafBookPlugin.popular(2);
assert.equal(popular2.length, 2);

// Test article()
const article = globalThis.LeafBookPlugin.article("wattpad://story/12345");
assert.equal(article.title, "Câu chuyện hay - Author1");
assert.ok(article.content.includes("Nội dung chương 1"));
assert.ok(article.content.includes("Nội dung chương 2"));
assert.ok(article.content.includes("Tác giả:"));
assert.ok(article.content.includes("Mô tả truyện"));
assert.ok(article.content.includes("Hoàn thành"));
assert.ok(article.content.includes("Chương 1: Khởi đầu"));
assert.ok(article.content.includes("Chương 2: Kết thúc"));

// Test invalid path
assert.throws(
  () => globalThis.LeafBookPlugin.article("https://example.com/story"),
  /không hợp lệ/
);

console.log("Wattpad plugin test passed");
