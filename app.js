// app.js - Logique principale de l'application - VERSION CORRIGÉE

const CACHE_NAME = 'envol-pwa-v2.0'; // DOIT ÊTRE LE MÊME QUE service-worker.js

// ========== FONCTIONS GLOBALES ==========
// Fonction pour centrer le calendrier sur le jour actuel
function centrerCalendrierSurJour(jour) {
  const index = jour - 1;
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  
  const days = grid.children;
  if (days[index]) {
    // Calcul pour centrer (jour 8 serait à la 2ème ligne)
    const row = Math.floor(index / 10);
    grid.scrollTop = row * (50 + 8); // hauteur case + gap
  }
}

// Affiche un overlay au premier lancement
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

// ========== LOGIQUE PRINCIPALE ==========
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

  // ========== SECTION DÉPANNAGE ==========

// 1. Deuxième bouton de test (identique au premier)
document.getElementById('test-notification-btn-2')?.addEventListener('click', async function() {
  // Utilisez la même logique que votre bouton test-notification-btn existant
  // Copiez-collez le code de gestion des notifications ici
});

// 2. Bouton "Vider le cache"
document.getElementById('clear-cache-btn')?.addEventListener('click', async function() {
  const btn = this;
  const originalText = btn.textContent;
  
  if (!confirm("Vider le cache ? L'application se rechargera mais tes défis validés seront conservés.")) {
    return;
  }
  
  btn.textContent = 'Nettoyage en cours...';
  btn.disabled = true;
  
  try {
    // Option A : Message au Service Worker (méthode propre)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Méthode via MessageChannel (plus fiable)
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            console.log('Cache vidé, rechargement...');
            setTimeout(() => window.location.reload(), 500);
          } else {
            console.error('Échec vidage cache:', event.data.error);
            alert("Le cache n'a pas pu être vidé. Essayez de fermer et rouvrir l'application.");
          }
          btn.textContent = originalText;
          btn.disabled = false;
          resolve();
        };
        
        navigator.serviceWorker.controller.postMessage(
          { action: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      });
    }
    // Option B : Fallback simple
    else {
      // Fallback simple : Supprime uniquement le cache des ressources, PAS le localStorage
      if ('caches' in window) {
        await caches.delete(CACHE_NAME);
      }
      setTimeout(() => window.location.reload(), 500);
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert("Une erreur est survenue. Essayez de fermer et rouvrir l'application.");
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

// 3. Vérification automatique des mises à jour
function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) {
        reg.update(); // Vérifie les mises à jour
        // Toutes les 24h
        setInterval(() => reg.update(), 24 * 60 * 60 * 1000);
      }
    });
  }
}

// Appeler au démarrage
setTimeout(checkForUpdates, 5000);
  
  // Récupérer le jour actuel
  let jourActuel = parseInt(localStorage.getItem('jour_actuel')) || 1;
  
  // ========== LOGIQUE ANTI-SPEED RUNNING ==========
  function peutPasserAuJourSuivant() {
    const aujourdhui = new Date().toLocaleDateString('fr-FR');
    const dernierChangement = localStorage.getItem('dernier_changement_jour');
    
    // Si c'est le premier jour OU si on a changé de jour calendaire
    if (!dernierChangement || dernierChangement !== aujourdhui) {
      localStorage.setItem('dernier_changement_jour', aujourdhui);
      return true;
    }
    return false;
  }
  
  function verifierEtAvancerJour() {
    if (peutPasserAuJourSuivant() && jourActuel < 77) {
      jourActuel++;
      localStorage.setItem('jour_actuel', jourActuel.toString());
    }
    afficherDefiDuJour(jourActuel);
  }
  
  // ========== FONCTIONS D'AFFICHAGE ==========
  // Afficher le défi du jour
  function afficherDefiDuJour(jour) {
    const defi = getDefiByDay(jour);
    
    // Mettre à jour l'interface
    if (currentDayElement) currentDayElement.textContent = jour;
    if (dayCurrentElement) dayCurrentElement.textContent = jour;
    if (challengeTitleElement) challengeTitleElement.textContent = defi.titre;
    if (challengeDescriptionElement) challengeDescriptionElement.textContent = defi.description;
    
    // Mettre à jour le bouton selon l'état
    if (markDoneButton) {
      if (defi.termine) {
        markDoneButton.textContent = '✅ Déjà accompli';
        markDoneButton.disabled = true;
        markDoneButton.classList.add('completed');
      } else {
        markDoneButton.textContent = '✅ Marquer comme accompli';
        markDoneButton.disabled = false;
        markDoneButton.classList.remove('completed');
      }
    }
    
    // Générer le calendrier
    genererCalendrier();
    centrerCalendrierSurJour(jour); // <-- CENTRER LE CALENDRIER
  }
  
  // Générer le calendrier visuel des 77 jours
  function genererCalendrier() {
    if (!calendarGrid) return;
    
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
        dayElement.classList.add('current');   // Jour actuel = ⏳
      } else if (jour < jourActuel && !defi.termine) {
        dayElement.classList.add('missed');    // Jours passés non validés = ❌
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
  
  // ========== ÉVÉNEMENTS ==========
  // Marquer un défi comme terminé (NOUVELLE VERSION - anti-speed running)
  if (markDoneButton) {
    // Supprimez d'abord tous les écouteurs existants
    const newMarkDoneButton = markDoneButton.cloneNode(true);
    markDoneButton.parentNode.replaceChild(newMarkDoneButton, markDoneButton);
    
    // Ajoutez le nouvel écouteur
    newMarkDoneButton.addEventListener('click', function() {
      const defi = getDefiByDay(jourActuel);
      defi.termine = true;
      defi.dateValidation = new Date().toISOString();
      saveProgression();
      
      // MAJ UI mais NE PAS changer jourActuel immédiatement
      afficherDefiDuJour(jourActuel);
      
      // Feedback
      alert("Défi validé ! À demain pour le prochain.");
    });
  }
  
  // Gérer les paramètres de notification
  const heureSauvegardee = localStorage.getItem('heure_notification') || '08:00';
  if (notificationTimeSelect) {
    notificationTimeSelect.value = heureSauvegardee;
    
    notificationTimeSelect.addEventListener('change', function() {
      localStorage.setItem('heure_notification', this.value);
      console.log('Heure de notification mise à jour :', this.value);
    });
  }
  
  // ========== NOTIFICATIONS ONESIGNAL ==========
  // Bouton de test de notification
  if (testNotificationButton) {
    testNotificationButton.addEventListener('click', async function() {
      // 1. Vérifier si OneSignal est prêt
      if (typeof OneSignal === 'undefined') {
        alert("OneSignal n'est pas encore chargé. Veuillez patienter quelques secondes.");
        return;
      }

      // 2. Vérifier et demander la permission si nécessaire
      const permission = await OneSignal.getNotificationPermission();
      
      if (permission === 'default') {
        // Affiche la bannière de demande de permission
        OneSignal.showSlidedownPrompt();
        return;
      }

      if (permission === 'denied') {
        alert("Vous avez bloqué les notifications. Pour les réactiver, allez dans les paramètres de votre navigateur/site.");
        return;
      }

      // 3. Envoyer la notification de test IN-APP (toast)
      const defi = getDefiByDay(jourActuel);
      
      OneSignal.sendSelfNotification(
        `🎯 ENVOL - Jour ${jourActuel}`,
        `${defi.titre}`,
        { url: window.location.href }
      );
      
      console.log("Notification de test envoyée !");
    });
  }
  
  // ========== INITIALISATION ==========
  // Afficher le défi du jour actuel
  verifierEtAvancerJour();
  
  // Afficher l'overlay d'installation
  showInstallOverlay();
  
  // Demander la permission pour les notifications
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => {
      Notification.requestPermission();
    }, 2000);
  }
});

// ========== GESTION PWA ==========
let deferredPrompt;
const installButton = document.createElement('button');

// Écouter l'événement beforeinstallprompt
window.addEventListener('beforeinstallprompt', (event) => {
  console.log('👍 beforeinstallprompt déclenché');
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
    alert("Pour installer l'application :\n1. Sur Android : menu → \"Ajouter à l'écran d'accueil\"\n2. Sur iOS : partager → \"Sur l'écran d'accueil\"");
    return;
  }
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response: ${outcome}`);
  
  deferredPrompt = null;
  installButton.style.display = 'none';
});

// Vérifier si l'app est déjà installée
window.addEventListener('appinstalled', () => {
  console.log('PWA installée avec succès !');
  installButton.style.display = 'none';
});

// ========== GESTION SAUVEGARDES ==========

// 1. Exporter la sauvegarde
document.getElementById('export-backup-btn')?.addEventListener('click', function() {
  const backupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    progression: JSON.parse(localStorage.getItem('defis_envol') || '[]'),
    jourActuel: localStorage.getItem('jour_actuel'),
    dernierChangement: localStorage.getItem('dernier_changement_jour'),
    heureNotification: localStorage.getItem('heure_notification')
  };
  
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  a.href = url;
  a.download = `sauvegarde-envol-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('✅ Sauvegarde exportée ! Conservez ce fichier précieusement.');
});

// 2. Importer la sauvegarde
document.getElementById('import-backup-btn')?.addEventListener('click', function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const backupData = JSON.parse(event.target.result);
        
        // Validation basique
        if (!backupData.progression || !backupData.jourActuel) {
          throw new Error('Format de sauvegarde invalide');
        }
        
        if (confirm(`Importer la sauvegarde du ${new Date(backupData.timestamp).toLocaleDateString('fr-FR')} ? Votre progression actuelle sera écrasée.`)) {
          localStorage.setItem('defis_envol', JSON.stringify(backupData.progression));
          localStorage.setItem('jour_actuel', backupData.jourActuel);
          if (backupData.dernierChangement) {
            localStorage.setItem('dernier_changement_jour', backupData.dernierChangement);
          }
          if (backupData.heureNotification) {
            localStorage.setItem('heure_notification', backupData.heureNotification);
          }
          
          alert('✅ Progression importée avec succès !');
          window.location.reload();
        }
      } catch (error) {
        console.error('Erreur import:', error);
        alert('❌ Fichier de sauvegarde invalide ou corrompu.');
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
});

// Soucis avec les notifications :

// ========== GESTION NOTIFICATIONS ANDROID ==========

// 1. Bouton "Autoriser les notifications"
document.getElementById('allow-notifications-btn')?.addEventListener('click', async function() {
  const btn = this;
  const originalText = btn.textContent;
  
  btn.textContent = 'Vérification...';
  btn.disabled = true;
  
  try {
    // Méthode OneSignal (préférée)
    if (typeof OneSignal !== 'undefined') {
      const permission = await OneSignal.getNotificationPermission();
      
      if (permission === 'default') {
        // Affiche la bannière de demande
        OneSignal.showSlidedownPrompt();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 3000);
        return;
      }
      
      if (permission === 'granted') {
        alert('✅ Notifications déjà autorisées !');
      } else {
        alert('Vous avez bloqué les notifications. Pour les réactiver :\n\n1. Ouvrez les paramètres Chrome\n2. Allez dans "Paramètres du site"\n3. Trouvez "ENVOL" et autorisez les notifications');
      }
    } 
    // Fallback API standard
    else if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        alert('✅ Notifications autorisées avec succès !');
      } else if (permission === 'denied') {
        alert('Vous avez bloqué les notifications. Consultez les paramètres de votre navigateur.');
      }
    } else {
      alert('Votre navigateur ne supporte pas les notifications ou OneSignal n\'est pas chargé.');
    }
  } catch (error) {
    console.error('Erreur permission notifications:', error);
    alert('Une erreur est survenue lors de la demande de permission.');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

// 2. Bouton "Envoyer une notif' test"
document.getElementById('test-notification-android-btn')?.addEventListener('click', async function() {
  const btn = this;
  const originalText = btn.textContent;
  
  btn.textContent = 'Préparation...';
  btn.disabled = true;
  
  try {
    // Vérifier OneSignal d'abord
    if (typeof OneSignal !== 'undefined') {
      const permission = await OneSignal.getNotificationPermission();
      
      if (permission === 'granted') {
        // Envoyer une notification in-app (toast)
        const jourActuel = parseInt(localStorage.getItem('jour_actuel')) || 1;
        const defi = getDefiByDay(jourActuel);
        
        OneSignal.sendSelfNotification(
          `🎯 Test ENVOL - Jour ${jourActuel}`,
          `${defi.titre}\nSi tu vois ceci, les notifications fonctionnent !`,
          { url: window.location.href }
        );
        
        alert('✅ Notification de test envoyée !\n\nElle devrait apparaître en haut de l\'écran.');
      } else if (permission === 'default') {
        alert('Veuillez d\'abord autoriser les notifications en utilisant le bouton "Autoriser les notifications".');
      } else {
        alert('Notifications bloquées. Autorisez-les d\'abord dans les paramètres de votre navigateur.');
      }
    } 
    // Fallback API standard (moins fiable)
    else if ('Notification' in window && Notification.permission === 'granted') {
      const jourActuel = parseInt(localStorage.getItem('jour_actuel')) || 1;
      const defi = getDefiByDay(jourActuel);
      
      new Notification(`🎯 Test ENVOL - Jour ${jourActuel}`, {
        body: `${defi.titre}\nNotification test`,
        icon: '/sekhamet-envol/assets/icons/ENVOL-192.png'
      });
      
      alert('✅ Notification système envoyée !');
    } else {
      alert('Impossible d\'envoyer une notification.\n\n1. Vérifiez que OneSignal est chargé\n2. Autorisez les notifications si demandé');
    }
  } catch (error) {
    console.error('Erreur notification test:', error);
    alert('Erreur lors de l\'envoi de la notification :\n' + error.message);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

// 3. Détection Android pour afficher/masquer cette section
function detecterAndroidEtNotifications() {
  // Cibler UNIQUEMENT la section notifications Android
  const androidSection = document.querySelector('.trouble-item:has(#allow-notifications-btn)');
  
  if (!androidSection) return;
  
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  console.log('Détection:', { isAndroid, isiOS });
  
  // Masquer uniquement si iOS ou si pas Android du tout
  if (isiOS || !isAndroid) {
    androidSection.style.display = 'none';
    console.log('Section Android masquée (iOS ou non-Android)');
  } else {
    androidSection.style.display = 'block';
    console.log('Section Android affichée (Android détecté)');
    
    // Vérifier l'état des notifications pour le feedback
    if (typeof OneSignal !== 'undefined') {
      setTimeout(async () => {
        try {
          const permission = await OneSignal.getNotificationPermission();
          const note = androidSection.querySelector('.small-note');
          if (note && permission === 'granted') {
            note.textContent = '✓ Notifications déjà activées sur cet appareil.';
            note.style.color = '#10b981';
          }
        } catch (e) {
          // Ignorer silencieusement
        }
      }, 2000);
    }
  }
  
  // TOUTES les autres sections doivent rester visibles
  document.querySelectorAll('.trouble-item').forEach(section => {
    if (section !== androidSection && section.style.display === 'none') {
      section.style.display = 'block';
    }
  });
}

// Appeler la détection au chargement
document.addEventListener('DOMContentLoaded', detecterAndroidEtNotifications);


// 3. Supprimer la progression
document.getElementById('reset-progress-btn')?.addEventListener('click', function() {
  if (!confirm('ÊTES-VOUS ABSOLUMENT SÛR ?\n\nTous vos défis validés seront effacés et vous recommencerez au Jour 1.\n\nCette action est irréversible !')) {
    return;
  }
  
  if (!confirm('DERNIÈRE CHANCE :\nAppuyez sur "Annuler" pour garder votre progression.\n"OK" pour tout supprimer.')) {
    return;
  }
  
  // Réinitialisation
  DefisEnvol.forEach(defi => {
    defi.termine = false;
    defi.dateValidation = null;
  });
  
  localStorage.setItem('defis_envol', JSON.stringify(DefisEnvol));
  localStorage.setItem('jour_actuel', '1');
  localStorage.removeItem('dernier_changement_jour');
  localStorage.setItem('heure_notification', '08:00');
  localStorage.removeItem('install_prompt_shown'); // Pour revoir le splash screen
  
  alert('🗑️ Progression supprimée. Vous recommencez au Jour 1.');
  window.location.reload();
});
