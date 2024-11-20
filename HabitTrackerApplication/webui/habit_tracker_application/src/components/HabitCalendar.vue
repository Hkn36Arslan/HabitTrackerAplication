<template>
  <div class="calendar">
    <h4 style="margin-bottom: 2rem;">{{ habit.name }} Calendar</h4>
    <div class="calendar-grid">
      <div v-for="date in dates" :key="date" :class="['calendar-day', { completed: loadCheckedDate(date) }]"
        :data-date="date">
        {{ formatDate(date) }}
      </div>
    </div>
  </div>
</template>
<script>
import { ref, onMounted } from 'vue';
import { useHabitStore } from '../stores/habitStore';
export default {
  props: {
    habitId: {
      type: Number,
      required: true,
    },
    habit: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const dates = ref([]);
    const habitStore = useHabitStore();

    // Gelen tarihleri teğit etme
    const loadCheckedDate = (date) => {
      return habitStore.loadCheckedDate(props.habitId, date);
    };


    // Tarihi yerel tarihe formatlamak
    const formatDate = (date) => {
      const dateObject = new Date(date);
      return dateObject.toLocaleDateString();
    };

    // Bütün ayın tarihlerini ayarlayan fonksiyon
    const generateMonthDates = () => {
      const today = new Date();
      const firstDayOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));
      const lastDayOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0));

      const currentDate = new Date(firstDayOfMonth);
      while (currentDate <= lastDayOfMonth) {
        dates.value.push(currentDate.toISOString().split('T')[0]); // YYYY-MM-DD formatında tarih
        currentDate.setDate(currentDate.getDate() + 1);
      }
    };


    onMounted(async () => {
      generateMonthDates();
    });


    return {
      dates,
      formatDate,
      loadCheckedDate,

    };
  },
};
</script>

<style scoped>
.completed {
  background-color: #2dce89;
}
</style>