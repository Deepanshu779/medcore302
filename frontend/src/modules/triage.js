import api from '../services/api';

export function createTriageModule(state) {
    return {
        async sendBotMessage(text) {
            state.isBotTyping = true;
            setTimeout(() => {
                state.isBotTyping = false;
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                state.chatMessages.push({ sender: 'bot', text, time });
                setTimeout(() => this.scrollChatToBottom(), 50);
            }, 1000);
        },

        sendUserMessage() {
            if (!state.chatInput.trim()) return;
            const text = state.chatInput.trim();
            state.chatInput = '';
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            state.chatMessages.push({ sender: 'user', text, time });
            setTimeout(() => this.scrollChatToBottom(), 50);

            if (state.chatState === 'init') {
                state.chatState = 'symptoms';
                this.sendBotMessage("Understood. Please describe your symptoms in detail (e.g. chest pain, severe headache, persistent fever, fatigue).");
            } else if (state.chatState === 'symptoms') {
                const lowText = text.toLowerCase();
                if (lowText.includes('chest') || lowText.includes('heart') || lowText.includes('breath')) {
                    state.chatState = 'critical';
                    this.sendBotMessage("⚠️ WARNING: Chest or respiratory symptoms require immediate attention. We recommend visiting our 'Nearby Facilities' tab and seeking immediate evaluation at an emergency department. Would you like to schedule an emergency consultation with a cardiologist?");
                } else if (lowText.includes('head') || lowText.includes('migraine') || lowText.includes('dizzy')) {
                    state.chatState = 'neurology';
                    this.sendBotMessage("I see. Headaches or dizziness can indicate neurological fatigue, migraine patterns, or blood pressure fluctuations. We suggest consulting Dr. Sandeep Vaishya (Neurologist). Shall I assist you in booking a slot?");
                } else {
                    state.chatState = 'general';
                    this.sendBotMessage("Thank you for sharing your symptoms. These appear stable for routine evaluation. We advise adequate rest and consulting a physician if they persist. Would you like to review doctor availability?");
                }
            } else {
                this.sendBotMessage("I am ready to help you schedule an appointment or provide additional guidance. Let me know what you need!");
            }
        },

        triggerSymptomCheck(symptom) {
            state.chatInput = symptom;
            this.sendUserMessage();
        },

        scrollChatToBottom() {
            const el = document.getElementById('chatContainer');
            if (el) el.scrollTop = el.scrollHeight;
        },

        async runDiseasePrediction() {
            if (!state.predSymptoms.trim() || !state.predAge || !state.predSystolic || !state.predDiastolic || !state.predSugar) {
                return alert("Please fill all clinical parameters (symptoms, age, blood pressure, glucose) to run the triage scan.");
            }
            state.isPredicting = true;
            state.predictionResult = null;
            try {
                const result = await api.post('/api/predict-disease', {
                    symptoms: state.predSymptoms,
                    age: state.predAge,
                    systolic: state.predSystolic,
                    diastolic: state.predDiastolic,
                    sugar: state.predSugar
                });
                state.predictionResult = result;
            } catch (e) {
                alert("Failed to run disease prediction: " + e.message);
            } finally {
                state.isPredicting = false;
            }
        },

        bookSpecFromPredict(specName) {
            const doc = state.doctors.find(d => d.name === specName);
            if (doc) {
                state.selectedDoc = doc;
                state.setActiveNav('docs');
            } else {
                state.filter = specName.includes('Khanna') ? 'Cardiology' : (specName.includes('Iyer') ? 'Neurology' : 'Pediatrics');
                state.setActiveNav('docs');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        async calculateAIHealthScore() {
            if (!state.healthSleep || !state.healthSteps || !state.healthBpm || !state.predSystolic || !state.predDiastolic) {
                return alert("Please enter your biometric sleep, steps, BPM, and blood pressure markers to compute your health score.");
            }
            state.isCalculatingScore = true;
            state.healthScoreResult = null;
            try {
                const result = await api.post('/api/health-score', {
                    sleep: state.healthSleep,
                    steps: state.healthSteps,
                    bpm: state.healthBpm,
                    diet: state.healthDiet,
                    stress: state.healthStress,
                    systolic: state.predSystolic,
                    diastolic: state.predDiastolic
                });
                state.healthScoreResult = result;
            } catch (e) {
                alert("Failed to compute health score: " + e.message);
            } finally {
                state.isCalculatingScore = false;
            }
        },

        async uploadBloodReport(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            state.uploadedFileName = file.name;
            state.isScanningReport = true;
            state.scannedReportResult = null;

            state.logSecurityActivity(`Uploaded medical report for scanning: ${file.name}`);

            const reader = new FileReader();
            reader.onload = async (e) => {
                const fileData = e.target.result;
                try {
                    const result = await api.post('/api/ai/scan-report', {
                        fileName: file.name,
                        fileContent: fileData
                    });
                    state.scannedReportResult = result;
                    state.speakText("Medical report scanned successfully. Extracted clinical diagnostics are displayed.");
                } catch (err) {
                    alert("Diagnostic report extraction failed: " + err.message);
                } finally {
                    state.isScanningReport = false;
                }
            };
            reader.readAsDataURL(file);
        },

        addInteractionMed() {
            if (!state.interactionMedsInput.trim()) return;
            state.interactionMedsList.push(state.interactionMedsInput.trim());
            state.interactionMedsInput = '';
            this.checkMedicineInteractions();
        },

        removeInteractionMed(index) {
            state.interactionMedsList.splice(index, 1);
            this.checkMedicineInteractions();
        },

        async checkMedicineInteractions() {
            if (state.interactionMedsList.length < 2) {
                state.interactionCheckResult = null;
                return;
            }
            state.isCheckingInteractions = true;
            try {
                const result = await api.post('/api/ai/check-interactions', {
                    medicines: state.interactionMedsList
                });
                state.interactionCheckResult = result;
            } catch (e) {
                console.error('[Interactions] check error:', e);
            } finally {
                state.isCheckingInteractions = false;
            }
        }
    };
}

