// data/defis.js
// Vos 77 défis transformés en structure JavaScript

const DefisEnvol = [
  {
    jour: 1,
    titre: "Reprendre contact avec ton environnement",
    description: "Aujourd’hui, observe ton quotidien sans chercher à corriger. Note ce qui te stimule, t’épuise ou t’agresse subtilement.",
    termine: false,
    dateValidation: null
  },
  {
    jour: 2,
    titre: "Ton corps capte plus que tu ne crois",
    description: "Prends conscience des écrans et ondes autour de toi. Sans jugement, remarque comment ton corps réagit.",
    termine: false,
    dateValidation: null
  },
  {
    jour: 3,
    titre: "L'information de l'eau",
    description: "Bois un verre d'eau en conscience. Pose une intention simple avant de boire. Observe.",
    termine: false,
    dateValidation: null
  },
  // ... Continuez pour les 74 jours restants
  // (Je peux vous fournir le fichier complet avec les 77 défis)
  
  {
    jour: 77,
    titre: "Lettre de gratitude",
    description: "Fais-toi une lettre de gratitude pour mettre sur le papier tout ce que tu faisais avant de commencer ce défi et ce qui change ton quotidien maintenant : c'est le moment du bilan ! Si tu as des souhaits ou des remerciements à remettre à l'Univers, brûle-la en conscience.",
    termine: false,
    dateValidation: null
  }
];

// Fonction utilitaire pour obtenir le défi d'un jour
function getDefiByDay(jourNumero) {
  return DefisEnvol.find(defi => defi.jour === jourNumero) || DefisEnvol[0];
}

// Sauvegarde la progression dans le localStorage
function saveProgression() {
  localStorage.setItem('defis_envol', JSON.stringify(DefisEnvol));
}

// Charge la progression depuis le localStorage
function loadProgression() {
  const sauvegarde = localStorage.getItem('defis_envol');
  if (sauvegarde) {
    const defisSauves = JSON.parse(sauvegarde);
    defisSauves.forEach((defiSauve, index) => {
      if (DefisEnvol[index]) {
        DefisEnvol[index].termine = defiSauve.termine;
        DefisEnvol[index].dateValidation = defiSauve.dateValidation;
      }
    });
  }
}

// Initialise l'app au premier lancement
function initializeApp() {
  if (!localStorage.getItem('app_initialisee')) {
    localStorage.setItem('app_initialisee', 'true');
    localStorage.setItem('jour_actuel', '1');
    localStorage.setItem('heure_notification', '09:00');
    saveProgression();
  }
  loadProgression();
}
