<!-- client/src/components/tickets/PaymentForm.vue -->
<template>
  <div class="payment-form">
    <h2>Payment Details</h2>
    
    <div class="form-group">
      <label>Full Name</label>
      <input v-model="form.name" type="text" required />
    </div>
    
    <div class="form-group">
      <label>Email</label>
      <input v-model="form.email" type="email" required />
    </div>
    
    <div class="form-group">
      <label>Phone (optional)</label>
      <input v-model="form.phone" type="tel" />
    </div>
    
    <div class="form-group">
      <label>Card Details</label>
      <div id="card-element" class="card-element"></div>
      <div id="card-errors" class="card-errors" v-if="error">{{ error }}</div>
    </div>
    
    <div class="total-amount">
      <h3>Total to pay: €{{ totalAmount }}</h3>
    </div>
    
    <div class="actions">
      <button @click="$emit('back')" class="back-btn">← Back</button>
      <button 
        @click="processPayment" 
        :disabled="loading"
        class="pay-btn"
      >
        {{ loading ? 'Processing...' : `Pay €${totalAmount} →` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { stripePromise } from '../../services/stripe';
import { createPaymentIntent, confirmPayment } from '../../services/api';

const props = defineProps<{
  ticketType: string;
  quantity: number;
  visitDate: string;
  totalAmount: number;
}>();

const emit = defineEmits(['back', 'success']);

const form = ref({
  name: '',
  email: '',
  phone: ''
});

const loading = ref(false);
const error = ref('');
let stripe: any;
let elements: any;
let cardElement: any;

onMounted(async () => {
  stripe = await stripePromise;
  elements = stripe.elements();
  
  cardElement = elements.create('card', {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        '::placeholder': {
          color: '#aab7c4'
        }
      }
    }
  });
  
  cardElement.mount('#card-element');
  
  cardElement.on('change', (event: any) => {
    error.value = event.error ? event.error.message : '';
  });
});

const processPayment = async () => {
  if (!form.value.name || !form.value.email) {
    error.value = 'Please fill in all fields';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    // Create payment intent
    const intent = await createPaymentIntent({
      ticketType: props.ticketType,
      quantity: props.quantity,
      visitDate: props.visitDate,
      email: form.value.email,
      name: form.value.name,
      phone: form.value.phone
    });
    
    // Confirm payment with Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      intent.clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: form.value.name,
            email: form.value.email
          }
        }
      }
    );
    
    if (stripeError) {
      throw new Error(stripeError.message);
    }
    
    // Confirm with backend
    const confirmation = await confirmPayment({
      paymentIntentId: paymentIntent.id,
      sessionId: intent.sessionId
    });
    
    emit('success', confirmation.ticket);
    
  } catch (err: any) {
    error.value = err.message || 'Payment failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.payment-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: white;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.card-element {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.card-errors {
  color: #dc3545;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.total-amount {
  text-align: right;
  color: white;
  margin: 2rem 0;
}

.actions {
  display: flex;
  gap: 1rem;
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

.pay-btn {
  flex: 2;
  padding: 1rem;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.1rem;
}

.pay-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>