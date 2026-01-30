// app.js - Logique principale de l'application

const CACHE_NAME = 'envol-pwa-v2.0';
const userAgent = navigator.userAgent;
const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);

// ========== FONCTIONS GÉRANT ONESIGNAL ==========

// Fonction sécurisée pour accéder à OneSignal - AMÉLIORÉE
function safeOneSignal() {
    if (typeof OneSignal !== 'undefined' && OneSignal) {
        return OneSignal;
    }
    console.warn('[OneSignal] Pas encore chargé');
    return null;
}

// Fonction pour attendre OneSignal SANS ERREUR
function waitForOneSignal(maxSeconds = 5) {
    return new Promise((resolve) => {
        // Si déjà disponible
        if (typeof OneSignal !== 'undefined' && OneSignal) {
            console.log('[OneSignal] Déjà chargé');
            resolve(OneSignal);
            return;
        }
        
        console.log('[OneSignal] Attente du chargement...');
        
        // Vérifier toutes les 100ms
        let attempts = 0;
        const maxAttempts = maxSeconds * 10; // 10 vérifications par seconde
        
        const interval = setInterval(() => {
            attempts++;
            
            if (typeof OneSignal !== 'undefined' && OneSignal) {
                clearInterval(interval);
                console.log(`[OneSignal] Chargé après ${attempts/10}s`);
                resolve(OneSignal);
                return;
            }
            
            // Timeout après maxSeconds
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.warn(`[OneSignal] Non chargé après ${maxSeconds}s`);
                resolve(null); // Retourne null au lieu de planter
            }
        }, 100);
    });
}



// ========== DEBUG SIMPLIFIÉ ONESIGNAL ==========
function debugOneSignal() {
  console.log('🔍 [DEBUG] Vérification OneSignal...');
  
  setTimeout(async () => {
    console.log('=== DEBUG ONESIGNAL ===');
    
    try {
      // Vérifier si OneSignal est chargé
      if (typeof OneSignal !== 'undefined') {
        console.log('✅ OneSignal chargé');
        console.log('Version SDK:', OneSignal.VERSION || 'Inconnue');
        
        // Vérifier l'initialisation
        if (OneSignal.config && OneSignal.config.appId) {
          console.log('✅ App ID configuré:', OneSignal.config.appId);
          
          // Vérifier l'abonnement
          try {
            if (OneSignal.User && OneSignal.User.PushSubscription) {
              const isSubscribed = Notification.permission === "granted";
              console.log('🔔 Abonnement actif:', isSubscribed);
              
              if (isSubscribed) {
                console.log('🎉 Prêt pour les notifications push !');
              }
            }
          } catch (e) {
            console.log('⚠️ Impossible de vérifier abonnement:', e.message);
          }
        } else {
          console.log('⚠️ OneSignal pas encore initialisé');
        }
      } else {
        console.log('❌ OneSignal non détecté');
        console.log('Causes possibles:');
        console.log('1. Bloqueur de scripts (uBlock, AdBlock)');
        console.log('2. Firefox avec protection renforcée');
        console.log('3. Connexion lente au CDN');
        
        // Suggestion

        
          
        if (/Firefox/i.test(navigator.userAgent)) {
          console.log('💡 Firefox: Désactivez "Protection renforcée" temporairement');
        }
      }
    } catch (error) {
      console.error('❌ Erreur debug:', error);
    }
    
    console.log('=== FIN DEBUG ===');
  }, 4000); // Attendre 4 secondes
}





// ========== FONCTIONS GLOBALES =====================================
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
        <p>Pour un accès rapide depuis ton écran d'accueil,</p>
        <div id="install-instructions">
          <p>👇🏻 clique sur le bouton jaune👇🏻</p>
          <p>"📱 Installer ENVOL sur l'écran d'accueil"</p>
          <p>ou</p>
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
    // Attendre que OneSignal soit disponible
    await new Promise(resolve => {
      if (typeof OneSignal !== 'undefined') {
        resolve();
        return;
      }
      
      // Vérifier toutes les 100ms pendant 5 secondes
      let attempts = 0;
      const check = setInterval(() => {
        attempts++;
        if (typeof OneSignal !== 'undefined') {
          clearInterval(check);
          resolve();
        }
        if (attempts > 50) { // 5 secondes
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
    
    // Si OneSignal est disponible, l'utiliser
    if (typeof OneSignal !== 'undefined') {
      try {
        // Ancienne méthode
        if (typeof OneSignal.isPushNotificationsEnabled === 'function') {
          const isSubscribed = await OneSignal.isPushNotificationsEnabled();
          return isSubscribed ? 'granted' : 'default';
        }
        // Nouvelle méthode
        if (OneSignal.User && OneSignal.User.PushSubscription) {
          const subscription = OneSignal.User.PushSubscription;
          return subscription.optIn ? 'granted' : 'denied';
        }
      } catch (e) {
        console.warn('Erreur OneSignal API:', e);
      }
    }
    
    // Fallback: Notification API native
    if ('Notification' in window) {
      return Notification.permission;
    }
    
    return 'unsupported';
    
  } catch (error) {
    console.warn('Erreur vérification permission:', error);
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



// ===================================================================
// ========== LOGIQUE PRINCIPALE =====================================
// ========== DÉBUT DU DOM CONTENT LOADED ============================
// ===================================================================


document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initialisation ENVOL...');
      debugOneSignal();
    

    //=============================================================
    //============ BANNIÈRE OFFLINE-ONLINE ========================
    
      function showNetworkBanner(message, type) {
        // Supprimer ancienne bannière
        const oldBanner = document.getElementById('network-banner');
        if (oldBanner) oldBanner.remove();
        
        // Créer nouvelle bannière
        const banner = document.createElement('div');
        banner.id = 'network-banner';
        banner.className = `network-banner ${type}`;
        banner.textContent = message;
        
        document.body.prepend(banner);
        
        // Si c'est "online", supprimer après 1 seconde
        if (type === 'online') {
          setTimeout(() => {
            banner.remove();
          }, 1000);
        }
      }
  
      // État initial
      if (!navigator.onLine) {
        showNetworkBanner('⚠️ Hors ligne - Mode local activé', 'offline');
      }
      
      // Écouter les changements
      window.addEventListener('online', () => {
        showNetworkBanner('✅ Réseau rétabli !', 'online');
      });
      
      window.addEventListener('offline', () => {
        showNetworkBanner('⚠️ Hors ligne - Mode local activé', 'offline');
      });
    
    //============ FIN DE LA BANNIÈRE OFFLINE-ONLINE ==============
    //=============================================================

    
      
      // Vérification des boutons
      console.log('=== VÉRIFICATION BOUTONS ===');
      console.log('test-notification-android-btn:', document.getElementById('test-notification-android-btn') ? '✅' : '❌');
      console.log('allow-notifications-btn:', document.getElementById('allow-notifications-btn') ? '✅' : '❌');
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
      
    // ========== GESTION DES JOURS (AVEC JOURS MANQUÉS) ==========
    
    // Récupérer le jour actuel
    let jourActuel = parseInt(localStorage.getItem('jour_actuel')) || 1;
    
    // Nouvelle propriété : défis "rattrapés" (ratés mais validés après)
    function initMadeupDefis() {
      if (!localStorage.getItem('defis_madeup')) {
        localStorage.setItem('defis_madeup', JSON.stringify([]));
      }
    }


    //===================================================================
    //======= VÉRIFIER JOURS MANQUÉS ====================================
    // Vérifier et gérer les jours manqués depuis la dernière connexion
    //===================================================================

    
    function verifierJoursManques() {
      const aujourdhui = new Date().toLocaleDateString('fr-FR');
      const dernierAcces = localStorage.getItem('dernier_acces');
      
      // Premier accès
      if (!dernierAcces) {
        localStorage.setItem('dernier_acces', aujourdhui);
        return jourActuel;
      }
      
      // Calculer différence en jours
      const date1 = new Date(dernierAcces.split('/').reverse().join('-'));
      const date2 = new Date(aujourdhui.split('/').reverse().join('-'));
      const diffJours = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
      
      console.log('📅 Dernier accès:', dernierAcces, 'Différence:', diffJours, 'jours');
      
      if (diffJours > 0) {
        // Marquer les jours passés comme manqués (sauf si déjà fait ou rattrapé)
        for (let i = 0; i < diffJours && jourActuel + i <= 77; i++) {
          const jourAMarquer = jourActuel + i;
          const defi = getDefiByDay(jourAMarquer);
          
          // Vérifier si déjà rattrapé
          const madeupDefis = JSON.parse(localStorage.getItem('defis_madeup') || '[]');
          const estDejaRattrape = madeupDefis.includes(jourAMarquer);
          
          if (defi && !defi.termine && !estDejaRattrape) {
            console.log(`❌ Jour ${jourAMarquer} marqué comme manqué`);
            // On ne change pas defi.termine ici, on utilise juste la classe CSS
          }
        }
        
        // Mettre à jour le dernier accès
        localStorage.setItem('dernier_acces', aujourdhui);
      }
      
      return jourActuel;
    }

     //===================================================================
     //======= FIN DE 'VÉRIFIER JOURS MANQUÉS' =============================
    //===================================================================
    

    // Fonction originale anti-speed running (conservée)
    function peutPasserAuJourSuivant() {
      const aujourdhui = new Date().toLocaleDateString('fr-FR');
      const dernierChangement = localStorage.getItem('dernier_changement_jour');
    
      console.log('📅 Comparaison dates:', {
        aujourdhui: aujourdhui,
        dernierChangement: dernierChangement,
        sontEgaux: dernierChangement === aujourdhui
      });
        
      // Protection spéciale pour le jour 1
      if (jourActuel === 1 && !dernierChangement) {
        localStorage.setItem('dernier_changement_jour', aujourdhui);
        return false;
      }
      
      if (!dernierChangement || dernierChangement !== aujourdhui) {
        localStorage.setItem('dernier_changement_jour', aujourdhui);
        return true;
      }
      return false;
    }



    
    function verifierEtAvancerJour() {
       // 1. Mettre à jour jourActuel depuis localStorage
      let jourActuel = parseInt(localStorage.getItem('jour_actuel')) || 1;
      
      // 2. Vérifier jours manqués
      verifierJoursManques();
      
      console.log('🔍 VERIFICATION AVANCEMENT JOUR');
      console.log('Jour actuel avant:', jourActuel);
      console.log('Peut avancer?', peutPasserAuJourSuivant());
    
      // CHECK CRITIQUE au cas où jourActuel n'est pas défini :
      if (!jourActuel || isNaN(jourActuel)) {
        console.error('❌ ERREUR: jourActuel invalide:', jourActuel);
        jourActuel = parseInt(localStorage.getItem('jour_actuel')) || 1;
        console.log('📝 Correction: jourActuel =', jourActuel);
      }
    
      // Ensuite vérifier si on peut avancer aujourd'hui
      if (peutPasserAuJourSuivant() && jourActuel < 77) {
        jourActuel++;
        localStorage.setItem('jour_actuel', jourActuel.toString());
        console.log('📈 Avancé au jour:', jourActuel);
      }
      
      afficherDefiDuJour(jourActuel);
    }

    // EXPOSER GLOBALEMENT pour débogage
    window.verifierEtAvancerJour = verifierEtAvancerJour;
    window.getDefiByDay = getDefiByDay; // Utile pour tests
    

    
    // ========== FONCTIONS D'AFFICHAGE (MODIFIÉES) ==========
    
    function afficherDefiDuJour(jour) {
      const defi = getDefiByDay(jour);
      if (!defi) return;
      
      if (currentDayElement) currentDayElement.textContent = jour;
      if (dayCurrentElement) dayCurrentElement.textContent = jour;
      if (challengeTitleElement) challengeTitleElement.textContent = defi.titre;
      if (challengeDescriptionElement) challengeDescriptionElement.textContent = defi.description;
      
      if (markDoneButton) {
        // Vérifier si c'est un défi manqué mais rattrapable
        const madeupDefis = JSON.parse(localStorage.getItem('defis_madeup') || '[]');
        const estDejaRattrape = madeupDefis.includes(jour);
        
        if (defi.termine) {
          markDoneButton.textContent = '✅ Déjà accompli';
          markDoneButton.disabled = true;
          markDoneButton.classList.add('completed');
        } else if (estDejaRattrape) {
          markDoneButton.textContent = '✨ Déjà rattrapé';
          markDoneButton.disabled = true;
          markDoneButton.classList.add('madeup');
        } else {
          markDoneButton.textContent = '✅ Marquer comme accompli';
          markDoneButton.disabled = false;
          markDoneButton.classList.remove('completed', 'madeup');
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
      
      // Initialiser les défis rattrapés
      initMadeupDefis();
      const madeupDefis = JSON.parse(localStorage.getItem('defis_madeup') || '[]');
      
      for (let jour = 1; jour <= 77; jour++) {
        const defi = getDefiByDay(jour);
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = jour;
        
        const estDejaRattrape = madeupDefis.includes(jour);
        
        if (defi.termine) {
          dayElement.classList.add('completed'); // Vert
        } else if (estDejaRattrape) {
          dayElement.classList.add('madeup'); // Jaune (rattrapé)
        } else if (jour === jourActuel) {
          dayElement.classList.add('current'); // Bleu
        } else if (jour < jourActuel && !defi.termine && !estDejaRattrape) {
          dayElement.classList.add('missed'); // Rouge (raté)
        } else {
          dayElement.classList.add('upcoming'); // Gris
        }
        
        dayElement.addEventListener('click', () => afficherDefiDuJour(jour));
        calendarGrid.appendChild(dayElement);
      }
      centrerCalendrierSurJour(jourActuel);
    }   



    // ===========================================================
    // ========== ÉVÉNEMENTS PRINCIPAUX (MODIFIÉS) ===============
    // ====== Changement de date, défi rattrapé, défi validé =====
    
    if (markDoneButton) {
      markDoneButton.addEventListener('click', function() {
        const defi = getDefiByDay(jourActuel);
        if (!defi) return;
        
        // Vérifier si c'est un défi passé (raté)
        const aujourdhui = new Date().toLocaleDateString('fr-FR');
        const dernierAcces = localStorage.getItem('dernier_acces');
        let estUnRattrapage = false;
        
        if (dernierAcces) {
          const dateDernierAcces = new Date(dernierAcces.split('/').reverse().join('-'));
          const dateActuelle = new Date(aujourdhui.split('/').reverse().join('-'));
          const diffJours = Math.floor((dateActuelle - dateDernierAcces) / (1000 * 60 * 60 * 24));
          
          // Si le défi est d'un jour antérieur
          if (jourActuel < parseInt(localStorage.getItem('jour_actuel')) || diffJours > 0) {
            estUnRattrapage = true;
          }
        }
        
        if (estUnRattrapage) {
          // Marquer comme rattrapé
          const madeupDefis = JSON.parse(localStorage.getItem('defis_madeup') || '[]');
          if (!madeupDefis.includes(jourActuel)) {
            madeupDefis.push(jourActuel);
            localStorage.setItem('defis_madeup', JSON.stringify(madeupDefis));
            alert("✨ Défi rattrapé avec succès !");
          }
        } else {
          // Validation normale
          defi.termine = true;
          defi.dateValidation = new Date().toISOString();
          alert("✅ Défi validé ! À demain pour le prochain.");
        }
        
        if (typeof saveProgression === 'function') saveProgression();
        afficherDefiDuJour(jourActuel);
      });
    }
    
    if (notificationTimeSelect) {
      const heureSauvegardee = localStorage.getItem('heure_notification') || '08:00';
      notificationTimeSelect.value = heureSauvegardee;
      notificationTimeSelect.addEventListener('change', function() {
        localStorage.setItem('heure_notification', this.value);
      });
    }

    
  
      // ========== BOUTONS DÉPANNAGE ==========
      
      // 1. VIDER LE CACHE
      document.getElementById('clear-cache-btn')?.addEventListener('click', async function() {
        const btn = this;
        if (!confirm("Vider le cache ?")) return;
        btn.textContent = 'Nettoyage...';
        btn.disabled = true;
        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
              if (event.data.success) {
                setTimeout(() => window.location.reload(), 500);
              }
              btn.textContent = '🗑️ Vider le cache maintenant';
              btn.disabled = false;
            };
            navigator.serviceWorker.controller.postMessage(
              { action: 'CLEAR_CACHE' },
              [messageChannel.port2]
            );
          } else if ('caches' in window) {
            await caches.delete(CACHE_NAME);
            setTimeout(() => window.location.reload(), 500);
          }
        } catch (error) {
          console.error('Erreur:', error);
          btn.textContent = '🗑️ Vider le cache maintenant';
          btn.disabled = false;
        }
      });

    
  
      // 4. EXPORTER SAUVEGARDE
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

    
  
      // 5. IMPORTER SAUVEGARDE
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
  
      // 6. SUPPRIMER PROGRESSION
      document.getElementById('reset-progress-btn')?.addEventListener('click', function() {
        if (!confirm('ÊTES-VOUS ABSOLUMENT SÛR ?\n\nTous vos défis validés seront effacés !')) return;
        if (!confirm('DERNIÈRE CHANCE : "Annuler" pour garder, "OK" pour supprimer.')) return;
        DefisEnvol.forEach(defi => {
          defi.termine = false;
          defi.dateValidation = null;
        });
        localStorage.setItem('defis_envol', JSON.stringify(DefisEnvol));
        localStorage.setItem('jour_actuel', '1');
        
        // Correction bug jour 1 manqué après reset
        const aujourdhui = new Date().toLocaleDateString('fr-FR');
        localStorage.setItem('dernier_changement_jour', aujourdhui);
        
        localStorage.setItem('heure_notification', '08:00');
        localStorage.removeItem('install_prompt_shown');
        alert('🗑️ Progression supprimée.');
        window.location.reload();
      });

    

      // ========== INITIALISATION FINALE ==========
      verifierEtAvancerJour();




    // ===================================================================================
    // ========== GESTION PWA ============================================================
        
    let deferredPrompt;
    const installButton = document.createElement('button');
    installButton.id = 'install-pwa-btn';
    installButton.className = 'install-btn';
    installButton.textContent = '📱 Installer ENVOL sur l\'écran d\'accueil';
    installButton.style.cssText = `
      display: none;
      width: calc(100% - 40px);
      max-width: 400px;
      margin: 20px auto 50px auto;
      background: linear-gradient(160deg, #f29a0b 0%, #ed5d0e 100%);
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

    
    //=============== CHARGEMENT DU MODULE DE NOTIFICATION ===============
    //====================================================================

    // Charger le module notifications UNIQUEMENT si OneSignal est disponible
setTimeout(() => {
  if (typeof OneSignal !== 'undefined' || typeof window.OneSignalGlobal !== 'undefined') {
    console.log('🔔 Chargement module notifications...');
    const script = document.createElement('script');
    // script.src = '/sekhamet-envol/envol-notifications.js';
    script.onload = () => console.log('✅ Module notifications chargé');
    document.head.appendChild(script);
  } else {
    console.warn('⚠️ OneSignal non disponible - notifications désactivées');
  }
}, 3000);
    

});

//============ FIN DU DOM CONTENT LOADED ===================


//==========================================================
//================== DEBOGG SECTION =========================

// Export de la fonction getDefiByDay() pour l'utiliser dans envol-notifications.js
window.getDefiByDay = getDefiByDay;
console.log('✅ getDefiByDay exposée globalement');

console.log('✅ app.js chargé complètement');

// Déclencher l'événement pour signaler que app.js est prêt
window.dispatchEvent(new Event('app-ready'));

// Exporter les fonctions nécessaires
window.getDefiByDay = getDefiByDay; // Si elle n'est pas déjà globale

console.log('📋 Fonctions disponibles:', {
  getDefiByDay: typeof getDefiByDay,
  envoyerNotificationDuJour: typeof window.envoyerNotificationDuJour
});
