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
