<template>
  <div class="detailPage">
    <div class="container2">
      <h5 style="margin-left: 1.4rem;" class="titlePage">Habit Detail</h5>
      <button style="width:12.5%;" @click="deleteHabit" class="btn btn-danger "><i class="bi bi-trash3"></i>
        Habit Delete</button>
    </div>
    <div class="containerComponents">
      <div class="card containerHabitItem">
        <HabitItem v-if="selectedHabit" :habit="selectedHabit" :isEditing="true" :isEditBtn="false" :isCheckbox="false"
          @checkboxToggled="updateCheckedDates" :layout="layout" :is-update-visible-props="isUpdateVisible"
          @close="updateVisible" :delete-status="deleteStatus" @delete="updateDelete" />
        <!-- update,cancel ve delete butonları -->
        <div class="butons">
          <button style="width:32%;" @click="openUpdate" class="btn btn-primary "><i class="bi bi-arrow-repeat"></i>
            Update</button>
          <button style="width:32%;" @click="cancelEdit" class="btn btn-secondary ">Cancel</button>
        </div>
      </div>
      <hr class="hr" />
      <HabitCalendar v-if="selectedHabit" :habit="selectedHabit" :habit-id="habitId" />
      <hr class="hr" />
      <HabitStats v-if="selectedHabit" :habit="selectedHabit" :checked-dates="checkedDates" />
      <hr class="hr" :layout="layout" />
    </div>
  </div>
</template>

<script>
import HabitItem from '@/components/HabitItem.vue';
import HabitCalendar from '@/components/HabitCalendar.vue';
import { ref, onMounted, watch } from 'vue';
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
    const layout = ref("default");
    const deleteStatus = ref(false);
    const isUpdateVisible = ref(false);

    watch(
      isUpdateVisible,
      (newValue) => {
        isUpdateVisible.value = newValue;
      },
    );

    watch(
      deleteStatus,
      (newValue) => {
        deleteStatus.value = newValue;
        console.log("deleteStatus", deleteStatus.value);
      }
    );

    const openUpdate = () => {
      isUpdateVisible.value = !isUpdateVisible.value;
    };

    const updateVisible = (value) => {
      isUpdateVisible.value = value;
    };
    /* ************************************************************** */
    const deleteHabit = () => {
      console.log("Status değiştirildi.");
      deleteStatus.value = !deleteStatus.value;
    };

    const updateDelete = (value) => {
      deleteStatus.value = !value;
    };

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
      layout,
      openUpdate,
      isUpdateVisible,
      updateVisible,
      deleteHabit,
      deleteStatus,
      updateDelete
    };
  },
};
</script>
