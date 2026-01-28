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
    iosWarning.className = 'browser-warning';
    iosWarning.innerHTML = `
      <p><strong>📱 Sur iOS</strong>, les notifications push ne fonctionnent pas quand l\'app est fermée (limitation Apple).</p>
      <p>Mais <strong>tu peux recevoir des notifications quand ENVOL est ouverte !</strong></p>
      <p>Garde un onglet ouvert pour tes rappels quotidiens 😊</p>
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
    firefoxWarning.className = 'browser-warning.firefox';
    firefoxWarning.innerHTML = `
      <p><strong>🦊 Firefox détecté :</strong></p>
      <p>Tes notifications peuvent être bloquées par la "Protection renforcée".</p>
      <p><em>Si besoin, désactive-la temporairement dans les paramètres.</em></p>
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
  const toggleBtn = document.getElementById('notifications-toggle-btn');
  
  if (!toggleBtn) return;
  
  if (isActive) {
    // MODE ON (vert) : "Notifications activées : Désactiver les notifications ? 🔕"
    toggleBtn.className = 'backup-btn toggle-on';
    toggleBtn.innerHTML = '🔕 Notifications activées : Désactiver les notifications ?';
  } else {
    // MODE OFF (rouge) : "Notifications désactivées : Activer les notifications ? 🔔"
    toggleBtn.className = 'backup-btn toggle-off';
    toggleBtn.innerHTML = '🔔 Notifications désactivées : Activer les notifications ?';
  }
}
    
    updateToggleButton();
    
    toggleBtn.addEventListener('click', async function() {
  console.log('🔔 [Envol-Notifications] Clic toggle');
  
  if (Notification.permission === "granted") {
    // DÉSACTIVER
    if (confirm('Voudrais-tu désactiver tes notifications quotidiennes ?\n\nTu pourras les réactiver à tout moment si tu changes d\'avis 😊')) {
      try {
        if (oneSignal?.User?.PushSubscription?.optOut) {
          await oneSignal.User.PushSubscription.optOut();
        }
        
        // Alerte chaleureuse de confirmation
        alert('✨ Parfait ! Tes notifications sont maintenant désactivées.\n\nSi tu veux les réactiver plus tard, ce bouton sera toujours là pour toi !\n\nPrends soin de toi 🌟');
        
      } catch (error) {
        console.error('Erreur désabonnement:', error);
        alert('Oh mince ! Une petite erreur s\'est glissée...\n\nTu peux désactiver les notifications directement dans les paramètres de ton navigateur 💙');
      }
    }
  } else {
    // ACTIVER
    if (isIOS) {
      alert('📱 Sur iOS, les notifications push ne fonctionnent pas quand l\'app est fermée (limitation Apple).\n\nMais tu peux recevoir des notifications quand ENVOL est ouverte !\n\nGarde un onglet ouvert pour tes rappels quotidiens 😊');
      return;
    }
    
    if (isFirefox) {
      alert('🦊 Coucou ! Firefox a parfois une "Protection renforcée" qui peut bloquer les notifications.\n\nSi la popup n\'apparaît pas, désactive-la temporairement dans les paramètres.\n\nMerci pour ta patience 🙏');
    }
    
    try {
      await oneSignal.Slidedown.promptPush();
      
      setTimeout(() => {
        if (Notification.permission === "granted") {
          // Alerte joyeuse de succès
          alert('🎉 Génial ! Tes notifications sont maintenant activées !\n\nChaque jour, je te rappellerai de venir faire ton défi ENVOL.\n\nÀ demain pour la prochaine aventure ! 🚀');
        } else if (Notification.permission === "denied") {
          alert('Je comprends ! Tu as choisi de ne pas recevoir de notifications.\n\nSi tu changes d\'avis, tu peux les autoriser dans les paramètres de ton navigateur.\n\nTon parcours continue quand même ! 🌈');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Erreur activation:', error);
      alert('Oups ! Je n\'ai pas réussi à afficher la demande de permission...\n\nPeut-être qu\'un bloqueur ou une protection de navigateur empêche ça.\n\nEssaie avec Chrome ou désactive temporairement les protections 💡');
    }
  }
  
  // Mise à jour du bouton après un petit délai
  setTimeout(updateToggleButton, 500);
});
  }
  
  // ========== BOUTON "AUTORISER NOTIFICATIONS" ==========
  const allowBtn = document.getElementById('allow-notifications-btn');
  if (allowBtn) {
    console.log('✅ [Envol-Notifications] Bouton allow trouvé');
    
    allowBtn.addEventListener('click', async function() {
      console.log('🔔 [Envol-Notifications] Clic sur autoriser notifications');
      
  if (isIOS) {
    alert('📱 Sur iOS, les notifications push ne fonctionnent pas quand l\'app est fermée (limitation Apple).\n\nMais tu peux recevoir des notifications quand ENVOL est ouverte !\n\nGarde un onglet ouvert pour tes rappels quotidiens 😊');
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
          alert('✅ Tu es déjà abonné.e aux notifications !');
        } else {
          alert('❌ Notifications bloquées.\nAutorise-les dans les paramètres de ton navigateur. 🙂');
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
        alert('Hey ! Avant de tester, il faut que tu autorises les notifications.\n\nClique sur "Activer les notifications" juste au-dessus, puis reviens ici !\n\nJe t\'attends 😊');
        return;
      }
      
      if (isIOS) {
        alert('📱 Sur iOS, les notifications push ne fonctionnent pas quand l\'app est fermée (limitation Apple).\n\nMais tu peux recevoir des notifications quand ENVOL est ouverte !\n\nGarde un onglet ouvert pour tes rappels quotidiens 😊');
        return;
        
        if ('Notification' in window) {
          const jourActuel = localStorage.getItem('jour_actuel') || 1;
          const notif = new Notification(`🎯 ENVOL iOS - Jour ${jourActuel}`, {
            body: 'Notification locale de test - Bravo !',
            icon: '/sekhamet-envol/assets/icons/ENVOL-192_sansMarges.png'
          });
          
          notif.onclick = () => {
            window.focus();
            notif.close();
          };
          
          alert('✨ Parfait ! Notification locale envoyée !\n\nC\'est comme ça que tu verras les rappels quand l\'app est ouverte.\n\nGarde ENVOL dans un onglet pour ne rien manquer ! 💫');
        }
        return;
      }
      
      try {
        const jourActuel = localStorage.getItem('jour_actuel') || 1;
        console.log('🔔 Test pour le jour:', jourActuel);
        
        // Méthode 1: OneSignal addTrigger (v16)
        if (oneSignal.Notifications?.addTrigger) {
          console.log('🔔 Utilisation addTrigger');
          await oneSignal.Notifications.addTrigger({
            'test': Date.now(),
            'jour': jourActuel,
            'message': 'Test de notification ENVOL'
          });
          
          alert('✅ Super ! J\'ai envoyé une notification test.\n\nRegarde en haut à droite de ton écran, elle devrait arriver d\'ici quelques secondes !\n\nSi tu ne la vois pas, vérifie tes paramètres de notifications 😊');
          
        } else {
          // Fallback: Notification API native
          console.log('🔔 Fallback: Notification API native');
          const notif = new Notification('🎯 ENVOL - Test réussi !', {
            body: `Jour ${jourActuel} - Merci d'avoir testé !`,
            icon: '/sekhamet-envol/assets/icons/ENVOL-192_sansMarges.png',
            badge: '/sekhamet-envol/assets/icons/ENVOL-192.png'
          });
          
          notif.onclick = () => {
            window.focus();
            notif.close();
          };
          
          // Auto-fermeture après 5 secondes
          setTimeout(() => notif.close(), 5000);
          
          alert('✨ Bravo ! Notification locale envoyée !\n\nC\'est exactement comme ça que tu recevras tes défis quotidiens.\n\nÀ très vite pour le prochain défi ! 💫');
        }
        
      } catch (error) {
        console.error('❌ Erreur test:', error);
        
        let message = 'Oh non ! Une petite erreur s\'est produite...\n\n';
        let showMailOption = false;
        
        if (error.message.includes('permission')) {
          message = 'Oups ! On dirait que la permission a été révoquée...\n\nRéautorise les notifications dans les paramètres de ton navigateur, s\'il te plaît 🌸';
        } else if (error.message.includes('Illegal constructor')) {
          message = 'Ton navigateur a besoin d\'une mise à jour ou d\'un rechargement.\n\n';
          message += 'Essaie de :\n';
          message += '1. Recharger la page\n';
          message += '2. Vérifier que tu es en ligne\n';
          message += '3. Réessayer dans quelques instants\n\n';
          showMailOption = true;
        } else if (error.message.includes('user isn\'t subscribed')) {
          message = 'Active d\'abord les notifications avec le bouton vert ci-dessus 😊';
        } else {
          message += error.message + '\n\nRecharge la page et réessaie 🌸';
          showMailOption = true;
        }
        
        // Si erreur persistante, proposer de contacter
        if (showMailOption) {
          message += '\n\nSi le problème persiste, nous contacter peut nous aider à le résoudre !';
          
          if (confirm(message + '\n\nSouhaites-tu ouvrir ton client mail pour nous écrire ?')) {
            const sujet = '⚠️🔔🕊️ Problème notifications ENVOL';
            const corps = `Bonjour,\n\nJ'ai un problème avec les notifications ENVOL.\n\nDétails : ${error.message}\n\nMerci !`;
            window.location.href = `mailto:contact@sekhamet.com?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
            return;
          }
        } else {
          alert(message);
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
        alert('❌ Les notifications ne sont pas autorisées dans les paramètres de ton navigateur :\nvérifies tes autorisations et réessaie. 🙂\nSi ça ne fonctionne toujours pas, envoie-moi une capture d\'écran à contact@sekhamet.com');
      }
    });
  }
}
