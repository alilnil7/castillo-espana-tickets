<!-- client/src/views/TicketsView.vue -->
<template>
  <div class="tickets-view">
    <div class="container">
      <TicketSelector 
        v-if="step === 1"
        @next="handleTicketSelected"
      />
      
      <DatePicker 
        v-if="step === 2"
        @back="step = 1"
        @next="handleDateSelected"
      />
      
      <PaymentForm 
        v-if="step === 3"
        :ticketType="bookingData.ticketType"
        :quantity="bookingData.quantity"
        :visitDate="bookingData.visitDate"
        :totalAmount="bookingData.totalAmount"
        @back="step = 2"
        @success="handlePaymentSuccess"
      />
      
      <TicketConfirmation 
        v-if="step === 4"
        :ticket="ticket"
        @reset="resetBooking"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TicketSelector from '../components/tickets/TicketSelector.vue';
import DatePicker from '../components/tickets/DatePicker.vue';
import PaymentForm from '../components/tickets/PaymentForm.vue';
import TicketConfirmation from '../components/tickets/TicketConfirmation.vue';

const step = ref(1);
const bookingData = ref({
  ticketType: '',
  quantity: 1,
  visitDate: '',
  totalAmount: 0
});
const ticket = ref(null);

const handleTicketSelected = (data: any) => {
  bookingData.value.ticketType = data.ticketType;
  bookingData.value.quantity = data.quantity;
  // Calculate total based on type
  const prices: any = { adult: 15, child: 8, family: 35 };
  bookingData.value.totalAmount = prices[data.ticketType] * (data.ticketType === 'family' ? 1 : data.quantity);
  step.value = 2;
};

const handleDateSelected = (date: string) => {
  bookingData.value.visitDate = date;
  step.value = 3;
};

const handlePaymentSuccess = (ticketData: any) => {
  ticket.value = ticketData;
  step.value = 4;
};

const resetBooking = () => {
  step.value = 1;
  bookingData.value = {
    ticketType: '',
    quantity: 1,
    visitDate: '',
    totalAmount: 0
  };
  ticket.value = null;
};
</script>

<style scoped>
.tickets-view {
  min-height: 80vh;
  padding: 2rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}
</style>