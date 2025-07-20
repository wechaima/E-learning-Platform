import User from '../models/User.js';

// Lister tous les formateurs
export const listFormateurs = async (req, res) => {
  try {
    const formateurs = await User.find(
      { role: 'formateur' },
      { nom: 1, prenom: 1, email: 1, specialite: 1, _id: 1 }
    );
    res.status(200).json(formateurs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Modifier un formateur
export const updateFormateur = async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, specialite } = req.body;

  try {
    // Vérifier que l'utilisateur existe et est un formateur
    const formateur = await User.findOne({ _id: id, role: 'formateur' });
    if (!formateur) {
      return res.status(404).json({ message: 'Formateur non trouvé' });
    }

    // Mise à jour
    const updatedFormateur = await User.findByIdAndUpdate(
      id,
      { nom, prenom, email, specialite },
      { new: true, select: 'nom prenom email specialite' }
    );

    res.status(200).json({
      message: 'Formateur mis à jour',
      formateur: updatedFormateur
    });
  } catch (err) {
    
      res.status(500).json({ message: err.message });
    }
  }
;

// Supprimer un formateur
export const deleteFormateur = async (req, res) => {
  const { id } = req.params;

  try {
    const formateur = await User.findOneAndDelete({ _id: id, role: 'formateur' });
    
    if (!formateur) {
      return res.status(404).json({ message: 'Formateur non trouvé' });
    }

    res.status(200).json({ message: 'Formateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};