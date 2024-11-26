<template>
  <div class="card calendar">
    <h3>{{ habit.name }} Monthly Calendar</h3>
    <!-- FullCalendar bileşeni -->
    <FullCalendar ref="fullCalendar" :options="calendarOptions" />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useHabitStore } from "../stores/habitStore";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default {
  components: {
    FullCalendar,
  },
  props: {
    habitId: {
      type: Number,
      required: true,
    },
    habit: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const habitStore = useHabitStore();
    const dates = ref([]);


    // Habit store'dan işaretli tarihler ile ilgili bilgileri almak
    const loadCheckedDate = (date) => {
      console.log("Kontrol ediliyor: ", date);
      // habitStore.loadCheckedDate fonksiyonunu doğru şekilde çağırdığınızı kontrol edin
      const isChecked = habitStore.loadCheckedDate(props.habitId, date);
      console.log("loadCheckedDate sonucu: ", isChecked); // Burada sonucu konsola yazdırın
      return isChecked;
    };

    const calendarOptions = ref({
      plugins: [dayGridPlugin, interactionPlugin],
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth",
      },
      initialView: "dayGridMonth",
      dateClick: (info) => {
        console.log("Date clicked: ", info.dateStr);  // Date clicked kontrolü
      },
      dayCellDidMount: (info) => {
        console.log("Date from FullCalendar: ", info.dateStr);  // Bu dateStr'in neden undefined olduğunu görmek için
        if (info.dateStr) {
          console.log("FullCalendar Date is not undefined!");
        } else {
          console.error("FullCalendar Date is undefined");
        }

        // Eğer tarih işaretlenmişse, yeşil arka plan uygula
        if (loadCheckedDate(info.dateStr)) {
          info.el.style.backgroundColor = "#2dce89"; // Yeşil renk
          info.el.style.color = "#ffffff"; // Beyaz yazı rengi
          info.el.style.border = "1px solid #1a7739"; // Kenarlık
        } else {
          info.el.style.backgroundColor = ""; // Varsayılan renk
          info.el.style.color = ""; // Varsayılan renk
          info.el.style.border = ""; // Varsayılan kenarlık
        }
      },
    });


    // Ayın tüm tarihlerini oluşturma fonksiyonu
    const generateMonthDates = () => {
      const today = new Date();
      const firstDayOfMonth = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), 1)
      );
      const lastDayOfMonth = new Date(
        Date.UTC(today.getFullYear(), today.getMonth() + 1, 0)
      );

      const currentDate = new Date(firstDayOfMonth);
      while (currentDate <= lastDayOfMonth) {
        dates.value.push(currentDate.toISOString().split("T")[0]); // YYYY-MM-DD formatında tarih
        currentDate.setDate(currentDate.getDate() + 1);
      }
    };

    // Bileşen yüklendiğinde tarihleri oluştur
    onMounted(() => {
      generateMonthDates();
    });

    return {
      calendarOptions,
      loadCheckedDate,
      dates,
    };
  },
};
</script>

<style scoped>
.completed {
  background-color: #2dce89;
  color: white;
  border: 1px solid #1a7739;
}
</style>
