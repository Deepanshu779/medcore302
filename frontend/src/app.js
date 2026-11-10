import { createAuthModule } from './modules/auth';
import { createDoctorsModule } from './modules/doctors';
import { createMapModule } from './modules/map';
import { createTelemetryModule } from './modules/telemetry';
import { createTriageModule } from './modules/triage';
import { createEmergencyModule } from './modules/emergency';
import { createServicesModule } from './modules/services';
import { createPrescriptionsModule } from './modules/prescriptions';
import { createVaultModule } from './modules/vault';
import { createVoiceModule } from './modules/voice';
import { createActivityModule } from './modules/activity';

export function docManager() {
    const state = {
        // Auth State
        isAuthenticated: false,
        activeNav: 'dash',
        user: { id: '', firstName: '', lastName: '', email: '', phone: '' },
        loginEmail: '',
        loginPassword: '',
        regFirstName: '',
        regLastName: '',
        regEmail: '',
        regPhone: '',
        regPassword: '',
        profileImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',

        // Doctors & Booking
        filter: 'All Specialists',
        selectedDoc: null,
        bookingDate: '',
        bookingTime: '',
        doctors: [],
        appointments: [{ docName: 'Dr. Naresh Trehan' }],
        allAppointments: [],
        categories: ['All Specialists', 'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'Orthopedics', 'Gastroenterology', 'Dentistry', 'Hematology'],
        times: ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'],

        // Navigation Links
        navLinks: [
            { id: 'dash', name: 'Dashboard', icon: 'fas fa-columns' },
            { id: 'docs', name: 'Find Doctors', icon: 'fas fa-user-md' },
            { id: 'hosp', name: 'Nearby Maps', icon: 'fas fa-map-marked-alt' },
            { id: 'meds', name: 'Prescriptions', icon: 'fas fa-pills' },
            { id: 'chat', name: 'Consultation', icon: 'fas fa-comment-medical' },
            { id: 'predict', name: 'AI Predictor', icon: 'fas fa-brain' },
            { id: 'sos', name: 'Safety Centre', icon: 'fas fa-shield-halved' },
            { id: 'telemetry', name: 'Biometrics HUD', icon: 'fas fa-heartbeat' },
            { id: 'services', name: 'Services Network', icon: 'fas fa-hand-holding-medical' },
            { id: 'family', name: 'Family Care', icon: 'fas fa-people-roof' },
            { id: 'doctor', name: 'Doctor Console', icon: 'fas fa-user-doctor' },
            { id: 'vault', name: 'Medical Vault', icon: 'fas fa-vault' },
            { id: 'timeline', name: 'Medical Journey', icon: 'fas fa-route' },
            { id: 'profile', name: 'My Profile', icon: 'fas fa-user-circle' }
        ],

        // Active Medications
        medications: [
            { name: 'Telmisartan (40mg)', type: 'Hypertension', dose: 'Once Daily (Morning)', doctor: 'Dr. Naresh Trehan', status: 'Active' },
            { name: 'Metformin (500mg)', type: 'Diabetes Management', dose: 'Twice Daily (After Meals)', doctor: 'Dr. Priya Bansal', status: 'Active' },
            { name: 'Amoxicillin + Clavulanate', type: 'Antibiotic', dose: '625mg • 5 Days Course', doctor: 'Dr. Sunita Deshmukh', status: 'Ending Soon' },
            { name: 'Pantoprazole (40mg)', type: 'Antacid', dose: 'As Needed (Empty Stomach)', doctor: 'Dr. Sandeep Vaishya', status: 'Active' }
        ],

        // Map & Hospitals
        map: null,
        userMarker: null,
        accuracyCircle: null,
        mapLoaded: false,
        locationStatus: 'Awaiting GPS permission...',
        watchId: null,
        userCoords: null,
        gpsSpeed: 0,
        gpsAccuracy: 0,
        hospitals: [],
        hospitalMarkers: [],

        // Live Telemetry
        liveBpm: 72,
        ecgCanvas: null,
        ecgCtx: null,
        ecgAnimationId: null,
        ecgX: 0,
        ecgY: 0,
        ecgArrhythmia: false,
        ecgAlertBanner: '',
        smartAlertsList: [
            { time: 'Just now', alert: 'Normal Sinus Rhythm active.', severity: 'normal' }
        ],
        waterGoal: 2500,
        waterCurrent: 0,

        // Triage Chat
        chatMessages: [
            { sender: 'bot', text: 'Namaste! Welcome to MedCore consultation and triage assistant. I can assist in evaluating symptoms and recommending nearby specialists in India.', time: 'Just now' }
        ],
        chatInput: '',
        isBotTyping: false,
        chatState: 'init',

        // Symptom & Disease Predictor
        predSymptoms: '',
        predAge: '',
        predSugar: '',
        predSystolic: '',
        predDiastolic: '',
        isPredicting: false,
        predictionResult: null,

        // Health Score
        healthSleep: '',
        healthSteps: '',
        healthBpm: '',
        healthStress: 'Low',
        healthDiet: 'Balanced',
        isCalculatingScore: false,
        healthScoreResult: null,

        // Voice Assistant
        isListening: false,
        voiceTranscript: '',
        voiceSupported: false,
        recognition: null,

        // System Settings
        darkMode: false,

        // Diagnostic Report Scanner
        uploadedFileName: '',
        isScanningReport: false,
        scannedReportResult: null,

        // Drug Interactions
        interactionMedsInput: '',
        interactionMedsList: [],
        isCheckingInteractions: false,
        interactionCheckResult: null,

        // Emergency SOS & Ambulance
        sosActive: false,
        sosCountdown: 0,
        sosInterval: null,
        sosResult: null,
        ambulanceMarker: null,
        ambulanceRouteInterval: null,
        ambulanceEta: '',
        ambulanceDistance: '',
        accelEnabled: false,
        accelForce: 0,
        accelThreshold: 25,
        showAccidDialog: false,
        qrCodeDataUrl: '',

        // Blood Network & Organs
        bloodDonorsList: [],
        bloodSearchCity: '',
        bloodSearchGroup: '',
        bloodRegName: '',
        bloodRegGroup: 'O+',
        bloodRegCity: 'Delhi',
        bloodRegPhone: '',
        isRegDonor: false,
        organRegType: 'Kidney',
        organRegVerified: false,
        organRegName: '',

        // Pharmacies & Home Care
        pharmacySearch: '',
        pharmacyStockResults: [],
        homeNurseType: 'General Nurse',
        homeNurseDays: 5,
        homeNurseAddress: '',
        homeNurseBooked: false,

        // Lab Bookings
        labHomeTest: 'Complete Blood Count (CBC)',
        labHomeAddress: '',
        labHomeDate: '',
        labBookingsList: [],

        // Family Care Module
        familyProfilesList: [],
        familyRegName: '',
        familyRegRel: 'Spouse',
        familyRegAge: '',
        familyRegBlood: 'O+',
        familyRegAllergies: '',
        pregnancyWeeks: 12,
        mentalMoodScore: 5,
        mentalStressResult: null,

        // Doctor Console & Prescriptions
        docPrescPatient: 'Deepanshu Kumar',
        docPrescDrugInput: '',
        docPrescDosageInput: '',
        docPrescDrugsList: [],
        docPrescSignature: '',
        docPrescQrText: '',
        digitalPrescriptionsList: [],

        // Medical Vault & Audit
        vaultFilesList: [],
        vaultActiveLock: true,
        vaultSimBiometric: false,
        vaultSimFaceId: false,
        activityLogsList: [],
        timelineEventsList: [],

        // Computed getters
        get filteredDoctors() {
            if (this.filter === 'All Specialists') return this.doctors;
            return this.doctors.filter(d => d.specialty === this.filter);
        },

        get sortedHospitals() {
            if (!this.hospitals || this.hospitals.length === 0) return [];
            if (!this.userCoords) {
                return this.hospitals.map(h => ({ ...h, distanceStr: 'Calculating...' }));
            }
            return this.hospitals.map(h => {
                const dist = this.getDistance(this.userCoords.lat, this.userCoords.lng, h.lat, h.lng);
                const distanceStr = dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
                return { ...h, distanceVal: dist, distanceStr };
            }).sort((a, b) => a.distanceVal - b.distanceVal);
        },

        getPageTitle() {
            const titleMap = {
                'dash': 'Health Dashboard',
                'docs': 'Specialist Directory',
                'hosp': 'Nearby Facilities (India)',
                'meds': 'Active Prescriptions',
                'chat': 'Online Consultation',
                'auth': 'Authentication Portal',
                'profile': 'Patient Profile & Details',
                'sos': 'Safety Command Centre',
                'telemetry': 'Biometrics HUD',
                'services': 'Clinical Services Network',
                'family': 'Family Care Portals',
                'doctor': 'Doctor Panel Console',
                'vault': 'Secure Medical Vault',
                'timeline': 'Historical Medical Journey'
            };
            return titleMap[this.activeNav] || 'MedCore 302';
        },

        setActiveNav(id) {
            this.activeNav = id;
            if (id === 'hosp') {
                setTimeout(() => this.initMap(), 50);
            }
            if (id === 'dash') {
                this.initEcg();
            }
        },

        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            if (this.darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            this.logSecurityActivity(`Toggled Dark Mode to ${this.darkMode ? 'ON' : 'OFF'}`);
        },

        init() {
            this.fetchDoctors();
            this.fetchHospitals();
            this.startBpmSimulator();
            this.initVoiceAssistant();
            this.fetchAllSystemAppointments();
            this.fetchTimelineEvents();
        }
    };

    // Attach all domain module methods onto the unified state object
    Object.assign(state,
        createAuthModule(state),
        createDoctorsModule(state),
        createMapModule(state),
        createTelemetryModule(state),
        createTriageModule(state),
        createEmergencyModule(state),
        createServicesModule(state),
        createPrescriptionsModule(state),
        createVaultModule(state),
        createVoiceModule(state),
        createActivityModule(state)
    );

    return state;
}

export default docManager;

