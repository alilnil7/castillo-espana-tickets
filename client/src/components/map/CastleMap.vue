<!-- client/src/components/map/CastleMap.vue -->
<template>
  <div class="castle-map">
    <div class="map-controls">
      <div class="mode-switch">
        <button 
          :class="{ active: mode === 'practical' }"
          @click="mode = 'practical'"
        >
          🚗 Practical Mode (Services)
        </button>
        <button 
          :class="{ active: mode === 'exploration' }"
          @click="mode = 'exploration'"
        >
          🏛️ Exploration Mode (History)
        </button>
      </div>
    </div>
    
    <div id="map" class="map-container"></div>
    
    <div v-if="selectedPoint" class="point-details" @click="closeDetails">
      <div class="details-card" @click.stop>
        <h3>{{ selectedPoint.title }}</h3>
        <p>{{ selectedPoint.description }}</p>
        <button @click="closeDetails">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getMapPoints, getPointDetails } from '../../services/api';

// Types
interface MapPoint {
  id: string;
  title: string;
  lat: number;
  lng: number;
  type: string;
  description?: string;
}

interface PointDetails {
  id: string;
  title: string;
  description: string;
  image_url?: string;
}

// Declare google global
declare global {
  interface Window {
    google: any;
  }
}

const mode = ref<string>('practical');
let map: any = null;
let markers: any[] = [];
const selectedPoint = ref<PointDetails | null>(null);

const loadGoogleMaps = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};

const initMap = async (): Promise<void> => {
  await loadGoogleMaps();
  
  map = new window.google.maps.Map(document.getElementById('map'), {
    center: { lat: 48.8566, lng: 2.3522 },
    zoom: 15,
    styles: [
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }]
      }
    ]
  });
  
  await loadPoints();
};

const getMarkerIcon = (type: string): string => {
  const icons: Record<string, string> = {
    tower: 'http://maps.google.com/mapfiles/ms/icons/castle.png',
    entrance: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    service: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
  };
  return icons[type] || 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
};

const loadPoints = async (): Promise<void> => {
  if (!map) return;
  
  const response = await getMapPoints();
  const points: MapPoint[] = response.points;
  
  // Clear existing markers
  markers.forEach((marker: any) => {
    if (marker && marker.setMap) {
      marker.setMap(null);
    }
  });
  markers = [];
  
  // Filter by mode
  const filteredPoints: MapPoint[] = mode.value === 'practical' 
    ? points.filter((p: MapPoint) => p.type === 'service')
    : points.filter((p: MapPoint) => p.type !== 'service');
  
  for (const point of filteredPoints) {
    const marker = new window.google.maps.Marker({
      position: { lat: point.lat, lng: point.lng },
      map: map,
      title: point.title,
      icon: getMarkerIcon(point.type)
    });
    
    marker.addListener('click', async () => {
      const details = await getPointDetails(point.id);
      selectedPoint.value = details.point;
    });
    
    markers.push(marker);
  }
};

const closeDetails = (): void => {
  selectedPoint.value = null;
};

// Watch for mode changes
watch(mode, () => {
  loadPoints();
});

onMounted(() => {
  initMap();
});
</script>

<style scoped>
.castle-map {
  position: relative;
  height: 70vh;
}

.map-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.mode-switch {
  display: flex;
  gap: 10px;
}

.mode-switch button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #f0f0f0;
  transition: all 0.3s ease;
}

.mode-switch button.active {
  background: #667eea;
  color: white;
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: 15px;
}

.point-details {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.details-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.details-card button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>