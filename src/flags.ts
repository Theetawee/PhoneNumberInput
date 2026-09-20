// src/flag-polyfill.ts

// Base64 string of the highly optimized Twemoji Country Flags font asset
const TWEMOJI_FONT_BASE64 =
    "data:font/woff2;base64,d09GMgABAAAAAAQoAA4AAAAABiwAAA...[TRUNCATED FOR BREVITY]...";

export function initFlagPolyfill() {
    if (typeof window === "undefined") return;

    // 1. Check if the browser already supports country flags natively (like macOS/iOS)
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000";
    ctx.textBaseline = "top";
    ctx.font = "32px Arial";
    // Render the Ugandan flag emoji (🇺🇬) to test system font capabilities
    ctx.fillText("\uD83C\uDDFA\uD83C\uDDEC", 0, 0);

    const pixelData = ctx.getImageData(0, 0, 32, 32).data;
    let isSupported = false;

    // A quick check to see if the browser rendered a real colorful flag or plain text letters
    for (let i = 0; i < pixelData.length; i += 4) {
        if (pixelData[i] !== pixelData[i + 1] || pixelData[i] !== pixelData[i + 2]) {
            isSupported = true;
            break;
        }
    }

    // 2. If it's a Windows machine or another platform without flag fonts, inject the style
    if (!isSupported && !document.getElementById("embedded-flag-font")) {
        const style = document.createElement("style");
        style.id = "embedded-flag-font";
        style.innerHTML = `
      @font-face {
        font-family: 'Twemoji Country Flags';
        src: url('${TWEMOJI_FONT_BASE64}') format('woff2');
        font-display: swap;
      }
    `;
        document.head.appendChild(style);
    }
}
