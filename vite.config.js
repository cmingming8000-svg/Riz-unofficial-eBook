import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import rizalBookPlugin from "./vite-plugin-book.js";

export default defineConfig({
  plugins: [rizalBookPlugin(), viteSingleFile()],
  build: {
    target: 'es2015',
  },
});
