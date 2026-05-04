<!-- client/src/components/guide/VirtualGuide.vue -->
<template>
  <div class="virtual-guide">
    <h2>Virtual Audio Guide</h2>
    
    <div class="guide-list">
      <div 
        v-for="item in guideContent" 
        :key="item.id"
        class="guide-item"
        @click="playGuide(item)"
      >
        <div class="guide-icon">🎧</div>
        <div class="guide-info">
          <h3>{{ item.title }}</h3>
          <p>{{ item.duration }}</p>
        </div>
        <div class="play-icon">▶️</div>
      </div>
    </div>
    
    <div v-if="playing" class="audio-player">
      <audio ref="audioPlayerRef" controls autoplay>
        <source :src="playing.audioUrl" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
      <h4>{{ playing.title }}</h4>
      <button @click="stopGuide">Stop</button>
    </div>
    
    <div class="video-section" v-if="currentVideo">
      <h3>Video Tour</h3>
      <video controls width="100%">
        <source :src="currentVideo" type="video/mp4">
        Your browser does not support the video element.
      </video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getGuideContent } from '../../services/api';

// Define types for guide content
interface GuideItem {
  id: string;
  title: string;
  duration: string;
  audioUrl: string;
  videoUrl?: string;
}

const guideContent = ref<GuideItem[]>([
  { id: 'welcome', title: 'Welcome to the Castle', duration: '2:30', audioUrl: '/audio/welcome.mp3' },
  { id: 'history', title: 'History of the Castle', duration: '5:00', audioUrl: '/audio/history.mp3' },
  { id: 'architecture', title: 'Architecture Tour', duration: '3:45', audioUrl: '/audio/architecture.mp3' }
]);

const playing = ref<GuideItem | null>(null);
const audioPlayerRef = ref<HTMLAudioElement | null>(null);
const currentVideo = ref<string | null>(null);

const playGuide = (item: GuideItem): void => {
  playing.value = item;
  // Reset video when playing audio
  currentVideo.value = null;
};

const stopGuide = (): void => {
  if (audioPlayerRef.value) {
    audioPlayerRef.value.pause();
    audioPlayerRef.value.currentTime = 0;
  }
  playing.value = null;
};

onMounted(async () => {
  try {
    const response = await getGuideContent();
    if (response.success && response.content) {
      // Transform API response to match GuideItem interface if needed
      const apiContent = response.content;
      const formattedContent: GuideItem[] = Object.keys(apiContent).map(key => ({
        id: key,
        title: apiContent[key].title,
        duration: apiContent[key].duration,
        audioUrl: apiContent[key].audioUrl,
        videoUrl: apiContent[key].videoUrl
      }));
      if (formattedContent.length) {
        guideContent.value = formattedContent;
      }
    }
  } catch (error) {
    console.error('Failed to load guide content:', error);
  }
});
</script>

<style scoped>
.virtual-guide {
  max-width: 600px;
  margin: 0 auto;
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
}

.guide-item {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 15px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.guide-item:hover {
  transform: translateX(10px);
}

.guide-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.guide-info {
  flex: 1;
}

.guide-info h3 {
  margin: 0;
  color: #333;
}

.guide-info p {
  margin: 0.5rem 0 0;
  color: #666;
}

.play-icon {
  font-size: 1.5rem;
  color: #667eea;
}

.audio-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  text-align: center;
  z-index: 1000;
}

.audio-player audio {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.audio-player h4 {
  margin-top: 0.5rem;
  color: #333;
}

.audio-player button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.video-section {
  margin-top: 2rem;
}

.video-section h3 {
  color: white;
  margin-bottom: 1rem;
}
</style>