import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import router from './routes/formateurRoutes.js';
import visiteurRoutes from './routes/visiteurRoutes.js';
import courseRoutes from './routes/courseRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/formateurs', router);
app.use('/api', visiteurRoutes);
app.use('/api/courses', courseRoutes);
// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur' });
});

export default app;