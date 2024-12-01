<template>
  <div>
    <div class="container2">
      <h5 style="margin-left: 1.4rem;" class="titlePage">Statistics</h5>
    </div>
    <div class="containerStats">
      <div class="card habitListStats">
        <div v-for="habit in habits" :key="habit.id" class="col-12 mb-2 habitListStatsItem">
          <div class=" habitListStatsItemName">
            <!-- Her alışkanlık için HabitItem ve HabitStats bileşenlerini oluştur -->
            <HabitItem :layout="layout" :habit="habit" :is-description="false" :is-edit-btn="false" :is-checkbox="false"
              style="width:100%;" />
          </div>
          <div class=" habitListStatsItemStats">
            <HabitCalendar style="width:25%;" :layout="layout" :habit="habit" :habit-id="habit.id" />
            <HabitStats style="width:80%;" :layout="layout" :size="310" :habit="habit" :habit-id="habit.id"
              :checked-dates="habitStore.checkedDates[habit.id]" :currentSeries="false" :title="false"
              @longeStreak="handleData" />
          </div>
        </div>
      </div>
      <div class="theBest">
        <div class="longestSeries">
          <h5 style="margin-top: 1rem;">Habit With The Longest Series</h5>
          <div class="theBestItem">
            <div class="confetti-icon">🎉</div>
            <div class="theBestItem1">
              <div class="name-container">
                <div class="decorative-name">🎉 {{ habitName }} 🎉</div>
              </div>
              <div class="trophy">
                🏆
                <span class="streak-value"><span style="font-size: .5rem;">Longest Series</span><br>{{ habitStreak
                  }}</span>
              </div>
            </div>
            <div class="confetti-icon">🎉</div>
          </div>
        </div>
        <div class="highestCompletionRate">
          <h5 style="margin-top: 1rem;">Highest Completion Rate</h5>
          <div class="theBestItem">
            <div class="name-container">
              <div class="decorative-name">🎉 {{ highestCompletionRateHabit?.name || 0 }} 🎉</div>
            </div>
            <div class="rateStats">
              <div class="circular-progress">
                <svg class="progress-ring" :width="size" :height="size">
                  <circle class="progress-ring__background" :r="radius" :cx="size / 2" :cy="size / 2" />
                  <circle class="progress-ring__circle" :stroke-dasharray="circumference"
                    :stroke-dashoffset="progressOffset" :r="radius" :cx="size / 2" :cy="size / 2" />
                </svg>
                <div class="progress-value">
                  {{ (highestCompletionRateHabit?.completionRate).toFixed(2) || 0 }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HabitItem from '@/components/HabitItem.vue';
import HabitStats from '@/components/HabitStats.vue';
import { computed, ref, onMounted, watchEffect } from 'vue';
import { useHabitStore } from '../stores/habitStore';
import HabitCalendar from '@/components/HabitCalendar.vue';

export default {
  name: 'StatsView',
  components: {
    HabitItem,
    HabitStats,
    HabitCalendar,
  },
  props: {
    size: {
      type: Number,
      default: 120, // Çemberin boyutu
    },
    strokeWidth: {
      type: Number,
      default: 10, // Çemberin kalınlığı
    },

  },
  computed: {
    radius() {
      return (this.size - this.strokeWidth) / 2;
    },
    circumference() {
      return 2 * Math.PI * this.radius;
    },
    progressOffset() {
      return this.circumference * (1 - (this.highestCompletionRateHabit?.completionRate || 0) / 100);
    },
  },
  setup() {
    const habitStore = useHabitStore();
    const habitStreak = ref(null);
    const habitName = ref(null);
    const layout = ref("alternative");
    let arrayObjects = []; // Objeleri tutan array

    // En uzun seri alma
    const handleData = ((data) => {
      // Gelen objeyi array'e ekle
      arrayObjects.push(data);

      // En büyük streak değerini bul
      const maxStreak = Math.max(...arrayObjects.map(obj => obj.streak));

      // Bu değere sahip objeyi bul
      const maxStreakObject = arrayObjects.find(obj => obj.streak === maxStreak);
      if (maxStreakObject) {
        // Data.value'yi en uzun seriye sahip objeyle güncelle
        habitStreak.value = maxStreakObject.streak;
        habitName.value = maxStreakObject.name;
      }
    });


    // Alışkanlıkları computed ile reaktif olarak alın
    const habits = computed(() => habitStore.habits);

    console.log("habits", habits.value);

    // En uzun seriye sahip alışkanlığı hesaplayın
    const longestSeriesHabit = computed(() => {
      return habits.value.reduce((longest, habit) => {
        return habit.series > (longest?.series || 0) ? habit : longest;
      }, null);
    });



    // En yüksek tamamlanma oranına sahip alışkanlığı hesaplayın
    const highestCompletionRateHabit = computed(() => {
      const allHabits = habitStore.habits;
      const rates = allHabits.map(habit => ({
        ...habit,
        completionRate: habitStore.getCompletionRate(habit.id)
      }));

      // En yüksek tamamlanma oranına sahip olanı bulma
      return rates.reduce((max, habit) => habit.completionRate > max.completionRate ? habit : max, rates[0]);
    });


    // Veriler değiştiğinde highestCompletionRateHabit'i güncellemek için watchEffect kullanma
    watchEffect(() => {
      if (habits.value.length > 0) {
        highestCompletionRateHabit.value; // Bu, computed değerini günceller
        console.log(highestCompletionRateHabit.value);
      }
    });

    onMounted(() => {

      habitStore.loadHabits();  // Verileri yüklemek için store'dan metodu çağırıyoruz
      habitStore.loadCheckedDates(); // Eğer checkedDates de varsa bunu da yükle
      habitStore.loadNotes(); // Notlar varsa bunları da yükleyin

    });

    return {
      habits,
      longestSeriesHabit,
      highestCompletionRateHabit,
      habitStore,
      handleData,
      habitName,
      habitStreak,
      layout,
    };
  },
};
</script>

<style></style>
