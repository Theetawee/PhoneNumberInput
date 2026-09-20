export function initFlagPolyfill(): void {
    // Exit gracefully if running on the server during SSR (Next.js / Remix)
    if (typeof window === "undefined") return;

    // 1. Feature detection: Test if the browser natively supports colorful flag emojis
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000";
    ctx.textBaseline = "top";
    ctx.font = "32px Arial";

    // Render the Ugandan flag emoji (🇺🇬) to test browser rendering capabilities
    ctx.fillText("\uD83C\uDDFA\uD83C\uDDEC", 0, 0);

    const pixelData = ctx.getImageData(0, 0, 32, 32).data;
    let nativeSupport = false;

    // If color channels vary, a colorful flag rendered natively (e.g., macOS/iOS)
    for (let i = 0; i < pixelData.length; i += 4) {
        if (pixelData[i] !== pixelData[i + 1] || pixelData[i] !== pixelData[i + 2]) {
            nativeSupport = true;
            break;
        }
    }

    // 2. Fallback: If on Windows/system without flag fonts, inject the CDN style rule
    if (!nativeSupport && !document.getElementById("embedded-flag-font")) {
        const style = document.createElement("style");
        style.id = "embedded-flag-font";
        style.innerHTML = `
      @font-face {
        font-family: 'Twemoji Country Flags';
        src: url('https://cdn.jsdelivr.net/npm/country-flag-emoji-polyfill@0.1/dist/TwemojiCountryFlags.woff2') format('woff2');
        font-display: swap;
      }
    `;
        document.head.appendChild(style);
    }
}
