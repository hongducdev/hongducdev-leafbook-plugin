globalThis.LeafBookPlugin = Object.freeze({
  id: "wattpad.stories",

  popular(page) {
    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const offset = (safePage - 1) * 20;
    const url = "https://www.wattpad.com/api/v3/stories?" +
      "filter=hot&limit=20&offset=" + offset +
      "&fields=id,title,cover,user(name),numParts,completed,description";
    let raw;
    try { raw = LeafBook.httpGet(url); } catch (e) {
      throw new Error("Không thể kết nối Wattpad. Hãy thử:\n" +
        "1. Đổi DNS thành 1.1.1.1 (Cloudflare) hoặc 8.8.8.8 (Google)\n" +
        "2. Trên Android: Cài đặt → Mạng → DNS riêng → nhập 1dot1dot1dot1.cloudflare-dns.com\n" +
        "3. Trên iOS: Cài đặt → Wi-Fi → (i) → Cấu hình DNS → Thủ công → thêm 1.1.1.1\n" +
        "4. Hoặc sử dụng VPN");
    }
    const payload = JSON.parse(raw);

    return (payload.stories || []).flatMap((story) => {
      const name = String(story.title || "").trim();
      const id = story.id;
      if (!name || !id) return [];
      const path = "wattpad://story/" + id;
      const cover = story.cover || undefined;
      return [{ name, path, cover }];
    });
  },

  article(path) {
    const storyMatch = String(path).match(/^wattpad:\/\/story\/(\d+)$/);
    if (!storyMatch) throw new Error("Liên kết Wattpad không hợp lệ");
    const storyId = storyMatch[1];

    const storyUrl = "https://www.wattpad.com/api/v3/stories/" + storyId +
      "?fields=id,title,cover,user(name),description,numParts,completed," +
      "parts(id,title,length,url)";
    let raw;
    try { raw = LeafBook.httpGet(storyUrl); } catch (e) {
      throw new Error("Không thể kết nối Wattpad. Hãy thử:\n" +
        "1. Đổi DNS thành 1.1.1.1 (Cloudflare) hoặc 8.8.8.8 (Google)\n" +
        "2. Trên Android: Cài đặt → Mạng → DNS riêng → nhập 1dot1dot1dot1.cloudflare-dns.com\n" +
        "3. Trên iOS: Cài đặt → Wi-Fi → (i) → Cấu hình DNS → Thủ công → thêm 1.1.1.1\n" +
        "4. Hoặc sử dụng VPN");
    }
    const story = JSON.parse(raw);
    const title = String(story.title || "Wattpad").trim();
    const author = (story.user && story.user.name) || "Unknown";
    const parts = story.parts || [];

    const htmlParts = [];
    htmlParts.push('<div class="story-meta">');
    if (story.cover) htmlParts.push('<img src="' + story.cover + '" alt="cover" style="max-width:200px" />');
    htmlParts.push("<p><strong>Tác giả:</strong> " + author + "</p>");
    if (story.description) htmlParts.push("<p>" + story.description + "</p>");
    htmlParts.push("<p><strong>Số chương:</strong> " + parts.length + (story.completed ? " (Hoàn thành)" : " (Đang viết)") + "</p>");
    htmlParts.push("</div>");
    htmlParts.push("<hr/>");

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const chapterText = LeafBook.httpGet("https://www.wattpad.com/apiv2/storytext?id=" + part.id);
      htmlParts.push("<h2>Chương " + (i + 1) + ": " + (part.title || "") + "</h2>");
      htmlParts.push(chapterText);
      htmlParts.push("<hr/>");
    }

    return { title: title + " - " + author, content: htmlParts.join("\n") };
  }
});
