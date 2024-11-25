import { defineStore } from 'pinia';

export const useHabitStore = defineStore('habitStore', {
    state: () => ({
        habits: JSON.parse(localStorage.getItem('habits')) || [], // Alışkanlıklar
        checkedDates: JSON.parse(localStorage.getItem('checkedDates')) || {}, // İşaretli tarihleri tutan obje
        notes: JSON.parse(localStorage.getItem("habitNotes")) || {}, // Alışkanlıklara ait notlar
    }),

    actions: {
        // habitDetail componentine istenen habiti döner
        getHabitById(id) {
            return this.habits.find(habit => habit.id === id);
        },

        // Yeni alışkanlık ekler
        addHabit(habit) {
            if (!this.habits.some(h => h.id === habit.id)) {
                this.habits.push(habit);
                this.saveHabits();
            }
        },

        // LocalStorage kaydetme metodu
        saveHabits() {
            localStorage.setItem('habits', JSON.stringify(this.habits));
        },


        // Alışkanlık silme metodu
        deleteHabit(id) {
            this.habits = this.habits.filter(habit => habit.id !== id);
            this.saveHabits();
        },

        // Alışkanlık güncelleme metodu
        updateHabit(updatedHabit) {
            const index = this.habits.findIndex(habit => habit.id === updatedHabit.id);
            if (index !== -1) {
                this.habits.splice(index, 1, updatedHabit);
                this.saveHabits();
            }
        },

        // LocalStorage'den alışkanlıkları geri yükleme metodu
        loadHabits() {
            const loadedHabits = JSON.parse(localStorage.getItem('habits')) || [];
            this.habits = loadedHabits;
        },
        // Not yönetimi için metotlar
        getNotesByHabitId(habitId) {
            return this.notes[habitId] || [];
        },

        addNote(habitId, note) {
            if (!this.notes[habitId]) {
                this.notes[habitId] = [];
            }
            this.notes[habitId].push(note);
            this.saveNotes();
        },

        deleteNote(habitId, noteIndex) {
            if (this.notes[habitId]) {
                this.notes[habitId].splice(noteIndex, 1);
                this.saveNotes();
            }
        },

        saveNotes() {
            localStorage.setItem("habitNotes", JSON.stringify(this.notes));
        },

        loadNotes() {
            this.notes = JSON.parse(localStorage.getItem("habitNotes")) || {};
        },
        // Checkbox işaret durumu kaydetme metodu (Bugün için tarih bazlı kaydetme)
        saveCheckedState(habitId, value) {
            const today = new Date().toISOString().split('T')[0]; // Bugünün tarihi YYYY-MM-DD formatında
            const key = `habit-${habitId}-${today}`; // Özgün anahtar (habitId + tarih)
            localStorage.setItem(key, value); // checkbox durumunu kaydediyoruz
        },

        // Checkbox işaret durumu yükleme metodu (Bugün için)
        loadCheckedState(habitId) {
            const today = new Date().toISOString().split('T')[0]; // Bugünün tarihi
            const key = `habit-${habitId}-${today}`; // Özgün anahtar (habitId + tarih)
            const savedChecked = localStorage.getItem(key);
            return savedChecked === 'true'; // true/false dönüşümü
        },

        // Checkbox işaretlenme tarihini localStorage kaydeder
        // Checkbox işaretlenme tarihini kaydet
        saveCheckedDate(habitId, date) {
            if (!this.checkedDates[habitId]) {
                this.checkedDates[habitId] = new Set();
            }
            this.checkedDates[habitId].add(date);
            this.saveCheckedDates();
        },

        // Kaydedilen tarihleri localStorage'a kaydetme
        saveCheckedDates() {
            const checkedDatesSerializable = {};
            Object.keys(this.checkedDates).forEach(habitId => {
                checkedDatesSerializable[habitId] = Array.from(this.checkedDates[habitId]);
            });
            localStorage.setItem('checkedDates', JSON.stringify(checkedDatesSerializable));
        },

        // LocalStorage'den checkedDates yükleme
        loadCheckedDates() {
            const loadedCheckedDates = JSON.parse(localStorage.getItem('checkedDates')) || {};
            this.checkedDates = Object.fromEntries(
                Object.entries(loadedCheckedDates).map(([key, value]) => [key, new Set(value)])
            );
        },

        // Yeni olarak, belirtilen habitId ve date ile tarih kontrolü yapmak için fonksiyon eklenmiştir
        loadCheckedDate(habitId, date) {
            const habitCheckedDates = new Set(this.checkedDates[habitId] || []);  // Array'i Set'e çevir
            return habitCheckedDates.has(date);
        },

        // Tamamlama oranı hesaplama
        getCompletionRate(habitId) {
            const habitDates = this.checkedDates[habitId] || new Set();
            const totalDays = habitDates.size;
            return totalDays > 0 ? (totalDays / 30) * 100 : 0; // Örneğin, son 30 gün üzerinden hesaplama yapıyoruz
        },


        // Günlük checkbox durumunu sıfırlama ve güncelleme
        resetCheckedState() {
            // Bugünün tarihi ve geçmişe ait tüm verileri sıfırla
            const today = new Date().toISOString().split('T')[0]; // Bugünün tarihi YYYY-MM-DD formatında
            this.habits.forEach(habit => {
                const key = `habit-${habit.id}-${today}`;
                localStorage.removeItem(key); // Bugün için kaydedilen checkbox verisini sıfırla
            });
            this.checkedDates = {}; // Tüm checkbox tarihlerini sıfırla
            localStorage.removeItem('checkedDates'); // Tüm geçmiş veriyi sil
        }
    }
});
