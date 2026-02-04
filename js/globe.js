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
        this.currentZoom = Math.max(150, this.currentZoom - 10);
    }

    zoomOut() {
        this.currentZoom = Math.min(600, this.currentZoom + 10);
    }

    flyTo(lat, lon, zoom = 200) {
        this.autoRotate = false;
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const targetRotY = -theta;
        const targetRotX = phi - Math.PI / 2;

        this.animateCamera(targetRotX, targetRotY, zoom);
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

        if (this.autoRotate) {
            this.rotation.y += 0.001;
        }

        this.globe.rotation.y = this.rotation.y;
        this.globe.rotation.x = this.rotation.x;
        this.camera.position.z = this.currentZoom;

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}