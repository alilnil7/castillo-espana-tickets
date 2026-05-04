<!-- client/src/components/tickets/TicketConfirmation.vue -->
<template>
  <div class="ticket-confirmation">
    <div class="success-icon">✅</div>
    <h2>Payment Successful!</h2>
    <p>Your tickets have been booked. Show this QR code at the entrance.</p>
    
    <div class="qr-container">
      <img :src="ticket.qrCode" alt="QR Code" />
    </div>
    
    <div class="ticket-details">
      <div class="detail">
        <span class="label">Ticket Type:</span>
        <span class="value">{{ ticket.packName }}</span>
      </div>
      <div class="detail">
        <span class="label">Quantity:</span>
        <span class="value">{{ ticket.quantity }}</span>
      </div>
      <div class="detail">
        <span class="label">Visit Date:</span>
        <span class="value">{{ formatDate(ticket.visitDate) }}</span>
      </div>
      <div class="detail">
        <span class="label">Total Paid:</span>
        <span class="value">€{{ ticket.amount }}</span>
      </div>
    </div>
    
    <button @click="downloadTicket" class="download-btn">
      📥 Download Ticket
    </button>
    
    <button @click="resetAndContinue" class="continue-btn">
      Back to Home →
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  ticket: any;
}>();

const emit = defineEmits(['reset']);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const downloadTicket = () => {
  const link = document.createElement('a');
  link.download = `ticket-${props.ticket.id}.png`;
  link.href = props.ticket.qrCode;
  link.click();
};

const resetAndContinue = () => {
  emit('reset');
};
</script>

<style scoped>
.ticket-confirmation {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.qr-container {
  margin: 2rem 0;
  padding: 1rem;
  background: white;
  display: inline-block;
  border-radius: 10px;
}

.qr-container img {
  width: 200px;
  height: 200px;
}

.ticket-details {
  text-align: left;
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.detail {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dee2e6;
}

.detail:last-child {
  border-bottom: none;
}

.label {
  font-weight: bold;
  color: #495057;
}

.value {
  color: #667eea;
  font-weight: bold;
}

.download-btn {
  width: 100%;
  padding: 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 10px;
  margin-bottom: 1rem;
  cursor: pointer;
}

.continue-btn {
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
</style>