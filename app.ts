import express from 'express';
import os from 'os';
import cors from 'cors';
import apiRoutes from './src/routes/index.js';
import { PORT, CLIENT_URLS } from './src/config/env.config.js';

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      // Ignora IPs internas (127.0.0.1) y solo toma IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  return 'localhost'; // Fallback
}

const app = express();
const LOCAL_IP = getLocalIP();

// CORS - usa CLIENT_URLS de env (producción) + localhost (desarrollo)
const allowedOrigins = [
  ...CLIENT_URLS.split(',').map(url => url.trim()),
  'http://localhost:5173',
  `http://${LOCAL_IP}:5173`
];

// Middlewares básicos
app.use(express.json()); // Vital para poder recibir JSON en el body
app.use(cors({
  origin: allowedOrigins
}));

// Rutas
// Prefijamos todas las rutas con /api/v1 para versionado
app.use('/api/v1', apiRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 Servidor iniciado:\n');
  console.log(`   📍 Local:     http://localhost:${PORT}`);
  console.log(`   📱 Red Local: http://${LOCAL_IP}:${PORT}`);
  console.log('\n   📋 CORS habilitado para:');
  allowedOrigins.forEach(origin => console.log(`      - ${origin}`));
  console.log('');
});