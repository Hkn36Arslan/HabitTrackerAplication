<template>
  <div class="detailPage">
    <div class="container2">
      <h5 style="margin-left: 1.4rem;" class="titlePage">Habit Detail</h5>
      <button style="width:12.5%;" @click="deleteHabit" class="btn btn-danger "><i class="bi bi-trash3"></i>
        Delete Habit </button>
    </div>
    <div class="containerComponents">
      <div class="card containerHabitItem">
        <!-- Notes Modal -->
        <div v-if="isNote" class="modal-backdrop custom-modal">
          <div class="modal-content custom-modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Notes for {{ selectedHabit.name }}</h5>
              <button class="closeBtn" type="button" @click="close" aria-label="Close">X</button>
            </div>
            <div class="modal-body">
              <div class="note-pad">
                <ul class="list-group note-list">
                  <li v-if="emptyList">
                    <i class="bi bi-pin-angle-fill pin-icon"></i>
                    <span class="note-text">Not yok.</span>
                  </li>
                  <li v-for="(note, index) in notes" :key="index" class="list-group-item note-item">
                    <i class="bi bi-pin-angle-fill pin-icon"></i>
                    <span class="note-text">{{ note }}</span>
                    <button @click="updateNote(index)" class="btn btn-primary btn-sm update-btn">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button @click="deleteNote(index)" class="btn btn-danger btn-sm delete-btn">
                      <i class="bi bi-trash"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div class="modal-footer">
              <button @click="close" class="btn btn-secondary w-25">Close</button>
            </div>
          </div>
        </div>


        <HabitItem style="width: 40% !important;" v-if="selectedHabit" :habit="selectedHabit" :isEditing="true"
          :isEditBtn="false" :isCheckbox="false" @checkboxToggled="updateCheckedDates" :layout="layout"
          :is-update-visible-props="isUpdateVisible" @close="updateVisible" :delete-status="deleteStatus"
          @delete="updateDelete" />
        <!-- update,cancel ve delete butonları -->
        <div class="butons">
          <div class="content">
            <h4>Manage Notes for habit</h4>
            <textarea v-model="newNote" placeholder="Enter your note here..." class="form-control mb-2"></textarea>
            <div class="contentButon">
              <button style="width: 48%;" @click="addNote" class="btn btn-primary mb-2">
                <i style="font-size: 1.3rem;" class="bi bi-plus"></i>
                Add Note</button>
              <button style="width: 48%; display: flex; align-items: center; justify-content: center;"
                @click="toggleNote" class="btn btn-primary mb-2">
                <i style="font-size: 1.2rem; margin-right: .5rem;" class="bi bi-list-task"></i> Manage Notes
              </button>
            </div>
          </div>
          <button style="width:12%; height: 60px;" @click="openUpdate" class="btn btn-primary "><i
              class="bi bi-arrow-repeat"></i>
            Update</button>
        </div>
      </div>
      <HabitCalendar v-if="selectedHabit" :habit="selectedHabit" :habit-id="habitId" />
      <HabitStats v-if="selectedHabit" :habit="selectedHabit" :checked-dates="checkedDates" />
    </div>

  </div>
</template>


<script>
import HabitItem from "@/components/HabitItem.vue";
import HabitCalendar from "@/components/HabitCalendar.vue";
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useHabitStore } from "../stores/habitStore";
import HabitStats from "@/components/HabitStats.vue";


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
    // Notes state
    const isNote = ref(false);
    const newNote = ref("");
    const notes = ref([]);
    const emptyList = ref(false);

    const toggleNote = () => {
      isNote.value = !isNote.value;
      if (emptyControl()) {
        emptyList.value = true;
      }
      else if (isNote.value) {
        notes.value = habitStore.getNotesByHabitId(props.habitId);
        emptyList.value = false;
      }
    };

    const emptyControl = () => {
      if (notes.value.length === 0) {
        emptyList.value = true;
        return emptyList.value;
      }
    };

    const addNote = () => {
      if (newNote.value.trim() !== "") {
        habitStore.addNote(props.habitId, newNote.value.trim());
        notes.value = habitStore.getNotesByHabitId(props.habitId);
        newNote.value = "";
        emptyList.value = !emptyList.value;

      }
      else {
        alert("Lütfen text alanını doldurun.");
      }
    };

    const deleteNote = (index) => {
      habitStore.deleteNote(props.habitId, index);
      notes.value = habitStore.getNotesByHabitId(props.habitId);
      if (emptyControl()) {
        emptyList.value = true;
      }
    };
    const close = () => {
      isNote.value = !isNote.value;
      emptyList.value = !emptyList.value;
    };

    // Habit Management Logic
    watch(isUpdateVisible, (newValue) => {
      isUpdateVisible.value = newValue;
    });

    watch(deleteStatus, (newValue) => {
      deleteStatus.value = newValue;
    });

    const openUpdate = () => {
      isUpdateVisible.value = !isUpdateVisible.value;
    };

    const updateVisible = (value) => {
      isUpdateVisible.value = value;
    };

    const deleteHabit = () => {
      deleteStatus.value = !deleteStatus.value;
    };

    const updateDelete = (value) => {
      deleteStatus.value = !value;
    };

    onMounted(() => {
      const habitId = Number(route.params.habitId);
      selectedHabit.value = habitStore.getHabitById(habitId);
      notes.value = habitStore.getNotesByHabitId(props.habitId);
      if (selectedHabit.value) {
        loadCheckedDates();
      }
    });

    const loadCheckedDates = () => {
      checkedDates.value = habitStore.checkedDates[props.habitId] || new Set();
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
      updateDelete,
      isNote,
      newNote,
      notes,
      addNote,
      deleteNote,
      toggleNote,
      close,
      emptyList,
      emptyControl,
    };
  },
};
</script>

<style scoped>
.custom-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.custom-modal-content {
  background-color: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.5rem;

}

.closeBtn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}

.note-pad {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 1rem;
  position: relative;
  background-image: linear-gradient(to bottom, transparent 50%, #e8e8e8 50%);
  background-size: 100% 20px;
  background-position: top;
  background-repeat: repeat;
}

.note-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.note-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  background: none !important;
  border: none !important;
  border-radius: 5px;
  position: relative;
}

.pin-icon {
  color: #d9534f;
  font-size: 1.2rem;
  position: absolute;
  top: -10px;
  left: -10px;
  transform: rotate(-30deg);
}

.note-text {
  flex-grow: 1;
  margin-left: 1rem;
  margin-right: 1rem;
}

.delete-btn {
  background-color: #d9534f;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  font-size: 0.9rem;
  cursor: pointer;
  width: 5%;
}

.delete-btn:hover {
  background-color: #c9302c;
}

.update-btn {
  background-color: #887ff3 !important;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  font-size: 0.9rem;
  cursor: pointer;
  width: 5%;
  margin-right: 1rem;
}

.update-btn:hover {
  background-color: #c9302c;
}


.modal-footer {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.w-50 {
  width: 50%;
}
</style>