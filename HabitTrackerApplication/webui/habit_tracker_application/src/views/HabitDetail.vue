<template>
  <div class="detailPage">
    <div class="container2">
      <h5 style="margin-left: 1.4rem;" class="titlePage">Habit Detail</h5>
      <button style="width:12.5%;" @click="deleteHabit" class="btn btn-danger "><i class="bi bi-trash3"></i>
        Delete Habit </button>
    </div>
    <div v-if="alertSuccess" class="alert alert-success" role="alert" style=" position: absolute; z-index: 1000;">
      added successfully
    </div>
    <div v-if="alertDanger" class="alert alert-danger" role="alert" style=" position: absolute;  z-index: 1000;">
      {{ textareaMessage }}
      {{ deleteMessage }}
    </div>
    <div v-if="containerComponents" class="containerComponents">
      <div class="containerHabit">
        <div class="card containerHabitItem">
          <HabitItem style="width: 80% !important;" v-if="selectedHabit" :habit="selectedHabit" :isEditing="true"
            :isEditBtn="false" :isCheckbox="false" @checkboxToggled="updateCheckedDates" :layout="layout"
            :is-update-visible-props="isUpdateVisible" @close="updateVisible" :delete-status="deleteStatus"
            @delete="updateDelete" />
          <button style="width:25%; height: 50px;" @click="openUpdate" class="btn btn-primary ">
            <i class="bi bi-arrow-repeat"></i>
            Update</button>
          <!-- update,cancel ve delete butonları -->
        </div>
        <div class="card containerHabitItem2" style=" height: 426px;">
          <div class="content2">
            <div class="messageBox">
              <input v-model="newNote" placeholder="Add notes for Habit ..." />
              <div class="contentButon">
                <button style="width:40px;height: 40px; border-radius: 50%;" @click="addNote" class="btn btn-primary ">
                  <i class="bi bi-send-fill"></i></button>
              </div>
            </div>
            <div v-if="alertDangerDelete" class="alert alert-danger" role="alert"
              style=" position: absolute; left:40%; top: 20%;  z-index: 1000;">
              Note Deleted
            </div>
            <div v-if="alertSuccessSave" class="alert alert-success" role="alert"
              style=" position: absolute; left:40%; top: 20%; z-index: 1000;">
              Saved Successfully
            </div>
            <!-- ***************************************************** -->
            <div v-if="isEditingNote" class="modal-backdrop custom-modal">
              <div style="width: 30% !important;" class="modal-content custom-modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Update Note</h5>
                  <button class="closeBtn" type="button" @click="isEditingNote = false" aria-label="Close">X</button>
                </div>
                <div class="modal-body">
                  <textarea v-model="editNoteText" placeholder="Update your note..." class="form-control"></textarea>
                </div>
                <div class="modal-footer">
                  <button @click="saveEditedNote" style="margin-right: 1rem;" class="btn btn-primary">Save</button>
                  <button @click="isEditingNote = false" class="btn btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
            <div class="note-pad">
              <ul class="list-group note-list">
                <li v-if="noteControl" class="list-group-item note-item">
                  <i class="bi bi-pin-angle-fill pin-icon"></i>
                  <span class="note-text">Not yok.</span>
                </li>
                <li v-for="(note, index) in notes" :key="index" class="list-group-item note-item">
                  <i class="bi bi-pin-angle-fill pin-icon"></i>
                  <span class="note-text">{{ note }}</span>
                  <button @click="toggleEditNote(index)" style="width: 5%; font-size: 1rem;margin-right: .5rem;"
                    class="btn btn-primary btn-sm ">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button @click="deleteNote(index)" class="btn btn-danger btn-sm delete-btn">
                    <i class="bi bi-trash"></i>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <HabitCalendar v-if="selectedHabit" :habit="selectedHabit" :habit-id="habitId" :data="receivedData" />
      <HabitStats v-if="selectedHabit" :habit="selectedHabit" :habit-id="habitId" @updateData="longeStreakFunction"
        style="margin-top: 2rem;" />
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
    const newNote = ref("");
    const notes = ref([]);
    const isEditingNote = ref(false); // Düzenleme modunu kontrol eder
    const editNoteIndex = ref(null); // Düzenlenen notun indeksi
    const editNoteText = ref(""); // Düzenlenecek notun yeni içeriği
    const alertSuccess = ref(false);
    const alertDanger = ref(false);
    const alertSuccessSave = ref(false);
    const alertDangerDelete = ref(false);
    const deleteMessage = ref("");
    const textareaMessage = ref("");
    const containerComponents = ref(true);
    const receivedData = ref("");
    const noteControl = ref(true);

    console.log("receivedData", receivedData.value);

    watch(
      receivedData,
      (newValue) => {
        receivedData.value = newValue;
      }
    );
    watch(
      noteControl,
      (newValue) => {
        noteControl.value = newValue;
      }
    );

    const addNote = () => {
      if (newNote.value.trim() !== "") {
        habitStore.addNote(props.habitId, newNote.value.trim());
        notes.value = habitStore.getNotesByHabitId(props.habitId);
        newNote.value = "";
        noteControl.value = false;
        alertSuccessFunction();

        setTimeout(() => {
          alertSuccessFunction();
        }, 1000);


      }
      else {
        alertDangerFunction();

        setTimeout(() => {
          alertDangerFunction();
        }, 1000);

      }
    };
    const toggleEditNote = (index) => {
      isEditingNote.value = true;
      editNoteIndex.value = index;
      editNoteText.value = notes.value[index];
    };

    const saveEditedNote = () => {
      if (editNoteIndex.value !== null && editNoteText.value.trim() !== "") {
        habitStore.updateNote(props.habitId, editNoteIndex.value, editNoteText.value.trim());
        notes.value = habitStore.getNotesByHabitId(props.habitId);
        isEditingNote.value = false;
        editNoteIndex.value = null;
        editNoteText.value = "";
        noteControl.value = false;

      }
      alertSuccessSaveFunction();

      setTimeout(() => {
        alertSuccessSaveFunction();
      }, 1000);

    };

    const deleteNote = (index) => {

      habitStore.deleteNote(props.habitId, index);

      notes.value = habitStore.getNotesByHabitId(props.habitId);


      if (notes.value.length === 0) {
        noteControl.value = true;
      }

      alertDangerDeleteFunction();

      setTimeout(() => {
        alertDangerDeleteFunction();
      }, 1000);
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
      alertDanger.value = !alertDanger.value;
      deleteStatus.value = !deleteStatus.value;
      textareaMessage.value = ""
      deleteMessage.value = "Deleted !"
      setTimeout(() => {
        alertDanger.value = !alertDanger.value;
      }, 1000);

    };

    const updateDelete = (value) => {
      deleteStatus.value = !value;
      containerComponents.value = false;
    };

    const alertSuccessFunction = () => {
      alertSuccess.value = !alertSuccess.value;
    };

    const alertDangerFunction = () => {
      alertDanger.value = !alertDanger.value;
      deleteMessage.value = "";
      textareaMessage.value = " Please fill in the text field !";
    };
    const alertSuccessSaveFunction = () => {
      alertSuccessSave.value = !alertSuccessSave.value;
    };

    const alertDangerDeleteFunction = () => {
      alertDangerDelete.value = !alertDangerDelete.value;
    };


    const longeStreakFunction = (data) => {

      receivedData.value = data;
    }
    onMounted(() => {
      const habitId = Number(route.params.habitId);
      selectedHabit.value = habitStore.getHabitById(habitId);
      notes.value = habitStore.getNotesByHabitId(props.habitId);
      if (selectedHabit.value) {
        loadCheckedDates();
      }

      notes.value = habitStore.getNotesByHabitId(props.habitId);

      if (notes.value.length !== 0) {
        noteControl.value = false;
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
      newNote,
      notes,
      addNote,
      deleteNote,
      close,
      isEditingNote,
      editNoteIndex,
      editNoteText,
      toggleEditNote,
      saveEditedNote,
      alertSuccess,
      alertDanger,
      alertSuccessSave,
      alertDangerDelete,
      deleteMessage,
      textareaMessage,
      containerComponents,
      receivedData,
      longeStreakFunction,
      noteControl,

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