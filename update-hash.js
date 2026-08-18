const crypto = require("node:crypto");
const fs = require("node:fs");

const catalog = JSON.parse(fs.readFileSync("leafbook-plugins.json", "utf8"));
for (const plugin of catalog) {
  const path = plugin.url.replace(/^\.\//, "");
  if (!path.startsWith("plugins/") || path.includes("..")) throw new Error(`URL script không hợp lệ: ${plugin.url}`);
  plugin.sha256 = crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
}
fs.writeFileSync("leafbook-plugins.json", JSON.stringify(catalog, null, 2) + "\n");
for (const plugin of catalog) console.log(`${plugin.id}: ${plugin.sha256}`);
