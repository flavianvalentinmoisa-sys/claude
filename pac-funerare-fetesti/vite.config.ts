import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { etichetaCap } from "./scripts/seo.ts";

/** Pune în <head> titlul, descrierea și datele JSON-LD generate din site.ts. */
function seoDinSite(): Plugin {
  return {
    name: "seo-din-site",
    transformIndexHtml(html) {
      return html.replace("<!--cap-->", etichetaCap());
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seoDinSite()],
});
