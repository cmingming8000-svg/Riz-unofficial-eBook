import { defineConfig } from "vite";
import fs from 'fs';
import path from 'path';
import rizalBookPlugin from "./vite-plugin-book.js";

export default defineConfig({
  plugins: [
    rizalBookPlugin(),
    {
      name: 'cleanup',
      closeBundle() {
        // Remove everything except index.html
        const distDir = path.resolve('dist');
        if (!fs.existsSync(distDir)) return;
        const files = fs.readdirSync(distDir);
        for (const file of files) {
          if (file !== 'index.html') {
            const filePath = path.join(distDir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
              fs.rmSync(filePath, { recursive: true });
            } else {
              fs.unlinkSync(filePath);
            }
          }
        }
        console.log('🧹 Cleaned up - only dist/index.html remains');
      }
    }
  ],
  build: {
    emptyOutDir: true,
  },
});
