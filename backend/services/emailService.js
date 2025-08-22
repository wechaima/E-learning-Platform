import nodemailer from 'nodemailer';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Envoie un email de notification de mise à jour de cours
 * @param {Object} course - Le cours mis à jour
 * @param {Object|null} updatedChapter - Le chapitre modifié/ajouté (optionnel)
 * @param {Array} recipients - Liste des étudiants à notifier
 */
export const sendCourseUpdateEmail = async (course, updatedChapter, recipients) => {
  try {
    if (!recipients || recipients.length === 0) return;

    const courseLink = `${process.env.FRONTEND_URL}/courses/${course._id}`;
    
    let emailSubject = `[Mise à jour] ${course.title}`;
    let emailText = `Bonjour,\n\n`;
    emailText += `Le cours "${course.title}" a été mis à jour.\n\n`;

    if (updatedChapter) {
      emailText += `Nouveautés dans le chapitre : ${updatedChapter.title}\n`;
      
      if (updatedChapter.sections && updatedChapter.sections.length > 0) {
        emailText += `Sections ajoutées/modifiées :\n`;
        updatedChapter.sections.forEach(section => {
          emailText += `- ${section.title}\n`;
        });
      }
    }

    emailText += `\nAccédez au cours : ${courseLink}\n\n`;
    emailText += `Cordialement,\nL'équipe pédagogique`;

    // Envoi en masse avec BCC pour éviter de divulguer les emails
    await transporter.sendMail({
      from: `"Plateforme Éducative" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      bcc: recipients.map(r => r.email),
      subject: emailSubject,
      text: emailText,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Mise à jour du cours : ${course.title}</h2>
          <p>Le cours a été mis à jour avec de nouveaux contenus.</p>
          
          ${updatedChapter ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0;">Chapitre : ${updatedChapter.title}</h3>
              ${updatedChapter.sections && updatedChapter.sections.length > 0 ? `
                <p>Sections :</p>
                <ul style="padding-left: 20px;">
                  ${updatedChapter.sections.map(s => `<li>${s.title}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          ` : ''}
          
          
          
          <p style="margin-top: 30px; color: #7f8c8d; font-size: 0.9em;">
            Vous recevez cet email car vous êtes inscrit à ce cours.
          </p>
        </div>
      `
    });

    console.log(`Notification envoyée à ${recipients.length} étudiants pour le cours ${course._id}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
    // Ne pas bloquer le processus même en cas d'erreur d'envoi d'email
  }
};