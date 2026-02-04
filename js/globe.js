// js/globe.js - Plain JavaScript

class Globe {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.globe = null;
        this.markers = [];
        this.currentZoom = 400;
        this.rotation = { x: 0, y: 0 };
        this.autoRotate = true;

        this.init();
    }

    init() {
        console.log('🌍 Initializing Globe...');

        // Camera
        this.camera.position.z = this.currentZoom;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1.2);
        pointLight.position.set(200, 200, 200);
        this.scene.add(pointLight);

        // Create Globe
        this.createGlobe();

        // Stars
        this.createStars();

        // Animate
        this.animate();

        // Resize
        window.addEventListener('resize', () => this.onResize());

        console.log('✅ Globe initialized!');
    }

    createGlobe() {
        const geometry = new THREE.SphereGeometry(100, 64, 64);

        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load(
            'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
            () => console.log('✅ Earth texture loaded')
        );

        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpScale: 0.3,
            specular: new THREE.Color(0x333333),
            shininess: 15
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);

        // Atmosphere
        this.addAtmosphere();
    }

    addAtmosphere() {
        const geometry = new THREE.SphereGeometry(105, 64, 64);
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });

        const atmosphere = new THREE.Mesh(geometry, material);
        this.scene.add(atmosphere);
    }

    createStars() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i < 10000; i++) {
            vertices.push(
                THREE.MathUtils.randFloatSpread(2000),
                THREE.MathUtils.randFloatSpread(2000),
                THREE.MathUtils.randFloatSpread(2000)
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });
        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
    }

    addMarker(lat, lon, name, color = 0x00ffff) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -100 * Math.sin(phi) * Math.cos(theta);
        const y = 100 * Math.cos(phi);
        const z = 100 * Math.sin(phi) * Math.sin(theta);

        // Create marker pin (larger and more visible)
        const geometry = new THREE.SphereGeometry(3, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });
        const marker = new THREE.Mesh(geometry, material);

        marker.position.set(x, y, z);
        marker.userData = { name, lat, lon };

        this.markers.push(marker);
        this.scene.add(marker);

        // Add glow ring around marker
        this.addMarkerGlow(x, y, z, color);

        // Add text label on globe
        this.addMarkerLabel(x, y, z, name);

        // Pulsing animation
        this.animateMarker(marker);

        console.log(`📍 Added marker: ${name} at (${lat}, ${lon})`);
    }

    // NEW: Add glow effect around marker
    addMarkerGlow(x, y, z, color) {
        const glowGeometry = new THREE.RingGeometry(4, 5, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);

        // Orient ring to face outward from globe
        glow.position.set(x * 1.01, y * 1.01, z * 1.01);
        glow.lookAt(0, 0, 0);

        this.scene.add(glow);
    }

    // UPDATED: Better text labels
    addMarkerLabel(x, y, z, text) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;

        // Draw background
        context.fillStyle = 'rgba(0, 20, 40, 0.8)';
        context.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 15);
        context.fill();

        // Draw border
        context.strokeStyle = '#00FFFF';
        context.lineWidth = 4;
        context.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 15);
        context.stroke();

        // Draw text
        context.fillStyle = '#00FFFF';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        // Create sprite
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });
        const sprite = new THREE.Sprite(material);

        // Position label above marker
        sprite.position.set(x * 1.2, y * 1.2, z * 1.2);
        sprite.scale.set(30, 7.5, 1);

        this.scene.add(sprite);
    }

    animateMarker(marker) {
        let scale = 1;
        let growing = true;

        const animate = () => {
            if (growing) {
                scale += 0.02;
                if (scale >= 1.5) growing = false;
            } else {
                scale -= 0.02;
                if (scale <= 1) growing = true;
            }
            marker.scale.set(scale, scale, scale);
            requestAnimationFrame(animate);
        };
        animate();
    }

    rotateGlobe(deltaX, deltaY) {
        this.autoRotate = false; // Stop auto rotation immediately

        // More responsive rotation
        this.rotation.y += deltaX * 0.002; // Smooth horizontal rotation
        this.rotation.x += deltaY * 0.002; // Smooth vertical rotation

        // Limit vertical rotation (prevent flipping)
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

        // Apply rotation immediately (no easing delay)
        this.globe.rotation.y = this.rotation.y;
        this.globe.rotation.x = this.rotation.x;

        // Reset auto-rotation timer
        clearTimeout(this.autoRotateTimer);
        this.autoRotateTimer = setTimeout(() => {
            this.autoRotate = true;
            console.log('🔄 Auto-rotation resumed');
        }, 5000);

        // Debug
        console.log(`🌍 Globe rotation: X=${this.rotation.x.toFixed(2)}, Y=${this.rotation.y.toFixed(2)}`);
    }

    zoomIn() {
        this.currentZoom = Math.max(100, this.currentZoom - 15); // Increased speed
        console.log('🔍 Zoom Level:', this.currentZoom);
    }

    zoomOut() {
        this.currentZoom = Math.min(600, this.currentZoom + 15); // Increased speed
        console.log('🔍 Zoom Level:', this.currentZoom);
    }

    flyTo(lat, lon, zoom = 200) {
        this.autoRotate = false;
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const targetRotY = -theta;
        const targetRotX = phi - Math.PI / 2;

        this.animateCamera(targetRotX, targetRotY, zoom);

        console.log(`🚀 Flying to: ${lat}, ${lon} at zoom ${zoom}`);
    }

    // NEW: Street-level exploration
    exploreStreetLevel(lat, lon) {
        console.log('🏙️ Entering Street Level View:', lat, lon);

        // Zoom to maximum street level
        this.autoRotate = false;

        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const targetRotY = -theta;
        const targetRotX = phi - Math.PI / 2;

        // Very close zoom for street view
        const streetZoom = 120;

        this.animateCamera(targetRotX, targetRotY, streetZoom);

        // Add camera tilt for better perspective
        setTimeout(() => {
            this.addCameraTilt(0.3);
        }, 1000);

        // Show street overlay if needed
        this.showStreetOverlay(lat, lon);
    }

    // NEW: Add camera tilt
    addCameraTilt(tiltAmount) {
        this.rotation.x += tiltAmount;
        this.globe.rotation.x = this.rotation.x;
    }

    // NEW: Show street overlay/details
    showStreetOverlay(lat, lon) {
        // This can show actual street view or map overlay
        console.log('📍 Loading street details for:', lat, lon);

        // Option: Open Google Street View in iframe
        const streetViewUrl = `https://www.google.com/maps/@${lat},${lon},3a,75y,0h,90t/data=!3m7!1e1`;

        // Show notification
        const notification = document.createElement('div');
        notification.id = 'street-notification';
        notification.innerHTML = `
        <div style="
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 20, 40, 0.95);
            border: 2px solid #0ff;
            border-radius: 15px;
            padding: 20px 30px;
            z-index: 300;
            backdrop-filter: blur(15px);
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
            animation: slideUp 0.5s ease;
        ">
            <p style="color: #0ff; font-size: 16px; margin-bottom: 10px;">
                🏙️ Street-Level View Active
            </p>
            <p style="color: #888; font-size: 12px; margin-bottom: 15px;">
                Viewing: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°
            </p>
            <a href="${streetViewUrl}" target="_blank" style="
                display: inline-block;
                padding: 10px 20px;
                background: linear-gradient(45deg, #0ff, #0af);
                color: #000;
                text-decoration: none;
                border-radius: 20px;
                font-weight: bold;
                box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
            ">
                🗺️ Open Google Street View
            </a>
            <button onclick="this.parentElement.remove()" style="
                margin-left: 10px;
                padding: 10px 20px;
                background: rgba(255, 0, 0, 0.8);
                color: white;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                font-weight: bold;
            ">
                ✖️ Close
            </button>
        </div>
    `;

        // Remove old notification if exists
        const oldNotif = document.getElementById('street-notification');
        if (oldNotif) oldNotif.remove();

        document.body.appendChild(notification);

        // Auto remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 500);
            }
        }, 10000);
    }

    animateCamera(targetX, targetY, targetZoom) {
        const duration = 2000;
        const startTime = Date.now();
        const startRotX = this.rotation.x;
        const startRotY = this.rotation.y;
        const startZoom = this.currentZoom;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            this.rotation.x = startRotX + (targetX - startRotX) * eased;
            this.rotation.y = startRotY + (targetY - startRotY) * eased;
            this.currentZoom = startZoom + (targetZoom - startZoom) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    resetView() {
        this.autoRotate = true;
        this.animateCamera(0, 0, 400);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Auto-rotation
        if (this.autoRotate) {
            this.rotation.y += 0.001;
        }

        // Apply rotations
        this.globe.rotation.y = this.rotation.y;
        this.globe.rotation.x = this.rotation.x;

        // Apply zoom
        this.camera.position.z = this.currentZoom;

        // Check zoom level for map overlay
        this.updateMapOverlay();

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // NEW: Show map overlay when zoomed in close
    updateMapOverlay() {
        const zoomLevel = this.currentZoom;

        // When zoom < 150 (very close), show street overlay
        if (zoomLevel < 150) {
            this.showMapDetails();
        } else {
            this.hideMapDetails();
        }
    }

    showMapDetails() {
        // Check if overlay already exists
        let overlay = document.getElementById('map-overlay');
        
        if (overlay) {
            // Update existing map position
            this.updateExistingMap();
            return;
        }
        
        // Create new overlay
        overlay = document.createElement('div');
        overlay.id = 'map-overlay';
        overlay.style.cssText = `
            position: fixed;
            bottom: 120px;
            right: 420px;
            width: 380px;
            height: 380px;
            border: 3px solid #0ff;
            border-radius: 15px;
            overflow: hidden;
            z-index: 500;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
            background: #1a1a1a;
        `;
        
        const center = this.getCurrentCenter();
        
        // Create inner HTML
        overlay.innerHTML = `
            <div id="mini-map" style="width: 100%; height: 100%; position: relative;"></div>
            
            <div style="
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(0, 255, 255, 0.95);
                color: #000;
                padding: 8px 15px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: bold;
                z-index: 1000;
                pointer-events: none;
            ">
                📍 Street View
            </div>
            
            <div style="
                position: absolute;
                bottom: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #0ff;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 11px;
                z-index: 1000;
                pointer-events: none;
            ">
                ${center.lat.toFixed(4)}°, ${center.lng.toFixed(4)}°
            </div>
            
            <button id="close-map-overlay" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255, 0, 0, 0.95);
                border: 2px solid #ff0000;
                color: white;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                cursor: pointer;
                font-weight: bold;
                font-size: 20px;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                line-height: 1;
            ">×</button>
        `;
        
        document.body.appendChild(overlay);
        
        // Initialize Leaflet Map after DOM is ready
        setTimeout(() => {
            try {
                // Check if L (Leaflet) is available
                if (typeof L === 'undefined') {
                    console.error('❌ Leaflet not loaded');
                    overlay.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff0000; padding: 20px; text-align: center;">
                            ⚠️ Map library not loaded. Please refresh the page.
                        </div>
                    `;
                    return;
                }
                
                // Remove any existing map instance
                const mapContainer = document.getElementById('mini-map');
                mapContainer._leaflet_id = null;
                
                // Create new map
                this.miniMapInstance = L.map('mini-map', {
                    center: [center.lat, center.lng],
                    zoom: 16,
                    zoomControl: true,
                    attributionControl: false
                });
                
                // Add tile layer - OpenStreetMap
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(this.miniMapInstance);
                
                // Add marker at center
                const marker = L.marker([center.lat, center.lng], {
                    icon: L.divIcon({
                        className: 'custom-map-marker',
                        html: '<div style="background: #0ff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px #0ff;"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(this.miniMapInstance);
                
                marker.bindPopup(`<b>📍 Current Location</b><br>${center.lat.toFixed(4)}°, ${center.lng.toFixed(4)}°`).openPopup();
                
                console.log('✅ Map initialized at:', center.lat, center.lng);
                
                // Force map to resize
                setTimeout(() => {
                    this.miniMapInstance.invalidateSize();
                }, 100);
                
            } catch (error) {
                console.error('❌ Map initialization error:', error);
            }
        }, 200);
        
        // Add close button event listener
        setTimeout(() => {
            const closeBtn = document.getElementById('close-map-overlay');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.closeMapOverlay();
                });
                
                closeBtn.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.1) rotate(90deg)';
                    this.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.8)';
                });
                
                closeBtn.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1) rotate(0deg)';
                    this.style.boxShadow = 'none';
                });
                
                console.log('✅ Close button attached');
            }
        }, 300);
    }
    
    // NEW: Close map overlay function
    closeMapOverlay() {
        const overlay = document.getElementById('map-overlay');
        if (overlay) {
            // Destroy map instance
            if (this.miniMapInstance) {
                this.miniMapInstance.remove();
                this.miniMapInstance = null;
            }
            
            // Remove overlay with animation
            overlay.style.opacity = '0';
            overlay.style.transform = 'scale(0.8)';
            overlay.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                overlay.remove();
                console.log('✅ Map overlay closed');
            }, 300);
        }
    }
    
    // Update existing map when globe rotates
    updateExistingMap() {
        if (this.miniMapInstance) {
            const center = this.getCurrentCenter();
            this.miniMapInstance.setView([center.lat, center.lng], this.miniMapInstance.getZoom());
            
            // Update coordinate display
            const coordDisplay = document.querySelector('#map-overlay div:nth-child(3)');
            if (coordDisplay) {
                coordDisplay.textContent = `${center.lat.toFixed(4)}°, ${center.lng.toFixed(4)}°`;
            }
        }
    }

    hideMapDetails() {
        const overlay = document.getElementById('map-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    getCurrentCenter() {
        // Convert rotation to lat/lng
        let lat = -(this.rotation.x * 180 / Math.PI);
        let lng = -(this.rotation.y * 180 / Math.PI);
        
        // Normalize longitude to -180 to 180
        lng = ((lng + 180) % 360) - 180;
        
        // Clamp latitude to -90 to 90
        lat = Math.max(-85, Math.min(85, lat));
        
        return { lat, lng };
    }
}