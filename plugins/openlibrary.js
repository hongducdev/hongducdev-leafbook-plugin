globalThis.LeafBookPlugin = Object.freeze({
  id: "openlibrary.fiction",

  popular(page) {
    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const url = "https://openlibrary.org/search.json" +
      "?q=subject_key%3Afiction" +
      "&fields=key,title,cover_i" +
      "&sort=rating&limit=20&page=" + safePage;
    const payload = JSON.parse(LeafBook.httpGet(url));

    return (payload.docs || []).flatMap((book) => {
      const name = String(book.title || "").trim();
      const key = String(book.key || "").trim();
      if (!name || !key) return [];
      const path = key.startsWith("/")
        ? "https://openlibrary.org" + key
        : "https://openlibrary.org/works/" + key;
      const cover = book.cover_i
        ? "https://covers.openlibrary.org/b/id/" + book.cover_i + "-M.jpg"
        : undefined;
      return [{ name, path, cover }];
    });
  }
});
