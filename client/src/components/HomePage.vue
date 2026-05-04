<!-- client/src/components/HomePage.vue -->
<template>
  <div class="home">
    <div class="hero">
      <h1>Welcome to Castillo de España</h1>
      <p>Discover centuries of history, architecture, and culture</p>
    </div>

    <div class="actions-grid">
      <div class="action-card" @click="goToTickets">
        <div class="card-icon">🎫</div>
        <h2>Buy Tickets</h2>
        <p>Purchase your entry tickets online</p>
        <button class="action-btn">Get Tickets →</button>
      </div>

      <div class="action-card" @click="goToMap">
        <div class="card-icon">🗺️</div>
        <h2>Interactive Map</h2>
        <p>Explore the castle grounds</p>
        <button class="action-btn">Explore →</button>
      </div>

      <div class="action-card" @click="goToGuide">
        <div class="card-icon">🎧</div>
        <h2>Virtual Guide</h2>
        <p>Audio and video tours</p>
        <button class="action-btn">Listen →</button>
      </div>

      <div class="action-card" @click="goToSupport">
        <div class="card-icon">❓</div>
        <h2>Questions</h2>
        <p>FAQ and customer support</p>
        <button class="action-btn">Ask →</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToTickets = () => router.push('/tickets');
const goToMap = () => router.push('/map');
const goToGuide = () => router.push('/guide');
const goToSupport = () => router.push('/support');
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.action-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.action-card h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.action-card p {
  color: #666;
  margin-bottom: 1.5rem;
}

.action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: opacity 0.3s ease;
}

.action-btn:hover {
  opacity: 0.9;
}
</style>