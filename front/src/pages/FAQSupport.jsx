import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Copy, CheckCircle, User, Shield, HelpCircle, Bug, Lightbulb, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    icon: <User className="h-5 w-5 text-emerald-500" />,
    title: "Compte & Connexion",
    questions: [
      {
        q: "Comment modifier mon mot de passe ?",
        a: "Va dans Paramètres du compte, puis clique sur 'Modifier le mot de passe'. Suis les instructions pour enregistrer un nouveau mot de passe sécurisé.",
      },
      {
        q: "J'ai oublié mon mot de passe, que faire ?",
        a: "Sur la page de connexion, clique sur 'Mot de passe oublié ?' et suis la procédure pour réinitialiser ton mot de passe par email.",
      },
      {
        q: "Comment supprimer mon compte ?",
        a: "Contacte le support via l'email ci-dessous pour demander la suppression définitive de ton compte. Nous traiterons ta demande sous 48h.",
      },
    ],
  },
  {
    icon: <Shield className="h-5 w-5 text-blue-500" />,
    title: "Sécurité & Confidentialité",
    questions: [
      {
        q: "Mes données sont-elles sécurisées ?",
        a: "Oui, toutes tes données sont stockées de façon sécurisée et ne sont jamais partagées sans ton consentement. Nous respectons la RGPD.",
      },
      {
        q: "Comment signaler un problème de sécurité ?",
        a: "Contacte-nous immédiatement via l'email support@toupaw.app en décrivant le problème rencontré.",
      },
    ],
  },
  {
    icon: <HelpCircle className="h-5 w-5 text-orange-500" />,
    title: "Utilisation de l'application",
    questions: [
      {
        q: "Comment ajouter un nouvel animal ?",
        a: "Va dans la section Multi-animaux puis clique sur 'Ajouter un animal'. Suis les instructions pour renseigner les informations de ton compagnon.",
      },
      {
        q: "Comment modifier ou supprimer un rappel ?",
        a: "Rends-toi dans la section Suivi > Rappels, puis clique sur le rappel à modifier ou supprimer.",
      },
      {
        q: "Comment gérer plusieurs animaux ?",
        a: "Utilise la section Multi-animaux pour ajouter, modifier ou supprimer des animaux. Tu peux passer de l'un à l'autre facilement.",
      },
    ],
  },
  {
    icon: <Bug className="h-5 w-5 text-red-500" />,
    title: "Bugs & Problèmes",
    questions: [
      {
        q: "L'application ne fonctionne pas correctement, que faire ?",
        a: "Vérifie ta connexion internet, puis essaie de redémarrer l'application. Si le problème persiste, contacte le support avec une description détaillée.",
      },
      {
        q: "Je rencontre un bug, comment le signaler ?",
        a: "Envoie-nous un email à support@toupaw.app avec une capture d'écran et la description du bug. Nous corrigerons au plus vite !",
      },
    ],
  },
  {
    icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
    title: "Suggestions & Améliorations",
    questions: [
      {
        q: "Puis-je proposer une fonctionnalité ?",
        a: "Oui ! Nous sommes à l'écoute de la communauté. Envoie-nous tes idées à support@toupaw.app, nous les étudierons avec attention.",
      },
    ],
  },
];

function Accordion({ title, icon, questions }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-emerald-100 shadow-sm mb-4">
      <button
        className="w-full flex items-center justify-between px-5 py-4 focus:outline-none"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex items-center gap-3 font-semibold text-base text-gray-900">{icon}{title}</span>
        {open ? <ChevronUp className="h-5 w-5 text-emerald-500" /> : <ChevronDown className="h-5 w-5 text-emerald-500" />}
      </button>
      {open && (
        <div className="px-6 pb-5">
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="mb-3">
                <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <span className="text-emerald-600">Q.</span> {q.q}
                </div>
                <div className="text-gray-700 pl-6 text-sm">{q.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FAQSupport() {
  const [copied, setCopied] = useState(false);
  const supportEmail = "support@toupaw.app";
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-semibold px-3 py-2 rounded-lg hover:bg-emerald-50 transition"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Retour
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-couleur-titre font-ranille">FAQ & Support</h1>
        </div>
        {/* Introduction */}
        <div className="bg-white/80 rounded-xl border border-emerald-100 shadow p-6 mb-8">
          <div className="text-base font-semibold text-emerald-700 mb-2">“Une question ? Un doute ? On est là pour toi et ton compagnon.”</div>
          <div className="text-gray-700 text-sm">Retrouve ici les réponses aux questions fréquentes, des conseils d’utilisation, et tous les moyens de contacter notre équipe. Notre mission : t’accompagner au quotidien pour le bien-être de ton animal.</div>
        </div>
        {/* FAQ Catégorisée */}
        {FAQ_CATEGORIES.map((cat, idx) => (
          <Accordion key={idx} title={cat.title} icon={cat.icon} questions={cat.questions} />
        ))}
        {/* Contact Support enrichi */}
        <div className="mt-10 mb-8">
          <h2 className="font-semibold text-xl text-emerald-700 mb-4 flex items-center gap-2"><Mail className="h-6 w-6 text-emerald-400" />Contacter le support</h2>
          <div className="bg-white rounded-xl border border-emerald-100 p-5 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center text-gray-900">
              <Mail className="h-5 w-5 text-emerald-600" />
              <span className="select-all font-medium">{supportEmail}</span>
            </div>
            <div className="flex items-center text-gray-900">
              <button
                onClick={handleCopy}
                className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 hover:bg-emerald-100 text-sm flex items-center gap-1"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} {copied ? 'Copié !' : 'Copier'}
              </button>
              <a
                href={`mailto:${supportEmail}`}
                className="ml-2 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 hover:bg-emerald-100 text-sm flex items-center gap-1"
              >
                <Mail className="h-4 w-4" /> Écrire
              </a>
            </div>
            <div className="text-gray-500 text-sm">
              Notre équipe répond sous 24h (jours ouvrés). Merci de décrire précisément ton problème ou ta question.<br />
              <span className="font-semibold text-emerald-700">Horaires support :</span> Lundi - Vendredi, 9h-18h
            </div>
          </div>
        </div>

        {/* Illustration */}
        <div className="flex justify-center mt-8">
          <img src="/assets/logo2.png" alt="Toupaw" className="h-24 w-auto opacity-80" />
        </div>
      </div>
    </div>
  );
} 