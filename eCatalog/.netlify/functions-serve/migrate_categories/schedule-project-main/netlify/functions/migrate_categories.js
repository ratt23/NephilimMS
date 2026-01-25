// ../netlify/functions/migrate_categories.js
var API_URL = "http://127.0.0.1:8889/.netlify/functions/api";
var ADMIN_PASSWORD = "admin123";
var DEFAULT_CATEGORIES = [
  { id: "tarif-kamar", label: "Tarif Kamar" },
  { id: "fasilitas", label: "Fasilitas" },
  { id: "radiology", label: "Cek Harga Radiologi" },
  { id: "layanan-unggulan", label: "Layanan Unggulan" },
  { id: "contact-person", label: "Contact Person" }
];
async function migrate() {
  try {
    console.log("\u{1F504} Starting Migration via API...");
    console.log("\u{1F511} Logging in...");
    const loginRes = await fetch(`${API_URL}/login`, {
      method: "POST",
      body: JSON.stringify({ password: ADMIN_PASSWORD }),
      headers: { "Content-Type": "application/json" }
    });
    if (!loginRes.ok) throw new Error("Login failed: " + loginRes.statusText);
    const cookie = loginRes.headers.get("set-cookie");
    console.log("\u2705 Login successful");
    console.log("\u{1F4E5} Fetching current settings...");
    const settingsRes = await fetch(`${API_URL}/settings`, {
      headers: { "Cookie": cookie }
    });
    const settingsData = await settingsRes.json();
    const config = {};
    settingsData.forEach((item) => {
      config[item.key] = item.value;
    });
    let currentCategories = [];
    try {
      currentCategories = JSON.parse(config["ecatalog_categories"] || "[]");
    } catch (e) {
    }
    let currentVisibility = {};
    try {
      currentVisibility = JSON.parse(config["category_visibility"] || "{}");
    } catch (e) {
    }
    console.log(`Current: ${currentCategories.length} categories`);
    const updates = [];
    const newCategories = [...currentCategories];
    const existingIds = new Set(newCategories.map((c) => c.id));
    let catsChanged = false;
    DEFAULT_CATEGORIES.forEach((def) => {
      if (!existingIds.has(def.id)) {
        newCategories.push(def);
        existingIds.add(def.id);
        catsChanged = true;
        console.log(`+ Adding category: ${def.label}`);
      }
    });
    if (catsChanged || newCategories.length < DEFAULT_CATEGORIES.length) {
      updates.push({ key: "ecatalog_categories", value: JSON.stringify(newCategories) });
    }
    const newVisibility = { ...currentVisibility };
    let visChanged = false;
    DEFAULT_CATEGORIES.forEach((def) => {
      if (!newVisibility[def.id]) {
        newVisibility[def.id] = true;
        visChanged = true;
        console.log(`+ Resetting visibility for: ${def.id}`);
      }
    });
    if (visChanged) {
      updates.push({ key: "category_visibility", value: JSON.stringify(newVisibility) });
    }
    if (updates.length > 0) {
      console.log(`\u{1F4E4} Sending ${updates.length} updates...`);
      const updateRes = await fetch(`${API_URL}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookie
        },
        body: JSON.stringify(updates)
      });
      if (updateRes.ok) {
        console.log("\u2705 Migration Compeleted Successfully!");
      } else {
        console.log("\u274C Update failed with status: " + updateRes.status);
        const text = await updateRes.text();
        console.log("Response:", text);
      }
    } else {
      console.log("\u2705 No changes needed.");
    }
  } catch (e) {
    console.error("\u274C Migration Error:", e);
  }
}
migrate();
//# sourceMappingURL=migrate_categories.js.map
