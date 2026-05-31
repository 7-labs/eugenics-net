import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://eugenics.net",
  output: "static",
  build: {
    format: "file"
  }
});
