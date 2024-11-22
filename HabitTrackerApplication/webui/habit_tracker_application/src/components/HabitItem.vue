<template>
  <div :class="layoutClass">
    <div>
      <!-- Offcanvas Arka Plan Karartması -->
      <div v-if="isUpdateVisibleProps" class="offcanvas-backdrop fade show"></div>

      <div v-if="isUpdateVisibleProps" class="offcanvas offcanvas-start show" tabindex="-1" id="offcanvasAddHabit"
        aria-labelledby="offcanvasAddHabitLabel" role="dialog">
        <div class="offcanvas-header border-bottom" style="position: relative;">
          <h5 id="offcanvasAddHabitLabel" class="offcanvas-title">Add New Habits</h5>
          <button class="closeBtn" type="button" @click="openUpdate" aria-label="Close">X</button>
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
            id="updateHabitForm" novalidate>
            <div class="mb-4 fv-plugins-icon-container">
              <label class="form-label" for="habit-name">Habit Name</label>
              <input v-model="updatedHabit.name" class="form-control mb-4" placeholder="Habit Name"
                :class="{ 'input-error': habitNameError }" />
              <small v-if="habitNameError" class="error-message">
                {{ habitNameError }}
              </small>
            </div>

            <div class="mb-4 fv-plugins-icon-container">
              <label class="form-label" for="habit-description">Description</label>
              <input type="text" class="form-control" id="habit-description" placeholder="Description"
                v-model="updatedHabit.description" />
            </div>

            <div class="mb-4 fv-plugins-icon-container">
              <label class="form-label" for="habit-start-date">Start Date</label>
              <input type="date" class="form-control" id="habit-start-date" v-model="updatedHabit.startDate"
                :class="{ 'input-error': habitStartDateError }" />
              <small v-if="habitStartDateError" class="error-message">
                {{ habitStartDateError }}
              </small>
            </div>

            <div class="mb-4 fv-plugins-icon-container">
              <label class="form-label" for="habit-goal">Goal</label>
              <input type="text" class="form-control" id="habit-goal" placeholder="Goal" v-model="updatedHabit.goal" />
            </div>

            <button type="submit" class="btn btn-success me-3 data-submit waves-effect waves-light">
              Update
            </button>
            <button @click="openUpdate" style="width: 48%;" type="reset" class="btn btn-secondary waves-effect">
              Cancel
            </button>
          </form>
        </div>
      </div>

      <!-- ****************************************************************************** -->
      <div class="card cardItem ">
        <div class="card Item">
          <div class="card checkbox" v-if="checkbox">
            <!-- Elementin görünür olup olmamasını sağlamak için v-if yapısı kullanıldı.-->
            <input type="checkbox" v-model="checked" @change="saveCheckedState"
              :class="{ completed: isCheckedToday }" />
            <span>Completed ✓ </span>
            <!--  :class="{ completed: isCheckedToday }" eğer isCheckedToday true dönerse elemente completed olarak class ekle -->
            <!-- v-model: checkbox'ın işaretlenme durumunu kontrol eder./ @change="saveCheckedState": işaretlenmeyi localStorage kaydetmek için fonksiyona yönlendirir. -->
          </div>
          <div class="group">
            <div class="card  name">
              <h2 style="color: #00bad1;margin-left: 1rem;">{{ habit.name }}</h2>
              <!-- props olarak alınan objenin özelliği -->
            </div>
            <div class="card edit" v-if="isEditButton">
              <button class="btn btn-primary">
                <!-- Butondaki router-link yapısına tıklayınca HabitDetail sayfasına yönlendirir. -->
                <router-link :to="{ name: 'HabitDetail', params: { habitId: habit.id } }"
                  style="text-decoration: none; color: white;">
                  <i class="bi bi-eye" style="display: block; color: #7367f0; width: 100%;"></i>
                </router-link>
              </button>
            </div>
          </div>
          <div class="card description" v-if="isDescription">
            <!-- Açıklama -->
            <p>
              <i class="bi bi-card-text"></i>
              {{ habit.description }}
            </p>

            <!-- Hedef -->
            <p>
              <i class="bi bi-flag"></i>
              <strong style="color: #28c76f;">Goal :</strong> {{ habit.goal }}
            </p>

            <!-- Başlangıç Tarihi -->
            <p>
              <i class="bi bi-calendar-event"></i>
              <strong style="color: #ff4c51;">Start :</strong> {{ habit.startDate }}
            </p>
          </div>
        </div>
        <div class="detail" v-if="isEditingLocal"> <!-- Düzenleme alanının görünürlüğünü ayarlanmıştır. -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useHabitStore } from '../stores/habitStore';
import { ref, onMounted, toRefs, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

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
  emits: ["close", "delete"],

  setup(props, { emit }) { // emit'i parametre olarak ekleyin
    const habitStore = useHabitStore();
    const isEditingLocal = ref(props.isEditing); // reaktif değişken oluşturuluyor.
    const isEditButton = ref(props.isEditBtn); // reaktif değişkenlerin değerinde bir güncelleme olduğunda bağlı olduğu tüm bileşen ve süreçlerde otomatik olarak değişikliğin yansıtılmasına olanak sağlar.
    const updatedHabit = ref({ ...props.habit });
    const checked = ref(false);
    const checkbox = ref(props.isCheckbox);
    const router = useRouter();
    const isUpdateVisible = ref(props.isUpdateVisibleProps);
    const today = new Date().toISOString().split('T')[0];
    const habitNameError = ref("");
    const habitStartDateError = ref("");
    const successMessage = ref("");
    const errorMessage = ref("");

    const delete_Status = ref(props.deleteStatus);

    console.log("props", delete_Status.value);

    watch(
      isUpdateVisible,
      (newValue) => {
        isUpdateVisible.value = newValue;
      });

    watch(
      () => props.deleteStatus,
      (newValue) => {
        delete_Status.value = newValue;
        console.log("Prop deleteStatus değişti:", newValue);

        if (delete_Status.value) {

          console.log("deleteHabitFunction içerisine girildi");

          habitStore.deleteHabit(props.habit.id);

          emit("delete", delete_Status.value);

          router.push({ name: 'Home' });
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
      loadCheckedState();
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

    // reaktif değişkendeki değeri habitStore gönderiyor.
    const saveEdit = () => {
      habitStore.updateHabit(updatedHabit.value);
      isEditingLocal.value = false; //  Sonrasında güncelleme alanını gizler.
    };

    // işlemi kaydedip Home sayfasına yönlendirir.
    const cancelEdit = () => {
      saveEdit();
      emit("close", isUpdateVisible.value);
    };


    // habitin checkbox işaretlenmesini localStorage kaydetmek için habitStore gerekli  id ve değerler gönderiliyor.
    const saveCheckedState = () => {
      const currentCheckedState = habitStore.loadCheckedState(`habit-${props.habit.id}-checked`);
      // Mevcut durum ile değiştirilecek durumu karşılaştırın değer aynı değilse işlem yap.
      if (checked.value !== currentCheckedState) {
        habitStore.saveCheckedState(`habit-${props.habit.id}-checked`, checked.value);
        if (checked.value) {
          habitStore.saveCheckedDate(props.habit.id, today); // checkbox ı işaretlenen habitin ıd si ve bugünün tarihi habitStorage e gönderilerek işaretlendiği tarih localStorage e kaydedilir.
          emit('checkboxToggled', true); //emit yapıları, Vue.js'te bir bileşenden dışarıya olay göndermek için kullanılır. emit kullanarak, üst bileşenlere veya Vue Router gibi başka bileşenlere belirli bir durumu veya olayı bildirebiliriz.
        } else {
          emit('checkboxToggled', checked);
        }
      }
    };

    const loadCheckedState = () => {
      checked.value = habitStore.loadCheckedState(`habit-${props.habit.id}-checked`);
    };

    onMounted(() => {
      loadCheckedState();
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