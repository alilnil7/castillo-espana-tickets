<template>
  <div class="map-view">
    <h1>Interactive Map</h1>
    <CastleMap />
  </div>
</template>

<script setup lang="ts">
import CastleMap from '../components/map/CastleMap.vue';
</script>

<style scoped>
.map-view {
  padding: 2rem;
}

.map-view h1 {
  text-align: center;
  color: white;
  margin-bottom: 1rem;
}
</style>