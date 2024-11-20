<template>
  <div :class="layoutClass">
    <div class="card cardItem ">
      <div class="card Item">
        <div class="card checkbox" v-if="checkbox">
          <!-- Elementin görünür olup olmamasını sağlamak için v-if yapısı kullanıldı.-->
          <input type="checkbox" v-model="checked" @change="saveCheckedState" :class="{ completed: isCheckedToday }" />
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
                <i class="bi bi-eye" style="display: block; width: 100%;"></i>
              </router-link>
            </button>
          </div>
        </div>
        <hr style="width: 100%; color: gray;">
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
        <div :class="['update', { visible: isUpdateVisible }]">
          <!-- Güncelleme formunun görünürlüğünü ayarlanmıştır. -->
          <div class="addHabitNav">
            <h4>Update Habit</h4>
            <span id="closeBtn" @click="closeBtn" class="closeBtn">X</span>
          </div>
          <input style="margin-top: 1rem;" v-model="updatedHabit.name" class="form-control mb-4"
            placeholder="Alışkanlık Adı" />
          <input v-model="updatedHabit.description" class="form-control mb-4" placeholder="Açıklama" />
          <input v-model="updatedHabit.startDate" class="form-control mb-4" type="date"
            placeholder="Başlangıç Tarihi" />
          <input v-model="updatedHabit.goal" class="form-control mb-4" placeholder="Goal" />
          <button style="width: 100%;" @click="saveEdit" class="btn btn-success">Save</button>
        </div>
        <!-- update,cancel ve delete butonları -->
        <div class="butons">
          <button style="width:32%;" @click="openUpdate" class="btn btn-primary ">Update</button>
          <button style="width:32%;" @click="cancelEdit" class="btn btn-secondary ">Cancel</button>
          <button style="width:32%;" @click="deleteHabit" class="btn btn-danger ">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useHabitStore } from '../stores/habitStore';
import { ref, onMounted, toRefs, computed } from 'vue';
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
  },
  computed: {
    layoutClass() {
      return this.layout === 'alternative' ? 'alternative-layout' : 'default-layout';
    }
  },
  setup(props, { emit }) { // emit'i parametre olarak ekleyin
    const habitStore = useHabitStore();
    const isEditingLocal = ref(props.isEditing); // reaktif değişken oluşturuluyor.
    const isEditButton = ref(props.isEditBtn); // reaktif değişkenlerin değerinde bir güncelleme olduğunda bağlı olduğu tüm bileşen ve süreçlerde otomatik olarak değişikliğin yansıtılmasına olanak sağlar.
    const updatedHabit = ref({ ...props.habit });
    const checked = ref(false);
    const checkbox = ref(props.isCheckbox);
    const router = useRouter();
    const isUpdateVisible = ref(false);
    const today = new Date().toISOString().split('T')[0];

    // Bugünkü tarihin işaretli olup olmadığını kontrol eden computed property
    const isCheckedToday = computed(() => {
      // Ensure checkedDates is always an array
      const checkedDates = habitStore.loadCheckedDates(props.habit.id) || []; // Default to an empty array if undefined or null
      return checkedDates.includes(today); // Safe to use .includes now
    });


    // Bu fonksiyon ile güncelleme formunun görünürlüğü sağlanıyor.
    const openUpdate = () => {
      isUpdateVisible.value = !isUpdateVisible.value;
    };
    // güncelleme formunu gizliyor.
    const closeBtn = () => {
      isUpdateVisible.value = !isUpdateVisible.value;
    };
    // reaktif değişkendeki değeri habitStore gönderiyor.
    const saveEdit = () => {
      habitStore.updateHabit(updatedHabit.value);
      isEditingLocal.value = false; //  Sonrasında güncelleme alanını gizler.
      router.push({ name: 'Home' }); // Home sayfasına yönlendiriyor
    };
    // işlemi kaydedip Home sayfasına yönlendirir.
    const cancelEdit = () => {
      saveEdit();
      router.push({ name: 'Home' });
    };
    // habitStore silinecek habitin id sini gönderiyor ve Home sayfasına yönlendiriyor.
    const deleteHabit = () => {
      habitStore.deleteHabit(props.habit.id);
      router.push({ name: 'Home' });
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
      isUpdateVisible,
      isEditButton,
      openUpdate,
      saveEdit,
      cancelEdit,
      deleteHabit,
      saveCheckedState,
      closeBtn,
      checkbox,
      isCheckedToday,
    };
  },
};

</script>

<style scoped>
.completed {
  background-color: #3da53d;
  /* İstediğiniz arka plan rengi */
}
</style>
