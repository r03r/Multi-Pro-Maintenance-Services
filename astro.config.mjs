// @ts-check
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
    output: "static", // Cambia a 'server' si en el futuro necesitas Server-Side Rendering (SSR)
    adapter: vercel(),
});
