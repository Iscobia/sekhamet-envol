// app.js - Logique principale de l'application

document.addEventListener('DOMContentLoaded', function() {
  // Initialiser l'app
  initializeApp();
  
  // Éléments DOM
  const currentDayElement = document.getElementById('current-day');
  const dayCurrentElement = document.getElementById('day-current');
  const challengeTitleElement = document.getElementById('challenge-title');
  const challengeDescriptionElement = document.getElementById('challenge-description');
  const markDoneButton = document.getElementById('mark-done-btn');
  const calendarGrid = document.getElementById('calendar-grid');
  const notificationTimeSelect = document.getElementById('notification-time');
  const testNotificationButton = document.getElementById('test-notification-btn');
  
  // Récupérer le jour actuel
  let jourActuel = parseInt(localStorage.getItem('jour_actuel')) || 1;
  
  // Afficher le défi du jour
  function afficherDefiDuJour(jour) {
    const defi = getDefiByDay(jour);
    
    // Mettre à jour l'interface
    currentDayElement.textContent = jour;
    dayCurrentElement.textContent = jour;
    challengeTitleElement.textContent = defi.titre;
    challengeDescriptionElement.textContent = defi.description;
    
    // Mettre à jour le bouton selon l'état
    if (defi.termine) {
      markDoneButton.textContent = '✅ Déjà accompli';
      markDoneButton.disabled = true;
      markDoneButton.classList.add('completed');
    } else {
      markDoneButton.textContent = '✅ Marquer comme accompli';
      markDoneButton.disabled = false;
      markDoneButton.classList.remove('completed');
    }
    
    // Générer le calendrier
    genererCalendrier();
  }
  
  // Générer le calendrier visuel des 77 jours
  function genererCalendrier() {
    calendarGrid.innerHTML = ''; // Vider le calendrier
    
    for (let jour = 1; jour <= 77; jour++) {
      const defi = getDefiByDay(jour);
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.textContent = jour;
      
      // Déterminer l'icône selon l'état
      if (defi.termine) {
        dayElement.classList.add('completed'); // ✅
      } else if (jour === jourActuel) {
        dayElement.classList.add('current');   // ⏳
      } else if (jour < jourActuel) {
        dayElement.classList.add('missed');    // ❌
      } else {
        dayElement.classList.add('upcoming');  // 🕔
      }
      
      // Ajouter un clic pour voir un défi spécifique
      dayElement.addEventListener('click', function() {
        afficherDefiDuJour(jour);
      });
      
      calendarGrid.appendChild(dayElement);
    }
  }
  
  // Marquer un défi comme terminé
  markDoneButton.addEventListener('click', function() {
    const defi = getDefiByDay(jourActuel);
    defi.termine = true;
    defi.dateValidation = new Date().toISOString();
    
    saveProgression();
    afficherDefiDuJour(jourActuel);
    
    // Passer au jour suivant si possible
    if (jourActuel < 77) {
      jourActuel++;
      localStorage.setItem('jour_actuel', jourActuel.toString());
      
      // Petit délai avant d'afficher le nouveau défi
      setTimeout(() => {
        afficherDefiDuJour(jourActuel);
      }, 1000);
    }
  });
  
  // Gérer les paramètres de notification
  const heureSauvegardee = localStorage.getItem('heure_notification') || '09:00';
  notificationTimeSelect.value = heureSauvegardee;
  
  notificationTimeSelect.addEventListener('change', function() {
    localStorage.setItem('heure_notification', this.value);
    console.log('Heure de notification mise à jour :', this.value);
    // Ici, vous intégrerez la programmation OneSignal plus tard
  });
  
  // Bouton de test de notification
  testNotificationButton.addEventListener('click', function() {
    if ('Notification' in window && Notification.permission === 'granted') {
      const defi = getDefiByDay(jourActuel);
      new Notification(`🎯 Défi ENVOL - Jour ${jourActuel}`, {
        body: defi.titre,
        icon: '/assets/icons/icon-192.png'
      });
    } else {
      alert('Veuillez autoriser les notifications dans les paramètres de votre navigateur.');
    }
  });
  
  // Afficher le défi du jour actuel
  afficherDefiDuJour(jourActuel);
  
  // Demander la permission pour les notifications
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => {
      Notification.requestPermission();
    }, 2000);
  }
});


// Gestion de l'installation PWA (bouton d'installation sur l'écran d'accueil)
let deferredPrompt;
const installButton = document.createElement('button');

// Écouter l'événement beforeinstallprompt
window.addEventListener('beforeinstallprompt', (event) => {
  console.log('👍 beforeinstallprompt déclenché');
  // Empêche l'affichage automatique
  event.preventDefault();
  deferredPrompt = event;
  
  // Créer/s'afficher le bouton d'installation
  installButton.id = 'install-pwa-btn';
  installButton.textContent = '📱 Installer ENVOL sur l\'écran d\'accueil';
  installButton.className = 'install-btn';
  installButton.style.display = 'block';
  
  // Ajouter le bouton avant le footer
  const footer = document.querySelector('.app-footer');
  if (footer) {
    footer.parentNode.insertBefore(installButton, footer);
  }
});

// Gérer le clic sur le bouton d'installation
installButton.addEventListener('click', async () => {
  if (!deferredPrompt) {
    // Fallback pour les navigateurs qui ne supportent pas l'API
    alert("Pour installer l'application :\n1. Sur Android : menu → \"Ajouter à l'écran d'accueil\"\n2. Sur iOS : partager → \"Sur l'écran d'accueil\"");
    return;
  }
  
  // Affiche l'invite d'installation native
  deferredPrompt.prompt();
  
  // Attendre le choix de l'utilisateur
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response: ${outcome}`);
  
  // Réinitialiser
  deferredPrompt = null;
  installButton.style.display = 'none';
});

// Vérifier si l'app est déjà installée
window.addEventListener('appinstalled', () => {
  console.log('PWA installée avec succès !');
  installButton.style.display = 'none';
});


// Dans votre PWA (app.js) - Affiche un overlay au premier lancement
function showInstallOverlay() {
  if (localStorage.getItem('install_prompt_shown')) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'install-overlay';
  overlay.innerHTML = `
    <div style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center;">
      <div style="background:white; padding:30px; border-radius:20px; max-width:400px; text-align:center;">
        <h2>Installer ENVOL ?</h2>
        <p>Pour un accès rapide depuis votre écran d'accueil :</p>
        <div id="install-instructions">
          <p><strong>Android :</strong> Menu → "Ajouter à l'écran d'accueil"</p>
          <p><strong>iOS :</strong> Partager → "Sur l'écran d'accueil"</p>
        </div>
        <button id="close-overlay" style="margin-top:20px; padding:10px 20px; background:#0ea5e9; color:white; border:none; border-radius:8px;">
          Compris, merci !
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  document.getElementById('close-overlay').addEventListener('click', () => {
    overlay.remove();
    localStorage.setItem('install_prompt_shown', 'true');
  });
  
  // Fermer après 10 secondes
  setTimeout(() => {
    if (document.getElementById('install-overlay')) {
      document.getElementById('install-overlay').remove();
      localStorage.setItem('install_prompt_shown', 'true');
    }
  }, 10000);
}

// Appeler au chargement
showInstallOverlay();
