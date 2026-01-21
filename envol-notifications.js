// ================================================
// MODULE NOTIFICATIONS ONESIGNAL - SÉCURISÉ
// Ajoutez ce bloc à la FIN de votre app.js existant
// ================================================

// Unique namespace pour éviter les conflits
const EnvolNotifications = {
    // Variables privées
    _oneSignalUserId: null,
    _isInitialized: false,
    
    // Initialisation sécurisée
    init: function() {
        console.log('[EnvolNotifications] Démarrage de l\'initialisation...');
        
        // Vérifier si déjà initialisé
        if (this._isInitialized) {
            console.log('[EnvolNotifications] Déjà initialisé');
            return;
        }
        
        // Attendre que la page soit complètement chargée
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._setupOneSignal());
        } else {
            this._setupOneSignal();
        }
    },
    
    // Configuration interne de OneSignal
    _setupOneSignal: function() {
        console.log('[EnvolNotifications] Configuration OneSignal...');
        
        // Vérifier si OneSignal est déjà chargé
        if (window.OneSignalDeferred && Array.isArray(window.OneSignalDeferred)) {
            this._configureOneSignal();
        } else {
            // Charger OneSignal dynamiquement
            this._loadOneSignalScript();
        }
    },
    
    // Chargement du script OneSignal
    _loadOneSignalScript: function() {
        const script = document.createElement('script');
        script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
        script.defer = true;
        script.onload = () => {
            console.log('[EnvolNotifications] Script OneSignal chargé');
            this._configureOneSignal();
        };
        document.head.appendChild(script);
    },
    
    // Configuration OneSignal
    _configureOneSignal: function() {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        
        OneSignalDeferred.push(async (OneSignal) => {
            try {
                await OneSignal.init({
                    appId: "3ed3f3a4-01f5-407e-a9c5-129c11d6f53b",
                    serviceWorkerParam: { scope: "/sekhamet-envol/" },
                    serviceWorkerPath: "/sekhamet-envol/service-worker.js",
                    promptOptions: {
                        slidedown: {
                            enabled: true,
                            autoPrompt: true,
                            timeDelay: 3
                        }
                    }
                });
                
                console.log('[EnvolNotifications] ✅ OneSignal initialisé');
                this._isInitialized = true;
                
                // Récupérer l'ID utilisateur
                this._oneSignalUserId = await OneSignal.getUserId();
                if (this._oneSignalUserId) {
                    localStorage.setItem('envol_onesignal_id', this._oneSignalUserId);
                    console.log('[EnvolNotifications] ID utilisateur:', this._oneSignalUserId);
                }
                
                // Écouter les changements
                OneSignal.User.PushSubscription.addEventListener("change", (isSubscribed) => {
                    console.log('[EnvolNotifications] Statut notifications:', isSubscribed);
                    this._updateNotificationStatus(isSubscribed);
                });
                
                // Initialiser l'interface
                this._initNotificationUI();
                
            } catch (error) {
                console.error('[EnvolNotifications] ❌ Erreur:', error);
            }
        });
    },
    
    // Mise à jour de l'interface
    _updateNotificationStatus: function(isEnabled) {
        const timeSelect = document.getElementById('notification-time');
        const section = document.querySelector('.notifications-settings');
        
        if (!timeSelect || !section) return;
        
        if (isEnabled) {
            timeSelect.disabled = false;
            section.classList.add('envol-notif-enabled');
            section.classList.remove('envol-notif-disabled');
        } else {
            timeSelect.disabled = true;
            section.classList.add('envol-notif-disabled');
            section.classList.remove('envol-notif-enabled');
        }
    },
    
    // Initialisation de l'interface utilisateur
    _initNotificationUI: function() {
        console.log('[EnvolNotifications] Initialisation UI...');
        
        // Gestion du sélecteur d'heure
        const timeSelect = document.getElementById('notification-time');
        if (timeSelect) {
            // Récupérer l'heure sauvegardée
            const savedTime = localStorage.getItem('envol_notif_time') || '09:00';
            timeSelect.value = savedTime;
            
            // Sauvegarder quand l'heure change
            timeSelect.addEventListener('change', (e) => {
                const time = e.target.value;
                localStorage.setItem('envol_notif_time', time);
                console.log('[EnvolNotifications] Heure enregistrée:', time);
                this._showToast('✅ Heure de rappel mise à jour: ' + time);
            });
        }
        
        // Bouton "Autoriser notifications"
        const allowBtn = document.getElementById('allow-notifications-btn');
        if (allowBtn) {
            allowBtn.addEventListener('click', () => this._requestPermission());
        }
        
        // Bouton "Notification test"
        const testBtn = document.getElementById('test-notification-android-btn');
        if (testBtn) {
            testBtn.addEventListener('click', () => this._sendTestNotification());
        }
    },
    
    // Demander la permission
    _requestPermission: function() {
        if (window.OneSignal) {
            window.OneSignal.Slidedown.promptPush();
        } else {
            alert('OneSignal n\'est pas encore chargé. Rafraîchissez la page.');
        }
    },
    
    // Envoyer une notification test
    _sendTestNotification: function() {
        console.log('[EnvolNotifications] Envoi notification test...');
        
        // Vérifier les permissions
        if (!('Notification' in window)) {
            this._showToast('❌ Votre navigateur ne supporte pas les notifications');
            return;
        }
        
        if (Notification.permission === 'granted') {
            // Créer une notification locale
            const notification = new Notification('🔔 Test Envol', {
                body: 'Ceci est une notification de test !',
                icon: '/sekhamet-envol/assets/icons/ENVOL-192.png',
                badge: '/sekhamet-envol/assets/icons/ENVOL-192.png'
            });
            
            notification.onclick = () => {
                console.log('[EnvolNotifications] Notification test cliquée');
                window.focus();
            };
            
            this._showToast('✅ Notification test envoyée !');
            
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this._sendTestNotification(); // Réessayer
                }
            });
        } else {
            this._showToast('❌ Les notifications sont bloquées. Autorisez-les dans les paramètres.');
        }
    },
    
    // Afficher un message temporaire
    _showToast: function(message) {
        // Créer un toast simple
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            font-family: sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(toast);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            toast.style.transition = 'opacity 0.3s';
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
};

// Démarrer le module après un court délai
setTimeout(() => {
    EnvolNotifications.init();
}, 2000);
