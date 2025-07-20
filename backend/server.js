import 'dotenv/config';
import app from './app.js';
import mongoose from 'mongoose';
import { initAdmin } from './controllers/authController.js';


// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB');
    initAdmin(); // Crée le compte admin si inexistant
  })
  .catch(err => console.error('❌ Erreur MongoDB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});