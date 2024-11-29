<template>
  <div class="card calendar">
    <div class="card-body">
      <!-- Takvim -->
      <VCalendar :locale="'en'" :attributes="calendarAttributes" expanded />
    </div>
    <div class="totalDays">
      <h4>Total Number Of Days</h4> <span style=" margin-left: .5rem; color: #f72d66; font-size: 2rem;"> {{ data
        }}</span>
    </div>
  </div>
</template>

<script>
import { onMounted, computed, watch } from "vue";
import { useHabitStore } from "../stores/habitStore";
import { VCalendar } from "v-calendar";

export default {
  components: {
    VCalendar,
  },
  props: {
    habitId: {
      type: Number,
      required: true,
    },
    data: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const habitStore = useHabitStore();

    // Store'dan işaretli tarihleri al ve reaktif olarak izle
    const checkedDatesCopy = computed(() => {
      const dates = habitStore.checkedDates[props.habitId] || new Set();
      return Array.from(dates);
    });

    console.log("checkedDatesCalendar", checkedDatesCopy.value);

    // Takvim için özellikleri ayarla
    const calendarAttributes = computed(() => [
      {
        key: "checked-dates",
        dates: checkedDatesCopy.value, // İşaretli tarihleri Pinia'dan al
        highlight: {
          color: "green", // Kenar rengi yok
          fillMode: "",     // Arka plan yok
        },
        popover: {
          label: "Habit Completed", // Popup etiketi
        },
      },
    ]);

    // İşaretli tarihler güncellendiğinde takvimi de güncelle
    watch(checkedDatesCopy, (newDates) => {
      habitStore.saveCheckedDates(props.habitId, new Set(newDates)); // Yeni tarihleri sakla
      console.log("Updated checkedDates in calendar:", newDates);
    });

    // İlk yükleme sırasında kontrol
    onMounted(() => {
      console.log("Mounted, checked dates loaded:", checkedDatesCopy.value);
    });

    return {
      calendarAttributes,
    };
  },
};
</script>
