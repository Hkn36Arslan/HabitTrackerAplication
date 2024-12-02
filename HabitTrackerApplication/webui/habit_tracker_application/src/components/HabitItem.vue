<template>
  <div :class="layoutClass">
    <div class="itemHabit">
      <!-- Modal Arka Plan Karartması -->
      <div v-if="isUpdateVisibleProps" class="modal-backdrop fade show"></div>

      <!-- Modal Yapısı -->
      <div v-if="isUpdateVisibleProps" class="modal fade show d-block" tabindex="-1" role="dialog" id="modalAddHabit">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header border-bottom">
              <h5 id="modalAddHabitLabel" class="modal-title">Update Habits</h5>
              <button type="button" class="closeBtn" @click="openUpdate" aria-label="Close">✕</button>
            </div>
            <div class="modal-body">
              <!-- Alert Mesajları -->
              <div v-if="errorMessage" class="alert alert-danger"
                style=" position: absolute !important; z-index: 2000 !important; margin-left:25%; top: 30%;"
                role="alert">
                {{ errorMessage }}
              </div>
              <div v-if="successMessage" class="alert alert-success"
                style=" position: absolute !important; z-index: 2000 !important; margin-left:25%; top: 30%;"
                role="alert">
                {{ successMessage }}
              </div>

              <!-- Form Yapısı -->
              <form @submit.prevent="validateForm" id="updateHabitForm" novalidate>
                <div class="mb-4">
                  <label class="form-label" for="habit-name">Habit Name</label>
                  <input v-model="updatedHabit.name" class="form-control mb-4" placeholder="Habit Name"
                    :class="{ 'input-error': habitNameError }" />
                  <small v-if="habitNameError" class="text-danger">
                    {{ habitNameError }}
                  </small>
                </div>

                <div class="mb-4">
                  <label class="form-label" for="habit-description">Description</label>
                  <input type="text" class="form-control" id="habit-description" placeholder="Description"
                    v-model="updatedHabit.description" />
                </div>

                <div class="mb-4">
                  <label class="form-label" for="habit-start-date">Start Date</label>
                  <input type="date" class="form-control" id="habit-start-date" v-model="updatedHabit.startDate"
                    :class="{ 'input-error': habitStartDateError }" />
                  <small v-if="habitStartDateError" class="text-danger">
                    {{ habitStartDateError }}
                  </small>
                </div>

                <div class="mb-4">
                  <label class="form-label" for="habit-goal">Goal</label>
                  <input type="text" class="form-control" id="habit-goal" placeholder="Goal"
                    v-model="updatedHabit.goal" />
                </div>

                <div class="d-flex justify-content-between">
                  <button type="submit" class="btn btn-success">
                    <i class="bi bi-arrow-repeat"></i>
                    Update
                  </button>
                  <button @click="openUpdate" type="reset" class="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- ****************************************************************************** -->
      <div class="card cardItem">
        <div class="card Item">
          <div class="card checkbox" v-if="checkbox">
            <!-- Elementin görünür olup olmamasını sağlamak için v-if yapısı kullanıldı.-->
            <input type="checkbox" v-model="checked" @change="saveCheckedState"
              :class="{ completed: isCheckedToday }" />
            <span>Completed ✓</span>
          </div>
          <div class="group">
            <div class="card name">
              <h2 style="font-family: 'Open Sans', sans-serif;margin-top: .5rem;">{{ habit.name }}
              </h2>
            </div>
            <div class="card description" v-if="isDescription">
              <p>
                <i class="bi bi-card-text"></i>
                {{ habit.description }}
              </p>
              <p>
                <i class="bi bi-flag"></i>
                <strong style="color: #28c76f;">Goal :</strong> {{ habit.goal }}
              </p>
              <p>
                <i class="bi bi-calendar-event"></i>
                <strong style="color: #ff4c51;">Start :</strong> {{ habit.startDate }}
              </p>
            </div>
          </div>
          <div class="card edit" v-if="isEditButton">
            <button class="btn btn-primary">
              <router-link :to="{ name: 'HabitDetail', params: { habitId: habit.id } }" class="router">
                <i class="bi bi-eye"> Detail</i>
              </router-link>
            </button>
          </div>
        </div>
        <div class="detail" v-if="isEditingLocal"></div>
      </div>
    </div>
  </div>
</template>


<script>
import { useHabitStore } from '../stores/habitStore';
import { ref, onMounted, toRefs, computed, watch } from 'vue';

export default {
  props: {
    habit: Object,
    isEditing: {   // Bu yapı ile bir elementin görünürlüğünü vb olaylarda değişken tipiyle  ve değeriyle oluşturulur.
      type: Boolean,
      default: false,
    },
    isEditBtn: {
      type: Boolean,
      default: false,
    },
    isCheckbox: {
      type: Boolean,
      default: false,
    },
    isDescription: {
      type: Boolean,
      default: true,
    },
    layout: {
      type: String,
      default: 'default'
    },
    isUpdateVisibleProps: {
      type: Boolean,
      default: false,
    },
    deleteStatus: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    layoutClass() {
      return this.layout === 'alternative' ? 'alternative-layout' : 'default-layout';
    },
  },
  emits: ["close", "delete", "checkboxToggled", "updatedHabit"],

  setup(props, { emit }) { // emit'i parametre olarak ekleyin
    const habitStore = useHabitStore();
    const isEditingLocal = ref(props.isEditing); // reaktif değişken oluşturuluyor.
    const isEditButton = ref(props.isEditBtn); // reaktif değişkenlerin değerinde bir güncelleme olduğunda bağlı olduğu tüm bileşen ve süreçlerde otomatik olarak değişikliğin yansıtılmasına olanak sağlar.
    const updatedHabit = ref({ ...props.habit });
    const checked = ref(false);
    const checkbox = ref(props.isCheckbox);
    const isUpdateVisible = ref(props.isUpdateVisibleProps);
    const today = new Date().toISOString().split('T')[0];
    const habitNameError = ref("");
    const habitStartDateError = ref("");
    const successMessage = ref("");
    const errorMessage = ref("");
    const delete_Status = ref(props.deleteStatus);

    watch(
      isUpdateVisible,
      (newValue) => {
        isUpdateVisible.value = newValue;
      });

    watch(
      () => props.deleteStatus,
      (newValue) => {
        delete_Status.value = newValue;

        if (delete_Status.value) {

          habitStore.deleteHabit(props.habit.id);

          emit("delete", delete_Status.value);

        }


      }
    );


    // Bugünkü tarihin işaretli olup olmadığını kontrol eden computed property
    const isCheckedToday = computed(() => {
      // Ensure checkedDates is always an array
      const checkedDates = habitStore.loadCheckedDates(props.habit.id) || []; // Default to an empty array if undefined or null
      return checkedDates.includes(today); // Safe to use .includes now
    });


    // Bu fonksiyon ile güncelleme formunun görünürlüğü sağlanıyor.
    const openUpdate = () => {
      emit("close", isUpdateVisible.value);
      reset();
    };

    const newHabit = ref({
      id: null,
      name: "",
      description: "",
      startDate: "",
      goal: "",
    });

    const reset = () => {
      newHabit.value = { id: null, name: "", description: "", startDate: "", goal: "" };
      habitNameError.value = "";
      habitStartDateError.value = "";
      successMessage.value = "";
      errorMessage.value = "";
    };
    const validateForm = () => {
      habitNameError.value = "";
      habitStartDateError.value = "";
      successMessage.value = "";
      errorMessage.value = "";

      let isValid = true;

      if (!updatedHabit.value.name.trim()) {
        habitNameError.value = "This field cannot be empty.";
        isValid = false;
      }

      if (!updatedHabit.value.startDate.trim()) {
        habitStartDateError.value = "This field cannot be empty.";
        isValid = false;
      }

      if (isValid) {
        saveEdit();
        successMessage.value = "Habit updated successfully!";
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

    // reaktif değişkendeki değeri habitStore gönderiyor.
    const saveEdit = () => {
      habitStore.updateHabit(updatedHabit.value);
      isEditingLocal.value = false; //  Sonrasında güncelleme alanını gizler.
      emit("updatedHabit", updatedHabit.value);
    };

    // işlemi kaydedip Home sayfasına yönlendirir.
    const cancelEdit = () => {
      emit("close", isUpdateVisible.value);
      reset();
    };


    // habitin checkbox işaretlenmesini localStorage kaydetmek için habitStore gerekli  id ve değerler gönderiliyor.
    const saveCheckedState = () => {
      const currentCheckedState = habitStore.loadCheckedState(`habit-${props.habit.id}-checked`);

      if (checked.value !== currentCheckedState) {
        // Check edilen durumu kaydet
        habitStore.saveCheckedState(`habit-${props.habit.id}-checked`, checked.value);

        if (checked.value) {
          // Eğer checkbox işaretlenmişse, tarihi ekle
          habitStore.saveCheckedDate(props.habit.id, today);
          emit('checkboxToggled', true); // Durum değişikliği bildirimi
        } else {
          // Checkbox işareti kaldırılmışsa, tarihi sil
          habitStore.deleteCheckedDate(props.habit.id, today);
          emit('checkboxToggled', false); // Durum değişikliği bildirimi
        }
      }
    };


    const loadCheckedState = () => {
      checked.value = habitStore.loadCheckedState(`habit-${props.habit.id}-checked`);
    };

    onMounted(() => {
      loadCheckedState();
      saveCheckedState();
    });

    return {
      ...toRefs(props),
      isEditingLocal,
      updatedHabit,
      checked,
      isEditButton,
      // openUpdate,
      saveEdit,
      cancelEdit,
      delete_Status,
      saveCheckedState,
      checkbox,
      isCheckedToday,
      habitNameError,
      habitStartDateError,
      successMessage,
      errorMessage,
      validateForm,
      openUpdate,
    };
  },
};

</script>

<style scoped>
.completed {
  background-color: #3da53d;
  /* İstediğiniz arka plan rengi */
}

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