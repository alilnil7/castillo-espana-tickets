<!-- client/src/components/tickets/DatePicker.vue -->
<template>
  <div class="date-picker">
    <h2>Select Visit Date</h2>
    <div class="calendar">
      <div class="calendar-header">
        <button @click="prevMonth">←</button>
        <h3>{{ currentMonth }} {{ currentYear }}</h3>
        <button @click="nextMonth">→</button>
      </div>
      <div class="calendar-weekdays">
        <div v-for="day in weekdays" :key="day">{{ day }}</div>
      </div>
      <div class="calendar-days">
        <div
          v-for="day in days"
          :key="day.date"
          class="calendar-day"
          :class="{
            selected: selectedDate === day.date,
            disabled: !day.available,
            today: day.isToday
          }"
          @click="handleDayClick(day)"
        >
          {{ day.day }}
        </div>
      </div>
    </div>
    
    <div class="actions">
      <button @click="$emit('back')" class="back-btn">← Back</button>
      <button 
        @click="emitNext" 
        :disabled="!selectedDate"
        class="next-btn"
      >
        Continue to Payment →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const emit = defineEmits<{
  (e: 'next', date: string): void;
  (e: 'back'): void;
}>();

const selectedDate = ref<string>('');

const currentDate = ref(new Date());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.toLocaleString('default', { month: 'long' }));

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface CalendarDay {
  day: number;
  date: string;
  available: boolean;
  isToday: boolean;
}

const formatDateStr = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const days = computed<CalendarDay[]>(() => {
  const year = currentYear.value;
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay() || 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysArray: CalendarDay[] = [];
  
  // Previous month days
  for (let i = startDay - 1; i > 0; i--) {
    const date = new Date(year, month, -i + 1);
    const dateStr = formatDateStr(date);
    daysArray.push({
      day: date.getDate(),
      date: dateStr,
      available: false,
      isToday: false
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dateStr = formatDateStr(date);
    const isAvailable = date >= today;
    daysArray.push({
      day: i,
      date: dateStr,
      available: isAvailable,
      isToday: dateStr === formatDateStr(today)
    });
  }
  
  return daysArray;
});

const handleDayClick = (day: CalendarDay): void => {
  if (day.available && day.date) {
    selectedDate.value = day.date;
  }
};

const emitNext = (): void => {
  if (selectedDate.value) {
    emit('next', selectedDate.value);
  }
};

const prevMonth = (): void => {
  currentDate.value = new Date(currentYear.value, currentDate.value.getMonth() - 1);
};

const nextMonth = (): void => {
  currentDate.value = new Date(currentYear.value, currentDate.value.getMonth() + 1);
};
</script>

<style scoped>
.date-picker {
  max-width: 500px;
  margin: 0 auto;
}

.calendar {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  margin: 2rem 0;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-header button {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.calendar-day {
  text-align: center;
  padding: 0.8rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.calendar-day:hover:not(.disabled) {
  background: #f0f0f0;
}

.calendar-day.selected {
  background: #667eea;
  color: white;
}

.calendar-day.disabled {
  color: #ccc;
  cursor: not-allowed;
}

.calendar-day.today {
  border: 2px solid #667eea;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.back-btn {
  flex: 1;
  padding: 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.next-btn {
  flex: 2;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>