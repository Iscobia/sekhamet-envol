// envol-notifications.js - Version corrigée pour OneSignal
console.log('🔔 [Envol-Notifications] Chargement du module...');

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔔 [Envol-Notifications] DOM chargé, initialisation...');
  
  // Initialiser après un délai pour laisser OneSignal se charger
  setTimeout(initEnvolNotifications, 2000);
});

async function initEnvolNotifications() {
  console.log('🔔 [Envol-Notifications] Début initialisation...');
  
  try {
    // VÉRIFICATION 1: OneSignal est-il disponible ?
    if (typeof OneSignal === 'undefined') {
      console.warn('⚠️ [Envol-Notifications] OneSignal non disponible');
      
      // Fallback: utiliser la variable globale si définie
      if (typeof window.OneSignalGlobal !== 'undefined') {
        console.log('🔔 [Envol-Notifications] Utilisation OneSignalGlobal');
        setupOneSignal(window.OneSignalGlobal);
      } else {
        console.error('❌ [Envol-Notifications] OneSignal complètement absent');
        setupFallbackNotifications();
      }
      return;
    }
    
    console.log('✅ [Envol-Notifications] OneSignal disponible');
    setupOneSignal(OneSignal);
    
  } catch (error) {
    console.error('❌ [Envol-Notifications] Erreur initialisation:', error);
    setupFallbackNotifications();
  }
}

async function setupOneSignal(oneSignal) {
  console.log('🔔 [Envol-Notifications] Configuration OneSignal...');
  
  try {
    // VÉRIFIER SI DÉJÀ INITIALISÉ
    if (oneSignal.config && oneSignal.config.appId) {
      console.log('✅ [Envol-Notifications] OneSignal déjà initialisé avec App ID:', oneSignal.config.appId);
    } else {
      console.warn('⚠️ [Envol-Notifications] OneSignal pas encore initialisé');
      // Ne pas réinitialiser! Attendre
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // CONFIGURER VOS NOTIFICATIONS QUOTIDIENNES
    await setupDailyNotifications(oneSignal);
    
    // CONFIGURER L'INTERFACE UTILISATEUR
    setupNotificationUI(oneSignal);
    
    console.log('✅ [Envol-Notifications] Configuration terminée');
    
  } catch (error) {
    console.error('❌ [Envol-Notifications] Erreur configuration:', error);
  }
}

async function setupDailyNotifications(oneSignal) {
  console.log('🔔 [Envol-Notifications] Configuration notifications quotidiennes...');
  
  // Récupérer l'heure configurée
  const heureNotification = localStorage.getItem('heure_notification') || '09:00';
  const [heures, minutes] = heureNotification.split(':').map(Number);
  
  console.log(`🔔 [Envol-Notifications] Heure configurée: ${heures}h${minutes}`);
  
  // Pour OneSignal, on doit créer des tags/custom data
  // Les vraies notifications programmées nécessitent le dashboard OneSignal
  
  // Méthode simplifiée: utiliser les tags
  await oneSignal.User.addTag('notification_time', heureNotification);
  await oneSignal.User.addTag('app_name', 'ENVOL');
  
  console.log('✅ [Envol-Notifications] Tags configurés');
}


//=============================================//
//============= BOUTONS TECHNIQUES ============//
//=============================================//

function setupNotificationUI(oneSignal) {
  console.log('🔔 [Envol-Notifications] Configuration UI...');
  
  // ========== DÉTECTION NAVIGATEUR ==========
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  console.log('🔔 [Envol-Notifications] User Agent:', userAgent.substring(0, 80) + '...');
  console.log('🔔 [Envol-Notifications] Platform:', platform);
  
  const isIOS = /iPhone|iPad|iPod/i.test(platform) || 
                /iPhone|iPad|iPod/i.test(userAgent);
  const isFirefox = /Firefox/i.test(userAgent);
  const isChrome = /Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent);
  
  console.log('🔔 [Envol-Notifications] Détection:', { isIOS, isFirefox, isChrome });
  
  // ========== MESSAGES INFORMATIFS ==========
  if (isIOS) {
    console.log('🍎 iOS détecté - Notifications push non supportées');
    
    // Message visuel pour iOS
    const iosWarning = document.createElement('div');
    iosWarning.className = 'ios-info-message';
    iosWarning.innerHTML = `
      <p><strong>📱 Pour les utilisateurs iPhone/iPad :</strong></p>
      <p>iOS ne permet pas les notifications push pour les applications web.</p>
      <p><em>Astuce : Gardez ENVOL ouverte ou programmez un rappel quotidien ! 😃</em></p>
    `;
    
    const troubleshooting = document.querySelector('.troubleshooting');
    if (troubleshooting) {
      troubleshooting.insertBefore(iosWarning, troubleshooting.firstChild);
    }
  }
  
  if (isFirefox && !isIOS) {
    console.log('🦊 Firefox détecté - Notifications possibles avec limitations');
    
    // Message pour Firefox
    const firefoxWarning = document.createElement('div');
    firefoxWarning.className = 'firefox-info-message';
    firefoxWarning.innerHTML = `
      <p><strong>🦊 Firefox détecté :</strong></p>
      <p>Les notifications peuvent être bloquées par la "Protection renforcée".</p>
      <p><em>Si besoin, désactivez-la temporairement dans les paramètres.</em></p>
    `;
    
    const troubleshooting = document.querySelector('.troubleshooting');
    if (troubleshooting && !isIOS) {
      troubleshooting.insertBefore(firefoxWarning, troubleshooting.firstChild);
    }
  }
  
  // ========== BOUTON ON/OFF INTELLIGENT ==========
  const toggleBtn = document.getElementById('notifications-toggle-btn');
  if (toggleBtn) {
    console.log('✅ [Envol-Notifications] Bouton toggle trouvé');
    
    function updateToggleButton() {
      const isActive = Notification.permission === "granted";
      const statusSpan = document.getElementById('notifications-status');
      
      if (isActive) {
        toggleBtn.className = 'backup-btn active';
        toggleBtn.innerHTML = '🔔 <span id="notifications-status">Notifications activées</span>';
      } else {
        toggleBtn.className = 'backup-btn inactive';
        toggleBtn.innerHTML = '🔕 <span id="notifications-status">Activer les notifications</span>';
      }
    }
    
    updateToggleButton();
    
    toggleBtn.addEventListener('click', async function() {
      console.log('🔔 [Envol-Notifications] Clic toggle');
      
      if (Notification.permission === "granted") {
        // DÉSACTIVER
        if (confirm('Voulez-vous désactiver les notifications quotidiennes ?\n\nVous pourrez les réactiver à tout moment.')) {
          try {
            if (isIOS) {
              alert('📱 Sur iOS :\n1. Allez dans Paramètres → Safari\n2. Trouvez "ENVOL"\n3. Sélectionnez "Ne pas autoriser"');
            } else {
              if (oneSignal?.User?.PushSubscription?.optOut) {
                await oneSignal.User.PushSubscription.optOut();
              }
              alert('✅ Notifications désactivées !\n\nPour supprimer complètement :\nCliquez sur 🔒 à gauche de l\'URL → Notifications → Bloquer');
            }
          } catch (error) {
            console.error('Erreur désabonnement:', error);
            alert('⚠️ Erreur technique. Désactivez dans les paramètres du navigateur.');
          }
        }
      } else {
        // ACTIVER
        if (isIOS) {
          alert('📱 Sur iOS, les notifications push ne sont pas disponibles.\n\nConseil : Gardez ENVOL ouverte ou créez un rappel calendrier !');
          return;
        }
        
        if (isFirefox) {
          alert('🦊 Firefox détecté :\n\n1. La "Protection renforcée" peut bloquer OneSignal\n2. Si aucune popup n\'apparaît, désactivez-la temporairement');
        }
        
        try {
          await oneSignal.Slidedown.promptPush();
          
          setTimeout(() => {
            if (Notification.permission === "granted") {
              alert('✅ Notifications activées !\n\nVous recevrez un rappel quotidien pour votre défi.');
            } else if (Notification.permission === "denied") {
              alert('❌ Notifications refusées.\n\nAutorisez-les dans les paramètres du navigateur.');
            }
          }, 2000);
          
        } catch (error) {
          console.error('Erreur activation:', error);
          alert('⚠️ Impossible d\'afficher la popup.\n\nEssayez de recharger la page ou utilisez Chrome.');
        }
      }
      
      setTimeout(updateToggleButton, 1000);
    });
  }
  
  // ========== BOUTON "AUTORISER NOTIFICATIONS" ==========
  const allowBtn = document.getElementById('allow-notifications-btn');
  if (allowBtn) {
    console.log('✅ [Envol-Notifications] Bouton allow trouvé');
    
    allowBtn.addEventListener('click', async function() {
      console.log('🔔 [Envol-Notifications] Clic sur autoriser notifications');
      
      if (isIOS) {
        alert('📱 Sur iOS, utilisez plutôt le bouton "Gérer les notifications" ci-dessus.\n\nLes notifications push ne sont pas supportées.');
        return;
      }
      
      if (isFirefox) {
        alert('🦊 Firefox détecté :\nLa "Protection renforcée" peut bloquer OneSignal.');
      }
      
      try {
        const currentPermission = Notification.permission;
        console.log('Permission actuelle:', currentPermission);
        
        if (currentPermission === "default") {
          await oneSignal.Slidedown.promptPush();
          
          setTimeout(() => {
            if (Notification.permission === "granted") {
              alert('✅ Notifications activées !');
            }
          }, 2000);
          
        } else if (currentPermission === "granted") {
          alert('✅ Vous êtes déjà abonné aux notifications !');
        } else {
          alert('❌ Notifications bloquées.\nAutorisez-les dans les paramètres du navigateur.');
        }
        
      } catch (error) {
        console.error('❌ Erreur:', error);
        alert('⚠️ Erreur technique : ' + error.message);
      }
    });
  }
  
  // ========== BOUTON "TEST NOTIFICATION" ==========
  const testBtn = document.getElementById('test-notification-android-btn');
  if (testBtn) {
    console.log('✅ [Envol-Notifications] Bouton test trouvé');
    
    testBtn.addEventListener('click', async function() {
      console.log('🔔 [Envol-Notifications] Clic sur test notification');
      
      if (Notification.permission !== "granted") {
        alert('❌ Veuillez d\'abord autoriser les notifications');
        return;
      }
      
      if (isIOS) {
        alert('📱 Sur iOS, les notifications push ne sont pas disponibles.\n\nMais vous pouvez tester les notifications locales !');
        
        if ('Notification' in window) {
          const jourActuel = localStorage.getItem('jour_actuel') || 1;
          const notif = new Notification(`🎯 ENVOL iOS - Jour ${jourActuel}`, {
            body: 'Notification locale de test',
            icon: '/sekhamet-envol/assets/icons/ENVOL-192_sansMarges.png'
          });
          
          notif.onclick = () => {
            window.focus();
            notif.close();
          };
          
          alert('✅ Notification locale envoyée !');
        }
        return;
      }
      
      try {
        const jourActuel = localStorage.getItem('jour_actuel') || 1;
        
        if (oneSignal.Notifications?.addTrigger) {
          await oneSignal.Notifications.addTrigger({
            'test': Date.now(),
            'jour': jourActuel
          });
          alert('✅ Notification test envoyée !\nElle devrait apparaître dans quelques secondes.');
        } else {
          // Fallback
          const notif = new Notification('🎯 ENVOL Test', {
            body: `Jour ${jourActuel} - Test de notification`,
            icon: '/sekhamet-envol/assets/icons/ENVOL-192_sansMarges.png'
          });
          notif.onclick = () => {
            window.focus();
            notif.close();
          };
          alert('✅ Notification locale envoyée !');
        }
        
      } catch (error) {
        console.error('❌ Erreur test:', error);
        alert('⚠️ Erreur d\'envoi : ' + error.message);
      }
    });
  }
}

//=============================================//
//=========== FIN BOUTONS TECHNIQUES ==========//
//=============================================//



function setupFallbackNotifications() {
  console.log('🔔 [Envol-Notifications] Utilisation fallback (notifications natives)');

    // Détecter Firefox
  if (/Firefox/i.test(navigator.userAgent)) {
    console.log('ℹ️ Firefox détecté - OneSignal bloqué par la protection');
  }
  
  // Code de fallback simple
  const testBtn = document.getElementById('test-notification-android-btn');
  if (testBtn) {
    testBtn.addEventListener('click', function() {
      if ('Notification' in window && Notification.permission === 'granted') {
        const jourActuel = localStorage.getItem('jour_actuel') || 1;
        const notif = new Notification(`🎯 ENVOL - Jour ${jourActuel}`, {
          body: 'Notification de test',
          icon: '/sekhamet-envol/assets/icons/ENVOL-192_sansMarges.png'
        });
        
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        
        alert('✅ Notification native envoyée !');
      } else {
        alert('❌ Veuillez autoriser les notifications dans les paramètres de votre navigateur.');
      }
    });
  }
}
