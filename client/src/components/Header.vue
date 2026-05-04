<!-- client/src/components/Header.vue -->
<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        <h1>🏰 Castillo de España</h1>
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/tickets" class="nav-link">🎫 Tickets</router-link>
        <router-link to="/map" class="nav-link">🗺️ Map</router-link>
        <router-link to="/guide" class="nav-link">🎧 Virtual Guide</router-link>
        <router-link to="/support" class="nav-link">❓ Support</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
.header {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  font-size: 1.5rem;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-link.router-link-active {
  background: #667eea;
}
</style>