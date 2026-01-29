// envol-notifications.js - Version corrigée pour OneSignal
console.log('🔔 [Envol-Notifications] Chargement du module...');

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔔 [Envol-Notifications] DOM chargé, initialisation...');
  
  // Initialiser après un délai pour laisser OneSignal se charger
  setTimeout(initEnvolNotifications, 2000);
});


//===========================================================================
// 1. Fonction principale d'initialisation


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




//===========================================================================
// 2. Configuration OneSignal

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
          
          // CONFIGURER LES NOTIFICATIONS QUOTIDIENNES One Signal
          await setupDailyNotifications(oneSignal);
          // PROGRAMMER LES NOTIFICATIONS NATIVES
          await programmerNotificationQuotidienne();
          
          // CONFIGURER L'INTERFACE UTILISATEUR
          setupNotificationUI(oneSignal);
          
          console.log('✅ [Envol-Notifications] Configuration terminée');
          
        } catch (error) {
          console.error('❌ [Envol-Notifications] Erreur configuration:', error);
        }
      }



 //===========================================================================
  // 3. Configuration notifications quotidiennes

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





//===========================================================================//
//========================= BOUTONS TECHNIQUES ==============================//
//===========================================================================//


//===========================================================================
// 4. Configuration INTERFACE UTILISATEUR (boutons, messages)


async function setupNotificationUI(oneSignal) {
  console.log('🔔 [Envol-Notifications] Configuration UI...');

  // ========== MISE À JOUR INITIALE DU BOUTON ==========
   await updateToggleButton();
  
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
  } // fin de if (isIOS)


  
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


  
  // =======================================================================
  // ========== BOUTON ON/OFF INTELLIGENT ==================================
  // =======================================================================
  
  const toggleBtn = document.getElementById('notifications-toggle-btn');

  
  if (toggleBtn) {
    console.log('✅ [Envol-Notifications] Bouton toggle trouvé');
    
    
  async function updateToggleButton() {
  const toggleBtn = document.getElementById('notifications-toggle-btn');
  if (!toggleBtn) return;
  
  let isActive = false;
  
  // VÉRIFICATION 1 : OneSignal (si disponible)
  if (typeof OneSignal !== 'undefined' && OneSignal.User && OneSignal.User.PushSubscription) {
    try {
      const subscription = OneSignal.User.PushSubscription;
      isActive = await subscription.optIn();
      console.log('🔔 État OneSignal (optIn):', isActive);
    } catch (e) {
      console.warn('⚠️ Erreur vérification OneSignal:', e);
      isActive = Notification.permission === "granted";
    }
  } 
  // VÉRIFICATION 2 : Notification API native
  else {
    isActive = Notification.permission === "granted";
    console.log('🔔 État Notification API:', isActive);
  }
  
  // MISE À JOUR DU BOUTON
  if (isActive) {
    toggleBtn.className = 'backup-btn toggle-on';
    toggleBtn.innerHTML = '🔕 Notifications activées : Désactiver les notifications ?';
    
    // Démarrer les notifications
    setTimeout(() => {
      programmerNotificationQuotidienne();
    }, 1000);
  } else {
    toggleBtn.className = 'backup-btn toggle-off';
    toggleBtn.innerHTML = '🔔 Notifications désactivées : Activer les notifications ?';
  }
  
    console.log('🔔 Bouton toggle:', isActive ? 'VERT (ON)' : 'ROUGE (OFF)');
  }


    
    updateToggleButton();


    //================================================================
    //======= ÉCOUTE D'UNE INTERACTION AVEC LE BOUTON TOGGLE =========
    
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
  } // Fin de if (toggleBtn) 



  
    // =======================================================================
    // ========== BOUTON "AUTORISER NOTIFICATIONS" ===========================
    // =======================================================================

  
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
    }  // fin de  if (allowBtn)



  
  
  // ========== BOUTON "TEST NOTIFICATION" ==========
  const testBtn = document.getElementById('test-notification-android-btn');
  if (testBtn) {
    console.log('✅ [Envol-Notifications] Bouton test trouvé');
    
    testBtn.addEventListener('click', async function() {
      console.log('🔔 Test complet des notifications...');

      //===== Test simple des notif natives et notif OneSignal============

      let resultats = [];
  
      // Test 1 : Notifications natives
      if ('Notification' in window) {
        if (Notification.permission === "granted") {
          try {
            const notif = new Notification(`🎯 ENVOL iOS - Jour ${jourActuel}`, {
              body: 'Notification locale de test - Bravo !',
              icon: '/sekhamet-envol/assets/icons/ENVOL-192_sansMarges.png'
            });

            // AJOUTE APRÈS :
            notif.onclick = function(event) {
              event.preventDefault();
              window.focus();
              notif.close();
            };
            
            resultats.push('✅ Notifications natives: OK');
            setTimeout(() => notif.close(), 2000);
          } catch (e) {
            resultats.push('❌ Notifications natives: ' + e.message);
          }
        } else {
          resultats.push('⚠️ Notifications natives: Permission non accordée');
        }
      } else {
        resultats.push('❌ Notifications natives: Non supporté');
      }


     // Test 2 : OneSignal
      
      if (typeof OneSignal !== 'undefined') {
    try {
      await OneSignal.Notifications.addTrigger({ test: 'envol-test' });
      resultats.push('✅ OneSignal: Test envoyé');
    } catch (e) {
      resultats.push('❌ OneSignal: ' + e.message);
    }
  } else {
    resultats.push('⚠️ OneSignal: Non disponible');
  }
  
  // Test Service Worker (pour notifications avec actions)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    resultats.push('✅ Service Worker: Actif');
    
    // Tester une notification complète
    const jourActuel = localStorage.getItem('jour_actuel') || 1;
    const defi = getDefiByDay(jourActuel);
    
    if (defi) {
      try {
        navigator.serviceWorker.controller.postMessage({
          action: 'SEND_NOTIFICATION',
          jour: jourActuel,
          titre: defi.titre,
          description: defi.description.substring(0, 50) + '...',
          tag: 'test-notification'
        });
        resultats.push('✅ Notification avec actions: Envoyée');
      } catch (e) {
        resultats.push('❌ Service Worker notification: ' + e.message);
      }
    }
  } else {
    resultats.push('⚠️ Service Worker: Inactif');
  }
  
  // Afficher résultats
  alert('🔔 TESTS NOTIFICATIONS 🔔\n\n' + resultats.join('\n') + 
        '\n\n📱 Sur iOS: Notifications limitées quand l\'app est fermée\n🦊 Firefox: Peut bloquer OneSignal\n\nPour les notifications quotidiennes:\n• Chrome/Edge: Complet\n• Firefox: Natives seulement\n• iOS Safari: Quand l\'app est ouverte');
});
  

//===========================================================================//
//======================= FIN BOUTONS TECHNIQUES ============================//
//===========================================================================//



//===========================================================================
// 5. Fallback (plan B) - FONCTION SÉPARÉE !
  
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



// =====================================================================
// ==============🔔 NOTIFICATIONS NATIVES QUOTIDIENNES 🔔===============
// =====================================================================

let notificationsProgrammees = false;

async function programmerNotificationQuotidienne() {
  console.log('🔔 [Programmation] Début...');
  
  // Vérifier si déjà programmée
  if (notificationsProgrammees) {
    console.log('🔔 [Programmation] Déjà en cours');
    return;
  }
  
  // VÉRIFIER LA PERMISSION AVANT de mettre à true
  if (Notification.permission !== 'granted') {
    console.log('❌ [Programmation] Permission non accordée');
    return;
  }
  
  // MAINTENANT on peut marquer comme programmée
  notificationsProgrammees = true;
  
  
  // 1. Vérifier la permission 
  if (Notification.permission !== 'granted') {
    console.log('❌ Permission non accordée');
    return;
  }
  
  // 2. Récupérer l'heure configurée
  const heureNotification = localStorage.getItem('heure_notification') || '09:00';
  const [heures, minutes] = heureNotification.split(':').map(Number);
  
  // 3. Calculer l'heure de déclenchement
  const maintenant = new Date();
  const heureDeclenchement = new Date();
  heureDeclenchement.setHours(heures, minutes, 0, 0);
  
  // Si l'heure est déjà passée aujourd'hui, programmer pour demain
  if (heureDeclenchement < maintenant) {
    heureDeclenchement.setDate(heureDeclenchement.getDate() + 1);
  }
  
  const delaiMs = heureDeclenchement.getTime() - maintenant.getTime();
  
  console.log(`🔔 Notification programmée à ${heureNotification} (dans ${Math.round(delaiMs/1000/60)} minutes)`);
  
  // 4. Programmer la notification
  setTimeout(async () => {
    await envoyerNotificationDuJour();
    
    // Reprogrammer pour le lendemain
    programmerNotificationQuotidienne();
  }, delaiMs);
}

async function envoyerNotificationDuJour() {
  try {
    // 1. Récupérer le jour actuel
    const jourActuel = parseInt(localStorage.getItem('jour_actuel')) || 1;
    
    // 2. Récupérer le défi du jour
    const defi = getDefiByDay(jourActuel);
    
    if (!defi) {
      console.error('❌ Défi non trouvé pour le jour', jourActuel);
      return;
    }
    
    // 3. Créer la notification avec le SERVICE-WORKER (permet les actions)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Envoyer via Service Worker
      navigator.serviceWorker.controller.postMessage({
        action: 'SEND_NOTIFICATION',
        jour: jourActuel,
        titre: defi.titre,
        description: defi.description,
        tag: `envol-jour-${jourActuel}`
      });
      
      console.log('✅ Notification envoyée via Service Worker:', {
        jour: jourActuel,
        titre: defi.titre,
        heure: new Date().toLocaleTimeString('fr-FR')
      });
      
    } else {
      // Fallback : Notification simple
      const options = {
        body: `Jour ${jourActuel}: ${defi.titre}\n\n${defi.description.substring(0, 100)}...`,
        icon: '/sekhamet-envol/assets/icons/ENVOL-192_sansMarges.png',
        tag: `envol-jour-${jourActuel}`,
        requireInteraction: true
      };
      
      // 4. Envoyer la notification
      const notification = new Notification(`🎯 ENVOL - Défi du jour`, options);
      
      
      console.log('✅ Notification native envoyée:', {
        jour: jourActuel,
        titre: defi.titre,
        heure: new Date().toLocaleTimeString('fr-FR')
      });
      
      // 5. Gérer les clics
      notification.onclick = function(event) {
        event.preventDefault(); // ← BLOQUE le comportement par défaut
        window.focus();         // ← Met l'app au premier plan
        notification.close();   // ← Ferme la notification
      };
      
      // Auto-fermeture après 30 secondes
      setTimeout(() => notification.close(), 30000);
    }
    
  } catch (error) {
    console.error('❌ Erreur envoi notification:', error);
  }
}

