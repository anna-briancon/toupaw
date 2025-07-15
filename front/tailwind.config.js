module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fond' : '#F7EDE2',
        // Couleurs principales
        'violet-terre': '#94473d',
        'violet-terre-hover': '#7a3a31',
        'rouge-orange': '#e0591c',
        'orange-saumon': '#ff9e6b',
        'orange-saumon-hover': '#f18348',
        'beige-rose': '#f2bc9b',
        'rose-poudre': '#cf9ea3',
        'vert-olive': '#597024',
        'jaune-vif': '#ffcc00',
        'sable-dore': '#f2d478',
        'blanc-casse': '#fcfaf2',
        'gris-pale': '#edede8',

        // Couleurs LOGO
        'rose-logo': '#f2d4a6',
        'beige-logo': '#fcf5db',

        // Noirs & blancs
        'noir-clair': '#d5d5d5',
        'noir-gris': '#211f1c',
        'noir-pur': '#000000',
        'blanc-pur': '#ffffff',
        'blanc-casse-clair': '#fcfbf7',
        'blanc-casse-fonce': '#faf9f5',

        // Secondaires
        'bleu-intense': '#0008c9',
        'bleu-pastel': '#80b0df',

        'couleur-principale': '#0EBA8C',
        'couleur-fond': '#FFFFFF',
        'couleur-secondaire': '#FFEDD5',
        'couleur-texte': '#000000',
        'couleur-titre': '#046148',
        'couleur-texte-info': '#666666',

        toupaw: {
          jaune: '#F7BD5F',
          creme: '#F7EDE2',
          rose: '#F5CAC3',
          vert: '#84A59D',
          corail: '#F38381',
        },

        tw: {
          turquoise: '#0EBA8C',
          jaune: '#F9FAF9',
          gris: '#222',
          grisclair: '#888',
          blanccasse: '#f8f8f8',
          text : '#5D4632',
        },
      },

      fontFamily: {
        sans: ['Open Sauce', 'sans-serif'],
        ranille: ['Ranille', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
