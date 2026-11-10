export function createTelemetryModule(state) {
    return {
        startBpmSimulator() {
            setInterval(() => {
                state.liveBpm = 72 + Math.floor(Math.random() * 7) - 3;
            }, 2000);
        },

        initEcg() {
            setTimeout(() => {
                const canvas = document.getElementById('ecgCanvas');
                if (!canvas) return;

                state.ecgCanvas = canvas;
                state.ecgCtx = canvas.getContext('2d');

                const resize = () => {
                    if (canvas.parentElement) {
                        canvas.width = canvas.parentElement.clientWidth;
                        canvas.height = 80;
                    }
                };
                window.addEventListener('resize', resize);
                resize();

                state.ecgX = 0;
                if (state.ecgAnimationId) cancelAnimationFrame(state.ecgAnimationId);
                this.drawEcg();
            }, 50);
        },

        drawEcg() {
            if (!state.ecgCanvas || !state.ecgCtx) return;

            const ctx = state.ecgCtx;
            const height = state.ecgCanvas.height;
            const midY = height / 2;

            const drawStep = () => {
                if (state.activeNav !== 'dash') {
                    state.ecgAnimationId = requestAnimationFrame(drawStep);
                    return;
                }

                const width = state.ecgCanvas.width || 300;

                ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
                ctx.fillRect(state.ecgX, 0, 8, height);

                ctx.beginPath();
                ctx.strokeStyle = state.ecgArrhythmia ? '#ef4444' : '#4f46e5';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';

                let y = midY;
                const phase = state.ecgX % 120;

                if (state.ecgArrhythmia) {
                    // Arrhythmia erratic fibrillation pattern
                    y = midY + (Math.sin(state.ecgX * 0.3) * 20) + ((Math.random() - 0.5) * 15);
                } else if (phase > 20 && phase <= 25) {
                    y = midY - 6 * Math.sin((phase - 20) * Math.PI / 5); // P wave
                } else if (phase > 35 && phase <= 38) {
                    y = midY + 4 * (phase - 35) / 3; // Q wave
                } else if (phase > 38 && phase <= 42) {
                    y = midY - 30 * (phase - 38) / 4; // R spike
                } else if (phase > 42 && phase <= 46) {
                    y = midY - 30 + 38 * (phase - 42) / 4; // S wave
                } else if (phase > 46 && phase <= 50) {
                    y = midY + 8 - 8 * (phase - 46) / 4;
                } else if (phase > 60 && phase <= 75) {
                    y = midY - 10 * Math.sin((phase - 60) * Math.PI / 15); // T wave
                } else {
                    y = midY + (Math.random() - 0.5) * 1.5;
                }

                ctx.moveTo(state.ecgX - 2, state.ecgY || midY);
                ctx.lineTo(state.ecgX, y);
                ctx.stroke();

                state.ecgY = y;
                state.ecgX = (state.ecgX + 2) % width;

                ctx.fillStyle = state.ecgArrhythmia ? '#ef4444' : '#4f46e5';
                ctx.fillRect(state.ecgX, y - 2, 2, 4);

                state.ecgAnimationId = requestAnimationFrame(drawStep);
            };

            drawStep();
        },

        toggleEcgArrhythmia() {
            state.ecgArrhythmia = !state.ecgArrhythmia;
            if (state.ecgArrhythmia) {
                state.speakText("Alert. Irregular heart rhythm pattern triggered. Showing ventricular tachycardia warning.");
                state.ecgAlertBanner = "⚠️ Telemetry Alert: Ventricular Fibrillation / Tachycardia Anomaly Detected!";
                state.smartAlertsList.unshift({
                    time: new Date().toLocaleTimeString(),
                    alert: "CRITICAL: Arrhythmia anomaly logged on Lead II.",
                    severity: "critical"
                });
                state.logSecurityActivity("Telemetry Event: Arrhythmia anomaly detected.");
            } else {
                state.ecgAlertBanner = "";
                state.smartAlertsList.unshift({
                    time: new Date().toLocaleTimeString(),
                    alert: "Sinus Rhythm successfully stabilized.",
                    severity: "normal"
                });
                state.speakText("Cardio telemetry returned to optimal sinus rhythm.");
            }
        },

        addWaterIntake(amount) {
            state.waterCurrent = Math.min(state.waterCurrent + amount, state.waterGoal);
            state.logSecurityActivity(`Logged hydration: +${amount}ml`);
            if (state.waterCurrent >= state.waterGoal) {
                state.speakText("Daily hydration goal achieved. Excellent wellness index.");
            }
        }
    };
}

