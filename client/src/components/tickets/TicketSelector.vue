<!-- client/src/components/tickets/TicketSelector.vue -->
<template>
  <div class="ticket-selector">
    <h2>Select Your Tickets</h2>
    <div class="ticket-types">
      <div 
        v-for="ticket in tickets" 
        :key="ticket.id"
        class="ticket-card"
        :class="{ selected: selectedTicket === ticket.id }"
        @click="selectTicket(ticket.id)"
      >
        <div class="ticket-icon">
          {{ ticket.id === 'adult' ? '👤' : ticket.id === 'child' ? '🧒' : '👨‍👩‍👧‍👦' }}
        </div>
        <div class="ticket-info">
          <h3>{{ ticket.name }}</h3>
          <p class="price">{{ ticket.price }} €</p>
          <p class="description" v-if="ticket.id === 'family'">2 adults + 2 children</p>
        </div>
        <div class="ticket-quantity" v-if="ticket.id !== 'family'">
          <button @click.stop="updateQuantity(ticket.id, -1)" :disabled="getQuantity(ticket.id) <= 0">-</button>
          <span>{{ getQuantity(ticket.id) }}</span>
          <button @click.stop="updateQuantity(ticket.id, 1)">+</button>
        </div>
      </div>
    </div>
    
    <div class="total">
      <h3>Total: {{ totalPrice }} €</h3>
    </div>
    
    <button 
      @click="$emit('next', getSelectedData)" 
      :disabled="!hasSelection"
      class="next-btn"
    >
      Continue to Date →
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getTickets } from '../../services/api';

const tickets = ref<any[]>([]);
const selectedTicket = ref('adult');
const quantities = ref({ adult: 1, child: 0 });

const selectTicket = (id: string) => {
  selectedTicket.value = id;
};

const getQuantity = (id: string) => {
  return quantities.value[id as keyof typeof quantities.value] || (id === selectedTicket.value ? 1 : 0);
};

const updateQuantity = (id: string, delta: number) => {
  const newQty = getQuantity(id) + delta;
  if (newQty >= 0 && newQty <= 10) {
    quantities.value[id as keyof typeof quantities.value] = newQty;
    if (newQty > 0) selectedTicket.value = id;
  }
};

const totalPrice = computed(() => {
  let total = 0;
  tickets.value.forEach(ticket => {
    const qty = ticket.id === 'family' ? (selectedTicket.value === 'family' ? 1 : 0) : getQuantity(ticket.id);
    total += ticket.price * qty;
  });
  return total;
});

const hasSelection = computed(() => {
  if (selectedTicket.value === 'family') return true;
  return getQuantity('adult') > 0 || getQuantity('child') > 0;
});

const getSelectedData = computed(() => {
  if (selectedTicket.value === 'family') {
    return { ticketType: 'family', quantity: 1 };
  }
  return { ticketType: selectedTicket.value, quantity: getQuantity(selectedTicket.value) };
});

onMounted(async () => {
  const response = await getTickets();
  tickets.value = response.tickets;
});
</script>

<style scoped>
.ticket-selector {
  max-width: 600px;
  margin: 0 auto;
}

.ticket-types {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
}

.ticket-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.ticket-card.selected {
  border-color: #667eea;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
}

.ticket-icon {
  font-size: 3rem;
  margin-right: 1rem;
}

.ticket-info {
  flex: 1;
}

.ticket-info h3 {
  margin: 0;
  color: #333;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin: 0.5rem 0;
}

.description {
  color: #666;
  font-size: 0.9rem;
}

.ticket-quantity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ticket-quantity button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #667eea;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
}

.ticket-quantity span {
  font-size: 1.2rem;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
}

.total {
  text-align: right;
  padding: 1rem;
  border-top: 2px solid #eee;
  margin-top: 1rem;
}

.next-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>