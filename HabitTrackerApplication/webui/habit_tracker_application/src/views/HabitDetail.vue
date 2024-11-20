<template>
  <div class="detailPage">
    <h2 class="titlePage mt-4 mb-5">Habit Detail</h2>
    <HabitItem v-if="selectedHabit" :habit="selectedHabit" :isEditing="true" :isEditBtn="false" :isCheckbox="false"
      @checkboxToggled="updateCheckedDates" />
    <hr class="hr" />
    <HabitCalendar v-if="selectedHabit" :habit="selectedHabit" :habit-id="habitId" />
    <hr class="hr" />
    <HabitStats v-if="selectedHabit" :habit="selectedHabit" :checked-dates="checkedDates" />
    <hr class="hr" />
  </div>
</template>

<script>
import HabitItem from '@/components/HabitItem.vue';
import HabitCalendar from '@/components/HabitCalendar.vue';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHabitStore } from '../stores/habitStore';
import HabitStats from '@/components/HabitStats.vue';

export default {
  components: { HabitItem, HabitCalendar, HabitStats },
  props: {
    habitId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const habitStore = useHabitStore();
    const route = useRoute();
    const selectedHabit = ref(null);
    const checkedDates = ref([]);

    onMounted(() => {
      const habitId = Number(route.params.habitId);
      selectedHabit.value = habitStore.getHabitById(habitId);
      if (selectedHabit.value) {
        loadCheckedDates();
      }
    });

    const loadCheckedDates = () => {
      checkedDates.value = habitStore.checkedDates[props.habitId] || new Set();
      console.log("checkedDates", JSON.stringify(checkedDates.value));
    };

    const updateCheckedDates = (isChecked) => {
      const today = new Date().toISOString().split("T")[0];
      if (isChecked && !checkedDates.value.includes(today)) {
        checkedDates.value.push(today);
      } else if (!isChecked) {
        checkedDates.value = checkedDates.value.filter((date) => date !== today);
      }
      habitStore.saveCheckedDates(selectedHabit.value.id, checkedDates.value);
    };

    return {
      selectedHabit,
      checkedDates,
      updateCheckedDates,
      loadCheckedDates,
    };
  },
};
</script>
