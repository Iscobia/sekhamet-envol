// app.js - Logique principale de l'application

const CACHE_NAME = 'envol-pwa-v2.0';
const userAgent = navigator.userAgent;
const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);

let jourActuel = parseInt(localStorage.getItem('jour_actuel'), 10) || 1;
let jourAffiche = jourActuel;

// === On attend que envol-notifications.js soit chargé :

// Au début de app.js
console.log('🔔 app.js chargement...');

// Attendre que envol-notifications.js soit prêt
function initApp() {
  console.log('🔔 Initialisation app...');
  
  // Vos fonctions existantes
  if (typeof setupNotificationUI === 'function') {
    console.log('✅ notifications disponibles');
  }
}

// Deux méthodes pour attendre
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  setTimeout(initApp, 1000); // Donner du temps à envol-notifications.js
}




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


  
    // ============================================================
    // ===== DÉCLARATION DES VARIABLES :
    // ================================
      
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
    
    let notesSaveTimer = null;
    
    function setNotesStatus(msg) {
      if (!notesStatus) return;
      notesStatus.textContent = msg || '';
    }
      
      // Synchroniser l'affichage avec l'état global (pas de "let" ici : on utilise le jourAffiche global)
      jourAffiche = jourActuel;


      // Listener DU bouton "Marquer comme accompli" (à attacher UNE SEULE FOIS)
        if (markDoneButton && !markDoneButton.dataset.listenerAttached) {
          markDoneButton.dataset.listenerAttached = "true";
        
          markDoneButton.addEventListener('click', function() {
            try {
              const jourCourant = parseInt(localStorage.getItem('jour_actuel')) || 1;
              const jourCible = parseInt(jourAffiche, 10) || jourCourant;

        
              const defi = getDefiByDay(jourCible);
              if (!defi) return;
        
              console.log('✅ [VALIDATION] jourCible:', jourCible, 'jourCourant:', jourCourant);
        
              // Interdire le futur
              if (jourCible > jourCourant) {
                alert("⏳ Tu pourras valider ce défi le jour J (ou rattraper un défi passé).");
                return;
              }
        
              // Jour passé = rattrapage
              if (jourCible < jourCourant) {
                const madeupDefis = JSON.parse(localStorage.getItem('defis_madeup') || '[]');
                if (!madeupDefis.includes(jourCible)) {
                  madeupDefis.push(jourCible);
                  localStorage.setItem('defis_madeup', JSON.stringify(madeupDefis));
                  alert("✨ Défi rattrapé avec succès !");
                } else {
                  alert("✨ Ce défi est déjà rattrapé.");
                }
              } else {
                // Jour courant = validation normale
                if (!defi.termine) {
                  defi.termine = true;
                  defi.dateValidation = new Date().toISOString();
                  alert("✅ Défi validé ! À demain pour le prochain.");
                } else {
                  alert("✅ Ce défi est déjà accompli.");
                }
              }
        
              if (typeof saveProgression === 'function') saveProgression();
        
              // Rafraîchir l'affichage + calendrier
              afficherDefiDuJour(jourCible);
              if (typeof genererCalendrier === 'function') genererCalendrier();
        
            } catch (e) {
              console.error("❌ Erreur validation défi:", e);
              alert("Oh mince… une erreur est survenue pendant la validation. Essaie de recharger l’app.");
            }
          });
        }


      // Réception des actions venant du Service Worker (boutons de notification)
      if ('serviceWorker' in navigator && !window.__envolSWMsgListenerAttached) {
        window.__envolSWMsgListenerAttached = true;
      
        navigator.serviceWorker.addEventListener('message', (event) => {
          try {
            const data = event.data || {};
            if (data.action === 'MARK_DONE') {
              const jourNotif = parseInt(data.jour, 10);
              console.log('🔔 [SW->APP] MARK_DONE reçu pour jour:', jourNotif);
      
              if (!isNaN(jourNotif)) {
                // Affiche le bon jour (met à jour jourAffiche)
                afficherDefiDuJour(jourNotif);
      
                // Applique la validation/rattrapage via ton handler existant
                if (markDoneButton) {
                  setTimeout(() => markDoneButton.click(), 0);
                }
              }
            }
          } catch (e) {
            console.error('❌ Erreur message SW:', e);
          }
        });
      }


  
      const calendarGrid = document.getElementById('calendar-grid');
      const notificationTimeSelect = document.getElementById('notification-time');
  
      
    // ========== GESTION DES JOURS (AVEC JOURS MANQUÉS) ==========

 
    
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
        
        // DEBUG
        console.log('📅 [DEBUG] Vérification avancement:', {
          aujourdhui,
          dernierChangement,
          sontIdentiques: dernierChangement === aujourdhui,
          jourActuel: parseInt(localStorage.getItem('jour_actuel'))
        });
        
         // ✅ Premier accès : on initialise, mais on N'AVANCE PAS
        if (!dernierChangement) {
          console.log('✅ Premier accès - initialisation (pas d’avancement)');
          localStorage.setItem('dernier_changement_jour', aujourdhui);
          return false;
        }

        
        // Autoriser si dates différentes
        if (dernierChangement !== aujourdhui) {
          console.log('✅ Nouveau jour - autorisé');
          return true; // pas d'écriture ici
        }
        
        console.log('❌ Même jour - bloqué');
        return false;
      }

//==== PROTECTION pour bonne lecture des dates même en cas de changement futur ou autre formatage de dates :
  // parseDateFRSafe() sert à lire/convertir une string en Date :
  function parseDateFRSafe(str) {
    if (!str) return null;
    const m = String(str).trim().match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!m) return null;
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    // Midi pour éviter les soucis de changement d’heure
    return new Date(yyyy, mm - 1, dd, 12, 0, 0);
  }

  // Ici on génère une string de date “canonique” pour comparer
  function getDateStrFR(date = new Date()) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  
  //======FIN de la protection du helper  
  
    
function verifierEtAvancerJour() {
  try {
    let jour = parseInt(localStorage.getItem('jour_actuel'), 10);
    if (!jour || isNaN(jour)) jour = 1;

    // On synchronise la variable globale
    const ancienJourActuel = jourActuel;
    jourActuel = jour;

    // (si tu as cette fonction, garde-la)
    if (typeof verifierJoursManques === 'function') {
      verifierJoursManques();
    }

    console.log('🚀 [DEBUG] verifierEtAvancerJour appelé');
    console.log('   Jour actuel (stocké):', jourActuel);

    // ======= NOUVEAU : calcul delta jours (multi-jours) =======
    const aujourdhuiStr = new Date().toLocaleDateString('fr-FR'); // "dd/mm/yyyy"
    const dernierStr = localStorage.getItem('dernier_changement_jour'); // "dd/mm/yyyy" ou null

    console.log('   Date aujourd’hui:', aujourdhuiStr);
    console.log('   Dernier changement:', dernierStr);

    // Premier lancement : on pose juste la référence, sans avancer
    if (!dernierStr) {
      localStorage.setItem('dernier_changement_jour', aujourdhuiStr);
      console.log('✅ Premier lancement : dernier_changement_jour initialisé (pas d’avancement)');
    } else {
      // Si la date a changé, on calcule combien de jours se sont écoulés
      if (dernierStr !== aujourdhuiStr) {
        // Parse FR "dd/mm/yyyy" -> Date à MIDI (évite bugs changement d’heure)
        const ancienneDate = parseDateFRSafe(dernierStr);
        const nouvelleDate = parseDateFRSafe(aujourdhuiStr);
        
        if (!ancienneDate || !nouvelleDate) {
          console.warn('⚠️ Date invalide détectée -> resync dernier_changement_jour', { dernierStr, aujourdhuiStr });
          localStorage.setItem('dernier_changement_jour', aujourdhuiStr);
          return jourActuel; // on ne casse pas l’app
        }
        

        const diffMs = nouvelleDate.getTime() - ancienneDate.getTime();
        const diffJours = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        console.log('📅 [DEBUG] Différence réelle en jours:', diffJours);

        if (diffJours > 0) {
          const nouveauJour = Math.min(77, jourActuel + diffJours);
          if (nouveauJour !== jourActuel) {
            jourActuel = nouveauJour;
            localStorage.setItem('jour_actuel', String(jourActuel));
            console.log(`🎯 AVANCÉ de ${diffJours} jour(s) -> jour_actuel:`, jourActuel);
          } else {
            console.log('⏸️ Déjà au max (77), pas d’avancement');
          }

          // Important : on met à jour la date de référence
          localStorage.setItem('dernier_changement_jour', aujourdhuiStr);
        } else {
          console.log('⏸️ Date différente mais diffJours <= 0 (heure/date système ?) — pas d’avancement');
          // On peut quand même resynchroniser la date si tu veux être stricte :
          // localStorage.setItem('dernier_changement_jour', aujourdhuiStr);
        }
      } else {
        console.log('❌ Même jour - bloqué');
      }
    }
    // ======= FIN NOUVEAU =======


    

    // ✅ Ne change l’écran que si l’utilisateur regardait le jour J (ou si rien n’est affiché)
    if (!jourAffiche) {
      jourAffiche = jourActuel;
      afficherDefiDuJour(jourActuel);
    } else if (jourAffiche === ancienJourActuel && jourActuel !== ancienJourActuel) {
      afficherDefiDuJour(jourActuel); // mettra jourAffiche = jourActuel
    } else {
      console.log('👀 Affichage conservé sur jourAffiche:', jourAffiche);
    }

    // Rafraîchir le calendrier
    if (typeof genererCalendrier === 'function') {
      genererCalendrier();
    }

    return jourActuel;
  } catch (e) {
    console.error('❌ Erreur verifierEtAvancerJour:', e);
    return jourActuel;
  }
} // Fin de VérifierEtAvancerJour

// ===== FIN de Notification Jouralière à l'ouverture de l'app ===== // 

// ===== Notes (stockées localement) =====
const NOTES_KEY = 'envol_notes';

function getAllNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); }
  catch { return {}; }
}

function getNoteForDay(day) {
  const notes = getAllNotes();
  return notes[String(day)] || '';
}

function setNoteForDay(day, text) {
  const notes = getAllNotes();
  const k = String(day);
  const v = String(text || '');

  if (v.trim() === '') {
    delete notes[k];
  } else {
    notes[k] = v;
  }
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

// ===== Fin des Notes (stockées localement) =====

    
    // ========== FONCTIONS D'AFFICHAGE (MODIFIÉES) ==========
    
  function afficherDefiDuJour(jour) {
      const defi = getDefiByDay(jour);
      if (!defi) return;
    

    // Pour que quand on clique un jour du calendrier ou quand le jour avance,
    // les notes affichées suivent: ==========================================
      const notesTextarea = document.getElementById('notes-textarea');
      const notesStatus = document.getElementById('notes-status');
      if (notesTextarea) notesTextarea.value = getNoteForDay(jour);
      if (notesStatus) notesStatus.textContent = '';
    // =======================================================================
        
      jourAffiche = jour; // 👈 IMPORTANT
               
      
      if (currentDayElement) currentDayElement.textContent = jour;
      if (dayCurrentElement) dayCurrentElement.textContent = jour;
      if (challengeTitleElement) challengeTitleElement.textContent = defi.titre;
      if (challengeDescriptionElement) challengeDescriptionElement.textContent = defi.description;

  // Notes : charger celles du jour affiché
  if (notesTextarea) notesTextarea.value = getNoteForDay(jour);
  if (notesStatus) notesStatus.textContent = '';
    
  // ✅ Mettre à jour le bouton selon l'état du jour affiché
  updateMarkDoneButtonUI(jour);
  refreshNotesUIForDay(jour);
  
  console.log("📌 afficherDefiDuJour appelé avec:", jour, "=> jourAffiche =", jourAffiche);
  }
 



 function updateMarkDoneButtonUI(jour) {
    if (!markDoneButton) return;
  
    const jourCourant = parseInt(jourActuel, 10) || 1;
    const jourCible = parseInt(jour, 10);
    const defi = getDefiByDay(jourCible);
    if (!defi || isNaN(jourCible)) return;
  
    const madeupDefis = JSON.parse(localStorage.getItem('defis_madeup') || '[]');
    const estRattrape = madeupDefis.includes(jourCible);
  
    // Nettoyer les états couleur précédents (on garde tes classes de base)
    markDoneButton.classList.remove(
      'mark-future', 'mark-rattraper', 'mark-madeup', 'mark-done', 'mark-default'
    );
  
    // Par défaut
    let label = "✅ Marquer comme accompli";
    let disabled = false;
    let stateClass = "mark-default";
  
    if (jourCible > jourCourant) {
      label = "⏳ Disponible le jour J";
      disabled = true;
      stateClass = "mark-future";     // gris
    } else if (defi.termine) {
      label = "✅ Accompli !";
      disabled = true;
      stateClass = "mark-done";       // (tu peux laisser vert ou neutre)
    } else if (estRattrape) {
      label = "✨ Déjà rattrapé";
      disabled = true;
      stateClass = "mark-madeup";     // jaune
    } else if (jourCible < jourCourant) {
      label = "✨ Rattraper ce défi";
      stateClass = "mark-rattraper";  // rouge
    }
  
    markDoneButton.textContent = label;
    markDoneButton.disabled = disabled;
    markDoneButton.classList.add(stateClass);
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



        // ========== RÉGLAGES UI ==========
    // ✅ Le listener "markDoneButton" est attaché plus haut UNE SEULE FOIS
    // (celui qui gère jourAffiche/jourCible et le rattrapage)

    // Sélecteur d'heure de notification (1 seul listener)
    if (notificationTimeSelect && !notificationTimeSelect.dataset.listenerAttached) {
      notificationTimeSelect.dataset.listenerAttached = "true";

      const heureSauvegardee = localStorage.getItem('heure_notification') || '08:00';
      notificationTimeSelect.value = heureSauvegardee;

      notificationTimeSelect.addEventListener('change', function() {
        localStorage.setItem('heure_notification', notificationTimeSelect.value);
        console.log('⏰ Heure de notification sauvegardée:', notificationTimeSelect.value);
      });
    }


// ========== NOTES (par jour) ==========
  
    // 1) Références DOM
    const notesTextarea = document.getElementById('notes-textarea');
    const clearNotesBtn = document.getElementById('clear-notes-btn');
    const notesStatusEl = document.getElementById('notes-status');  
    notesSaveTimer = null;
    
    // 2) Helpers stockage
    function getNotesMap() {
      try {
        return JSON.parse(localStorage.getItem('envol_notes_by_day') || '{}');
      } catch {
        return {};
      }
    }
    
    function setNotesMap(map) {
      localStorage.setItem('envol_notes_by_day', JSON.stringify(map));
    }
    
    function getNoteForDay(day) {
      const map = getNotesMap();
      return map[String(day)] || '';
    }
    
    function setNoteForDay(day, text) {
      const map = getNotesMap();
      const key = String(day);
      if (!text || !text.trim()) {
        delete map[key];
      } else {
        map[key] = text;
      }
      setNotesMap(map);
    }
    
    function setNotesStatus(msg) {
      if (!notesStatusEl) return;
      notesStatusEl.textContent = msg || '';
    }
    
    // 3) Charger les notes du jour affiché (à appeler quand on change de jour)
    function refreshNotesUIForDay(day) {
      if (!notesTextarea) return;
      notesTextarea.value = getNoteForDay(day);
      setNotesStatus('');
    }
    
    // 4) Listeners
    if (notesTextarea) {
      notesTextarea.addEventListener('input', () => {
        const day =
          parseInt(jourAffiche, 10) ||
          (parseInt(localStorage.getItem('jour_actuel'), 10) || 1);
    
        setNotesStatus('Sauvegarde…');
        clearTimeout(notesSaveTimer);
    
        notesSaveTimer = setTimeout(() => {
          setNoteForDay(day, notesTextarea.value);
          setNotesStatus('✅ Sauvegardé');
          setTimeout(() => setNotesStatus(''), 1500);
        }, 350);
      });
    }
    
    if (clearNotesBtn && notesTextarea) {
      clearNotesBtn.addEventListener('click', () => {
        const day =
          parseInt(jourAffiche, 10) ||
          (parseInt(localStorage.getItem('jour_actuel'), 10) || 1);
    
        if (!confirm('Effacer les notes de ce jour ?')) return;
    
        notesTextarea.value = '';
        setNoteForDay(day, '');
        setNotesStatus('🧹 Notes effacées');
        setTimeout(() => setNotesStatus(''), 1500);
      });
    }
    
    // 5) Premier chargement (jour actuel affiché au démarrage)
    refreshNotesUIForDay(jourAffiche);

// =========== NOTES fin =================
    

  
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
          heureNotification: localStorage.getItem('heure_notification'),
          notesByDay: JSON.parse(localStorage.getItem('envol_notes_by_day') || '{}'),
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
              
              // ✅ Notes (par jour)
              if (backupData.notesByDay) {
                localStorage.setItem('envol_notes_by_day', JSON.stringify(backupData.notesByDay));
              } else if (backupData.notes) {
                // Compatibilité ancienne sauvegarde "notes"
                // Si c'était une string -> on la met sur le jourActuel importé
                if (typeof backupData.notes === 'string') {
                  const day = String(backupData.jourActuel || 1);
                  localStorage.setItem('envol_notes_by_day', JSON.stringify({ [day]: backupData.notes }));
                } else if (typeof backupData.notes === 'object') {
                  // Si c'était déjà un map -> on le reprend tel quel
                  localStorage.setItem('envol_notes_by_day', JSON.stringify(backupData.notes));
                }
              } else {
                localStorage.removeItem('envol_notes_by_day');
              }
              
              // (Optionnel) on supprime l’ancienne clé si tu veux éviter la confusion
              localStorage.removeItem('envol_notes');
              
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
        // ✅ Reset des défis rattrapés (sinon le calendrier garde des jours jaunes)
        localStorage.setItem('defis_madeup', JSON.stringify([]));
        alert('🗑️ Progression supprimée.');
        window.location.reload();
      });

    

      // ========== EXPORTS DEBUG (dans le bon scope) ==========
      window.verifierEtAvancerJour = verifierEtAvancerJour;
      window.peutPasserAuJourSuivant = peutPasserAuJourSuivant;
      
      console.log('🔧 Exports debug (initApp):', {
        verifierEtAvancerJour: typeof window.verifierEtAvancerJour,
        peutPasserAuJourSuivant: typeof window.peutPasserAuJourSuivant
      });
      
      // ========== INITIALISATION FINALE ==========

      // On vérifie d'abord le jour avant d'avancer :
      verifierEtAvancerJour();

      const jourActuelApresSync = parseInt(localStorage.getItem('jour_actuel'), 10) || 1;
      afficherDefiDuJour(jourActuelApresSync);
      
      showDailyWakeNotificationIfNeeded().then(ok => console.log('🔔 Notif wake envoyée ?', ok));
      
      // ✅ Afficher le défi du jour au chargement (le calendrier seul ne remplit pas le panneau)
      afficherDefiDuJour(jourActuel);
      // Montrer la Notif du jour à l'ouverture de l'app :
      showDailyWakeNotificationIfNeeded();

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('👁️ [APP] Retour au premier plan -> resync jour');
          verifierEtAvancerJour();
          showDailyWakeNotificationIfNeeded();
        }
      });

    
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

// ====== Notification journalière au réveil de l'app (1 fois / jour) ======
    async function showDailyWakeNotificationIfNeeded() {
      const today = new Date().toLocaleDateString('fr-FR');
    
      // Déjà montré aujourd'hui -> stop
      if (localStorage.getItem('last_daily_notif_shown') === today) return false;
    
      // Anti-double déclenchement la même seconde (DOMContentLoaded + visibilitychange)
      const lockKey = 'daily_notif_lock';
      if (localStorage.getItem(lockKey) === today) return false;
      localStorage.setItem(lockKey, today);
    
      if (!('Notification' in window)) return false;
      if (Notification.permission !== 'granted') return false;
    
      try {
        // ✅ Priorité: notif riche via ton pipeline existant
        if (typeof window.envoyerNotificationDuJour === 'function') {
          await window.envoyerNotificationDuJour();
          localStorage.setItem('last_daily_notif_shown', today);
          return true;
        }
    
        // ✅ Fallback minimaliste (SEULEMENT si la riche n'est pas dispo)
        const reg = await navigator.serviceWorker?.getRegistration?.();
        if (reg?.showNotification) {
          await reg.showNotification("ENVOL — Défi du jour", {
            body: "Ton défi du jour t’attend ✨",
            icon: "./assets/icons/ENVOL-192.png",
            badge: "./assets/icons/ENVOL-192.png",
            tag: "envol-daily",
            renotify: false
          });
          localStorage.setItem('last_daily_notif_shown', today);
          return true;
        }
    
        // Dernier fallback: Notification directe
        new Notification("ENVOL — Défi du jour", {
          body: "Ton défi du jour t’attend ✨",
          tag: "envol-daily"
        });
        localStorage.setItem('last_daily_notif_shown', today);
        return true;
      } catch (e) {
        // si échec -> on retire le lock pour retenter au prochain wake
        localStorage.removeItem(lockKey);
        console.warn("Notif wake impossible:", e);
        return false;
      }
    } // FIn des Notification journalières au réveil de l'app

window.showDailyWakeNotificationIfNeeded = showDailyWakeNotificationIfNeeded;

//==========================================================
//================== DEBOGG SECTION =========================

// Export de la fonction getDefiByDay() pour l'utiliser dans envol-notifications.js
window.getDefiByDay = getDefiByDay;
console.log('✅ getDefiByDay exposée globalement');

console.log('✅ app.js chargé complètement');

// Déclencher l'événement pour signaler que app.js est prêt
window.dispatchEvent(new Event('app-ready'));

// ===== Export / Debug =====

// Exposer getDefiByDay (utile pour tests et notifications)
if (typeof getDefiByDay === 'function') {
  window.getDefiByDay = getDefiByDay;
}

console.log('📋 Fonctions disponibles:', {
  getDefiByDay: typeof getDefiByDay,
  envoyerNotificationDuJour_local: typeof envoyerNotificationDuJour,
  envoyerNotificationDuJour_window: typeof window.envoyerNotificationDuJour
});

// Expositions globales sécurisées (évite ReferenceError si fonctions non globales)
if (typeof peutPasserAuJourSuivant === 'function') {
  window.peutPasserAuJourSuivant = peutPasserAuJourSuivant;
}
if (typeof verifierEtAvancerJour === 'function') {
  window.verifierEtAvancerJour = verifierEtAvancerJour;
}


console.log('🔧 Fonctions debug app.js exposées:');
console.log('- peutPasserAuJourSuivant()');
console.log('- verifierEtAvancerJour()');

