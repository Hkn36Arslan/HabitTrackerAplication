<template>
  <div class="HomePage">
    <div class="container2">
      <h5 style="margin-left: 1.4rem;" class="titlePage">Habits</h5>
      <button id="toggleAddHabit" @click="toggleAddHabit" class="btn btn-primary">
        <i style="font-size: 1.2rem;" class="bi bi-plus"></i> Add NewHabits
      </button>
    </div>
    <HabitList style="margin-top: 5rem;" :is-add-habit="visible" @close="updateVisible" />
  </div>
</template>

<script>
import HabitList from '../components/HabitList.vue';
import { ref, watch } from 'vue';

export default {
  name: "HomeView",
  components: {
    HabitList,
  },
  setup() {
    const visible = ref(false);

    watch(
      visible,
      (newValue) => {
        visible.value = newValue;
      }
    );
    const toggleAddHabit = () => {
      visible.value = !visible.value;
    };

    const updateVisible = (value) => {
      visible.value = value;
    };
    return {
      visible, toggleAddHabit, updateVisible
    };
  }
};
</script>