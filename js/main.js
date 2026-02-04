// js/main.js - Main App

let globe;
let gestureController;
let currentLocation = null;

window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting GestureEarth...');

    setTimeout(() => {
        initializeApp();
    }, 500);
});

function initializeApp() {
    // Hide loading
    document.getElementById('loading').style.display = 'none';

    // Initialize Globe
    const container = document.getElementById('globe-container');
    globe = new Globe(container);

    // Add markers
    destinations.forEach(dest => {
        globe.addMarker(dest.lat, dest.lng, dest.name, 0x00ffff);
    });

    // Initialize Gestures
    const video = document.getElementById('webcam');
    gestureController = new GestureController(video, handleGesture);

    // Populate destinations
    populateDestinations();

    // Event listeners
    setupEventListeners();

    console.log('✅ App initialized!');
}

function handleGesture(gesture) {
    const statusEl = document.getElementById('gesture-status');

    switch (gesture.type) {
        case 'fist':
            statusEl.textContent = '✊ Make Fist & Move to Rotate';
            statusEl.style.color = '#FF6B6B';
            break;

        case 'drag':
            globe.rotateGlobe(gesture.deltaX, gesture.deltaY);

            // Show rotation indicator
            const indicator = document.getElementById('rotation-indicator');
            if (indicator) {
                indicator.classList.remove('hidden');

                // Rotate arrow based on movement direction
                const arrow = document.getElementById('compass-arrow');
                if (arrow) {
                    const angle = Math.atan2(gesture.deltaX, -gesture.deltaY) * (180 / Math.PI);
                    arrow.style.transform = `rotate(${angle}deg)`;
                }

                // Hide indicator after 500ms of no movement
                clearTimeout(this.indicatorTimeout);
                this.indicatorTimeout = setTimeout(() => {
                    indicator.classList.add('hidden');
                }, 500);
            }

            const direction = Math.abs(gesture.deltaX) > Math.abs(gesture.deltaY)
                ? (gesture.deltaX > 0 ? '→' : '←')
                : (gesture.deltaY > 0 ? '↓' : '↑');

            statusEl.textContent = `✊ Rotating ${direction} (${gesture.hand})`;
            statusEl.style.color = gesture.hand === 'Right' ? '#00FF00' : '#00FFFF';
            break;

        case 'pinch':
            globe.zoomIn();
            statusEl.textContent = '🤏 Zooming In';
            statusEl.style.color = '#4ECDC4';

            // Haptic-like feedback
            statusEl.style.transform = 'scale(1.05)';
            setTimeout(() => {
                statusEl.style.transform = 'scale(1)';
            }, 100);
            break;

        case 'palm':
            globe.zoomOut();
            statusEl.textContent = '🖐️ Zooming Out';
            statusEl.style.color = '#95E1D3';
            break;

        case 'point':
            statusEl.textContent = '👆 Point at Location to Select';
            statusEl.style.color = '#FFE66D';
            selectLocationByPoint(gesture);
            break;

        case 'thumbsup':
            if (currentLocation) {
                globe.flyTo(currentLocation.lat, currentLocation.lng, 180);
                statusEl.textContent = `👍 Flying to ${currentLocation.name}`;
                statusEl.style.color = '#00FF00';
            } else {
                statusEl.textContent = '👍 No location selected';
                statusEl.style.color = '#FFA500';
            }
            break;

        case 'peace':
            globe.resetView();
            statusEl.textContent = '✌️ Reset View';
            statusEl.style.color = '#A8E6CF';
            break;

        case 'both_pinch_close':
            globe.zoomIn();
            globe.zoomIn();
            statusEl.textContent = '🤏🤏 BOTH HANDS - Fast Zoom In!';
            statusEl.style.color = '#00FF00';
            statusEl.style.fontSize = '18px';
            setTimeout(() => {
                statusEl.style.fontSize = '16px';
            }, 200);
            break;

        case 'both_pinch_open':
            globe.zoomOut();
            globe.zoomOut();
            statusEl.textContent = '🖐️🖐️ BOTH HANDS - Fast Zoom Out!';
            statusEl.style.color = '#00FFFF';
            break;

        case 'both_open':
            globe.resetView();
            statusEl.textContent = '🖐️🖐️ BOTH HANDS - Resetting Globe!';
            statusEl.style.color = '#FF6B6B';
            setTimeout(() => {
                statusEl.textContent = '👋 Ready for gestures...';
                statusEl.style.color = '#0f0';
            }, 2000);
            break;

        case 'none':
            // Don't update status too frequently
            if (statusEl.textContent.includes('Waiting') ||
                statusEl.textContent.includes('Ready')) {
                return;
            }
            setTimeout(() => {
                statusEl.textContent = '👋 Ready for gestures...';
                statusEl.style.color = '#0f0';
            }, 1000);
            break;

        default:
            statusEl.textContent = '❓ Unknown gesture';
            statusEl.style.color = '#888';
    }
}

function populateDestinations() {
    const listEl = document.getElementById('destinations-list');

    destinations.forEach(dest => {
        const item = document.createElement('div');
        item.className = 'destination-item';
        item.innerHTML = `
            <h4>${dest.name}</h4>
            <p>${dest.country} • ${dest.category}</p>
        `;

        // Click handler with visual feedback
        item.addEventListener('click', () => {
            currentLocation = dest;

            // Highlight selected
            document.querySelectorAll('.destination-item').forEach(i => {
                i.style.background = 'rgba(0, 255, 255, 0.1)';
            });
            item.style.background = 'rgba(0, 255, 255, 0.3)';

            // Fly to location
            globe.flyTo(dest.lat, dest.lng, 180);
            showLocationInfo(dest);

            // Update status
            const statusEl = document.getElementById('gesture-status');
            statusEl.textContent = `🗺️ Flying to ${dest.name}`;
            statusEl.style.color = '#FFD700';
        });

        listEl.appendChild(item);
    });
}

function showLocationInfo(location) {
    const panel = document.getElementById('location-panel');
    document.getElementById('loc-name').textContent = location.name;
    document.getElementById('loc-description').textContent = location.description;
    document.getElementById('loc-image').src = location.image;
    document.getElementById('location-info').textContent = location.name;

    panel.classList.remove('hidden');
}

function setupEventListeners() {
    // ===== GESTURE GUIDE TOGGLE WITH AUTO HIDE/SHOW SPEED CONTROL =====
    const toggleGuideBtn = document.getElementById('toggle-guide-btn');
    const gestureList = document.getElementById('gesture-list');
    const speedControl = document.getElementById('sensitivity-control');
    
    if (toggleGuideBtn && gestureList && speedControl) {
        // Initially: Gesture Guide OPEN, Speed Control HIDDEN
        speedControl.classList.remove('visible');
        
        toggleGuideBtn.addEventListener('click', function() {
            if (gestureList.style.display === 'none') {
                // Show gesture list
                gestureList.style.display = 'flex';
                this.textContent = '−';
                
                // Hide speed control
                speedControl.classList.remove('visible');
                
                console.log('✅ Gesture Guide OPENED - Speed Control HIDDEN');
            } else {
                // Hide gesture list
                gestureList.style.display = 'none';
                this.textContent = '+';
                
                // Show speed control
                speedControl.classList.add('visible');
                
                console.log('✅ Gesture Guide CLOSED - Speed Control VISIBLE');
            }
        });
    }

    // ===== SPEED CONTROL BUTTONS =====
    document.querySelectorAll('.sensitivity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all
            document.querySelectorAll('.sensitivity-btn').forEach(b =>
                b.classList.remove('active')
            );
            this.classList.add('active');

            const speed = this.dataset.speed;

            // Update gesture controller settings
            if (gestureController) {
                switch(speed) {
                    case 'slow':
                        gestureController.GESTURE_HOLD_TIME = 1000;
                        gestureController.GESTURE_COOLDOWN = 700;
                        gestureController.CONFIDENCE_THRESHOLD = 4;
                        break;
                    case 'normal':
                        gestureController.GESTURE_HOLD_TIME = 600;
                        gestureController.GESTURE_COOLDOWN = 400;
                        gestureController.CONFIDENCE_THRESHOLD = 2;
                        break;
                    case 'fast':
                        gestureController.GESTURE_HOLD_TIME = 300;
                        gestureController.GESTURE_COOLDOWN = 200;
                        gestureController.CONFIDENCE_THRESHOLD = 1;
                        break;
                }
            }

            // Visual feedback
            const statusEl = document.getElementById('gesture-status');
            statusEl.textContent = `⚙️ Speed: ${speed.toUpperCase()}`;
            statusEl.style.color = '#FFD700';

            setTimeout(() => {
                statusEl.textContent = '👋 Ready for gestures...';
                statusEl.style.color = '#0f0';
            }, 2000);
        });
    });

    // ===== EXPLORE BUTTON =====
    const exploreBtn = document.getElementById('explore-btn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            if (currentLocation) {
                globe.flyTo(currentLocation.lat, currentLocation.lng, 150);
            }
        });
    }

    // ===== CLOSE LOCATION PANEL =====
    const closeBtn = document.getElementById('close-location-panel');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('location-panel').classList.add('hidden');

            // Visual feedback
            const statusEl = document.getElementById('gesture-status');
            statusEl.textContent = '✖️ Panel Closed';
            statusEl.style.color = '#FF6B6B';

            setTimeout(() => {
                statusEl.textContent = '👋 Ready for gestures...';
                statusEl.style.color = '#0f0';
            }, 1500);
        });
    }

    // ===== DEBUG PANEL TOGGLE (Press 'D' key) =====
    document.addEventListener('keypress', (e) => {
        if (e.key === 'd' || e.key === 'D') {
            const debugPanel = document.getElementById('debug-panel');
            if (debugPanel) {
                debugPanel.classList.toggle('show');
            }
        }
    });

    // ===== KEYBOARD SHORTCUTS =====
    document.addEventListener('keypress', (e) => {
        switch(e.key) {
            case 'r':
            case 'R':
                // Reset view
                globe.resetView();
                break;
            case '1':
                // Go to first destination
                if (destinations.length > 0) {
                    globe.flyTo(destinations[0].lat, destinations[0].lng, 180);
                }
                break;
            case '2':
                // Go to second destination
                if (destinations.length > 1) {
                    globe.flyTo(destinations[1].lat, destinations[1].lng, 180);
                }
                break;
            case '3':
                // Go to third destination
                if (destinations.length > 2) {
                    globe.flyTo(destinations[2].lat, destinations[2].lng, 180);
                }
                break;
        }
    });
}

// ===== SELECT LOCATION BY POINTING =====
function selectLocationByPoint(gesture) {
    if (!gesture.ray) return;

    // Convert screen position to world position (simplified)
    const screenX = gesture.tipPosition.x;
    const screenY = gesture.tipPosition.y;

    // Find nearest marker (simple distance check)
    let nearestDest = null;
    let minDist = Infinity;

    destinations.forEach(dest => {
        // Project globe coordinates to screen space (simplified)
        const phi = (90 - dest.lat) * (Math.PI / 180);
        const theta = (dest.lng + 180) * (Math.PI / 180);

        // Simple 2D distance check
        const projX = 0.5 + Math.sin(theta) * Math.cos(phi) * 0.3;
        const projY = 0.5 - Math.sin(phi) * 0.3;

        const dist = Math.sqrt(
            Math.pow(screenX - projX, 2) +
            Math.pow(screenY - projY, 2)
        );

        if (dist < minDist && dist < 0.15) {
            minDist = dist;
            nearestDest = dest;
        }
    });

    if (nearestDest) {
        currentLocation = nearestDest;
        globe.flyTo(nearestDest.lat, nearestDest.lng, 200);
        showLocationInfo(nearestDest);

        // Visual feedback
        const statusEl = document.getElementById('gesture-status');
        statusEl.textContent = `👆 Selected: ${nearestDest.name}`;
        statusEl.style.color = '#FFD700';

        setTimeout(() => {
            statusEl.style.color = '#0f0';
        }, 2000);
    }
}

// ===== UPDATE DEBUG INFO =====
function updateDebugInfo(gesture) {
    const debugGesture = document.getElementById('debug-gesture');
    const debugZoom = document.getElementById('debug-zoom');
    const debugRotation = document.getElementById('debug-rotation');
    
    if (debugGesture && globe) {
        debugGesture.textContent = gesture.type;
    }
    if (debugZoom && globe) {
        debugZoom.textContent = Math.round(globe.currentZoom);
    }
    if (debugRotation && globe) {
        debugRotation.textContent = `${globe.rotation.x.toFixed(2)}, ${globe.rotation.y.toFixed(2)}`;
    }
}