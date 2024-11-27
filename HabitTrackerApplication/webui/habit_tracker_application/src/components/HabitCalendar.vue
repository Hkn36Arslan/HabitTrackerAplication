<template>
  <div class="card calendar">
    <h3>{{ habit.name }} Monthly Calendar</h3>
    <FullCalendar ref="fullCalendar" :options="calendarOptions" />
  </div>
</template>

<script>
import { ref } from "vue";
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

    // İşaretli tarihleri kontrol eden fonksiyon
    const loadCheckedDate = (date) => {
      return habitStore.loadCheckedDate(props.habitId, date);
    };

    const calendarOptions = ref({
      plugins: [dayGridPlugin, interactionPlugin],
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth",
      },
      initialView: "dayGridMonth",
      dayCellDidMount: (info) => {
        // Tarihi UTC olarak formatlayarak karşılaştırma yapıyoruz
        const dateStr = new Date(Date.UTC(info.date.getFullYear(), info.date.getMonth(), info.date.getDate())).toISOString().split("T")[0];
        if (loadCheckedDate(dateStr)) {

          info.el.classList.add("custom-style"); // Custom style sınıfı ekleniyor
        }
      },
    });

    return {
      calendarOptions,
    };
  },
};
</script>
