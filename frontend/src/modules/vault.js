import api from '../services/api';

export function createVaultModule(state) {
    return {
        async uploadVaultFile(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;

            const fileType = file.type || 'application/octet-stream';
            const fileName = file.name;

            if (file.size > 10 * 1024 * 1024) {
                return alert("File size exceeds 10MB limit. Please upload a smaller document.");
            }

            state.logSecurityActivity(`Vault: Initialized upload of secure document ${fileName}`);

            const reader = new FileReader();
            reader.onload = async (e) => {
                const fileData = e.target.result;
                try {
                    await api.post('/api/vault/upload', {
                        userId: state.user.id || 1,
                        fileName,
                        fileType,
                        fileData
                    });
                    alert("Document securely stored in Medical Vault.");
                    this.fetchVaultFiles();
                } catch (err) {
                    alert("Failed to upload document to vault: " + err.message);
                }
            };
            reader.readAsDataURL(file);
        },

        async fetchVaultFiles() {
            try {
                state.vaultFilesList = await api.get(`/api/vault/files/${state.user.id || 1}`);
            } catch (e) {
                console.error('[Vault] fetch error:', e);
            }
        },

        verifyVaultBiometrics(type) {
            if (type === 'face') {
                state.vaultSimFaceId = true;
                state.speakText("Authenticating via Face ID");
            } else {
                state.vaultSimBiometric = true;
                state.speakText("Authenticating fingerprint sensor");
            }

            setTimeout(() => {
                state.vaultSimBiometric = false;
                state.vaultSimFaceId = false;
                state.vaultActiveLock = false;
                state.speakText("Secure vault decrypted successfully.");
                state.logSecurityActivity("Biometric authentication successful: Vault decrypted.");
                this.fetchVaultFiles();
            }, 1000);
        }
    };
}

