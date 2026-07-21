(function () {
// app.js - Logique principale de l'application

// Config par app (chargée via config.js dans chaque repo enfant)
const APP = window.APP_CONFIG || {};
const APP_ID = APP.ID || "app";
const APP_NAME = APP.NAME || "APP";
const APP_MAIN_TITLE = APP.MAIN_TITLE || "Mon Défi Quotidien";
const APP_BROWSER_TITLE = APP.BROWSER_TITLE || `${APP_NAME} - Défi Quotidien`;
const APP_ICON_192 = APP.ICON_192 || "./core/assets/icons/default-192.png";
const APP_SUPPORT_URL = APP.SUPPORT_URL || "#";
const TECH_SUPPORT_EMAIL = window.TECH_SUPPORT_EMAIL || "";


// ================================================

console.log("APP_ID:", APP_ID);
console.log("APP_NAME:", APP_NAME);
console.log("DEFIS LOADED:", window.DEFIS?.length);

// Cache name isolé par app (utile surtout pour Service Worker / caches)
// /!\ ATTENTION DOUBLON ? Semble inutilisé
//const CACHE_NAME = APP.CACHE_NAME || `${APP_ID}-pwa-v1`;

// Stockage isolé par app
const STORAGE_PREFIX = APP.STORAGE_PREFIX || `${APP_ID}_`;

// ===============================
// Gestion du stockage local
// ===============================

function storageKey(key) {
  return `${STORAGE_PREFIX}${key}`;
} // lsGet("jour_actuel") lit : origine_jour_actuel || et si Si APP_ID = "enveloppe" : enveloppe_jour_actuel

function lsGet(key, fallback = null) {
  const value = localStorage.getItem(storageKey(key));
  return value !== null ? value : fallback;
}

function lsSet(key, value) {
  localStorage.setItem(storageKey(key), value);
}

function lsRemove(key) {
  localStorage.removeItem(storageKey(key));
}

// ============== FONCTION PAUSE ==================//

function isManualProgressPaused() {
  return lsGet('progress_paused', 'false') === 'true';
}

function setManualProgressPaused(value) {
  lsSet('progress_paused', value ? 'true' : 'false');
}

function isFlowOverrideActive() {
  return lsGet('flow_pause_override', 'false') === 'true';
}

function setFlowOverrideActive(value) {
  lsSet('flow_pause_override', value ? 'true' : 'false');
}

function getFlowBlockerAppId() {
  const flow = getProgramFlow();
  if (!flow.length) return null;

  for (const appId of flow) {
    if (!isProgramCompleted(appId)) {
      return appId;
    }
  }

  return null;
}

function isFlowAutoPausedForApp(appId = APP_ID) {
  const flow = getProgramFlow();
  if (!flow.length || !flow.includes(appId)) return false;

  const blockerAppId = getFlowBlockerAppId();
  if (!blockerAppId) return false;

  if (blockerAppId === appId) return false;

  if (isFlowOverrideActive()) return false;

  return true;
}

function isProgressPaused() {
  return isManualProgressPaused() || isFlowAutoPausedForApp(APP_ID);
}

function setProgressPaused(value) {
  setManualProgressPaused(value);
  if (value) {
    setFlowOverrideActive(false);
  }
}


function updatePauseProgressionButton() {
  const btn = document.getElementById('pause-progression-btn');
  if (!btn) return;

  const manuallyPaused = isManualProgressPaused();
  const autoPaused = isFlowAutoPausedForApp(APP_ID);

  if (manuallyPaused) {
    btn.textContent = `▶️ Relancer ma progression dans ${APP_NAME}`;
    btn.classList.add('is-paused');
    btn.title = '';
    return;
  }

  if (autoPaused) {
    const blockerAppId = getFlowBlockerAppId();
    const blockerName = window.APP_CONFIGS?.[blockerAppId]?.NAME || blockerAppId || 'le programme précédent';

    btn.textContent = `▶️ Relancer ma progression dans ${APP_NAME}`;
    btn.classList.add('is-paused');
    btn.title = `En pause automatiquement tant que ${blockerName} n'est pas terminé.`;
    return;
  }

  btn.textContent = `⏸️ Mettre ma progression dans ${APP_NAME} en pause`;
  btn.classList.remove('is-paused');
  btn.title = '';
}

// ============== FIN de la FONCTION PAUSE ==================//


let INSTALL_APP_NAME = "EVOLUTION";

async function loadInstallAppNameFromManifest() {
  try {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) return;

    const manifestUrl = new URL(manifestLink.getAttribute('href'), window.location.href);
    const response = await fetch(manifestUrl.href, { cache: 'no-store' });
    if (!response.ok) return;

    const manifest = await response.json();
    INSTALL_APP_NAME = manifest.short_name || manifest.name || "EVOLUTION";

    console.log("📦 INSTALL_APP_NAME:", INSTALL_APP_NAME);

    updateBackupWarningNote();
  } catch (e) {
    console.warn("⚠️ Impossible de lire le manifest pour short_name :", e);
  }
}

function updateBackupWarningNote() {
  const note = document.getElementById('evolution-backup-warning');
  if (!note) return;

  const allowedIds = Array.isArray(window.ALLOWED_APP_IDS) ? window.ALLOWED_APP_IDS : [window.APP_ID];

  if (allowedIds.length <= 1) {
    note.textContent = '';
    note.style.display = 'none';
    return;
  }

  note.textContent = `ATTENTION : tu ne sauvegardes ici que ta progression sur ${APP_NAME}. Si tu veux aussi protéger ta progression sur les autres thèmes, exporte-les depuis leurs pages respectives.`;
  note.style.display = 'block';
}


let jourActuel = parseInt(lsGet('jour_actuel', '1'), 10) || 1;
let jourAffiche = jourActuel;

// === On choisi le programme à montrer :

function renderProgramSelector() {
  const container = document.getElementById("program-selector");
  if (!container) return;

  const allowedIds = Array.isArray(window.ALLOWED_APP_IDS) ? window.ALLOWED_APP_IDS : [window.APP_ID];

  const allPrograms = {
    fondation: {
      id: "fondation",
      name: "FONDATION",
      subtitle: "Prépare ton terrain",
      themeClass: "theme-fondation"
    },
    origine: {
      id: "origine",
      name: "ORIGINE",
      subtitle: "Alimentation consciente",
      themeClass: "theme-origine"
    },
    enveloppe: {
      id: "enveloppe",
      name: "ENVELOPPE",
      subtitle: "Retour à Soi par le corps",
      themeClass: "theme-enveloppe"
    },
    emergence: {
      id: "emergence",
      name: "EMERGENCE",
      subtitle: "Inconscient allié",
      themeClass: "theme-emergence"
    },
    reset: {
      id: "reset",
      name: "RESET",
      subtitle: "Retour au calme",
      themeClass: "theme-reset"
    },
    envol: {
      id: "envol",
      name: "ENVOL",
      subtitle: "Transformation globale",
      themeClass: "theme-envol"
    }
  };

  const programs = allowedIds
    .map(id => allPrograms[id])
    .filter(Boolean);

  container.innerHTML = "";

  if (programs.length <= 1) {
    container.style.display = "none";
    container.removeAttribute("data-layout");
    return;
  }

  container.style.display = "";
  container.className = "program-selector-grid";

  const hasFondation = allowedIds.includes("fondation");

  if (hasFondation && programs.length === 2) {
    container.dataset.layout = "duo-with-fondation";
  } else if (hasFondation && programs.length >= 4) {
    container.dataset.layout = "hub-with-fondation";
  } else {
    container.dataset.layout = "default";
  }

  programs.forEach(program => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `program-chip ${program.themeClass}`;

    if (program.id === window.APP_ID) {
      button.classList.add("is-active");
      button.disabled = true;
    } else {
      button.classList.add("is-inactive");
    }

    button.innerHTML = `
      <span class="program-chip-name">${program.name}</span>
      <span class="program-chip-subtitle">${program.subtitle}</span>
    `;

    button.addEventListener("click", () => {
        const url = new URL(window.location.href);

        url.searchParams.set("app", program.id);

        /*
         * Signale qu’il s’agit d’un véritable choix volontaire.
         * Ce marqueur sera retiré après le chargement.
         */
        url.searchParams.set("manual", "1");

        window.location.href = url.toString();
      });

    container.appendChild(button);
  });
}


function getProgramFlow() {
  const allowedIds = Array.isArray(window.ALLOWED_APP_IDS) ? window.ALLOWED_APP_IDS : [window.APP_ID];
  const flow = Array.isArray(window.PROGRAM_FLOW) ? window.PROGRAM_FLOW : [];

  return flow.filter(appId =>
    allowedIds.includes(appId) &&
    window.APP_CONFIGS &&
    window.APP_CONFIGS[appId] &&
    window.DEFIS_BY_APP &&
    Array.isArray(window.DEFIS_BY_APP[appId])
  );
}

function isProgramCompleted(appId) {
  const defis = window.DEFIS_BY_APP?.[appId];

  if (!Array.isArray(defis) || !defis.length) {
    return false;
  }

  const progression = JSON.parse(
    localStorage.getItem(`${appId}_defis_progression`) || "[]"
  );

  const defisTermines = progression.filter(
    defi => defi.termine
  ).length;

  const defisRattrapes = JSON.parse(
    localStorage.getItem(`${appId}_defis_madeup`) || "[]"
  ).length;

  return (defisTermines + defisRattrapes) >= defis.length;
}


function isCurrentProgramCompleted() {
  return isProgramCompleted(window.APP_ID);
}

function updateProgramCompleteOverlay() {
  const overlay = document.getElementById('program-complete-overlay');
  const resetLink = document.getElementById('program-complete-reset-link');
  if (!overlay) return;

  const completed = isCurrentProgramCompleted();
  overlay.hidden = !completed;

  if (resetLink && !resetLink.dataset.listenerAttached) {
    resetLink.dataset.listenerAttached = "true";
    resetLink.addEventListener('click', function () {
      const resetBtn = document.getElementById('reset-progress-btn');
      if (resetBtn) {
        resetBtn.click();
      }
    });
  }
}



function getRecommendedFlowAppId() {
  const flow = getProgramFlow();

  /*
   * Aucun parcours multiple disponible :
   * on conserve le programme actuellement chargé.
   */
  if (!flow.length) {
    console.log(
      "[FLOW] Aucun parcours disponible : maintien sur",
      window.APP_ID
    );

    return window.APP_ID;
  }

  /*
   * On cherche le premier programme encore inachevé
   * dans l’ordre défini par PROGRAM_FLOW.
   */
  for (const appId of flow) {
    const completed = isProgramCompleted(appId);

    console.log(
      `[FLOW] ${appId} :`,
      completed ? "terminé" : "incomplet"
    );

    if (!completed) {
      console.log(
        `[FLOW] Programme recommandé : ${appId}`
      );

      return appId;
    }
  }

  /*
   * Tous les programmes sont terminés :
   * aucune redirection automatique.
   * L’utilisateur reste sur le dernier programme visité.
   */
  console.log(
    "[FLOW] Tous les programmes disponibles sont terminés"
  );

  return null;
}


function ensureRecommendedFlowAppSelection() {
  const recommendedAppId = getRecommendedFlowAppId();

  console.log("APP actuelle :", window.APP_ID);
  console.log("Programme recommandé :", recommendedAppId);
  console.log("FONDATION terminée :", isProgramCompleted("fondation"));
  console.log("ORIGINE terminée :", isProgramCompleted("origine"));
  console.log("ENVELOPPE terminée :", isProgramCompleted("enveloppe"));
  console.log("EMERGENCE terminée :", isProgramCompleted("emergence"));
  console.log("ENVOL terminée :", isProgramCompleted("envol"));
  console.log("RESET terminée :", isProgramCompleted("reset"));

  const allowedIds = Array.isArray(window.ALLOWED_APP_IDS)
    ? window.ALLOWED_APP_IDS
    : [window.APP_ID];

  /*
   * Une application ne proposant qu’un seul programme
   * n’a pas besoin de redirection automatique.
   */
  if (allowedIds.length <= 1) {
    return false;
  }

  const url = new URL(window.location.href);

  /*
   * Ce marqueur est ajouté uniquement lorsqu’un utilisateur
   * clique volontairement sur une puce de programme.
   */
  const manualSelection =
    url.searchParams.get('manual') === '1';

  if (manualSelection) {
    /*
     * On respecte le choix pour ce chargement,
     * puis on retire le marqueur de l’adresse.
     */
    url.searchParams.delete('manual');

    window.history.replaceState(
      {},
      '',
      url.toString()
    );

    return false;
  }

  /*
   * null : tout le parcours est terminé.
   * APP_ID actuel : nous sommes déjà sur le bon programme.
   */
  if (
    !recommendedAppId ||
    recommendedAppId === window.APP_ID
  ) {
    return false;
  }

  url.searchParams.set(
    'app',
    recommendedAppId
  );

  window.location.replace(
    url.toString()
  );

  console.log("➡️ Redirection vers", recommendedAppId);

  return true;
}




function applyAppBranding() {
  document.title = APP_BROWSER_TITLE;

  const mainTitle = document.getElementById("app-main-title");
  if (mainTitle) {
    mainTitle.textContent = APP_MAIN_TITLE;
  }

  const favicon = document.getElementById("app-favicon");
  if (favicon) favicon.href = APP_ICON_192;

  const appleTouchIcon = document.getElementById("app-apple-touch-icon");
  if (appleTouchIcon) appleTouchIcon.href = APP_ICON_192;

  const footerLogo = document.getElementById("footer-logo");
  if (footerLogo) {
    footerLogo.src = APP_ICON_192;
    footerLogo.alt = APP_NAME;
  }

  const dayTotalElement = document.getElementById("day-total");
  if (dayTotalElement) {
    dayTotalElement.textContent = String(APP.TOTAL_DAYS || 0);
  }
  const supportLink = document.getElementById("support-link");
  if (supportLink) {
    supportLink.href = APP_SUPPORT_URL;

    if (APP_SUPPORT_URL === "#fondation-support") {
      supportLink.removeAttribute("target");
      supportLink.removeAttribute("rel");
    } else {
      supportLink.setAttribute("target", "_blank");
      supportLink.setAttribute("rel", "noopener noreferrer");
    }
  }
}

let errorBannerInitialized = false;
let latestTechnicalError = null;
const technicalErrorHistory = [];

function pushTechnicalError(entry) {
  technicalErrorHistory.push(entry);
  while (technicalErrorHistory.length > 10) {
    technicalErrorHistory.shift();
  }
  latestTechnicalError = entry;
}

function buildTechnicalErrorReport() {
  const lines = [
    `App: ${APP_NAME}`,
    `App ID: ${APP_ID}`,
    `URL: ${window.location.href}`,
    `User agent: ${navigator.userAgent}`,
    `Date: ${new Date().toISOString()}`,
    ''
  ];

  technicalErrorHistory.forEach((entry, index) => {
    lines.push(`--- Erreur ${index + 1} ---`);
    lines.push(`Type: ${entry.type}`);
    lines.push(`Message: ${entry.message || ''}`);
    if (entry.source) lines.push(`Source: ${entry.source}`);
    if (entry.lineno) lines.push(`Ligne: ${entry.lineno}`);
    if (entry.colno) lines.push(`Colonne: ${entry.colno}`);
    if (entry.stack) lines.push(`Stack: ${entry.stack}`);
    lines.push('');
  });

  return lines.join('\n');
}

function showTechnicalErrorBanner(entry) {
  pushTechnicalError(entry);

  const banner = document.getElementById('error-banner');
  const text = document.getElementById('error-banner-text');
  const mailBtn = document.getElementById('error-banner-mail');
  const copyBtn = document.getElementById('error-banner-copy');
  const closeBtn = document.getElementById('error-banner-close');

  if (!banner || !text || !mailBtn || !copyBtn || !closeBtn) return;

  text.textContent = `Une erreur a été détectée dans ${APP_NAME}. Tu peux continuer à utiliser l’app, ou envoyer un signalement technique.`;

  banner.hidden = false;

  if (!errorBannerInitialized) {
    closeBtn.addEventListener('click', () => {
      banner.hidden = true;
    });

    copyBtn.addEventListener('click', async () => {
      const report = buildTechnicalErrorReport();
      try {
        await navigator.clipboard.writeText(report);
        copyBtn.textContent = '✅ Détails copiés';
        setTimeout(() => {
          copyBtn.textContent = '📋 Copier les détails';
        }, 1500);
      } catch (e) {
        console.warn('Copie impossible :', e);
      }
    });

    mailBtn.addEventListener('click', () => {
      const report = buildTechnicalErrorReport();

      if (!TECH_SUPPORT_EMAIL) {
        alert("Aucun e-mail de support n'est configuré pour l'instant. Tu peux copier les détails puis les envoyer manuellement.");
        return;
      }

      const subject = encodeURIComponent(`[${APP_NAME}] Signalement technique`);
      const body = encodeURIComponent(report);
      window.location.href = `mailto:${TECH_SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    });

    errorBannerInitialized = true;
  }
}

function setupTechnicalErrorCapture() {
  window.addEventListener('error', (event) => {
    showTechnicalErrorBanner({
      type: 'error',
      message: event.message || 'Erreur inconnue',
      source: event.filename || '',
      lineno: event.lineno || '',
      colno: event.colno || '',
      stack: event.error?.stack || ''
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    showTechnicalErrorBanner({
      type: 'unhandledrejection',
      message: reason?.message || String(reason || 'Promesse rejetée'),
      source: '',
      lineno: '',
      colno: '',
      stack: reason?.stack || ''
    });
  });
}


function getNotificationAppIds() {
  return Array.isArray(window.NOTIFICATION_APP_IDS) && window.NOTIFICATION_APP_IDS.length
    ? window.NOTIFICATION_APP_IDS
    : [APP_ID];
}

function appStorageKey(appId, key) {
  return `${appId}_${key}`;
}

function appLsGet(appId, key, fallback = null) {
  const value = localStorage.getItem(appStorageKey(appId, key));
  return value !== null ? value : fallback;
}

function appLsSet(appId, key, value) {
  localStorage.setItem(appStorageKey(appId, key), value);
}

function appLsRemove(appId, key) {
  localStorage.removeItem(appStorageKey(appId, key));
}

function getDefiByDayForApp(appId, jourNumero) {
  const defis = window.DEFIS_BY_APP?.[appId];
  if (!Array.isArray(defis)) return null;
  return defis.find(defi => defi.jour === jourNumero) || null;
}

function isManualProgressPausedForApp(appId) {
  return appLsGet(appId, 'progress_paused', 'false') === 'true';
}

function isFlowOverrideActiveForApp(appId) {
  return appLsGet(appId, 'flow_pause_override', 'false') === 'true';
}

function isFlowAutoPausedForAppId(appId) {
  const flow = getProgramFlow();
  if (!flow.length || !flow.includes(appId)) return false;

  const blockerAppId = getFlowBlockerAppId();
  if (!blockerAppId) return false;

  if (blockerAppId === appId) return false;

  if (isFlowOverrideActiveForApp(appId)) return false;

  return true;
}

function isProgressPausedForApp(appId) {
  return isManualProgressPausedForApp(appId) || isFlowAutoPausedForAppId(appId);
}


function buildNotificationTargetUrl(appId) {
  const allowedIds = Array.isArray(window.ALLOWED_APP_IDS) ? window.ALLOWED_APP_IDS : [APP_ID];
  const currentUrl = new URL(window.location.href);

  if (allowedIds.length <= 1) {
    currentUrl.searchParams.delete('app');
    return currentUrl.toString();
  }

  currentUrl.searchParams.set('app', appId);
  return currentUrl.toString();
}


async function showDailyWakeNotificationIfNeededForApp(appId) {
  const appConfig = window.APP_CONFIGS?.[appId];
  if (!appConfig) return false;

  if (isProgressPausedForApp(appId)) return false;

  const today = new Date().toLocaleDateString('fr-FR');
  const lastShownKey = 'last_daily_notif_shown';
  const lockKey = 'daily_notif_lock';

  if (appLsGet(appId, lastShownKey) === today) return false;
  if (appLsGet(appId, lockKey) === today) return false;
  appLsSet(appId, lockKey, today);

  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const jourActuel = parseInt(appLsGet(appId, 'jour_actuel', '1'), 10) || 1;
    const defi = getDefiByDayForApp(appId, jourActuel);
    if (!defi) {
      appLsRemove(appId, lockKey);
      return false;
    }

    const notifTitle = `${appConfig.NAME} - Jour ${jourActuel} - ${defi.titre}`;
    const notifBody = (defi.description || '').substring(0, 240);
    const icon192 = appConfig.ICON_192 || './core/assets/icons/default-192.png';
    const targetUrl = buildNotificationTargetUrl(appId);

    const reg = ('serviceWorker' in navigator) ? await navigator.serviceWorker.ready.catch(() => null) : null;

    if (reg?.showNotification) {
      await reg.showNotification(notifTitle, {
        body: notifBody,
        icon: icon192,
        badge: icon192,
        tag: `${appId}-jour-${jourActuel}`,
        requireInteraction: true,
        data: {
          jour: String(jourActuel),
          url: targetUrl
        },
        actions: [
          { action: 'view', title: '👁️ Voir' },
          { action: 'mark-done', title: '✅ Marquer comme accompli' }
        ],
      });
    } else {
      console.warn(`⚠️ SW non prêt pour ${appId}, notif wake ignorée pour éviter une notif Chrome`);
      appLsRemove(appId, lockKey);
      return false;
    }

    appLsSet(appId, lastShownKey, today);
    return true;
  } catch (e) {
    appLsRemove(appId, lockKey);
    console.warn(`Notif wake impossible pour ${appId}:`, e);
    return false;
  }
}

async function showDailyWakeNotificationsForConfiguredApps() {
  const appIds = getNotificationAppIds();
  const results = [];

  for (const appId of appIds) {
    const sent = await showDailyWakeNotificationIfNeededForApp(appId);
    results.push({ appId, sent });

    await new Promise(resolve => setTimeout(resolve, 350));
  }

  console.log('🔔 Résultats wake multi-app:', results);
  return results;
}



// === On attend que envol-notifications.js soit chargé :

// Au début de app.js
console.log('🔔 app.js chargement...');

// Attendre que notifications.js soit prêt
function initApp() {
  console.log('🔔 Initialisation app...');

  renderProgramSelector();
  applyAppBranding();

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

console.log("APP_ID:", APP_ID);
console.log("APP_NAME:", APP_NAME);
console.log("DEFIS LOADED:", window.DEFIS?.length);


// ========== FONCTIONS GÉRANT ONESIGNAL ==========

// Fonction sécurisée pour accéder à OneSignal
function safeOneSignal() {
  const OneSignal = window.OneSignalGlobal;

  if (OneSignal) {
    return OneSignal;
  }

  return null;
}

// Fonction pour attendre OneSignal SANS ERREUR
function waitForOneSignal(maxSeconds = 5) {
  return new Promise((resolve) => {
    const alreadyAvailable = safeOneSignal();

    if (alreadyAvailable) {
      console.log('[OneSignal] Déjà chargé');
      resolve(alreadyAvailable);
      return;
    }

    console.log('[OneSignal] Attente du chargement...');

    let attempts = 0;
    const maxAttempts = maxSeconds * 10;

    const interval = setInterval(() => {
      attempts += 1;

      const OneSignal = safeOneSignal();

      if (OneSignal) {
        clearInterval(interval);

        console.log(
          `[OneSignal] Chargé après ${attempts / 10} s`
        );

        resolve(OneSignal);
        return;
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);

        console.warn(
          `[OneSignal] Non chargé après ${maxSeconds} s`
        );

        resolve(null);
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
      /*
       * On lit OneSignal après les 4 secondes d’attente.
       * Sinon la constante pourrait conserver la valeur null
       * capturée avant le chargement du SDK.
       */
      const OneSignal = window.OneSignalGlobal;

      if (!OneSignal) {
        console.log('❌ OneSignal non détecté');
        console.log('Causes possibles :');
        console.log('1. OneSignal est désactivé dans config.js');
        console.log('2. Le SDK n’a pas encore fini de charger');
        console.log('3. Un bloqueur de scripts empêche son chargement');
        console.log('4. Firefox bloque le CDN avec sa protection renforcée');

        if (/Firefox/i.test(navigator.userAgent)) {
          console.log(
            '💡 Firefox : vérifie la protection renforcée contre le pistage.'
          );
        }

        return;
      }

      console.log('✅ OneSignal chargé');
      console.log(
        'Version SDK :',
        OneSignal.VERSION || 'Non communiquée par le SDK'
      );

      if (OneSignal.config?.appId) {
        console.log(
          '✅ App ID configuré :',
          OneSignal.config.appId
        );
      } else {
        console.log(
          '⚠️ L’App ID n’est pas accessible depuis cet objet OneSignal.'
        );
      }

      const pushSubscription =
        OneSignal.User?.PushSubscription;

      if (pushSubscription) {
        const isSubscribed =
          Notification.permission === 'granted';

        console.log(
          '🔔 Autorisation navigateur :',
          Notification.permission
        );

        console.log(
          '🔔 Abonnement considéré actif :',
          isSubscribed
        );

        if (isSubscribed) {
          console.log(
            '🎉 Le navigateur autorise les notifications.'
          );
        }
      } else {
        console.log(
          '⚠️ PushSubscription n’est pas encore disponible.'
        );
      }
    } catch (error) {
      console.error(
        '❌ Erreur debug OneSignal :',
        error
      );
    } finally {
      console.log('=== FIN DEBUG ===');
    }
  }, 4000);
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
  if (lsGet('install_prompt_shown')) return;
  const overlay = document.createElement('div');
  overlay.id = 'install-overlay';
  overlay.innerHTML = `
    <div style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center;">
      <div style="background:white; padding:30px; border-radius:20px; max-width:400px; text-align:center;">
        <h2>Installer ${INSTALL_APP_NAME} ?</h2>
        <p>Pour un accès rapide depuis ton écran d'accueil,</p>
        <div id="install-instructions">
          <p>👇🏻 clique sur le bouton jaune👇🏻</p>
          <p>"📱 Installer ${INSTALL_APP_NAME} sur l'écran d'accueil"</p>
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
    lsSet('install_prompt_shown', 'true');
  });
  setTimeout(() => {
    if (document.getElementById('install-overlay')) {
      document.getElementById('install-overlay').remove();
      lsSet('install_prompt_shown', 'true');
    }
  }, 10000);
}

async function checkNotificationPermission() {
  try {
    const OneSignal = await waitForOneSignal(5);

    if (OneSignal) {
      try {
        /*
         * Ancienne API OneSignal.
         */
        if (
          typeof OneSignal.isPushNotificationsEnabled === 'function'
        ) {
          const isSubscribed =
            await OneSignal.isPushNotificationsEnabled();

          return isSubscribed
            ? 'granted'
            : 'default';
        }

        /*
         * API OneSignal récente.
         */
        const pushSubscription =
          OneSignal.User?.PushSubscription;

        if (pushSubscription) {
          return pushSubscription.optIn
            ? 'granted'
            : 'denied';
        }
      } catch (error) {
        console.warn(
          'Erreur pendant la lecture de OneSignal :',
          error
        );
      }
    }

    /*
     * Fallback natif si OneSignal n’est pas disponible.
     */
    if ('Notification' in window) {
      return Notification.permission;
    }

    return 'unsupported';
  } catch (error) {
    console.warn(
      'Erreur pendant la vérification des permissions :',
      error
    );

    return 'unsupported';
  }
}

function detecterAndroidEtNotifications() {
  const androidNotificationSection = document.getElementById('allow-notifications-btn')?.closest('.trouble-item');
  if (androidNotificationSection) {
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




// ===================================================================
// ========== LOGIQUE PRINCIPALE =====================================
// ========== DÉBUT DU DOM CONTENT LOADED ============================
// ===================================================================


document.addEventListener('DOMContentLoaded', async function() {
    console.log(`🚀 Initialisation ${APP_NAME}...`);
    if (ensureRecommendedFlowAppSelection()) return;

    setupTechnicalErrorCapture();
    await loadInstallAppNameFromManifest();
    debugOneSignal();

    const supportLink = document.getElementById("support-link");
    if (supportLink && APP_SUPPORT_URL === "#fondation-support") {
      supportLink.addEventListener("click", function (event) {
        event.preventDefault();
        if (window.FondationSupportOverlay) {
          window.FondationSupportOverlay.open();
        }
      });
    }
    

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
      const dayTotalElement = document.getElementById('day-total');
      const challengeTitleElement = document.getElementById('challenge-title');
      const challengeDescriptionElement = document.getElementById('challenge-description');
      const markDoneButton = document.getElementById('mark-done-btn');
      const pauseProgressionButton = document.getElementById('pause-progression-btn');


      // Synchroniser l'affichage avec l'état global (pas de "let" ici : on utilise le jourAffiche global)
      jourAffiche = jourActuel;

      // On vérifie l'état de pause ou d'avancement de chaque progression :
      updatePauseProgressionButton();

      if (pauseProgressionButton && !pauseProgressionButton.dataset.listenerAttached) {
        pauseProgressionButton.dataset.listenerAttached = "true";

        pauseProgressionButton.addEventListener('click', function () {
  const manuallyPaused = isManualProgressPaused();
  const autoPaused = isFlowAutoPausedForApp(APP_ID);
  const effectivelyPaused = manuallyPaused || autoPaused;

  const today = new Date().toLocaleDateString('fr-FR');

  // =========================
  // METTRE EN PAUSE
  // =========================
  if (!effectivelyPaused) {
    const currentDay =
      parseInt(lsGet('jour_actuel', '1'), 10) || 1;

    const currentChallenge =
      Array.isArray(window.DEFIS)
        ? window.DEFIS[currentDay - 1]
        : null;

    const wasCompleted =
      currentChallenge?.termine === true;

    lsSet(
      'pause_day_was_completed',
      wasCompleted ? 'true' : 'false'
    );

    lsSet('pause_started_date', today);

    setManualProgressPaused(true);
    setFlowOverrideActive(false);

    updatePauseProgressionButton();

    alert(
      `⏸️ La progression ${APP_NAME} est maintenant en pause.`
    );

    return;
  }

  // =========================
  // REPRENDRE APRÈS PAUSE MANUELLE
  // =========================
  if (manuallyPaused) {
    const pauseStartedDate =
      lsGet('pause_started_date', today);

    const wasCompleted =
      lsGet('pause_day_was_completed', 'false') === 'true';

    const resumedOnAnotherDay =
      pauseStartedDate !== today;

    setManualProgressPaused(false);

    /*
     * Nouveau défi uniquement si :
     * - le défi était déjà validé avant la pause ;
     * - au moins un changement de date a eu lieu.
     */
    if (wasCompleted && resumedOnAnotherDay) {
      let currentDay =
        parseInt(lsGet('jour_actuel', '1'), 10) || 1;

      if (
        Array.isArray(window.DEFIS) &&
        currentDay < window.DEFIS.length
      ) {
        currentDay += 1;

        lsSet(
          'jour_actuel',
          String(currentDay)
        );

        /*
         * Empêche verifierEtAvancerJour()
         * d’ajouter encore les jours écoulés pendant la pause.
         */
        lsSet(
          'dernier_changement_jour',
          today
        );

        jourActuel = currentDay;
        jourAffiche = currentDay;
      }
    } else {
      /*
       * Même jour ou défi non terminé :
       * la progression reprend exactement où elle était.
       */
      lsSet(
        'dernier_changement_jour',
        today
      );
    }

    lsRemove('pause_day_was_completed');
    lsRemove('pause_started_date');

    updatePauseProgressionButton();

    afficherDefiDuJour(jourActuel);

    if (typeof genererCalendrier === 'function') {
      genererCalendrier();
    }

    alert(
      `▶️ La progression ${APP_NAME} reprend à partir d’aujourd’hui.`
    );

    return;
  }

  // =========================
  // FORCER UNE PAUSE AUTOMATIQUE
  // =========================
  if (autoPaused) {
    setFlowOverrideActive(true);

    updatePauseProgressionButton();

    alert(
      `▶️ La progression ${APP_NAME} reprend malgré l’ordre recommandé du parcours.`
    );
  }
});
      }




      // Listener DU bouton "Marquer comme accompli" (à attacher UNE SEULE FOIS)
        if (markDoneButton && !markDoneButton.dataset.listenerAttached) {
          markDoneButton.dataset.listenerAttached = "true";

          markDoneButton.addEventListener('click', function() {
            try {
              const jourCourant = parseInt(lsGet('jour_actuel', '1'), 10) || 1;
              const jourCible = parseInt(jourAffiche, 10) || jourCourant;

              const defi = getDefiByDay(jourCible);
              if (!defi) return;

              console.log('✅ [VALIDATION] jourCible:', jourCible, 'jourCourant:', jourCourant, 'APP_ID:', APP_ID);

              if (jourCible > jourCourant) {
                alert("⏳ Tu pourras valider ce défi le jour J (ou rattraper un défi passé).");
                return;
              }

              if (jourCible < jourCourant) {
                const madeupDefis = JSON.parse(lsGet('defis_madeup', '[]'));
                if (!madeupDefis.includes(jourCible)) {
                  madeupDefis.push(jourCible);
                  lsSet('defis_madeup', JSON.stringify(madeupDefis));
                  alert("✨ Défi rattrapé avec succès !");
                } else {
                  alert("✨ Ce défi est déjà rattrapé.");
                }
              } else {
                if (!defi.termine) {
                  defi.termine = true;
                  defi.dateValidation = new Date().toISOString();
                  alert("✅ Défi validé ! À demain pour le prochain.");
                } else {
                  alert("✅ Ce défi est déjà accompli.");
                }
              }

              if (typeof saveProgression === 'function') saveProgression();

              afficherDefiDuJour(jourCible);
              if (typeof genererCalendrier === 'function') genererCalendrier();

            } catch (e) {
              console.error("❌ Erreur validation défi:", e);
              alert("Oh mince… une erreur est survenue pendant la validation. Essaie de recharger l’app.");
            }
          });
        }


      // Réception des actions venant du Service Worker
if ('serviceWorker' in navigator && !window.__envolSWMsgListenerAttached) {
  window.__envolSWMsgListenerAttached = true;

  function afficherDefiDepuisNotification(jour) {
    const jourNotif = parseInt(jour, 10);

    if (!isNaN(jourNotif)) {
      afficherDefiDuJour(jourNotif);
    }

    const challengeContainer = document.querySelector('.challenge-container');

    if (challengeContainer) {
      challengeContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  function afficherParametresNotifications() {
    const troubleshootingSection =
      document.querySelector('.troubleshooting');

    if (troubleshootingSection) {
      troubleshootingSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  navigator.serviceWorker.addEventListener('message', (event) => {
    try {
      const data = event.data || {};

      // ✅ Marquer le défi
      if (data.action === 'MARK_DONE') {
        const jourNotif = parseInt(data.jour, 10);

        console.log(
          '🔔 [SW->APP] MARK_DONE reçu pour jour:',
          jourNotif
        );

        if (!isNaN(jourNotif)) {
          afficherDefiDuJour(jourNotif);

          if (markDoneButton) {
            setTimeout(() => {
              markDoneButton.click();
            }, 0);
          }
        }

        return;
      }

      // 👁️ Afficher le défi sans le valider
      if (data.action === 'VIEW_CHALLENGE') {
        console.log(
          '🔔 [SW->APP] VIEW_CHALLENGE reçu pour jour:',
          data.jour
        );

        afficherDefiDepuisNotification(data.jour);
        return;
      }

      // ⚙️ Afficher la section de dépannage
      if (data.action === 'OPEN_NOTIFICATION_SETTINGS') {
        console.log(
          '🔔 [SW->APP] OPEN_NOTIFICATION_SETTINGS reçu'
        );

        afficherParametresNotifications();
        return;
      }

      console.warn(
        '🔔 [SW->APP] Action inconnue ignorée:',
        data.action
      );
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
      if (!lsGet('defis_madeup')) {
        lsSet('defis_madeup', JSON.stringify([]));
      }
    }


    //===================================================================
    //======= VÉRIFIER JOURS MANQUÉS ====================================
    // Vérifier et gérer les jours manqués depuis la dernière connexion
    //===================================================================

    
    function verifierJoursManques() {
      const aujourdhui = new Date().toLocaleDateString('fr-FR');
      const dernierAcces = lsGet('dernier_acces');
      
      // Premier accès
      if (!dernierAcces) {
        lsSet('dernier_acces',aujourdhui);
        return jourActuel;
      }

      // Calculer différence en jours
      const date1 = new Date(dernierAcces.split('/').reverse().join('-'));
      const date2 = new Date(aujourdhui.split('/').reverse().join('-'));
      const diffJours = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));

      console.log('📅 Dernier accès:', dernierAcces, 'Différence:', diffJours, 'jours');

      if (diffJours > 0) {
        // Marquer les jours passés comme manqués (sauf si déjà fait ou rattrapé)
        for (let i = 0; i < diffJours && jourActuel + i <= APP.TOTAL_DAYS; i++) {
          const jourAMarquer = jourActuel + i;
          const defi = getDefiByDay(jourAMarquer);

          // Vérifier si déjà rattrapé
          const madeupDefis = JSON.parse(lsGet('defis_madeup', '[]'));
          const estDejaRattrape = madeupDefis.includes(jourAMarquer);

          if (defi && !defi.termine && !estDejaRattrape) {
            console.log(`❌ Jour ${jourAMarquer} marqué comme manqué`);
            // On ne change pas defi.termine ici, on utilise juste la classe CSS
          }
        }

        // Mettre à jour le dernier accès
        lsSet('dernier_acces',aujourdhui);
      }

      return jourActuel;
    }

      //===================================================================
      //======= FIN DE 'VÉRIFIER JOURS MANQUÉS' =============================
      //===================================================================


      // Fonction originale anti-speed running (conservée)
      function peutPasserAuJourSuivant() {
        const aujourdhui = new Date().toLocaleDateString('fr-FR');
        const dernierChangement = lsGet('dernier_changement_jour');

        // DEBUG
        console.log('📅 [DEBUG] Vérification avancement:', {
          aujourdhui,
          dernierChangement,
          sontIdentiques: dernierChangement === aujourdhui,
          jourActuel: parseInt(lsGet('jour_actuel', '1'))
        });

         // ✅ Premier accès : on initialise, mais on N'AVANCE PAS
        if (!dernierChangement) {
          console.log('✅ Premier accès - initialisation (pas d’avancement)');
          lsSet('dernier_changement_jour',aujourdhui);
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

  //======FIN de la protection du helper


function verifierEtAvancerJour() {
  if (isProgressPaused()) {
    console.log(`⏸️ [${APP_NAME}] progression en pause : aucun avancement du jour`);
    return;
  }
  try {
    let jour = parseInt(lsGet('jour_actuel', '1'), 10);
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
    const dernierStr = lsGet('dernier_changement_jour'); // "dd/mm/yyyy" ou null

    console.log('   Date aujourd’hui:', aujourdhuiStr);
    console.log('   Dernier changement:', dernierStr);

    // Premier lancement : on pose juste la référence, sans avancer
    if (!dernierStr) {
      lsSet('dernier_changement_jour',aujourdhuiStr);
      console.log('✅ Premier lancement : dernier_changement_jour initialisé (pas d’avancement)');
    } else {
      // Si la date a changé, on calcule combien de jours se sont écoulés
      if (dernierStr !== aujourdhuiStr) {
        // Parse FR "dd/mm/yyyy" -> Date à MIDI (évite bugs changement d’heure)
        const ancienneDate = parseDateFRSafe(dernierStr);
        const nouvelleDate = parseDateFRSafe(aujourdhuiStr);

        if (!ancienneDate || !nouvelleDate) {
          console.warn('⚠️ Date invalide détectée -> resync dernier_changement_jour', { dernierStr, aujourdhuiStr });
          lsSet('dernier_changement_jour',aujourdhuiStr);
          return jourActuel; // on ne casse pas l’app
        }


        const diffMs = nouvelleDate.getTime() - ancienneDate.getTime();
        const diffJours = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        console.log('📅 [DEBUG] Différence réelle en jours:', diffJours);

        if (diffJours > 0) {
          const nouveauJour = Math.min(APP.TOTAL_DAYS, jourActuel + diffJours);
          if (nouveauJour !== jourActuel) {
            jourActuel = nouveauJour;
            lsSet('jour_actuel',String(jourActuel));
            console.log(`🎯 AVANCÉ de ${diffJours} jour(s) -> jour_actuel:`, jourActuel);
          } else {
            console.log('⏸️ Déjà au max (APP.TOTAL_DAYS), pas d’avancement');
          }

          // Important : on met à jour la date de référence
          lsSet('dernier_changement_jour',aujourdhuiStr);
        } else {
          console.log('⏸️ Date différente mais diffJours <= 0 (heure/date système ?) — pas d’avancement');
          // On peut quand même resynchroniser la date si tu veux être stricte :
          // lsSet('dernier_changement_jour',aujourdhuiStr);
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




// ===================================================================================
// ========== JOURNAL DES NOTES =======================================================
const NOTES_STORAGE_KEY = 'notes_by_day';
const notesSaveTimers = new Map();

function getNotesMap() {
  try {
    const current = JSON.parse(lsGet(NOTES_STORAGE_KEY, '{}'));
    if (current && typeof current === 'object' && !Array.isArray(current)) {
      return current;
    }
  } catch (error) {
    console.warn('⚠️ Notes illisibles, tentative de migration.', error);
  }

  return {};
}

function migrateLegacyNotes() {
  const current = getNotesMap();
  if (Object.keys(current).length > 0) return current;

  try {
    const legacy = JSON.parse(lsGet('notes', '{}'));
    if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) {
      lsSet(NOTES_STORAGE_KEY, JSON.stringify(legacy));
      lsRemove('notes');
      return legacy;
    }
  } catch (error) {
    console.warn('⚠️ Anciennes notes non migrées.', error);
  }

  return current;
}

function setNoteForDay(day, text) {
  const notes = getNotesMap();
  const key = String(day);
  const value = String(text || '');

  if (value.trim()) {
    notes[key] = value;
  } else {
    delete notes[key];
  }

  lsSet(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

function setNotesStatus(message) {
  const status = document.getElementById('notes-status');
  if (!status) return;
  status.textContent = message || '';
}

function scheduleNoteSave(day, value) {
  const previousTimer = notesSaveTimers.get(day);
  if (previousTimer) clearTimeout(previousTimer);

  setNotesStatus('Sauvegarde…');

  const timer = setTimeout(() => {
    setNoteForDay(day, value);
    notesSaveTimers.delete(day);
    setNotesStatus('✓ Sauvegardé');

    setTimeout(() => {
      if (notesSaveTimers.size === 0) setNotesStatus('');
    }, 1400);
  }, 350);

  notesSaveTimers.set(day, timer);
}

// S'assurer que toutes les sauvegardes de notes sont bien terminées
// avant d'exporter une sauvegarde

function flushPendingNotes() {
  const notes = getNotesMap();

  document.querySelectorAll('.notes-day-textarea').forEach((textarea) => {
    const noteDayElement = textarea.closest('.notes-day');
    const day = noteDayElement?.dataset.noteDay;

    if (!day) return;

    const value = textarea.value;

    if (value.trim()) {
      notes[day] = value;
    } else {
      delete notes[day];
    }
  });

  notesSaveTimers.forEach((timer) => clearTimeout(timer));
  notesSaveTimers.clear();

  lsSet(NOTES_STORAGE_KEY, JSON.stringify(notes));
  setNotesStatus('✓ Sauvegardé');
}


function autoResizeNoteTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}



function createNoteDayElement(day, notes, currentDay, selectedDay) {
  const item = document.createElement('article');
  item.className = 'notes-day';
  item.dataset.noteDay = String(day);

  if (day === selectedDay) item.classList.add('is-selected');

  const title = document.createElement('h4');
  title.className = 'notes-day-title';
  title.textContent = `Jour ${day} :`;
  item.appendChild(title);

  if (day > currentDay) {
    item.classList.add('is-future');

    const locked = document.createElement('p');
    locked.className = 'notes-future-message';
    locked.textContent = 'La prise de note sera disponible le jour venu.';
    item.appendChild(locked);
    return item;
  }

  const textarea = document.createElement('textarea');
  textarea.className = 'notes-day-textarea';
  textarea.dataset.noteDayInput = String(day);
  textarea.rows = 2;
  textarea.value = notes[String(day)] || '';
  requestAnimationFrame(() => autoResizeNoteTextarea(textarea));
  textarea.placeholder = 'Écris ici ce que tu ressens, ce que tu observes, tes prises de conscience…';
  textarea.setAttribute('aria-label', `Note du jour ${day}`);

  textarea.addEventListener('input', () => {
    autoResizeNoteTextarea(textarea);
    scheduleNoteSave(day, textarea.value);
  });

  item.appendChild(textarea);
  return item;
}

function renderNotesJournal(selectedDay = null, shouldFocus = false) {
  const journal = document.getElementById('notes-journal');
  if (!journal) return;

  const notes = migrateLegacyNotes();
  const totalDays = Math.max(1, Number(APP.TOTAL_DAYS) || 1);
  const currentDay = Math.max(1, parseInt(jourActuel, 10) || 1);
  const safeSelectedDay = Math.min(
    totalDays,
    Math.max(1, parseInt(selectedDay, 10) || parseInt(jourAffiche, 10) || currentDay)
  );

  journal.innerHTML = '';

  const fragment = document.createDocumentFragment();
  for (let day = 1; day <= totalDays; day += 1) {
    fragment.appendChild(
      createNoteDayElement(day, notes, currentDay, safeSelectedDay)
    );
  }
  journal.appendChild(fragment);

  if (!shouldFocus) return;

  requestAnimationFrame(() => {
    const selected = journal.querySelector(
      `[data-note-day="${safeSelectedDay}"]`
    );
    if (!selected) return;

    selected.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    if (safeSelectedDay <= currentDay) {
      const textarea = selected.querySelector('[data-note-day-input]');
      textarea?.focus({ preventScroll: true });
    }
  });
}
// ========== FIN DU JOURNAL DES NOTES ================================================


    // ========== FONCTIONS D'AFFICHAGE (MODIFIÉES) ==========

  function afficherDefiDuJour(jour, options = {}) {
      const defi = getDefiByDay(jour);
      if (!defi) return;

      jourAffiche = jour; // 👈 IMPORTANT


      if (currentDayElement) currentDayElement.textContent = jour;
      if (dayCurrentElement) dayCurrentElement.textContent = jour;
      if (dayTotalElement) dayTotalElement.textContent = String(APP.TOTAL_DAYS || 0);
      if (challengeTitleElement) challengeTitleElement.textContent = defi.titre;
      if (challengeDescriptionElement) challengeDescriptionElement.textContent = defi.description;
// ✅ Mettre à jour le bouton selon l'état du jour affiché
  updateMarkDoneButtonUI(jour);
  renderNotesJournal(jour);
  // Vérifier s'il faut mettre l'overlay de défis terminés
  updateProgramCompleteOverlay();

  console.log("📌 afficherDefiDuJour appelé avec:", jour, "=> jourAffiche =", jourAffiche);
  }




 function updateMarkDoneButtonUI(jour) {
    if (!markDoneButton) return;

    const jourCourant = parseInt(jourActuel, 10) || 1;
    const jourCible = parseInt(jour, 10);
    const defi = getDefiByDay(jourCible);
    if (!defi || isNaN(jourCible)) return;

    const madeupDefis = JSON.parse(lsGet('defis_madeup', '[]'));
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
      const madeupDefis = JSON.parse(lsGet('defis_madeup', '[]'));

      for (let jour = 1; jour <= APP.TOTAL_DAYS; jour++) {
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
        localStorage.setItem(STORAGE_PREFIX + 'heure_notification', notificationTimeSelect.value);
        console.log('⏰ Heure de notification sauvegardée:', notificationTimeSelect.value);
      });
    }





      // ========== BOUTONS DÉPANNAGE ==========

      // 1. VIDER LE CACHE
      document.getElementById('clear-cache-btn')?.addEventListener('click', async function () {
        const btn = this;
        const originalText = btn.textContent;

        const confirmed = confirm(
          "Tu vas vider le cache de l'application et recharger la page. Continuer ?"
        );
        if (!confirmed) return;

        btn.disabled = true;
        btn.textContent = "🧹 Nettoyage...";

        try {
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
          }

          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          }

          console.log("✅ Cache et Service Workers supprimés");

          // Petit délai pour laisser le navigateur finir le nettoyage
          setTimeout(() => {
            window.location.reload();
          }, 300);

        } catch (error) {
          console.error("❌ Erreur pendant le nettoyage du cache :", error);
          alert("Le nettoyage du cache a rencontré un problème. Tu peux réessayer.");
          btn.disabled = false;
          btn.textContent = originalText;
        }
      });



      // 4. EXPORTER SAUVEGARDE
      document.getElementById('export-backup-btn')?.addEventListener('click', function () {
        try {
          flushPendingNotes();

          const backupData = {
            version: '1.1',
            appId: APP_ID,
            appName: APP_NAME,
            timestamp: new Date().toISOString(),
            progression: JSON.parse(lsGet('defis_progression', '[]')),
            jourActuel: lsGet('jour_actuel', '1'),
            dernierChangement: lsGet('dernier_changement_jour', null),
            heureNotification: lsGet('heure_notification', '08:00'),
            defisMadeup: JSON.parse(lsGet('defis_madeup', '[]')),
            notesByDay: JSON.parse(lsGet('notes_by_day', '{}'))
          };

          const blob = new Blob(
            [JSON.stringify(backupData, null, 2)],
            { type: 'application/json' }
          );

          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.href = url;
          link.download =
            `sauvegarde-${APP_ID}-${new Date().toISOString().split('T')[0]}.json`;

          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);

          alert('✅ Sauvegarde exportée !');
        } catch (error) {
          console.error('Erreur export :', error);
          alert(
            '❌ La sauvegarde n’a pas pu être créée. Certaines données locales semblent illisibles.'
          );
        }
      });



      // 5. IMPORTER SAUVEGARDE
      document.getElementById('import-backup-btn')?.addEventListener('click', function () {
      const input = document.createElement('input');

      input.type = 'file';
      input.accept = '.json';

      input.onchange = function (event) {
        const file = event.target?.files?.[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (loadEvent) {
          try {
            const result = loadEvent.target?.result;

            /*
             * FileReader.result peut théoriquement être :
             * - une chaîne de caractères ;
             * - un ArrayBuffer ;
             * - null.
             *
             * Comme readAsText() doit nous fournir du texte,
             * on vérifie clairement le type avant JSON.parse().
             */
            if (typeof result !== 'string') {
              throw new Error(
                'Le fichier importé ne contient pas de texte lisible.'
              );
            }

            const backupData = JSON.parse(result);

            if (backupData.appId && backupData.appId !== APP_ID) {
              alert(
                `⚠️ Cette sauvegarde appartient au programme ` +
                `${backupData.appId}, pas à ${APP_ID}.`
              );
              return;
            }

            if (!backupData.progression || !backupData.jourActuel) {
              throw new Error('Format de sauvegarde invalide.');
            }

            const dateSauvegarde = backupData.timestamp
              ? new Date(backupData.timestamp).toLocaleDateString('fr-FR')
              : 'date inconnue';

            const confirmation = confirm(
              `Importer la sauvegarde du ${dateSauvegarde} ?`
            );

            if (!confirmation) return;

            lsSet(
              'defis_progression',
              JSON.stringify(backupData.progression)
            );

            lsSet(
              'jour_actuel',
              String(backupData.jourActuel)
            );

            if (backupData.dernierChangement) {
              lsSet(
                'dernier_changement_jour',
                backupData.dernierChangement
              );
            }

            if (backupData.heureNotification) {
              lsSet(
                'heure_notification',
                backupData.heureNotification
              );
            }

            /*
             * Notes au nouveau format :
             * {
             *   "1": "Ma note...",
             *   "2": "Une autre note..."
             * }
             */
            if (
              Array.isArray(backupData.defisMadeup)
            ) {
              lsSet(
                'defis_madeup',
                JSON.stringify(backupData.defisMadeup)
              );
            } else {
              lsSet(
                'defis_madeup',
                JSON.stringify([])
              );
            }

            if (
              backupData.notesByDay &&
              typeof backupData.notesByDay === 'object' &&
              !Array.isArray(backupData.notesByDay)
            ) {
              lsSet(
                'notes_by_day',
                JSON.stringify(backupData.notesByDay)
              );
            } else if (typeof backupData.notes === 'string') {
              /*
               * Ancien format :
               * une seule chaîne de texte.
               *
               * On la rattache au jour importé.
               */
              const day = String(backupData.jourActuel || 1);

              lsSet(
                'notes_by_day',
                JSON.stringify({
                  [day]: backupData.notes
                })
              );
            } else if (
                backupData.notes &&
                typeof backupData.notes === 'object' &&
                !Array.isArray(backupData.notes)
              ) {
              /*
               * Ancienne sauvegarde qui contiendrait déjà
               * un objet de notes.
               */
              lsSet(
                'notes_by_day',
                JSON.stringify(backupData.notes)
              );
            } else {
              lsSet(
                'notes_by_day',
                JSON.stringify({})
              );
            }

            // Suppression de l’ancienne clé après migration.
            lsRemove('notes');

            alert('✅ Progression importée !');
            window.location.reload();
          } catch (error) {
            console.error('Erreur import :', error);
            alert('❌ Fichier de sauvegarde invalide.');
          }
        };

        reader.onerror = function () {
          console.error(
            'Erreur pendant la lecture du fichier :',
            reader.error
          );

          alert('❌ Le fichier n’a pas pu être lu.');
        };

        reader.readAsText(file);
      };

      input.click();
    });

      // 6. SUPPRIMER PROGRESSION
      document.getElementById('reset-progress-btn')?.addEventListener('click', function() {
        if (!confirm(`ÊTES-VOUS ABSOLUMENT SÛR ?\n\nToute la progression du programme ${APP_NAME} sera effacée.`)) return;
        if (!confirm(`DERNIÈRE CHANCE : "Annuler" pour garder ${APP_NAME}, "OK" pour supprimer.`)) return;

        const wasPaused = isProgressPaused();

        window.DEFIS.forEach(defi => {
          defi.termine = false;
          defi.dateValidation = null;
        });

        if (typeof saveProgression === 'function') saveProgression();

        lsSet('jour_actuel', '1');

        const aujourdhui = new Date().toLocaleDateString('fr-FR');
        lsSet('dernier_changement_jour', aujourdhui);
        lsSet('dernier_acces', aujourdhui);
        lsSet('heure_notification', '08:00');
        lsSet('defis_madeup', JSON.stringify([]));
        lsSet('notes_by_day', JSON.stringify({}));
        lsRemove('notes');
        lsRemove('install_prompt_shown');
        lsSet('progress_paused', wasPaused ? 'true' : 'false');
        lsRemove('flow_pause_override');

        alert(`🗑️ Progression ${APP_NAME} supprimée.`);
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
      // On vérifie d'abord le jour avant d'avancer :
      verifierEtAvancerJour();

      const jourActuelApresSync = parseInt(lsGet('jour_actuel', '1'), 10) || 1;
      jourActuel = jourActuelApresSync;
      jourAffiche = jourActuelApresSync;

      // Toujours afficher le défi du jour
      afficherDefiDuJour(jourActuelApresSync);

      // Toujours générer le calendrier, même si la progression est en pause
      if (typeof genererCalendrier === 'function') {
        genererCalendrier();
      }
      updateProgramCompleteOverlay();

      showDailyWakeNotificationsForConfiguredApps().then(results => console.log('🔔 Notifs wake envoyées ?', results));



      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('👁️ [APP] Retour au premier plan -> resync jour');
          verifierEtAvancerJour();
          showDailyWakeNotificationsForConfiguredApps();
        }
      });

    
    // ===================================================================================
    // ========== GESTION PWA ============================================================
        
    let deferredPrompt;
    const installButton = document.createElement('button');
    installButton.id = 'install-pwa-btn';
    installButton.className = 'install-btn';
    installButton.textContent = `📱 Installer ${INSTALL_APP_NAME} sur l'écran d'accueil`;
    
    
        
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
  const oneSignal = window.OneSignalGlobal;

  if (oneSignal) {
    console.log('🔔 Chargement du module notifications…');
    const script = document.createElement('script');
    // script.src = '/sekhamet-envol/envol-notifications.js';
    script.onload = () => console.log('✅ Module notifications chargé');
    document.head.appendChild(script);
  } else {
    console.warn('⚠️ OneSignal non disponible');
  }
}, 3000);


});

//============ FIN DU DOM CONTENT LOADED ===================

// ====== Notification journalière au réveil de l'app (1 fois / jour) ======
    async function showDailyWakeNotificationIfNeeded() {
      if (isProgressPaused()) return false;
      const today = new Date().toLocaleDateString('fr-FR');

      // Déjà montré aujourd'hui -> stop
      if (lsGet('last_daily_notif_shown') === today) return false;

      // Anti-double déclenchement la même seconde (DOMContentLoaded + visibilitychange)
      const lockKey = 'daily_notif_lock';
      if (lsGet(lockKey) === today) return false;
      lsSet(lockKey, today);
    
      if (!('Notification' in window)) return false;
      if (Notification.permission !== 'granted') return false;
    
      try {
        // ✅ Priorité: notif riche via ton pipeline existant
        if (typeof window.envoyerNotificationDuJour === 'function') {
          await window.envoyerNotificationDuJour();
          lsSet('last_daily_notif_shown', today);
          return true;
        }
    
        // ✅ Fallback minimaliste (SEULEMENT si la riche n'est pas dispo)
        const reg = await navigator.serviceWorker?.getRegistration?.();
        const ICON_192 = APP.ICON_192 || "./core/assets/icons/default-192.png";
        if (reg?.showNotification) {
          await reg.showNotification((APP.NOTIF_TITLE || `${APP_NAME} — Défi du jour`), {
            body: "Ton défi du jour t’attend ✨",
            icon: ICON_192,
            badge: ICON_192,
            tag: `${APP_ID}-daily`,
            renotify: false
          });
          lsSet('last_daily_notif_shown', today);
          return true;
        }
    
        // Dernier fallback: Console
        console.warn(
          `⚠️ [Notification ${APP_NAME}] Service Worker indisponible : notification wake ignorée pour éviter une notification Chrome simplifiée.`
        );

        lsRemove(lockKey);
        return false;
      } catch (e) {
        // si échec -> on retire le lock pour retenter au prochain wake
        lsRemove(lockKey);
        console.warn("Notif wake impossible:", e);
        return false;
      }
    } // FIn des Notification journalières au réveil de l'app

window.showDailyWakeNotificationIfNeeded = showDailyWakeNotificationIfNeeded;
window.showDailyWakeNotificationIfNeededForApp = showDailyWakeNotificationIfNeededForApp;
window.showDailyWakeNotificationsForConfiguredApps = showDailyWakeNotificationsForConfiguredApps;


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

})();


// ===================================================================================
// ========== APPARENCE : MARBRE / BASALTE ===========================================
(function initSkinPreference() {
  const STORAGE_KEY = 'pwa_skin';
  const allowedSkins = new Set(['marbre', 'basalte']);

  function applySkin(skin) {
    const safeSkin = allowedSkins.has(skin) ? skin : 'marbre';
    document.documentElement.dataset.skin = safeSkin;
    localStorage.setItem(STORAGE_KEY, safeSkin);

    document.querySelectorAll('[data-skin-choice]').forEach((button) => {
      const isActive = button.dataset.skinChoice === safeSkin;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function bindSkinButtons() {
    const savedSkin = localStorage.getItem(STORAGE_KEY);
    applySkin(savedSkin || document.documentElement.dataset.skin || 'marbre');

    document.querySelectorAll('[data-skin-choice]').forEach((button) => {
      button.addEventListener('click', () => applySkin(button.dataset.skinChoice));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindSkinButtons, { once: true });
  } else {
    bindSkinButtons();
  }
})();

