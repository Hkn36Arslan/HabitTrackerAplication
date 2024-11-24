<template>
  <!-- Alışkanlık Ekleme Formu -->
  <div class="Habit">
    <!-- Offcanvas Arka Plan Karartması -->
    <div v-if="isAddHabit" class="offcanvas-backdrop fade show"></div>

    <div v-if="isAddHabit" class="offcanvas offcanvas-start show" tabindex="-1" id="offcanvasAddHabit"
      aria-labelledby="offcanvasAddHabitLabel" role="dialog">
      <div class="offcanvas-header border-bottom" style="position: relative;">
        <h5 id="offcanvasAddHabitLabel" class="offcanvas-title">Add New Habits</h5>
        <button class="closeBtn" type="button" @click="closeBtn" aria-label="Close">X</button>
      </div>
      <div style="position: relative;" class="offcanvas-body mx-0 flex-grow-0 p-6 h-100">
        <!-- Alert Mesajları -->
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="alert alert-success" role="alert">
          {{ successMessage }}
        </div>
        <form @submit.prevent="validateForm" class="add-new-habit pt-0 fv-plugins-bootstrap5 fv-plugins-framework"
          id="addNewHabitForm" novalidate>
          <div class="mb-4 fv-plugins-icon-container">
            <label class="form-label" for="habit-name">Habit Name</label>
            <input type="text" class="form-control" id="habit-name" placeholder="Habit Name" v-model="newHabit.name"
              :class="{ 'input-error': habitNameError }" />
            <small v-if="habitNameError" class="error-message">
              {{ habitNameError }}
            </small>
          </div>

          <div class="mb-4 fv-plugins-icon-container">
            <label class="form-label" for="habit-description">Description</label>
            <input type="text" class="form-control" id="habit-description" placeholder="Description"
              v-model="newHabit.description" />
          </div>

          <div class="mb-4 fv-plugins-icon-container">
            <label class="form-label" for="habit-start-date">Start Date</label>
            <input type="date" class="form-control" id="habit-start-date" v-model="newHabit.startDate"
              :class="{ 'input-error': habitStartDateError }" />
            <small v-if="habitStartDateError" class="error-message">
              {{ habitStartDateError }}
            </small>
          </div>

          <div class="mb-4 fv-plugins-icon-container">
            <label class="form-label" for="habit-goal">Goal</label>
            <input type="text" class="form-control" id="habit-goal" placeholder="Goal" v-model="newHabit.goal" />
          </div>

          <button type="submit" class="btn btn-success me-3 data-submit waves-effect waves-light">
            Add Habit
          </button>
          <button @click="closeBtn" style="width: 48%;" type="reset" class="btn btn-secondary waves-effect">
            Cancel
          </button>
        </form>
      </div>
    </div>
    <!-- Alışkanlık Listesi -->
   <!-- Alışkanlık Listesi -->
<div class="list">
    <div v-for="habit in habits" :key="habit.id" class="habit-item">
      <HabitItem :habit="habit" :is-edit-btn="true" :is-checkbox="true" :layout="layout" />
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
    const habitStore = useHabitStore();
    const habits = computed(() => habitStore.habits);
    habitStore.loadHabits();
    const layout = ref("default");

    const newHabit = ref({
      id: null,
      name: "",
      description: "",
      startDate: "",
      goal: "",
    });

    const habitNameError = ref("");
    const habitStartDateError = ref("");
    const successMessage = ref("");
    const errorMessage = ref("");

    const reset = () => {
      newHabit.value = { id: null, name: "", description: "", startDate: "", goal: "" };
      habitNameError.value = "";
      habitStartDateError.value = "";
      successMessage.value = "";
      errorMessage.value = "";
    };

    const closeBtn = () => {
      emit("close", isAddHabit.value);
      reset();
    };

    const validateForm = () => {
      habitNameError.value = "";
      habitStartDateError.value = "";
      successMessage.value = "";
      errorMessage.value = "";

      let isValid = true;

      if (!newHabit.value.name.trim()) {
        habitNameError.value = "This field cannot be empty.";
        isValid = false;
      }

      if (!newHabit.value.startDate.trim()) {
        habitStartDateError.value = "This field cannot be empty.";
        isValid = false;
      }

      if (isValid) {
        addNewHabit();
        successMessage.value = "Habit added successfully!";
        setTimeout(() => {
          successMessage.value = "";
        }, 1800);
      }
      else {
        errorMessage.value = "Please fix the errors above.";
        setTimeout(() => {
          errorMessage.value = "";
        }, 1800);
      }
    };

    const addNewHabit = () => {
      const habit = { ...newHabit.value, id: Date.now() };
      habitStore.addHabit(habit);
      reset();
    };

    return {
      habits,
      newHabit,
      habitNameError,
      habitStartDateError,
      successMessage,
      errorMessage,
      validateForm,
      closeBtn,
      layout,
    };
  },
};
</script>

<style scoped>
.input-error {
  border-color: red !important;
}

.error-message {
  color: red;
  font-size: 0.9em;
}

.alert {
  margin-bottom: 15px;
}
</style>
