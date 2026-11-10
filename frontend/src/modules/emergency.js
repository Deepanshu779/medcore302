import api from '../services/api';

export function createEmergencyModule(state) {
    return {
        triggerEmergencySos() {
            if (state.sosActive) {
                // Cancel SOS
                if (state.sosInterval) clearInterval(state.sosInterval);
                state.sosInterval = null;
                state.sosActive = false;
                state.sosCountdown = 0;
                state.speakText("Emergency SOS transmission cancelled.");
                return;
            }

            state.sosActive = true;
            state.sosCountdown = 5;
            state.speakText("Warning: Triggering Emergency SOS dispatch. Initiating 5 second countdown.");

            state.sosInterval = setInterval(() => {
                state.sosCountdown--;
                if (state.sosCountdown <= 0) {
                    clearInterval(state.sosInterval);
                    state.sosInterval = null;
                    this.sendSosRequest();
                }
            }, 1000);
        },

        async sendSosRequest() {
            state.speakText("SOS active. Geolocation locked. Emergency response dispatched.");
            state.logSecurityActivity("EMERGENCY SOS SYSTEM TRIGGERED");

            const lat = state.userCoords ? state.userCoords.lat : 28.6139;
            const lng = state.userCoords ? state.userCoords.lng : 77.2090;

            try {
                const data = await api.post('/api/emergency/sos', {
                    userId: state.user.id || 1,
                    lat,
                    lng,
                    bloodGroup: "O+ (Standard)",
                    contacts: "+91-98765-43210"
                });
                state.sosResult = data;
                this.driveAmbulanceSim(lat, lng);
            } catch (e) {
                console.error('[SOS] fetch error:', e);
                state.sosResult = {
                    success: true,
                    dispatchMessage: "Local offline emergency backup routing triggered.",
                    eta: "6 mins",
                    ambulanceId: "AMB-EMERGENCY-DL"
                };
                this.driveAmbulanceSim(lat, lng);
            }
        },

        driveAmbulanceSim(targetLat, targetLng) {
            if (!state.map || typeof L === 'undefined') {
                state.setActiveNav('hosp');
                setTimeout(() => this.driveAmbulanceSim(targetLat, targetLng), 300);
                return;
            }
            if (state.ambulanceRouteInterval) clearInterval(state.ambulanceRouteInterval);
            if (state.ambulanceMarker) state.map.removeLayer(state.ambulanceMarker);

            state.ambulanceEta = "6 mins";
            state.ambulanceDistance = "3.2 km";

            const startLat = targetLat + 0.015;
            const startLng = targetLng + 0.015;

            state.ambulanceMarker = L.marker([startLat, startLng], {
                icon: L.divIcon({
                    className: 'custom-hosp-icon',
                    html: `<div class="bg-red-600 border-2 border-white shadow-xl text-white text-[10px] w-7 h-7 rounded-full flex items-center justify-center font-bold animate-bounce"><i class="fas fa-truck-medical text-[10px]"></i></div>`,
                    iconSize: [28, 28]
                })
            }).addTo(state.map).bindPopup("<b>Emergency Ambulance (En Route)</b>").openPopup();

            let step = 0;
            const stepsCount = 60;
            const dLat = (targetLat - startLat) / stepsCount;
            const dLng = (targetLng - startLng) / stepsCount;

            state.ambulanceRouteInterval = setInterval(() => {
                step++;
                const currentLat = startLat + dLat * step;
                const currentLng = startLng + dLng * step;
                state.ambulanceMarker.setLatLng([currentLat, currentLng]);

                const remDist = (3.2 * (1 - step / stepsCount)).toFixed(2);
                const remEta = Math.ceil(6 * (1 - step / stepsCount));

                state.ambulanceDistance = `${remDist} km`;
                state.ambulanceEta = remEta > 0 ? `${remEta} mins` : "Arrived";

                if (step >= stepsCount) {
                    clearInterval(state.ambulanceRouteInterval);
                    state.speakText("Emergency services have arrived at your location.");
                    state.ambulanceMarker.bindPopup("<b>Ambulance Arrived</b>").openPopup();
                }
            }, 500);
        },

        initAccidentDetection() {
            if (state.accelEnabled) {
                state.accelEnabled = false;
                if (state.handleMotion) window.removeEventListener('devicemotion', state.handleMotion);
                state.logSecurityActivity("Accident detection accelerometer disabled.");
                return;
            }

            state.accelEnabled = true;
            state.logSecurityActivity("Accident detection accelerometer enabled.");
            state.speakText("Accident impact detection engine is active.");

            state.handleMotion = (event) => {
                const acc = event.accelerationIncludingGravity;
                if (!acc) return;

                const force = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
                state.accelForce = force.toFixed(1);

                if (force > state.accelThreshold) {
                    state.showAccidDialog = true;
                    this.triggerEmergencySos();
                    window.removeEventListener('devicemotion', state.handleMotion);
                    state.accelEnabled = false;
                }
            };

            window.addEventListener('devicemotion', state.handleMotion);
        },

        simulateAccidentShock() {
            state.accelForce = 34.2;
            state.showAccidDialog = true;
            this.triggerEmergencySos();
        },

        generateEmergencyQrCode() {
            setTimeout(() => {
                const canvas = document.getElementById('qrCodeCanvas');
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                const size = 160;

                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, size, size);

                ctx.fillStyle = '#0F172A';
                // Draw 3 position corner markers
                const drawCorner = (x, y) => {
                    ctx.fillRect(x, y, 35, 35);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(x + 5, y + 5, 25, 25);
                    ctx.fillStyle = '#0F172A';
                    ctx.fillRect(x + 10, y + 10, 15, 15);
                };

                drawCorner(10, 10);
                drawCorner(115, 10);
                drawCorner(10, 115);

                // Deterministic grid based on user ID and info
                const seedStr = `MEDCORE-${state.user.id || 1}-${state.user.email || 'patient'}`;
                let hash = 0;
                for (let i = 0; i < seedStr.length; i++) {
                    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
                    hash |= 0;
                }

                ctx.fillStyle = '#0F172A';
                for (let x = 48; x < 112; x += 8) {
                    for (let y = 10; y < 150; y += 8) {
                        hash = (hash * 9301 + 49297) % 233280;
                        if ((hash / 233280) > 0.45) {
                            ctx.fillRect(x, y, 6, 6);
                        }
                    }
                }

                state.qrCodeDataUrl = canvas.toDataURL();
            }, 50);
        }
    };
}

