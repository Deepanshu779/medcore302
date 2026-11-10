import api from '../services/api';

export function createAuthModule(state) {
    return {
        async login() {
            if (!state.loginEmail || !state.loginPassword) {
                return alert('Please enter both email and password.');
            }
            try {
                const data = await api.post('/api/auth/login', {
                    email: state.loginEmail,
                    password: state.loginPassword
                });
                state.user = data;
                state.isAuthenticated = true;
                state.activeNav = 'dash';
                state.fetchAppointments();
                state.initEcg();
            } catch (e) {
                alert(e.message || 'Login failed');
            }
        },

        async register() {
            if (!state.regEmail || !state.regPassword || !state.regFirstName) {
                return alert('Please fill all required registration fields.');
            }
            try {
                const data = await api.post('/api/auth/register', {
                    firstName: state.regFirstName,
                    lastName: state.regLastName,
                    email: state.regEmail,
                    phone: state.regPhone,
                    password: state.regPassword
                });
                state.user = data;
                state.isAuthenticated = true;
                state.activeNav = 'dash';
                state.fetchAppointments();
                state.initEcg();
            } catch (e) {
                alert(e.message || 'Registration failed');
            }
        },

        async saveProfile() {
            if (!state.user || !state.user.id) return;
            try {
                await api.put(`/api/profile/${state.user.id}`, state.user);
                alert('Profile updated successfully!');
            } catch (e) {
                alert(e.message || 'Failed to save profile');
            }
        },

        logout() {
            state.isAuthenticated = false;
            state.user = { id: '', firstName: '', lastName: '', email: '', phone: '' };
            state.appointments = [];
        },

        updatePhoto(event) {
            const file = event.target.files && event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    state.profileImage = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }
    };
}

