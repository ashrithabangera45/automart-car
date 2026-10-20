import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const sourceLogo = 'C:/Users/ashri/.gemini/antigravity-ide/brain/eb3f7b8a-bd82-4de5-b933-c84339adcf81/.user_uploaded/media_1791453126313.png';
const publicDir = path.resolve(__dirname, 'public');

try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const assetsDir = path.resolve(__dirname, 'src/assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  if (fs.existsSync(sourceLogo)) {
    fs.copyFileSync(sourceLogo, path.resolve(publicDir, 'logo.png'));
    fs.copyFileSync(sourceLogo, path.resolve(assetsDir, 'logo.png'));
  }
} catch (e) {
  console.error('Error copying logo:', e);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-logo',
      configureServer(server) {
        server.middlewares.use('/logo.png', (req, res, next) => {
          if (fs.existsSync(sourceLogo)) {
            res.setHeader('Content-Type', 'image/png');
            fs.createReadStream(sourceLogo).pipe(res);
          } else {
            next();
          }
        });
      }
    }
  ],
})

