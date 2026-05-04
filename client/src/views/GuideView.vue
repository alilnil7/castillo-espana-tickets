<template>
  <div class="guide-view">
    <h1>Virtual Guide</h1>
    <VirtualGuide />
  </div>
</template>

<script setup lang="ts">
import VirtualGuide from '../components/guide/VirtualGuide.vue';
</script>

<style scoped>
.guide-view {
  padding: 2rem;
}

.guide-view h1 {
  text-align: center;
  color: white;
  margin-bottom: 1rem;
}
</style>