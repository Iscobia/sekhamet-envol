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

function setupNotificationUI(oneSignal) {
  console.log('🔔 [Envol-Notifications] Configuration UI...');
  
  // Bouton "Autoriser les notifications"
  const allowBtn = document.getElementById('allow-notifications-btn');
  if (allowBtn) {
    console.log('✅ [Envol-Notifications] Bouton allow trouvé');
    
    allowBtn.addEventListener('click', async function() {
      console.log('🔔 [Envol-Notifications] Clic sur autoriser notifications');
      
      try {
        // Vérifier l'état actuel
        const isSubscribed = await oneSignal.User.PushSubscription.optIn;
        
        if (!isSubscribed) {
          console.log('🔔 [Envol-Notifications] Demande d\'autorisation...');
          
          // Afficher la popup d'autorisation
          await oneSignal.Slidedown.promptPush();
          
          // Vérifier après 2 secondes
          setTimeout(async () => {
            const newStatus = await oneSignal.User.PushSubscription.optIn;
            if (newStatus) {
              alert('✅ Notifications activées ! Vous recevrez vos défis quotidiennement.');
            }
          }, 2000);
          
        } else {
          alert('✅ Vous êtes déjà abonné aux notifications !');
        }
        
      } catch (error) {
        console.error('❌ [Envol-Notifications] Erreur autorisation:', error);
        alert('⚠️ Erreur: ' + error.message);
      }
    });
  }
  
  // Bouton "Test notification"
  const testBtn = document.getElementById('test-notification-android-btn');
  if (testBtn) {
    console.log('✅ [Envol-Notifications] Bouton test trouvé');
    
    testBtn.addEventListener('click', async function() {
      console.log('🔔 [Envol-Notifications] Clic sur test notification');
      
      try {
        // Vérifier la permission
        const isSubscribed = await oneSignal.User.PushSubscription.optIn;
        
        if (!isSubscribed) {
          alert('❌ Veuillez d\'abord autoriser les notifications');
          return;
        }
        
        // Envoyer une notification de test
        const jourActuel = localStorage.getItem('jour_actuel') || 1;
        const defis = JSON.parse(localStorage.getItem('defis_envol') || '[]');
        const defiDuJour = defis[jourActuel - 1] || { titre: 'Test' };
        
        // Méthode 1: Utiliser les triggers (recommandé)
        if (oneSignal.Notifications && typeof oneSignal.Notifications.addTrigger === 'function') {
          await oneSignal.Notifications.addTrigger({
            'test_notification': true,
            'jour': jourActuel,
            'timestamp': new Date().getTime()
          });
          
          alert('✅ Notification test envoyée ! Elle devrait apparaître dans quelques secondes.');
          
        } else {
          // Méthode alternative
          alert('✅ Test déclenché ! Vérifiez votre centre de notifications.');
        }
        
      } catch (error) {
        console.error('❌ [Envol-Notifications] Erreur test:', error);
        alert('⚠️ Erreur: ' + error.message);
      }
    });
  }
}

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
