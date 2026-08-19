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
  },

  article(path) {
    const url = new URL(String(path));
    if (url.protocol !== "https:" || (url.hostname !== "vnexpress.net" && !url.hostname.endsWith(".vnexpress.net"))) {
      throw new Error("Liên kết bài viết VnExpress không hợp lệ");
    }

    const document = LeafBook.parseHtml(LeafBook.httpGet(url.href));
    const body = document.querySelector("article.fck_detail, .fck_detail");
    if (!body) throw new Error("Không tìm thấy nội dung bài viết VnExpress");

    body.querySelectorAll("script, style, iframe, form, button, input").forEach((node) => node.remove());
    body.querySelectorAll("img").forEach((image) => {
      const source = image.getAttribute("data-src") || image.getAttribute("src");
      if (source) image.setAttribute("src", new URL(source, url).href);
      image.removeAttribute("srcset");
      image.removeAttribute("data-srcset");
    });
    body.querySelectorAll("a[href]").forEach((link) => {
      link.setAttribute("href", new URL(link.getAttribute("href"), url).href);
    });

    const title = document.querySelector("h1.title-detail")?.textContent?.trim() || "VnExpress";
    const description = document.querySelector(".description")?.innerHTML?.trim() || "";
    return {
      title,
      content: (description ? '<p class="description">' + description + "</p>" : "") + body.innerHTML
    };
  }
});
