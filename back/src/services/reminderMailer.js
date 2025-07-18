const cron = require('node-cron');
const { models } = require('../models');
const { sendMail } = require('../utils/mail');

const LOGO_URL = 'https://toupaw.fr/assets/logo.png';

function getCurrentTimeHHMM() {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // "HH:mm"
}

function getMailContent(type) {
  if (type === 'walk') {
    return {
      subject: '🐕 C’est l’heure de la balade !',
      html: `
        <div style="background:#f6f8fa;padding:32px 0;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;">
          <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 8px #0001;padding:32px 24px 24px 24px;text-align:center;">
            <img src='${LOGO_URL}' alt='Toupaw' style='width:70px;margin-bottom:16px;border-radius:12px;' />
            <h1 style="font-size:1.7rem;margin:0 0 12px 0;">🐕 C’est l’heure de la balade !</h1>
            <p style="font-size:1.1rem;margin:0 0 18px 0;">Votre compagnon attend sa promenade avec impatience.<br>Profitez-en pour prendre l’air ensemble !</p>
            <div style="margin:24px 0 0 0;font-size:0.95rem;color:#666;">À bientôt sur <b>Toupaw</b> 🐾</div>
          </div>
        </div>
      `,
      text: "C’est l’heure de promener votre animal ! Profitez-en pour prendre l’air ensemble."
    };
  }
  if (type === 'meal') {
    return {
      subject: '🍽️ C’est l’heure du repas !',
      html: `
        <div style="background:#f6f8fa;padding:32px 0;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;">
          <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 8px #0001;padding:32px 24px 24px 24px;text-align:center;">
            <img src='${LOGO_URL}' alt='Toupaw' style='width:70px;margin-bottom:16px;border-radius:12px;' />
            <h1 style="font-size:1.7rem;margin:0 0 12px 0;">🍽️ C’est l’heure du repas !</h1>
            <p style="font-size:1.1rem;margin:0 0 18px 0;">N’oubliez pas de nourrir votre animal pour qu’il reste en pleine forme.<br>Un petit moment gourmand à partager !</p>
            <div style="margin:24px 0 0 0;font-size:0.95rem;color:#666;">À bientôt sur <b>Toupaw</b> 🐾</div>
          </div>
        </div>
      `,
      text: "C’est l’heure de donner à manger à votre animal ! Un petit moment gourmand à partager."
    };
  }
  if (type === 'health') {
    return {
      subject: '💉 Rappel santé pour votre animal',
      html: `
        <div style="background:#f6f8fa;padding:32px 0;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;">
          <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 8px #0001;padding:32px 24px 24px 24px;text-align:center;">
            <img src='${LOGO_URL}' alt='Toupaw' style='width:70px;margin-bottom:16px;border-radius:12px;' />
            <h1 style="font-size:1.7rem;margin:0 0 12px 0;">💉 Rappel santé</h1>
            <p style="font-size:1.1rem;margin:0 0 18px 0;">C’est le moment de penser à la santé de votre animal : vaccin, vermifuge, rendez-vous vétérinaire…<br>Merci de prendre soin de lui !</p>
            <div style="margin:24px 0 0 0;font-size:0.95rem;color:#666;">À bientôt sur <b>Toupaw</b> 🐾</div>
          </div>
        </div>
      `,
      text: "C’est le moment de penser à la santé de votre animal : vaccin, vermifuge, rendez-vous vétérinaire…"
    };
  }
  // fallback
  return {
    subject: 'Rappel Toupaw',
    html: `<div style="background:#f6f8fa;padding:32px 0;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;"><div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 8px #0001;padding:32px 24px 24px 24px;text-align:center;"><img src='${LOGO_URL}' alt='Toupaw' style='width:70px;margin-bottom:16px;border-radius:12px;' /><h1 style="font-size:1.7rem;margin:0 0 12px 0;">🐾 Rappel Toupaw</h1><p style="font-size:1.1rem;margin:0 0 18px 0;">C’est l’heure d’un rappel pour votre animal !</p><div style="margin:24px 0 0 0;font-size:0.95rem;color:#666;">À bientôt sur <b>Toupaw</b> 🐾</div></div></div>`,
    text: "C’est l’heure d’un rappel pour votre animal !"
  };
}

async function sendReminders() {
  const nowHHMM = getCurrentTimeHHMM();
  const allSettings = await models.NotificationSettings.findAll({ where: { enabled: true } });
  const userMap = {};
  for (const setting of allSettings) {
    const times = Array.isArray(setting.times) ? setting.times : [];
    if (times.includes(nowHHMM)) {
      if (!userMap[setting.user_id]) userMap[setting.user_id] = [];
      userMap[setting.user_id].push(setting);
    }
  }
  for (const userId of Object.keys(userMap)) {
    const user = await models.User.findByPk(userId);
    if (!user) continue;
    for (const setting of userMap[userId]) {
      const { subject, html, text } = getMailContent(setting.type);
      try {
        await sendMail({
          to: user.email,
          subject,
          text,
          html
        });
        console.log(`[RAPPEL] Mail envoyé à ${user.email} pour ${setting.type} à ${nowHHMM}`);
      } catch (err) {
        console.error(`[RAPPEL] Erreur envoi mail à ${user.email} :`, err.message);
      }
    }
  }
}

cron.schedule('* * * * *', () => {
  sendReminders().catch(console.error);
});

module.exports = { sendReminders }; 