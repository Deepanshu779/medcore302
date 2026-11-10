import api from '../services/api';

export function createMapModule(state) {
    return {
        async fetchHospitals() {
            try {
                state.hospitals = await api.get('/api/hospitals');
            } catch (e) {
                console.error('[Hospitals] fetch error:', e);
            }
        },

        initMap() {
            if (typeof L === 'undefined') return;
            if (state.map) {
                setTimeout(() => state.map.invalidateSize(), 100);
                return;
            }
            const mapEl = document.getElementById('map');
            if (!mapEl) return;

            state.map = L.map('map').setView([28.6139, 77.2090], 11);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(state.map);

            this.paintHospitalMarkers();
            state.mapLoaded = true;
            this.locateUser();
        },

        paintHospitalMarkers() {
            if (!state.map || !state.hospitals || state.hospitals.length === 0 || typeof L === 'undefined') return;

            state.hospitalMarkers.forEach(m => state.map.removeLayer(m));
            state.hospitalMarkers = [];

            state.hospitals.forEach(hosp => {
                const marker = L.marker([hosp.lat, hosp.lng], {
                    icon: L.divIcon({
                        className: 'custom-hosp-icon',
                        html: `<div class="bg-indigo-600 border-2 border-white shadow-md text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-bold"><i class="fas fa-hospital text-[10px]"></i></div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    })
                }).addTo(state.map);

                marker.bindPopup(`
                    <div class="p-2 space-y-1">
                        <h4 class="font-bold text-xs text-slate-800">${hosp.name}</h4>
                        <p class="text-[10px] text-slate-500 mb-0.5"><i class="fas fa-bed text-indigo-600 mr-1"></i>Available Beds: <b>${hosp.beds}</b></p>
                        <p class="text-[10px] text-slate-500 mb-1"><i class="fas fa-clock text-amber-500 mr-1"></i>ER Wait: <b>${hosp.waitTime}</b></p>
                        <a href="tel:${hosp.phone}" class="text-[10px] bg-indigo-50 text-indigo-600 py-1 px-2 rounded-lg font-bold mt-2 inline-block"><i class="fas fa-phone mr-1"></i>Call Emergency</a>
                    </div>
                `);
                state.hospitalMarkers.push(marker);
            });
        },

        locateUser() {
            if (!navigator.geolocation) {
                state.locationStatus = "Geolocation not supported.";
                return;
            }
            state.locationStatus = "Connecting live GPS tracking...";

            if (state.watchId) {
                navigator.geolocation.clearWatch(state.watchId);
            }

            state.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, speed, accuracy } = position.coords;
                    state.userCoords = { lat: latitude, lng: longitude };
                    state.gpsSpeed = speed ? (speed * 3.6).toFixed(1) : 0;
                    state.gpsAccuracy = accuracy ? accuracy.toFixed(0) : 0;

                    state.locationStatus = `Continuous tracking active. Accuracy: ±${state.gpsAccuracy}m`;
                    this.generateLocalHospitals(latitude, longitude);

                    if (state.map && typeof L !== 'undefined') {
                        state.map.setView([latitude, longitude], 13);

                        if (state.userMarker) {
                            state.userMarker.setLatLng([latitude, longitude]);
                        } else {
                            state.userMarker = L.marker([latitude, longitude], {
                                icon: L.divIcon({
                                    className: 'custom-user-icon',
                                    html: `<div class="bg-indigo-600 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-xl animate-pulse"><div class="bg-white w-2 h-2 rounded-full"></div></div>`,
                                    iconSize: [24, 24],
                                    iconAnchor: [12, 12]
                                })
                            }).addTo(state.map)
                                .bindPopup('<b class="text-indigo-600 text-xs">Your Current Location</b>')
                                .openPopup();
                        }

                        if (state.accuracyCircle) {
                            state.accuracyCircle.setLatLng([latitude, longitude]);
                            state.accuracyCircle.setRadius(accuracy);
                        } else {
                            state.accuracyCircle = L.circle([latitude, longitude], {
                                radius: accuracy,
                                color: '#4f46e5',
                                fillColor: '#4f46e5',
                                fillOpacity: 0.15,
                                weight: 1
                            }).addTo(state.map);
                        }
                    }
                },
                () => {
                    state.locationStatus = "Access Denied. Showing default Indian grid.";
                    const defaultLat = 28.6304;
                    const defaultLng = 77.2177;
                    state.userCoords = { lat: defaultLat, lng: defaultLng };
                    this.generateLocalHospitals(defaultLat, defaultLng);

                    if (state.map) {
                        state.map.setView([defaultLat, defaultLng], 12);
                    }
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        },

        generateLocalHospitals(lat, lng) {
            const hospitalBrands = [
                { name: 'Apollo Multispeciality Hospital', beds: 85, waitTime: '15 mins', phone: '+91-9988776655', emergency: true },
                { name: 'Fortis Healthcare Center', beds: 42, waitTime: '10 mins', phone: '+91-9555123456', emergency: true },
                { name: 'Max Super Speciality Hospital', beds: 68, waitTime: '25 mins', phone: '+91-9333888777', emergency: false },
                { name: 'City Lifeline ER Clinic', beds: 12, waitTime: '5 mins', phone: '+91-9876543210', emergency: true },
                { name: 'Metro General Hospital', beds: 110, waitTime: '35 mins', phone: '+91-9123456789', emergency: true },
                { name: 'Red Cross Medical Center', beds: 18, waitTime: '8 mins', phone: '+91-9000111222', emergency: false }
            ];

            const offsets = [
                { dLat: 0.012, dLng: 0.018 },
                { dLat: -0.015, dLng: -0.009 },
                { dLat: 0.025, dLng: -0.021 },
                { dLat: -0.008, dLng: 0.026 },
                { dLat: 0.005, dLng: -0.012 },
                { dLat: -0.026, dLng: 0.021 }
            ];

            state.hospitals = hospitalBrands.map((brand, i) => {
                const offset = offsets[i];
                return {
                    name: brand.name,
                    lat: lat + offset.dLat,
                    lng: lng + offset.dLng,
                    beds: brand.beds,
                    waitTime: brand.waitTime,
                    phone: brand.phone,
                    emergency: brand.emergency
                };
            });

            this.paintHospitalMarkers();
        },

        setSimulatedCity(lat, lng, cityName) {
            if (state.watchId && navigator.geolocation) {
                navigator.geolocation.clearWatch(state.watchId);
                state.watchId = null;
            }
            state.userCoords = { lat, lng };
            state.locationStatus = `Simulating location in ${cityName}. Accuracy: ±5m`;

            if (state.map && typeof L !== 'undefined') {
                state.map.setView([lat, lng], 13);

                if (state.userMarker) {
                    state.userMarker.setLatLng([lat, lng]);
                    state.userMarker.setPopupContent(`<b>Simulated Location: ${cityName}</b>`).openPopup();
                } else {
                    state.userMarker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'custom-user-icon',
                            html: `<div class="bg-indigo-600 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-xl animate-pulse"><div class="bg-white w-2 h-2 rounded-full"></div></div>`,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        })
                    }).addTo(state.map)
                        .bindPopup(`<b>Simulated Location: ${cityName}</b>`)
                        .openPopup();
                }

                if (state.accuracyCircle) {
                    state.accuracyCircle.setLatLng([lat, lng]);
                    state.accuracyCircle.setRadius(5);
                } else {
                    state.accuracyCircle = L.circle([lat, lng], {
                        radius: 5,
                        color: '#4f46e5',
                        fillColor: '#4f46e5',
                        fillOpacity: 0.15,
                        weight: 1
                    }).addTo(state.map);
                }
            }

            this.generateLocalHospitals(lat, lng);
        },

        getDistance(lat1, lon1, lat2, lon2) {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        }
    };
}

