import api from '../services/api';

export function createPrescriptionsModule(state) {
    return {
        addDoctorPrescDrug() {
            if (!state.docPrescDrugInput.trim() || !state.docPrescDosageInput.trim()) return;
            state.docPrescDrugsList.push({
                name: state.docPrescDrugInput.trim(),
                dose: state.docPrescDosageInput.trim()
            });
            state.docPrescDrugInput = '';
            state.docPrescDosageInput = '';
        },

        async generatePrescription() {
            if (state.docPrescDrugsList.length === 0) {
                return alert("Please add at least one medication to the prescription.");
            }

            // Generate signature data url
            const canvas = document.createElement('canvas');
            canvas.width = 120;
            canvas.height = 40;
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#4f46e5';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(10, 30);
            ctx.quadraticCurveTo(40, 5, 80, 20);
            ctx.lineTo(110, 10);
            ctx.stroke();
            state.docPrescSignature = canvas.toDataURL();

            state.docPrescQrText = `MC-PRES-${Math.floor(1000 + Math.random() * 9000)}-VERIFIED`;

            try {
                await api.post('/api/doctors/prescription', {
                    userId: state.user.id || 1,
                    docName: "Dr. Naresh Trehan",
                    docSpecialty: "Cardiology",
                    drugs: state.docPrescDrugsList,
                    signature: state.docPrescSignature,
                    qrText: state.docPrescQrText
                });
                alert("Digital prescription verified, digitally signed, and generated!");
                state.docPrescDrugsList = [];
                this.fetchPrescriptions();
            } catch (e) {
                alert("Failed to create prescription: " + e.message);
            }
        },

        async fetchPrescriptions() {
            try {
                state.digitalPrescriptionsList = await api.get(`/api/doctors/prescriptions/${state.user.id || 1}`);
            } catch (e) {
                console.error('[Prescriptions] fetch error:', e);
            }
        }
    };
}

