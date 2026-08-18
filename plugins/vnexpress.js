globalThis.LeafBookPlugin = Object.freeze({
  id: "vnexpress.rss",

  popular(page) {
    if (Number(page) > 1) return [];
    const xml = LeafBook.httpGet("https://vnexpress.net/rss/tin-moi-nhat.rss");
    const document = LeafBook.parseXml(xml);
    if (document.querySelector("parsererror")) throw new Error("RSS VnExpress không hợp lệ");

    return [...document.querySelectorAll("item")].flatMap((item) => {
      const name = item.querySelector("title")?.textContent?.trim() || "";
      const path = item.querySelector("link")?.textContent?.trim() || "";
      if (!name || !path.startsWith("https://")) return [];
      const description = item.querySelector("description")?.textContent || "";
      const cover = LeafBook.parseHtml(description).querySelector("img")?.getAttribute("src") || undefined;
      return [{ name, path, cover }];
    });
  }
});
