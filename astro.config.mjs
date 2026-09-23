// @ts-check
import { jevApi } from "./server/dev-api.js";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
    vite: { plugins: [jevApi()] },
    site: "https://multi-pro-maintenance-services.vercel.app",
    output: "static", // Cambia a 'server' si en el futuro necesitas Server-Side Rendering (SSR)
    integrations: [sitemap({
        filter: (page) => !/^\/(admin|email-signature|email-template)(\/|$)/.test(new URL(page).pathname),
    })],
});
