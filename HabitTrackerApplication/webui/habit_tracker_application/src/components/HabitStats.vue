<template>
  <div :class="layoutClass">
    <div class="habit-stats">
      <div class="stats-container">
        <div class="stats">
          <div class="stat-item1">
            <div v-if="currentSeries" class="stat-item2 card currentSeries">
              <h3 class="card-title">Current Series</h3>
              <span class="value" style="width: 120px; border-radius: 100%; margin: 0 auto; margin-bottom: .5rem;">{{
                currentStreak }}
              </span>
              <h4>DAY</h4>
            </div>
            <div class="stat-item2 card rate">
              <h3>Completed Rate</h3>
              <div class="circular-progress" :style="{ width: size + 'px', height: size + 'px' }">
                <!-- SVG Çizimi -->
                <svg :width="size" :height="size" viewBox="0 0 36 36" class="circular-chart">
                  <!-- Arka plan çemberi -->
                  <path class="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <!-- İlerleme çemberi -->
                  <path class="circle" :stroke="color" :stroke-dasharray="progress + ', 100'"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <!-- Yüzdelik oran -->
                <div class="percentage">{{ completionRate }}%</div>
              </div>
            </div>
          </div>
          <div class="stat-item4">
            <div class="stat-item3 card">
              <h3 class="card-title">Longest Series</h3>
              <div class="longest">
                <span class="value" style="width: 120px; border-radius: 100%; margin: 0 auto;">{{
                  longestStreak
                }}</span>
                <h4>DAY</h4>
                <ColumnChart class="ColumnChart" :xAxis="myChart.xAxis" :series="myChart.series" :yAxis="myChart.yAxis"
                  :plotOptions="myChart.plotOptions" :Chart="myChart.chart" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent, onMounted } from 'vue';
import { ColumnChart } from 'vuejs3-highcharts';
import { useHabitStore } from "../stores/habitStore";

export default defineComponent({
  name: 'HabitStats',
  components: {
    ColumnChart,
  },
  emits: ['longeStreak', 'updateData'],
  props: {
    habit: {
      type: Object,
      required: true,
    },
    habitId: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      default: '#2dce89',
    },
    size: {
      type: Number,
      default: 265,
    },

    currentSeries: {
      type: Boolean,
      default: true,
    },
    title: {
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
  setup(props, { emit }) {
    const habitStore = useHabitStore();
    // Work with a local copy of checkedDates to avoid mutating the prop
    const checkedDatesCopy = computed(() => {
      const dates = habitStore.checkedDates[props.habitId] || new Set();
      return Array.from(dates);
    });


    const totalDaysCompleted = computed(() => checkedDatesCopy.value.length);

    const completionRate = computed(() => {
      const rate = ((checkedDatesCopy.value.length / 30) * 100);
      return rate % 1 === 0 ? rate : rate.toFixed(2);
    });

    const progress = completionRate;

    // Güncel seri hesabı
    const currentStreak = computed(() => {
      // Son eklenen ardışık grup (en güncel seri)
      const latestGroup = streakGroups.value[streakGroups.value.length - 1];

      // Eğer grupta eleman varsa, o grubun uzunluğunu döndür, yoksa 0 döndür
      return latestGroup ? latestGroup.length : 0;
    });

    const totalDaysArray = computed(() => {
      return Array.from({ length: 30 }, (_, index) => ({
        completed: checkedDatesCopy.value.some(date => {
          const dateDay = new Date(date).getDate();
          return dateDay === index + 1;
        }),
      }));
    });

    // Ardışık grupları oluştur
    const streakGroups = computed(() => {
      let groups = [];
      let currentGroup = [];
      let lastDate = null;

      Array.from(checkedDatesCopy.value).sort().forEach(date => {
        if (lastDate && isConsecutive(lastDate, date)) {
          currentGroup.push(date);
        } else {
          if (currentGroup.length > 0) {
            groups.push([...currentGroup]);
          }
          currentGroup = [date];
        }
        lastDate = date;
      });

      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }

      return groups;
    });

    // En uzun ardışık grupları bul
    const longestStreakGroups = computed(() => {
      const maxLength = Math.max(...streakGroups.value.map(group => group.length));
      return streakGroups.value.filter(group => group.length === maxLength);
    });

    const longestStreak = computed(() => longestStreakGroups.value[0]?.length || 0);

    function isConsecutive(date1, date2) {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      return (d2 - d1) === 86400000;
    }

    // En yeni grup için canlı kırmızı (#f72d66), diğerleri için soluk renk
    function getLineColor(isLatest) {
      if (isLatest) {
        // En güncel grup için daha canlı kırmızı
        return `rgb(247, 45, 102)`; // Koyu kırmızı (#f72d66)
      } else {
        // Eski gruplar için daha soluk kırmızı
        return `rgb(247, 145, 182)`; // Soluk kırmızı tonu
      }
    }


    const myChart = computed(() => {
      // En güncel grup (son grup)
      const latestGroupIndex = streakGroups.value.length - 1;

      return {
        chart: {
          type: 'line',
          backgroundColor: "transparent",
        },
        xAxis: {
          categories: checkedDatesCopy.value.map(date => new Date(date).toLocaleDateString()), // Bütün tarihleri xAxis'e ekle
          tickmarkPlacement: 'on',
          minRange: 1,
          maxRange: 1,
        },
        yAxis: {
          title: {
            text: 'Habit Progress'
          },
          labels: {
            enabled: true,
          },
        },
        plotOptions: {
          series: {
            lineWidth: 3,
            marker: {
              enabled: true,
              symbol: 'triangle',
              radius: 6,
            },
            states: {
              hover: {
                enabled: true,
                lineWidthPlus: 2,
              }
            }
          },
        },
        series: streakGroups.value.map((group, index) => ({
          type: 'line',
          color: getLineColor(index, index === latestGroupIndex), // En güncel grup için canlı kırmızı, diğerleri soluk
          data: checkedDatesCopy.value.map(date => group.includes(date) ? 1 : null), // Grup içindeki tarihler 1, diğerleri null
          lineWidth: 2,
          marker: {
            enabled: true,
            symbol: 'triangle',
            radius: 6,
          },
        })),
      };
    });

    const postLongeStreak = (() => {
      emit("longeStreak", { name: props.habit.name, streak: longestStreak.value });
      emit("updateData", totalDaysCompleted.value);
    });

    onMounted(() => {
      postLongeStreak();
    });

    return {
      totalDaysCompleted,
      longestStreak,
      currentStreak,
      completionRate,
      totalDaysArray,
      progress,
      myChart,
      postLongeStreak,
      habitStore,
    };
  },
});
</script>