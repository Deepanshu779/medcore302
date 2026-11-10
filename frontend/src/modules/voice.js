export function createVoiceModule(state) {
    return {
        initVoiceAssistant() {
            if (typeof window === 'undefined') return;
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                state.voiceSupported = false;
                return;
            }
            state.voiceSupported = true;
            state.recognition = new SpeechRecognition();
            state.recognition.continuous = false;
            state.recognition.interimResults = false;
            state.recognition.lang = 'en-IN';

            state.recognition.onstart = () => {
                state.isListening = true;
                state.voiceTranscript = 'Listening...';
            };

            state.recognition.onerror = (event) => {
                console.error('[Voice] recognition error:', event.error);
                state.isListening = false;
                this.speakText("Sorry, I could not hear you clearly. Please try again.");
            };

            state.recognition.onend = () => {
                state.isListening = false;
            };

            state.recognition.onresult = (event) => {
                const resultText = event.results[0][0].transcript;
                state.voiceTranscript = `"${resultText}"`;
                this.parseVoiceCommand(resultText);
            };
        },

        toggleVoiceAssistant() {
            if (!state.voiceSupported) return alert("Web Speech Recognition is not supported in this browser version.");
            if (state.isListening) {
                state.recognition.stop();
            } else {
                state.recognition.start();
            }
        },

        speakText(text) {
            if (typeof window === 'undefined' || !window.speechSynthesis) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-IN';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        },

        parseVoiceCommand(command) {
            const text = command.toLowerCase().trim();

            if (text.includes('cardiologist') || text.includes('cardiology')) {
                state.filter = 'Cardiology';
                const doc = state.doctors.find(d => d.specialty === 'Cardiology');
                state.selectedDoc = doc || null;
                state.setActiveNav('docs');
                this.speakText(`Filtering specialty to Cardiology. Selected ${doc ? doc.name : 'an available cardiologist'}. Opening quick scheduler.`);
            } else if (text.includes('pediatrician') || text.includes('pediatrics')) {
                state.filter = 'Pediatrics';
                const doc = state.doctors.find(d => d.specialty === 'Pediatrics');
                state.selectedDoc = doc || null;
                state.setActiveNav('docs');
                this.speakText(`Filtering specialty to Pediatrics. Selected ${doc ? doc.name : 'an available pediatrician'}. Opening quick scheduler.`);
            } else if (text.includes('neurologist') || text.includes('neurology')) {
                state.filter = 'Neurology';
                const doc = state.doctors.find(d => d.specialty === 'Neurology');
                state.selectedDoc = doc || null;
                state.setActiveNav('docs');
                this.speakText(`Filtering specialty to Neurology. Selected ${doc ? doc.name : 'an available neurologist'}. Opening quick scheduler.`);
            } else if (text.includes('dermatologist') || text.includes('dermatology')) {
                state.filter = 'Dermatology';
                const doc = state.doctors.find(d => d.specialty === 'Dermatology');
                state.selectedDoc = doc || null;
                state.setActiveNav('docs');
                this.speakText("Filtering specialty to Dermatology. Selected Dr. Sunita Deshmukh. Opening quick scheduler.");
            } else if (text.includes('dashboard') || text.includes('home') || text.includes('vitals')) {
                state.setActiveNav('dash');
                this.speakText("Opening your MedCore health dashboard.");
            } else if (text.includes('map') || text.includes('hospital') || text.includes('facility')) {
                state.setActiveNav('hosp');
                this.speakText("Opening nearby medical facility map.");
            } else if (text.includes('prescription') || text.includes('medication') || text.includes('medicine')) {
                state.setActiveNav('meds');
                this.speakText("Opening active prescriptions list.");
            } else if (text.includes('consultation') || text.includes('chatbot') || text.includes('video')) {
                state.setActiveNav('chat');
                this.speakText("Opening consultation and symptom checker assistant.");
            } else if (text.includes('predictor') || text.includes('predict') || text.includes('diagnose')) {
                state.setActiveNav('predict');
                this.speakText("Opening clinical disease prediction workspace.");
            } else if (text.includes('profile') || text.includes('my profile') || text.includes('patient info')) {
                state.setActiveNav('profile');
                this.speakText("Opening patient profile details.");
            } else {
                this.speakText("Command not recognized. Try saying 'book appointment with cardiologist' or 'go to dashboard'.");
            }
        }
    };
}

