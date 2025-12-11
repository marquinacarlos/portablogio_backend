import express from 'express';
import apiRoutes from './src/routes/index.js';
import { PORT } from './src/config/env.config.js';

const app = express();

// Middlewares básicos
app.use(express.json()); // Vital para poder recibir JSON en el body

// Rutas
// Prefijamos todas las rutas con /api/v1 para versionado
app.use('/api/v1', apiRoutes);

app.listen(PORT || 3000, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});