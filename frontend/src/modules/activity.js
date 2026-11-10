import api from '../services/api';

export function createActivityModule(state) {
    return {
        async logSecurityActivity(actionType) {
            try {
                await api.post('/api/activity-logs', {
                    userId: state.user.id || 1,
                    deviceType: 'Web Browser',
                    location: 'Delhi, India',
                    actionType
                });
                this.fetchActivityLogs();
            } catch (e) {
                console.error('[Activity] log error:', e);
            }
        },

        async fetchActivityLogs() {
            try {
                state.activityLogsList = await api.get(`/api/activity-logs/${state.user.id || 1}`);
            } catch (e) {
                console.error('[Activity] fetch error:', e);
            }
        },

        fetchTimelineEvents() {
            state.timelineEventsList = [
                { date: "May 25, 2026", title: "MedCore Health Score Computed", icon: "fas fa-heartbeat", desc: "Generated a wellness index overall rating of 82." },
                { date: "May 20, 2026", title: "Specialist Consultation Scheduled", icon: "fas fa-calendar-check", desc: "Booked appointment with Dr. Naresh Trehan (Cardiology)." },
                { date: "Apr 15, 2026", title: "Diagnostic Blood Panel Scanned", icon: "fas fa-microscope", desc: "Clinical markers extracted indicating borderline glucose levels." },
                { date: "Mar 10, 2026", title: "MedCore 302 Portal Registered", icon: "fas fa-id-card", desc: "Primary patient profile initialized." }
            ];
        }
    };
}

