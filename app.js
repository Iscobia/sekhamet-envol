// app.js - Logique principale de l'application - VERSION STRUCTURÉE (totalement remaniée le 20/01/2026)

const CACHE_NAME = 'envol-pwa-v2.0';

// ========== FONCTIONS GLOBALES ==========
function centrerCalendrierSurJour(jour) {
  const index = jour - 1;
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  const days = grid.children;
  if (days[index]) {
    const row = Math.floor(index / 10);
    grid.scrollTop = row * (50 + 8);
  }
}

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
  setTimeout(() => {
    if (document.getElementById('install-overlay')) {
      document.getElementById('install-overlay').remove();
      localStorage.setItem('install_prompt_shown', 'true');
    }
  }, 10000);
}

async function checkNotificationPermission() {
  try {
    if (typeof OneSignal === 'undefined') return 'unsupported';
    try {
      const isSubscribed = await OneSignal.isPushNotificationsEnabled();
      return isSubscribed ? 'granted' : 'default';
    } catch (e) {
      if (OneSignal.User && OneSignal.User.PushSubscription) {
        const subscription = OneSignal.User.PushSubscription;
        return subscription.optIn ? 'granted' : 'denied';
      }
      throw e;
    }
  } catch (error) {
    console.warn('Erreur vérification permission:', error);
    if ('Notification' in window) return Notification.permission;
    return 'unsupported';
  }
}

function detecterAndroidEtNotifications() {
  const androidNotificationSection = document.getElementById('allow-notifications-btn')?.closest('.trouble-item');
  if (androidNotificationSection) {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isiOS) {
      androidNotificationSection.style.display = 'none';
    } else {
      androidNotificationSection.style.display = 'block';
    }
  }
  document.querySelectorAll('.trouble-item').forEach(section => {
    if (section !== androidNotificationSection) {
      section.style.display = 'block';
      section.style.visibility = 'visible';
      section.style.opacity = '1';
    }
  });
}

function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) {
        reg.update();
        setInterval(() => reg.update(), 24 * 60 * 60 * 1000);
      }
    });
  }
}

// ========== LOGIQUE PRINCIPALE - DÉBUT DU DOMContentLoaded ==========
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initialisation ENVOL...');
  console.log('=== VÉRIFICATION BOUTONS ===');
  console.log('Bouton test Android:', document.getElementById('test-notification-android-btn') ? '✅' : '❌');
  console.log('Bouton autorisation:', document.getElementById('allow-notifications-btn') ? '✅' : '❌');
  console.log('=== FIN VÉRIFICATION ===');
  
  // Initialiser l'app
  if (typeof initializeApp === 'function') initializeApp();
  
  // Détection Android
  detecterAndroidEtNotifications();
  
  // Éléments DOM
  const currentDayElement = document.getElementById('current-day');
  const dayCurrentElement = document.getElementById('day-current');
  const challengeTitleElement = document.getElementById('challenge-title');
  const challengeDescriptionElement = document.getElementById('challenge-description');
  const markDoneButton = document.getElementById('mark-done-btn');
  const calendarGrid = document.getElementById('calendar-grid');
  const notificationTimeSelect = document.getElementById('notification-time');
  
  // Récupérer le jour actuel
  let jourActuel = parseInt(localStorage.getItem('jour_actuel')) || 1;
  
  // ========== LOGIQUE ANTI-SPEED RUNNING ==========
function peutPasserAuJourSuivant() {
  const aujourdhui = new Date().toLocaleDateString('fr-FR');
  const dernierChangement = localStorage.getItem('dernier_changement_jour');
  const jourActuel = parseInt(localStorage.getItem('jour_actuel')) || 1;
  
  // ⭐ Protection spéciale pour le jour 1 ⭐
  if (jourActuel === 1 && !dernierChangement) {
    localStorage.setItem('dernier_changement_jour', aujourdhui);
    return false; // Ne pas avancer du jour 1 au jour 2
  }
  
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
  function afficherDefiDuJour(jour) {
    const defi = getDefiByDay(jour);
    if (!defi) return;
    
    if (currentDayElement) currentDayElement.textContent = jour;
    if (dayCurrentElement) dayCurrentElement.textContent = jour;
    if (challengeTitleElement) challengeTitleElement.textContent = defi.titre;
    if (challengeDescriptionElement) challengeDescriptionElement.textContent = defi.description;
    
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
    
    if (typeof genererCalendrier === 'function') {
      genererCalendrier();
      centrerCalendrierSurJour(jour);
    }
  }
  
  function genererCalendrier() {
  if (!calendarGrid) return;
  calendarGrid.innerHTML = '';
  
  for (let jour = 1; jour <= 77; jour++) {
    const defi = getDefiByDay(jour);
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = jour;
    
    // ===== LOGIQUE CORRIGÉE =====
    // 1. D'abord vérifier si le défi est TERMINÉ
    if (defi.termine) {
      dayElement.classList.add('completed'); // ✅ Accompli
    }
    // 2. Sinon, vérifier si c'est le JOUR ACTUEL
    else if (jour === jourActuel) {
      dayElement.classList.add('current');   // ⏳ En cours
    }
    // 3. Sinon, vérifier si c'est un JOUR PASSÉ NON TERMINÉ
    else if (jour < jourActuel && !defi.termine) {
      dayElement.classList.add('missed');    // ❌ Manqué
    }
    // 4. Sinon, c'est un JOUR FUTUR
    else {
      dayElement.classList.add('upcoming');  // 🕔 À venir
    }
    // ============================
    
    dayElement.addEventListener('click', () => afficherDefiDuJour(jour));
    calendarGrid.appendChild(dayElement);
  }
  centrerCalendrierSurJour(jourActuel);
}
  
  // ========== ÉVÉNEMENTS ==========
  if (markDoneButton) {
    markDoneButton.addEventListener('click', function() {
      const defi = getDefiByDay(jourActuel);
      if (!defi) return;
      defi.termine = true;
      defi.dateValidation = new Date().toISOString();
      if (typeof saveProgression === 'function') saveProgression();
      afficherDefiDuJour(jourActuel);
      alert("Défi validé ! À demain pour le prochain.");
    });
  }
  
  if (notificationTimeSelect) {
    const heureSauvegardee = localStorage.getItem('heure_notification') || '08:00';
    notificationTimeSelect.value = heureSauvegardee;
    notificationTimeSelect.addEventListener('change', function() {
      localStorage.setItem('heure_notification', this.value);
    });
  }
  
  if (testNotificationButton) {
    testNotificationButton.addEventListener('click', async function() {
      if (typeof OneSignal === 'undefined') {
        alert("OneSignal n'est pas encore chargé.");
        return;
      }
      const permission = await checkNotificationPermission();
      if (permission === 'default') {
        OneSignal.showSlidedownPrompt();
      } else if (permission === 'denied') {
        alert("Notifications bloquées.");
      } else if (permission === 'granted') {
        const defi = getDefiByDay(jourActuel);
        OneSignal.sendSelfNotification(
          `🎯 ENVOL - Jour ${jourActuel}`,
          `${defi.titre}`,
          { url: window.location.href }
        );
        alert('✅ Notification de test envoyée !');
      }
    });
  }
  
  // ========== BOUTONS DÉPANNAGE ==========
  document.getElementById('test-notification-btn-2')?.addEventListener('click', async function() {
    const permission = await checkNotificationPermission();
    if (permission === 'granted') {
      const defi = getDefiByDay(jourActuel);
      OneSignal.sendSelfNotification(
        `🎯 ENVOL - Jour ${jourActuel}`,
        `${defi.titre}`,
        { url: window.location.href }
      );
      alert('✅ Notification de test envoyée !');
    } else if (permission === 'default') {
      OneSignal.showSlidedownPrompt();
    }
  });
  
  

//==============IMPORT-EXPORT==============//
  
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
    alert('✅ Sauvegarde exportée !');
  });
  
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
          if (!backupData.progression || !backupData.jourActuel) throw new Error('Format invalide');
          if (confirm(`Importer la sauvegarde du ${new Date(backupData.timestamp).toLocaleDateString('fr-FR')} ?`)) {
            localStorage.setItem('defis_envol', JSON.stringify(backupData.progression));
            localStorage.setItem('jour_actuel', backupData.jourActuel);
            if (backupData.dernierChangement) localStorage.setItem('dernier_changement_jour', backupData.dernierChangement);
            if (backupData.heureNotification) localStorage.setItem('heure_notification', backupData.heureNotification);
            alert('✅ Progression importée !');
            window.location.reload();
          }
        } catch (error) {
          console.error('Erreur import:', error);
          alert('❌ Fichier invalide.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

//=========================NOTIFICATION BUTTONS=================================//

  document.getElementById('test-notification-android-btn')?.addEventListener('click', async function() {
  const btn = this;
  btn.textContent = 'Test...';
  btn.disabled = true;
  
  try {
    // Vérification OneSignal
    if (typeof OneSignal === 'undefined') {
      alert('⚠️ OneSignal pas chargé\nAttendez 5 sec ou rechargez');
      return;
    }
    
    // Vérification permission
    const permission = await checkNotificationPermission();
    
    if (permission === 'granted') {
      const defi = getDefiByDay(jourActuel);
      const heure = localStorage.getItem('heure_notification') || '08:00';
      
      // Essai 1 : OneSignal moderne
      if (OneSignal.Notifications && typeof OneSignal.Notifications.sendTrigger === 'function') {
        try {
          await OneSignal.Notifications.sendTrigger({
            type: "test",
            custom: { title: `🎯 ENVOL Test`, message: defi.titre }
          });
          alert('✅ Notification test envoyée !');
          return;
        } catch (e) {
          console.warn('OneSignal échoué');
        }
      }
      
      // Essai 2 : Notification API native
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('🎯 ENVOL Test', {
            body: `Jour ${jourActuel}: ${defi.titre.substring(0, 80)}`,
            icon: '/sekhamet-envol/assets/icons/ENVOL-192_sansMarges.png'
          });
          alert('✅ Notification test envoyée !');
          return;
        } catch (e) {
          console.warn('Notification API échoué');
        }
      }
      
      // Si tout échoue
      alert(`✅ Test terminé !\nVous recevrez vos défis à ${heure}`);
      
    } else if (permission === 'default') {
      OneSignal.showSlidedownPrompt();
      alert('🔔 Autorisez les notifications puis réessayez');
    } else {
      alert('❌ Notifications bloquées\nAutorisez-les dans les paramètres');
    }
  } catch (error) {
    alert('⚠️ Erreur : ' + error.message);
  } finally {
    btn.textContent = '🧐 Envoyer une notif\' test';
    btn.disabled = false;
  }
});

//===========================RESET PROGRESS BUTTON=============================//
  
  document.getElementById('reset-progress-btn')?.addEventListener('click', function() {
    if (!confirm('ÊTES-VOUS ABSOLUMENT SÛR ?\n\nTous vos défis validés seront effacés !')) return;
    if (!confirm('DERNIÈRE CHANCE : "Annuler" pour garder, "OK" pour supprimer.')) return;
    DefisEnvol.forEach(defi => {
      defi.termine = false;
      defi.dateValidation = null;
    });
    localStorage.setItem('defis_envol', JSON.stringify(DefisEnvol));
    localStorage.setItem('jour_actuel', '1');
    
  // ⭐⭐⭐ CORRECTION ICI (bug du jour 1 manqué après reset) ⭐⭐⭐
  // NE PAS supprimer dernier_changement_jour, mais le mettre à AUJOURD'HUI
  const aujourdhui = new Date().toLocaleDateString('fr-FR');
  localStorage.setItem('dernier_changement_jour', aujourdhui);
  // ⭐⭐⭐

    
    localStorage.setItem('heure_notification', '08:00');
    localStorage.removeItem('install_prompt_shown');
    alert('🗑️ Progression supprimée.');
    window.location.reload();
  });
  
  // ========== INITIALISATION ==========
// jourActuel est déjà déclaré plus haut, on l'utilise directement

// 1. D'abord vérifier et marquer les jours manqués
function verifierJoursManques() {
  const aujourdhui = new Date().toLocaleDateString('fr-FR');
  const dernierVerif = localStorage.getItem('derniere_verif_manques');
  
  if (dernierVerif === aujourdhui) return;
  localStorage.setItem('derniere_verif_manques', aujourdhui);
  
  // Ne pas vérifier si c'est le tout premier jour après réinitialisation
  const jourActuel = parseInt(localStorage.getItem('jour_actuel')) || 1;
  const defiJour1 = getDefiByDay(1);
  
  // Si on est au jour 1 et que le défi jour 1 n'est pas terminé, ne rien faire
  if (jourActuel === 1 && !defiJour1.termine) {
    return;
  }
  
  // Sinon, vérifier normalement
  for (let jour = 1; jour < jourActuel; jour++) {
    const defi = getDefiByDay(jour);
    if (!defi.termine) {
      defi.termine = false; // Déjà false, mais au cas où
    }
  }
  
  if (typeof saveProgression === 'function') saveProgression();
};

// 2. Ensuite vérifier si on peut avancer au jour suivant
// Mais SEULEMENT si l'utilisateur a terminé le jour actuel
function peutAvancerAuJourSuivant() {
  const defiActuel = getDefiByDay(jourActuel);
  if (!defiActuel) return false;
  
  // Si le jour actuel est terminé, on peut vérifier si on passe au suivant
  if (defiActuel.termine) {
    return peutPasserAuJourSuivant() && jourActuel < 77;
  }
  return false;
}

function verifierEtAvancerJour() {
  if (peutAvancerAuJourSuivant()) {
    jourActuel++;
    localStorage.setItem('jour_actuel', jourActuel.toString());
  }
  afficherDefiDuJour(jourActuel);
}

// 3. Maintenant on peut appeler verifierEtAvancerJour
verifierEtAvancerJour();

// 4. Continuer avec le reste...
showInstallOverlay();
setTimeout(checkForUpdates, 5000);
console.log('✅ ENVOL initialisé');

  
}); // FIN DU DOMContentLoaded

// ========== GESTION PWA ==========
let deferredPrompt;
const installButton = document.createElement('button');
installButton.id = 'install-pwa-btn';
installButton.className = 'install-btn';
installButton.textContent = '📱 Installer ENVOL sur l\'écran d\'accueil';
installButton.style.cssText = `
  display: none;
  width: calc(100% - 40px);
  max-width: 400px;
  margin: 20px auto;
  background: linear-gradient(135deg, #0b252f 0%, #0e303d 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 4px 15px rgba(11, 37, 47, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
`;

window.addEventListener('beforeinstallprompt', (event) => {
  console.log('👍 beforeinstallprompt déclenché');
  event.preventDefault();
  deferredPrompt = event;
  installButton.style.display = 'block';
  const footer = document.querySelector('.app-footer');
  if (footer) {
    const footerContent = footer.querySelector('.footer-content');
    if (footerContent) {
      footer.insertBefore(installButton, footerContent);
    } else {
      footer.prepend(installButton);
    }
  }
});

installButton.addEventListener('click', async () => {
  if (!deferredPrompt) {
    alert("Pour installer l'application :\n\n1. Sur Android : menu → \"Ajouter à l'écran d'accueil\"\n2. Sur iOS : utilisez le bouton Partager (📤) de Safari → \"Sur l'Écran d'Accueil\"");
    return;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`Choix utilisateur : ${outcome}`);
  deferredPrompt = null;
  installButton.style.display = 'none';
});

window.addEventListener('appinstalled', () => {
  console.log('🎉 PWA installée avec succès !');
  installButton.style.display = 'none';
});

if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('📱 App déjà installée');
  installButton.style.display = 'none';
}
// ========== FIN DU FICHIER ==========
