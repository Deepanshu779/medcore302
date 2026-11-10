import api from '../services/api';

export function createServicesModule(state) {
    return {
        async fetchBloodDonors() {
            try {
                const query = new URLSearchParams();
                if (state.bloodSearchCity) query.append('city', state.bloodSearchCity);
                if (state.bloodSearchGroup) query.append('group', state.bloodSearchGroup);

                state.bloodDonorsList = await api.get(`/api/blood-network?${query.toString()}`);
            } catch (e) {
                console.error('[Blood Donors] fetch error:', e);
            }
        },

        async registerBloodDonor() {
            if (!state.bloodRegName || !state.bloodRegPhone) {
                return alert("Please enter your name and phone number to register as a donor.");
            }
            try {
                await api.post('/api/blood-network/register', {
                    userId: state.user.id || 1,
                    name: state.bloodRegName,
                    bloodGroup: state.bloodRegGroup,
                    city: state.bloodRegCity,
                    phone: state.bloodRegPhone
                });
                alert("Thank you! You have been registered into the active donor directory.");
                state.isRegDonor = true;
                this.fetchBloodDonors();
            } catch (e) {
                alert("Failed to register donor: " + e.message);
            }
        },

        searchPharmacies() {
            if (!state.pharmacySearch.trim()) return;
            state.pharmacyStockResults = [
                { name: "Apollo Pharmacy Delhi", status: "Open (24/7)", stock: "In Stock", delivery: "15 min Delivery" },
                { name: "Fortis Clinical Pharmacy", status: "Open", stock: "In Stock", delivery: "Standard Pickup Only" },
                { name: "MedPlus Noida Store", status: "Closed", stock: "Low Stock", delivery: "Delivery Suspended" }
            ].filter(p => p.name.toLowerCase().includes(state.pharmacySearch.toLowerCase()) || state.pharmacySearch.length > 0);
        },

        async bookLabTest() {
            if (!state.labHomeAddress || !state.labHomeDate) {
                return alert("Please provide both your collection date and home address.");
            }
            try {
                await api.post('/api/lab-test/book', {
                    userId: state.user.id || 1,
                    testName: state.labHomeTest,
                    scheduleDate: state.labHomeDate,
                    address: state.labHomeAddress
                });
                alert(`Sample collection for ${state.labHomeTest} has been booked!`);
                state.labHomeAddress = '';
                this.fetchLabBookings();
            } catch (e) {
                alert("Failed to book lab test: " + e.message);
            }
        },

        async fetchLabBookings() {
            try {
                state.labBookingsList = await api.get(`/api/lab-test/bookings/${state.user.id || 1}`);
            } catch (e) {
                console.error('[Lab] fetch bookings error:', e);
            }
        },

        async fetchFamilyProfiles() {
            try {
                state.familyProfilesList = await api.get(`/api/family-profiles/${state.user.id || 1}`);
            } catch (e) {
                console.error('[Family] fetch error:', e);
            }
        },

        async addFamilyProfile() {
            if (!state.familyRegName || !state.familyRegAge) {
                return alert("Please enter both the name and age of the family member.");
            }
            try {
                await api.post('/api/family-profiles', {
                    userId: state.user.id || 1,
                    relationship: state.familyRegRel,
                    name: state.familyRegName,
                    age: state.familyRegAge,
                    bloodGroup: state.familyRegBlood,
                    allergies: state.familyRegAllergies
                });
                alert("Family profile added successfully!");
                state.familyRegName = '';
                state.familyRegAge = '';
                state.familyRegAllergies = '';
                this.fetchFamilyProfiles();
            } catch (e) {
                alert("Failed to add family member: " + e.message);
            }
        }
    };
}

