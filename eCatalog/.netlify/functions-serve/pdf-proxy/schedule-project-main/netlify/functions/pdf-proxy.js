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

// ../netlify/functions/pdf-proxy.js
var pdf_proxy_exports = {};
__export(pdf_proxy_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(pdf_proxy_exports);
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
    const pdfUrl = event.queryStringParameters?.url;
    if (!pdfUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "PDF URL required" })
      };
    }
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ message: "Failed to fetch PDF" })
      };
    }
    const pdfBuffer = await response.arrayBuffer();
    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline"
      },
      body: Buffer.from(pdfBuffer).toString("base64"),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error("PDF Proxy error:", error);
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
//# sourceMappingURL=pdf-proxy.js.map
