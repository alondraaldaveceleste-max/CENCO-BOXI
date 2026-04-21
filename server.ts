import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes / custom handlers here

  // Rutas amigables (antes de Vite)
  app.get('/dashboard', (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(__dirname, 'dist/dashboard.html'));
    } else {
      next(); // Deja que Vite lo maneje o usa el fallback abajo
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve from dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Cencosud corriendo en http://localhost:${PORT}`);
  });
}

startServer();
