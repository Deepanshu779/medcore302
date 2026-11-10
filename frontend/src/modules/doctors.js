import api from '../services/api';

export function createDoctorsModule(state) {
    return {
        async fetchDoctors() {
            try {
                state.doctors = await api.get('/api/doctors');
            } catch (e) {
                console.error('[Doctors] fetch error:', e);
            }
        },

        async fetchAllSystemAppointments() {
            try {
                state.allAppointments = await api.get('/api/all-appointments');
            } catch (e) {
                console.error('[Appointments] system fetch error:', e);
            }
        },

        async fetchAppointments() {
            if (!state.user || !state.user.id) return;
            try {
                state.appointments = await api.get(`/api/appointments/${state.user.id}`);
            } catch (e) {
                console.error('[Appointments] user fetch error:', e);
            }
        },

        selectDoctor(doc) {
            state.selectedDoc = doc;
            state.bookingDate = '';
            state.bookingTime = '';
            state.fetchAllSystemAppointments();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        isDateAvailable(dateStr) {
            if (!state.selectedDoc || !dateStr) return false;
            const parts = dateStr.split('-');
            if (parts.length !== 3) return false;
            const d = new Date(parts[0], parts[1] - 1, parts[2]);
            const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const selectedDayName = weekdays[d.getDay()];
            return state.selectedDoc.days.includes(selectedDayName);
        },

        getSuggestedDates() {
            if (!state.selectedDoc || !state.selectedDoc.days) return [];
            const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const suggestions = [];
            let count = 0;

            for (let i = 0; i < 30; i++) {
                const current = new Date();
                current.setDate(current.getDate() + i);
                const dayName = weekdays[current.getDay()];
                if (state.selectedDoc.days.includes(dayName)) {
                    const year = current.getFullYear();
                    const month = String(current.getMonth() + 1).padStart(2, '0');
                    const date = String(current.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${date}`;
                    const label = `${dayName.substring(0, 3)}, ${monthNames[current.getMonth()]} ${current.getDate()}`;
                    suggestions.push({ date: dateStr, label });
                    count++;
                    if (count >= 3) break;
                }
            }
            return suggestions;
        },

        isSlotBooked(timeStr) {
            if (!state.selectedDoc || !state.bookingDate) return false;
            return state.allAppointments.some(appt =>
                appt.docName === state.selectedDoc.name &&
                appt.date === state.bookingDate &&
                appt.time === timeStr
            );
        },

        async confirmBooking() {
            if (!state.user || !state.user.id) return alert('You must be logged in to book an appointment.');
            if (!state.selectedDoc) return alert('Please select a doctor first.');
            if (!state.bookingDate) return alert('Please select a consultation date.');
            if (!state.bookingTime) return alert('Please select an available time slot.');

            if (!state.isDateAvailable(state.bookingDate)) {
                return alert(`Dr. ${state.selectedDoc.name} is not available on the selected date. Please pick an active weekday.`);
            }
            if (state.isSlotBooked(state.bookingTime)) {
                return alert('This time slot is already booked. Please choose another slot.');
            }

            try {
                const data = await api.post('/api/appointments', {
                    userId: state.user.id,
                    docName: state.selectedDoc.name,
                    date: state.bookingDate,
                    time: state.bookingTime
                });

                state.appointments.push(data);
                const docName = state.selectedDoc.name;
                const finalDate = state.bookingDate;
                const finalTime = state.bookingTime;

                alert(`Booking confirmed with ${docName} on ${finalDate} at ${finalTime}!`);
                state.logSecurityActivity(`Booked clinical session with ${docName} on ${finalDate} at ${finalTime}`);
                state.speakText(`Appointment successfully confirmed with ${docName} on ${finalDate} at ${finalTime}.`);

                state.selectedDoc = null;
                state.bookingDate = '';
                state.bookingTime = '';
                state.fetchAllSystemAppointments();
            } catch (e) {
                alert('Failed to book appointment: ' + e.message);
            }
        }
    };
}

