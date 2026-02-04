// js/gestures.js - Plain JavaScript (CORRECTED)

class GestureController {
    constructor(videoElement, onGestureCallback) {
        this.video = videoElement;
        this.onGestureCallback = onGestureCallback;
        this.hands = null;
        this.camera = null;
        this.previousLandmarks = {};
        this.currentGesture = 'none';
        this.gestureStartTime = Date.now();

        // SLOWER DETECTION SETTINGS
        this.GESTURE_HOLD_TIME = 800; // Increased from 300ms to 800ms
        this.lastGestureTime = 0;
        this.GESTURE_COOLDOWN = 500; // 500ms cooldown between gestures
        this.gestureConfidence = 0;
        this.CONFIDENCE_THRESHOLD = 3; // Need 3 consecutive detections

        this.init();
    }

    async init() {
        console.log('📷 Initializing camera and gestures...');

        try {
            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
            });

            this.hands.onResults((results) => this.processResults(results));

            // Start Camera
            this.camera = new Camera(this.video, {
                onFrame: async () => {
                    await this.hands.send({ image: this.video });
                },
                width: 640,
                height: 480
            });

            await this.camera.start();
            console.log('✅ Camera started!');

        } catch (error) {
            console.error('❌ Camera error:', error);
            alert('Camera access denied! Please allow camera permission.');
        }
    }

    processResults(results) {
        const canvas = document.getElementById('hand-canvas-mini');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = 320;
        canvas.height = 240;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // UI elements
        const leftBox = document.getElementById('left-hand-box');
        const rightBox = document.getElementById('right-hand-box');
        const leftState = document.getElementById('left-state');
        const rightState = document.getElementById('right-state');
        const leftGesture = document.getElementById('left-gesture');
        const rightGesture = document.getElementById('right-gesture');

        // Reset
        leftBox.classList.remove('active');
        rightBox.classList.remove('active');
        leftState.textContent = 'Not Detected';
        rightState.textContent = 'Not Detected';
        leftGesture.textContent = '-';
        rightGesture.textContent = '-';

        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            this.onGestureCallback({ type: 'none' });
            return;
        }

        // Process each hand
        results.multiHandLandmarks.forEach((landmarks, index) => {
            // FIX: Mirror effect ke liye left/right swap
            const rawHandedness = results.multiHandedness[index].label;
            const handedness = rawHandedness === 'Left' ? 'Right' : 'Left';

            // Draw hand
            this.drawHand(ctx, landmarks, handedness, canvas.width, canvas.height);

            // Recognize gesture
            const gesture = this.recognizeGesture(landmarks);
            gesture.hand = handedness;

            // Update UI
            if (handedness === 'Left') {
                leftBox.classList.add('active');
                leftState.textContent = '✓ Tracking';
                leftGesture.textContent = this.getGestureLabel(gesture.type);
            } else {
                rightBox.classList.add('active');
                rightState.textContent = '✓ Tracking';
                rightGesture.textContent = this.getGestureLabel(gesture.type);
            }

            // Send gesture - SLOWER WITH CONFIDENCE
            const now = Date.now();

            if (gesture.type !== this.currentGesture) {
                this.currentGesture = gesture.type;
                this.gestureStartTime = now;
                this.gestureConfidence = 1;
            } else {
                this.gestureConfidence++;
            }

            // Only send if:
            // 1. Gesture held long enough (800ms)
            // 2. Detected multiple times (confidence)
            // 3. Cooldown period passed
            const heldLongEnough = now - this.gestureStartTime > this.GESTURE_HOLD_TIME;
            const confidentEnough = this.gestureConfidence >= this.CONFIDENCE_THRESHOLD;
            const cooldownPassed = now - this.lastGestureTime > this.GESTURE_COOLDOWN;

            if (heldLongEnough && confidentEnough && cooldownPassed) {
                this.onGestureCallback(gesture);
                this.lastGestureTime = now;

                // Visual feedback in console
                console.log(`✅ Gesture detected: ${gesture.type} (confidence: ${this.gestureConfidence})`);
            }

            // Drag - Track EACH hand separately
            const handKey = handedness;

            // SMOOTHER DRAG with throttling
            // IMPROVED FIST ROTATION
            if (gesture.type === 'fist') {
                // Initialize drag tracking
                if (!this.isDragging) {
                    this.isDragging = true;
                    this.dragStartTime = now;
                }

                // Only start sending drag after holding fist for 300ms
                const dragStarted = now - this.dragStartTime > 300;

                if (this.previousLandmarks[handKey] && dragStarted) {
                    const prevPalm = this.previousLandmarks[handKey][9];
                    const currPalm = landmarks[9];

                    // Calculate movement
                    const rawDeltaX = currPalm.x - prevPalm.x;
                    const rawDeltaY = currPalm.y - prevPalm.y;

                    // Amplify movement for better control
                    const deltaX = rawDeltaX * 800; // Increased sensitivity
                    const deltaY = rawDeltaY * 800;

                    // Throttle updates
                    if (!this.lastDragTime) this.lastDragTime = 0;
                    const dragCooldown = now - this.lastDragTime > 50; // Faster updates

                    // Send if ANY movement detected
                    if ((Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) && dragCooldown) {
                        this.onGestureCallback({
                            type: 'drag',
                            hand: handedness,
                            deltaX: deltaX,
                            deltaY: deltaY,
                            continuous: true // Flag for continuous movement
                        });
                        this.lastDragTime = now;

                        // Debug log
                        console.log(`🔄 Dragging: X=${deltaX.toFixed(2)}, Y=${deltaY.toFixed(2)}`);
                    }
                }
            } else {
                // Reset drag state when fist is released
                this.isDragging = false;
                this.dragStartTime = 0;
            }

            // Store landmarks for this hand
            this.previousLandmarks[handKey] = landmarks;
        }); // ← CLOSING BRACE for forEach

        // Two-hand gestures
        if (results.multiHandLandmarks.length === 2) {
            const twoHandGesture = this.recognizeTwoHandGesture(
                results.multiHandLandmarks[0],
                results.multiHandLandmarks[1]
            );
            if (twoHandGesture) {
                this.onGestureCallback(twoHandGesture);
            }
        }
    }

    drawHand(ctx, landmarks, handedness, width, height) {
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
            [5, 9], [9, 13], [13, 17]
        ];

        const color = handedness === 'Left' ? '#00FF00' : '#00FFFF';

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        connections.forEach(([start, end]) => {
            const sp = landmarks[start];
            const ep = landmarks[end];

            ctx.beginPath();
            ctx.moveTo((1 - sp.x) * width, sp.y * height);
            ctx.lineTo((1 - ep.x) * width, ep.y * height);
            ctx.stroke();
        });

        ctx.fillStyle = color;
        landmarks.forEach((lm, i) => {
            ctx.beginPath();
            ctx.arc(
                (1 - lm.x) * width,
                lm.y * height,
                i % 4 === 0 ? 6 : 4,
                0,
                2 * Math.PI
            );
            ctx.fill();
        });

        // Label
        ctx.shadowBlur = 0;
        ctx.font = 'bold 14px Arial';
        const palm = landmarks[9];
        ctx.fillText(handedness, (1 - palm.x) * width - 25, palm.y * height - 15);
    }

    recognizeGesture(lm) {
        if (this.isFist(lm)) return { type: 'fist' };
        if (this.isPinch(lm)) return { type: 'pinch' };
        if (this.isPoint(lm)) {
            const ray = this.getPointingRay(lm);
            return {
                type: 'point',
                ray: ray,
                tipPosition: {
                    x: lm[8].x,
                    y: lm[8].y,
                    z: lm[8].z
                }
            };
        }
        if (this.isPeace(lm)) return { type: 'peace' };
        if (this.isThumbsUp(lm)) return { type: 'thumbsup' };
        if (this.isOpenPalm(lm)) return { type: 'palm' };
        return { type: 'unknown' };
    }

    isFist(lm) {
        // More relaxed fist detection
        const indexBent = lm[8].y > lm[6].y - 0.02;
        const middleBent = lm[12].y > lm[10].y - 0.02;
        const ringBent = lm[16].y > lm[14].y - 0.02;
        const pinkyBent = lm[20].y > lm[18].y - 0.02;

        return indexBent && middleBent && ringBent && pinkyBent;
    }

    isPinch(lm) {
        const dist = Math.sqrt(
            Math.pow(lm[4].x - lm[8].x, 2) +
            Math.pow(lm[4].y - lm[8].y, 2)
        );
        return dist < 0.08;
    }

    isPoint(lm) {
        return lm[8].y < lm[6].y && lm[12].y > lm[10].y &&
            lm[16].y > lm[14].y && lm[20].y > lm[18].y;
    }

    isPeace(lm) {
        return lm[8].y < lm[6].y && lm[12].y < lm[10].y &&
            lm[16].y > lm[14].y && lm[20].y > lm[18].y;
    }

    isThumbsUp(lm) {
        return lm[4].y < lm[3].y && lm[8].y > lm[6].y && lm[12].y > lm[10].y;
    }

    isOpenPalm(lm) {
        return lm[8].y < lm[6].y && lm[12].y < lm[10].y &&
            lm[16].y < lm[14].y && lm[20].y < lm[18].y;
    }

    recognizeTwoHandGesture(h1, h2) {
        const palm1 = h1[9];
        const palm2 = h2[9];
        const dist = Math.sqrt(
            Math.pow(palm1.x - palm2.x, 2) + Math.pow(palm1.y - palm2.y, 2)
        );

        if (this.isPinch(h1) && this.isPinch(h2)) {
            if (dist < 0.3) return { type: 'both_pinch_close', hands: 'both' };
            if (dist > 0.5) return { type: 'both_pinch_open', hands: 'both' };
        }

        if (this.isFist(h1) && this.isFist(h2)) {
            return { type: 'both_fist', hands: 'both' };
        }

        if (this.isOpenPalm(h1) && this.isOpenPalm(h2)) {
            return { type: 'both_open', hands: 'both' };
        }

        return null;
    }

    getGestureLabel(type) {
        const labels = {
            'fist': '✊ Fist',
            'pinch': '🤏 Pinch',
            'point': '👆 Point',
            'peace': '✌️ Peace',
            'thumbsup': '👍 Thumbs',
            'palm': '🖐️ Open',
            'unknown': '❓'
        };
        return labels[type] || type;
    }

    getPointingRay(landmarks) {
        const indexTip = landmarks[8];
        const indexBase = landmarks[5];

        const direction = {
            x: indexTip.x - indexBase.x,
            y: indexTip.y - indexBase.y,
            z: indexTip.z - indexBase.z
        };

        return {
            origin: indexTip,
            direction: direction
        };
    }
}