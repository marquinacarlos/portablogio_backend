import express from 'express';
import cors from 'cors';
import apiRoutes from './src/routes/index.js';
import { PORT, API_URL, CLIENT_URL } from './src/config/env.config.js';

const app = express();

// Middlewares básicos
app.use(express.json()); // Vital para poder recibir JSON en el body
app.use(cors({
  origin: CLIENT_URL
}));

// Rutas
// Prefijamos todas las rutas con /api/v1 para versionado
app.use('/api/v1', apiRoutes);

app.listen(PORT, () => {
  console.log(API_URL);
});