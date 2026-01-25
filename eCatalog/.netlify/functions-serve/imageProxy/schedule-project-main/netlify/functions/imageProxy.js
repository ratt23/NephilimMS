var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../netlify/functions/imageProxy.js
var imageProxy_exports = {};
__export(imageProxy_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(imageProxy_exports);
async function handler(event, context) {
  const origin = event.headers.origin || event.headers.Origin || "";
  const allowedOrigins = [
    "https://shab.web.id",
    "https://jadwaldoktershab.netlify.app",
    "https://dashdev1.netlify.app",
    "https://dashdev2.netlify.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173"
  ];
  const headers = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  try {
    const imageUrl = event.queryStringParameters?.url;
    if (!imageUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Image URL required" })
      };
    }
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ message: "Failed to fetch image" })
      };
    }
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();
    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400"
        // Cache for 1 day
      },
      body: Buffer.from(buffer).toString("base64"),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error("Image Proxy error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Server error", error: error.message })
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=imageProxy.js.map
