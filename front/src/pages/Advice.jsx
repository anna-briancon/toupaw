import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, PawPrint, Heart, BookOpen, Utensils, Smile, Users, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const CATEGORIES = [
  {
    icon: <BookOpen className="h-6 w-6 text-emerald-500" />,
    title: "Éducation positive",
    tips: [
      "Privilégie le renforcement positif : récompense les bons comportements, ignore les mauvais.",
      "Sois cohérent dans tes demandes et tes règles.",
      "Utilise des ordres simples et toujours les mêmes mots.",
      "Sois patient : chaque animal apprend à son rythme.",
    ],
    quote: "L’éducation positive crée une relation de confiance durable.",
    resources: [
      { label: "Article : Les bases de l’éducation positive", url: "https://www.wanimo.com/veterinaire/education-du-chien/education-positive.html" },
      { label: "Vidéo : Clicker training", url: "https://www.youtube.com/watch?v=1K7P6g3cC2g" },
    ],
  },
  {
    icon: <Heart className="h-6 w-6 text-pink-500" />,
    title: "Bien-être & santé",
    tips: [
      "Consulte régulièrement le vétérinaire, vaccine et vermifuge ton animal.",
      "Surveille son poids, son alimentation et son comportement.",
      "Offre-lui un espace calme et sécurisé pour se reposer.",
      "Respecte ses besoins de sommeil et de tranquillité.",
    ],
    quote: "Un animal heureux, c’est un animal en bonne santé !",
    resources: [
      { label: "Guide : Bien-être animal", url: "https://www.fondation30millionsdamis.fr/conseils/" },
    ],
  },
  {
    icon: <Utensils className="h-6 w-6 text-yellow-500" />,
    title: "Alimentation",
    tips: [
      "Adapte la ration à l’âge, la taille et l’activité de ton animal.",
      "Privilégie une alimentation de qualité, évite les restes de table.",
      "Laisse toujours de l’eau fraîche à disposition.",
      "Évite les aliments toxiques (chocolat, oignon, raisin, etc.).",
    ],
    quote: "Bien nourrir, c’est aimer et protéger.",
    resources: [
      { label: "Tableau des aliments toxiques", url: "https://www.wanimo.com/veterinaire/alimentation/aliments-toxiques.html" },
    ],
  },
  {
    icon: <Smile className="h-6 w-6 text-orange-400" />,
    title: "Jeux & stimulation mentale",
    tips: [
      "Propose des jeux d’intelligence, des jouets interactifs ou des exercices d’apprentissage.",
      "Varie les activités pour éviter l’ennui.",
      "Partage des moments de complicité chaque jour.",
      "Cache des friandises pour stimuler son flair.",
    ],
    quote: "Jouer, c’est apprendre et renforcer le lien !",
    resources: [
      { label: "Idées de jeux pour chien et chat", url: "https://www.purina.fr/articles/chien/activite/jeux/jeux-chien" },
    ],
  },
  {
    icon: <Users className="h-6 w-6 text-blue-500" />,
    title: "Socialisation",
    tips: [
      "Expose ton animal à différents environnements, personnes et congénères dès son plus jeune âge.",
      "Respecte son rythme et ne force jamais une interaction.",
      "Félicite-le pour chaque progrès.",
      "Organise des rencontres positives avec d’autres animaux.",
    ],
    quote: "Un animal bien socialisé est plus serein au quotidien.",
    resources: [
      { label: "Socialisation du chiot", url: "https://www.chien.com/education/socialisation/" },
    ],
  },
];

const FAQ = [
  {
    q: "Mon chien détruit tout en mon absence, que faire ?",
    a: "L’ennui et l’anxiété de séparation sont souvent en cause. Augmente la stimulation mentale, laisse-lui des jouets d’occupation, et évite de dramatiser les départs/retours. Si le problème persiste, consulte un comportementaliste.",
  },
  {
    q: "Comment apprendre la propreté à un chiot ?",
    a: "Sors-le très régulièrement (après les repas, le jeu, le réveil), félicite-le dehors, nettoie sans gronder à l’intérieur. La régularité et la patience sont clés.",
  },
  {
    q: "Mon chat n’utilise pas sa litière, pourquoi ?",
    a: "Vérifie la propreté, l’emplacement, le type de litière, et l’absence de stress ou de problème médical. Certains chats sont sensibles au changement.",
  },
  {
    q: "Faut-il punir un animal ?",
    a: "Non, la punition génère de la peur et détériore la relation. Privilégie toujours l’éducation positive et la prévention.",
  },
];

function Accordion({ title, icon, children, quote, resources }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-emerald-100 shadow-sm mb-4">
      <button
        className="w-full flex items-center justify-between px-5 py-4 focus:outline-none"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex items-center gap-3 font-semibold text-lg text-gray-900">{icon}{title}</span>
        {open ? <ChevronUp className="h-5 w-5 text-emerald-500" /> : <ChevronDown className="h-5 w-5 text-emerald-500" />}
      </button>
      {open && (
        <div className="px-6 pb-5">
          <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-3">
            {children}
          </ul>
          {quote && <div className="italic text-emerald-700 border-l-4 border-emerald-200 pl-4 mb-2">“{quote}”</div>}
          {resources && resources.length > 0 && (
            <div className="mt-2">
              <span className="font-semibold text-emerald-700">Ressources utiles :</span>
              <ul className="list-none pl-0 mt-1">
                {resources.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-emerald-400" />
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">{r.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Advice() {
  const navigate = useNavigate();
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
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg">
            <Lightbulb className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-couleur-titre font-ranille">Conseils bien-être & éducation</h1>
        </div>
        <div className="bg-white/80 rounded-xl border border-emerald-100 shadow p-6 mb-8">
          <div className="text-lg font-semibold text-emerald-700 mb-2">“Le bien-être animal commence par la connaissance et l’amour.”</div>
          <div className="text-gray-700">Retrouve ici des conseils pratiques, des astuces d’experts et des ressources fiables pour offrir à ton compagnon une vie épanouie, équilibrée et pleine de complicité.</div>
        </div>
        {/* Conseils catégorisés */}
        {CATEGORIES.map((cat, idx) => (
          <Accordion key={idx} title={cat.title} icon={cat.icon} quote={cat.quote} resources={cat.resources}>
            {cat.tips.map((tip, i) => <li key={i}>{tip}</li>)}
          </Accordion>
        ))}
        {/* FAQ */}
        <div className="mt-10 mb-6">
          <h2 className="font-semibold text-xl text-emerald-700 mb-4 flex items-center gap-2"><PawPrint className="h-6 w-6 text-emerald-400" />FAQ éducation & comportement</h2>
          <div className="space-y-3">
            {FAQ.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-emerald-100 p-4 shadow-sm">
                <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <span className="text-emerald-600">Q.</span> {item.q}
                </div>
                <div className="text-gray-700 pl-6">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Ressources externes */}
        <div className="mb-10">
          <h2 className="font-semibold text-xl text-emerald-700 mb-4 flex items-center gap-2"><ExternalLink className="h-6 w-6 text-emerald-400" />Ressources recommandées</h2>
          <ul className="list-disc pl-7 space-y-2 text-gray-700">
            <li><a href="https://www.fondation30millionsdamis.fr/conseils/" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">Fondation 30 Millions d’Amis : Conseils pratiques</a></li>
            <li><a href="https://www.wanimo.com/veterinaire/" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">Wanimo : Conseils vétérinaires</a></li>
            <li><a href="https://www.purina.fr/articles/chien/education" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">Purina : Éducation et bien-être</a></li>
            <li><a href="https://www.chien.com/education/" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">Chien.com : Dossiers éducation</a></li>
          </ul>
        </div>
        {/* Illustration */}
        <div className="flex justify-center mt-8">
          <img src="/assets/logo2.png" alt="Toupaw" className="h-24 w-auto opacity-80" />
        </div>
      </div>
    </div>
  );
} 