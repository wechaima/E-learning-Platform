import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


import authRoutes from './routes/auth.js';
import visiteurRoutes from './routes/visiteurRoutes.js';
import formateurRoutes from './routes/formateurRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import adminRoutes from './routes/admin.js';
import progressRoutes from './routes/progress.js';

import statsRoutes from './routes/stats.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/formateurs', authRoutes );
app.use('/api', visiteurRoutes);
app.use('/api/formateur', formateurRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/auth', adminRoutes);
app.use('/api/users', courseRoutes);
// Après les autres app.use()
app.use('/api/progress', progressRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stats', statsRoutes);
// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur' });
});

export default app;