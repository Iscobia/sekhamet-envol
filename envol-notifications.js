// ================================================
// envol-notifications.js - VERSION CORRIGÉE
// Utilise les noms EXACTS de vos variables
// ================================================

(function() {
    'use strict';
    
    console.log('[Envol] Chargement du module notifications...');
    
    // Attendre que tout soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnvolNotifications);
    } else {
        setTimeout(initEnvolNotifications, 1000);
    }
    
    function initEnvolNotifications() {
        console.log('[Envol] Initialisation avec vos variables exactes');
        
        // VÉRIFICATION des éléments critiques
        const criticalElements = [
            'notification-time',    // VOTRE sélecteur d'heure
            'current-day',         // VOTRE jour du défi
            'challenge-title',     // VOTRE titre
            'challenge-description' // VOTRE description
        ];
        
        for (const id of criticalElements) {
            if (!document.getElementById(id)) {
                console.error(`[Envol] ❌ Élément #${id} non trouvé !`);
                return;
            }
        }
        
        console.log('[Envol] ✅ Tous les éléments trouvés');
        
        // Initialiser OneSignal
        setupOneSignal();
        
        // Configurer l'interface utilisateur
        setupNotificationUI();
    }
    
    // ==================== DONNÉES SPÉCIFIQUES À VOTRE APP ====================
    
    function getCurrentUserData() {
        // Récupère les données EXACTES de VOTRE application
        
        // 1. Jour actuel (utilise VOTRE id="current-day")
        const currentDayElement = document.getElementById('current-day');
        const currentDay = currentDayElement ? parseInt(currentDayElement.textContent) || 1 : 1;
        
        // 2. Jour dans la progression (utilise VOTRE id="day-current")
        const dayCurrentElement = document.getElementById('day-current');
        const dayInProgress = dayCurrentElement ? parseInt(dayCurrentElement.textContent) || 1 : 1;
        
        // 3. Titre du défi (utilise VOTRE id="challenge-title")
        const titleElement = document.getElementById('challenge-title');
        const challengeTitle = titleElement ? titleElement.textContent.trim() : 'Défi Envol';
        
        // 4. Description du défi (utilise VOTRE id="challenge-description")
        const descElement = document.getElementById('challenge-description');
        const challengeDescription = descElement ? descElement.textContent.trim() : 'Nouveau défi disponible';
        
        // 5. Heure de notification (utilise VOTRE id="notification-time")
        const timeSelect = document.getElementById('notification-time');
        const notificationTime = timeSelect ? timeSelect.value : '09:00';
        
        return {
            // Pour les notifications : "Jour X - Titre"
            currentDay: currentDay,
            dayInProgress: dayInProgress,
            
            // Pour le contenu des notifications
            challengeTitle: challengeTitle,
            challengeDescription: truncateText(challengeDescription, 100),
            
            // Pour la programmation
            notificationTime: notificationTime,
            
            // Timestamp
            lastUpdated: new Date().toISOString()
        };
    }
    
    function truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // ==================== ONESIGNAL ====================
    
    function setupOneSignal() {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        
        window.OneSignalDeferred.push(async function(OneSignal) {
            try {
                console.log('[Envol] Configuration OneSignal avec vos données...');
                
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
                
                console.log('[Envol] ✅ OneSignal configuré');
                
                // Récupérer l'ID utilisateur
                const userId = await OneSignal.getUserId();
                if (userId) {
                    console.log('[Envol] ID utilisateur OneSignal:', userId);
                    localStorage.setItem('envol_user_id', userId);
                    
                    // Sauvegarder les données ACTUELLES dans OneSignal
                    saveUserDataToOneSignal();
                }
                
                // Vérifier l'abonnement
                const isSubscribed = await OneSignal.User.PushSubscription.optIn;
                updateUIState(isSubscribed);
                
                // Écouter les changements
                OneSignal.User.PushSubscription.addEventListener("change", (isSubscribed) => {
                    console.log('[Envol] Abonnement changé:', isSubscribed);
                    updateUIState(isSubscribed);
                    
                    if (isSubscribed) {
                        showEnvolMessage('🔔 Notifications activées !', 'success');
                        // Resauvegarder les données
                        saveUserDataToOneSignal();
                    }
                });
                
            } catch (error) {
                console.error('[Envol] Erreur OneSignal:', error);
            }
        });
    }
    
    function saveUserDataToOneSignal() {
        if (!window.OneSignal) return;
        
        const userData = getCurrentUserData();
        
        // Sauvegarder comme TAGS dans OneSignal
        window.OneSignal.User.addTags({
            // Jour actuel du défi (VOTRE variable)
            'jour_defi': userData.currentDay,
            
            // Progression générale (VOTRE variable day-current)
            'progression': userData.dayInProgress,
            
            // Titre du défi actuel
            'defi_titre': userData.challengeTitle.substring(0, 30),
            
            // Heure de notification choisie (VOTRE variable)
            'heure_notification': userData.notificationTime,
            
            // Date de mise à jour
            'derniere_maj': new Date().toISOString().split('T')[0]
        }).then(() => {
            console.log('[Envol] Données sauvegardées dans OneSignal:', {
                jour: userData.currentDay,
                heure: userData.notificationTime
            });
        });
    }
    
    // ==================== INTERFACE UTILISATEUR ====================
    
    function setupNotificationUI() {
        console.log('[Envol] Configuration UI avec vos boutons...');
        
        // 1. Gestion du sélecteur d'heure (VOTRE notification-time)
        const timeSelect = document.getElementById('notification-time');
        if (timeSelect) {
            // Restaurer l'heure sauvegardée
            const savedTime = localStorage.getItem('envol_heure_notification') || '09:00';
            timeSelect.value = savedTime;
            
            // Sauvegarder quand l'utilisateur change
            timeSelect.addEventListener('change', function() {
                const selectedTime = this.value;
                console.log('[Envol] Heure modifiée:', selectedTime);
                
                // Sauvegarder localement
                localStorage.setItem('envol_heure_notification', selectedTime);
                
                // Sauvegarder dans OneSignal
                if (window.OneSignal) {
                    window.OneSignal.User.addTags({
                        'heure_notification': selectedTime
                    });
                }
                
                // Feedback utilisateur
                showEnvolMessage(`⏰ Rappel programmé à ${selectedTime}`, 'info');
                
                // Ici, plus tard, on programmera la notification via un backend
                scheduleDailyNotification(selectedTime);
            });
        }
        
        // 2. Bouton "Autoriser les notifications" (VOTRE bouton)
        const allowBtn = document.getElementById('allow-notifications-btn');
        if (allowBtn) {
            allowBtn.addEventListener('click', function() {
                console.log('[Envol] Clic sur "Autoriser notifications"');
                requestNotificationPermission();
            });
        }
        
        // 3. Bouton "Envoyer une notif' test" (VOTRE bouton)
        const testBtn = document.getElementById('test-notification-android-btn');
        if (testBtn) {
            testBtn.addEventListener('click', function() {
                console.log('[Envol] Clic sur "Notification test"');
                sendTestNotificationWithUserData();
            });
        }
        
        // Ajouter les styles
        addEnvolNotificationStyles();
    }
    
    function updateUIState(isEnabled) {
        const section = document.querySelector('.notifications-settings');
        const timeSelect = document.getElementById('notification-time');
        
        if (!section || !timeSelect) return;
        
        if (isEnabled) {
            // Activé
            timeSelect.disabled = false;
            timeSelect.style.opacity = '1';
            section.classList.add('envol-active');
            section.classList.remove('envol-inactive');
        } else {
            // Désactivé
            timeSelect.disabled = true;
            timeSelect.style.opacity = '0.6';
            section.classList.add('envol-inactive');
            section.classList.remove('envol-active');
        }
    }
    
    // ==================== NOTIFICATION TEST AVEC VOS DONNÉES ====================
    
    function sendTestNotificationWithUserData() {
        console.log('[Envol] Création notification test avec VOS données...');
        
        // Récupérer les données ACTUELLES de VOTRE application
        const userData = getCurrentUserData();
        
        // Format du titre: "Jour X - Titre du défi"
        const notificationTitle = `Jour ${userData.currentDay} - ${userData.challengeTitle}`;
        const notificationBody = userData.challengeDescription;
        
        console.log('[Envol] Données de notification:', {
            titre: notificationTitle,
            description: notificationBody,
            heure: userData.notificationTime
        });
        
        // Vérifier les permissions
        if (!('Notification' in window)) {
            showEnvolMessage('Navigateur incompatible avec les notifications', 'error');
            return;
        }
        
        if (Notification.permission === 'granted') {
            // Créer la notification avec VOS données
            const notification = new Notification(notificationTitle, {
                body: notificationBody,
                icon: '/sekhamet-envol/assets/icons/ENVOL-192.png',
                badge: '/sekhamet-envol/assets/icons/ENVOL-192.png',
                tag: 'envol-test-' + Date.now(),
                // Données additionnelles
                data: {
                    day: userData.currentDay,
                    title: userData.challengeTitle,
                    type: 'test'
                }
            });
            
            // Quand on clique sur la notification
            notification.onclick = function() {
                console.log('[Envol] Notification test cliquée - Jour', userData.currentDay);
                window.focus();
                this.close();
            };
            
            showEnvolMessage(`✅ Test envoyé: "${notificationTitle}"`, 'success');
            
        } else if (Notification.permission === 'default') {
            // Demander la permission
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    sendTestNotificationWithUserData(); // Réessayer
                } else {
                    showEnvolMessage('Permissions refusées', 'warning');
                }
            });
        } else {
            showEnvolMessage('❌ Notifications bloquées. Autorisez-les dans les paramètres.', 'error');
        }
    }
    
    // ==================== FONCTIONS AUXILIAIRES ====================
    
    function requestNotificationPermission() {
        if (window.OneSignal) {
            window.OneSignal.Slidedown.promptPush();
        } else {
            showEnvolMessage('OneSignal se charge, veuillez patienter...', 'info');
            setTimeout(requestNotificationPermission, 1000);
        }
    }
    
    function scheduleDailyNotification(time) {
        // Cette fonction sera complétée plus tard avec un backend
        console.log(`[Envol] À programmer: notification quotidienne à ${time}`);
        
        // Pour l'instant, sauvegarder juste la préférence
        const schedule = {
            time: time,
            data: getCurrentUserData(),
            scheduledAt: new Date().toISOString()
        };
        
        localStorage.setItem('envol_notification_schedule', JSON.stringify(schedule));
        
        console.log('[Envol] Préférence sauvegardée:', schedule);
    }
    
    function showEnvolMessage(text, type = 'info') {
        // Créer un message temporaire
        const message = document.createElement('div');
        message.className = `envol-message envol-${type}`;
        message.textContent = text;
        
        // Styles
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${getMessageColor(type)};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: envolMessageIn 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(message);
        
        // Ajouter l'animation si pas déjà présente
        if (!document.getElementById('envol-animations')) {
            const style = document.createElement('style');
            style.id = 'envol-animations';
            style.textContent = `
                @keyframes envolMessageIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes envolMessageOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Supprimer après 4 secondes
        setTimeout(() => {
            message.style.animation = 'envolMessageOut 0.3s ease';
            setTimeout(() => {
                if (message.parentNode) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 4000);
    }
    
    function getMessageColor(type) {
        switch(type) {
            case 'success': return '#4CAF50'; // Vert
            case 'error': return '#f44336';   // Rouge
            case 'warning': return '#FF9800'; // Orange
            case 'info': 
            default: return '#2196F3';        // Bleu
        }
    }
    
    function addEnvolNotificationStyles() {
        if (document.getElementById('envol-notification-css')) return;
        
        const style = document.createElement('style');
        style.id = 'envol-notification-css';
        style.textContent = `
            /* Styles pour les notifications Envol */
            .notifications-settings.envol-active {
                background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
                border: 2px solid #2196F3;
                border-radius: 10px;
                padding: 16px;
                margin: 15px 0;
                transition: all 0.3s ease;
            }
            
            .notifications-settings.envol-inactive {
                background: linear-gradient(135deg, rgba(158, 158, 158, 0.1) 0%, rgba(158, 158, 158, 0.05) 100%);
                border: 2px solid #9E9E9E;
                border-radius: 10px;
                padding: 16px;
                margin: 15px 0;
                opacity: 0.7;
                transition: all 0.3s ease;
            }
            
            .notifications-settings.envol-inactive select {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .notifications-settings.envol-active h3 {
                color: #2196F3;
            }
            
            .notifications-settings.envol-inactive h3 {
                color: #9E9E9E;
            }
            
            /* Amélioration du sélecteur d'heure */
            .time-selector {
                display: flex;
                align-items: center;
                gap: 12px;
                margin: 18px 0;
                flex-wrap: wrap;
            }
            
            .time-selector label {
                font-weight: 600;
                color: #333;
                font-size: 15px;
            }
            
            #notification-time {
                padding: 10px 15px;
                border: 2px solid #2196F3;
                border-radius: 8px;
                background: white;
                font-size: 15px;
                min-width: 110px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            #notification-time:hover {
                border-color: #1976D2;
                box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
            }
            
            #notification-time:focus {
                outline: none;
                border-color: #1976D2;
                box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
            }
            
            #notification-time:disabled {
                border-color: #BDBDBD;
                background-color: #F5F5F5;
                color: #757575;
                cursor: not-allowed;
                box-shadow: none;
            }
        `;
        
        document.head.appendChild(style);
    }
    
})();
