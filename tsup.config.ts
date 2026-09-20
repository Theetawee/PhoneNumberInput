import { defineConfig } from "tsup";

export default defineConfig({
    // 1. Entry point(s) for your source code
    entry: ["src/index.ts"],

    // 2. Output both ES Modules (.mjs) and CommonJS (.js) formats
    format: ["cjs", "esm"],

    // 3. Automatically generate TypeScript declaration files (.d.ts)
    dts: true,

    // 4. Critical: Do NOT bundle React into your package code
    external: ["react", "react-dom", "google-libphonenumber"],

    // 5. Bundle internal CSS/styles if you have them, or extract them cleanly
    injectStyle: false, // Set to true if you want CSS injected directly into JS

    // 6. Production optimizations
    clean: true, // Empties the /dist folder before every build
    minify: true, // Compresses the output code for smaller file sizes
    sourcemap: true, // Generates source maps for easier debugging by your users
    skipNodeModulesBundle: true,
});
