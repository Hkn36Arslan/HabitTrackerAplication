<template>
  <!-- Alışkanlık Ekleme Formu -->
  <div class="Habit">
    <!-- Offcanvas Arka Plan Karartması -->
    <div v-if="isAddHabit" class="offcanvas-backdrop fade show"></div>

    <div v-if="isAddHabit" class="offcanvas offcanvas-start show" tabindex="-1" id="offcanvasAddHabit"
      aria-labelledby="offcanvasAddHabitLabel" role="dialog">
      <div class="offcanvas-header border-bottom">
        <h5 id="offcanvasAddHabitLabel" class="offcanvas-title">Add New Habits</h5>
        <button type="button" class="btn-close text-reset bg-secondary " @click="closeBtn" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body mx-0 flex-grow-0 p-6 h-100">
        <form class="add-new-habit pt-0 fv-plugins-bootstrap5 fv-plugins-framework" id="addNewHabitForm"
          onsubmit="return false" novalidate="novalidate">
          <div class="mb-4 fv-plugins-icon-container">
            <label class="form-label" for="habit-name">Habit Name</label>
            <input type="text" class="form-control" id="habit-name" placeholder="Habit Name" v-model="newHabit.name"
              required aria-label="Habit Name" />
            <div class="fv-plugins-message-container fv-plugins-message-container--enabled invalid-feedback"></div>
          </div>

          <div class="mb-4 fv-plugins-icon-container">
            <label class="form-label" for="habit-description">Description</label>
            <input type="text" class="form-control" id="habit-description" placeholder="Description"
              v-model="newHabit.description" aria-label="Description" />
            <div class="fv-plugins-message-container fv-plugins-message-container--enabled invalid-feedback"></div>
          </div>

          <div class="mb-4 fv-plugins-icon-container">
            <label class="form-label" for="habit-start-date">Start Date</label>
            <input type="date" class="form-control" id="habit-start-date" v-model="newHabit.startDate" required
              aria-label="Start Date" />
            <div class="fv-plugins-message-container fv-plugins-message-container--enabled invalid-feedback"></div>
          </div>

          <div class="mb-4 fv-plugins-icon-container">
            <label class="form-label" for="habit-goal">Goal</label>
            <input type="text" class="form-control" id="habit-goal" placeholder="Goal" v-model="newHabit.goal"
              aria-label="Goal" />
            <div class="fv-plugins-message-container fv-plugins-message-container--enabled invalid-feedback"></div>
          </div>

          <button type="button" @click="addNewHabit" class="btn btn-success me-3 data-submit waves-effect waves-light">
            Add Habit
          </button>
          <button type="reset" class="btn btn-danger waves-effect" data-bs-dismiss="offcanvas">
            Cancel
          </button>
          <input type="hidden" />
        </form>
      </div>

    </div>

    <!-- Alışkanlık Listesi -->
    <div class="list">
      <div v-for="habit in habits" :key="habit.id" class="habit-item">
        <HabitItem :habit="habit" :is-edit-btn="true" :is-checkbox="true" style="width: 100% !important;" />
      </div>
    </div>
  </div>
</template>

<script>
import { useHabitStore } from "../stores/habitStore";
import { ref, computed } from "vue";
import HabitItem from "./HabitItem.vue";

export default {
  components: { HabitItem },
  props: {
    isAddHabit: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const isAddHabit = ref(props.isAddHabit);
    console.log("gelen", isAddHabit.value);

    const closeBtn = () => {
      isAddHabit.value = false;
      console.log("close", isAddHabit.value)
      emit("close", isAddHabit.value);
    };

    const habitStore = useHabitStore();
    const habits = computed(() => habitStore.habits);
    habitStore.loadHabits();

    const newHabit = ref({
      id: null,
      name: "",
      description: "",
      startDate: "",
      goal: "",
    });

    const addNewHabit = () => {
      if (newHabit.value.name) {
        const habit = { ...newHabit.value, id: Date.now() };
        habitStore.addHabit(habit);
        newHabit.value = { id: null, name: "", description: "", startDate: "", goal: "" };
      }
    };

    return {
      habits,
      newHabit,
      addNewHabit,
      closeBtn,
    };
  },
};
</script>
