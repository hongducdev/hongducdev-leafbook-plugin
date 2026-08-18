const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let requestedUrl = "";
globalThis.LeafBook = Object.freeze({
  httpGet(url) {
    requestedUrl = url;
    return JSON.stringify({
      docs: [
        { key: "/works/OL1W", title: "First Book", cover_i: 123 },
        { key: "OL2W", title: "Second Book" },
        { key: "", title: "Invalid Book" }
      ]
    });
  }
});

vm.runInThisContext(fs.readFileSync("plugins/openlibrary.js", "utf8"), { filename: "openlibrary.js" });
const books = globalThis.LeafBookPlugin.popular(2);

assert.match(requestedUrl, /page=2$/);
assert.deepEqual(books, [
  {
    name: "First Book",
    path: "https://openlibrary.org/works/OL1W",
    cover: "https://covers.openlibrary.org/b/id/123-M.jpg"
  },
  {
    name: "Second Book",
    path: "https://openlibrary.org/works/OL2W",
    cover: undefined
  }
]);
console.log("Open Library plugin test passed");
