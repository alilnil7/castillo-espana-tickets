import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import TicketsView from '../views/TicketsView.vue';
import MapView from '../views/MapView.vue';
import GuideView from '../views/GuideView.vue';
import SupportView from '../views/SupportView.vue';

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/tickets', name: 'Tickets', component: TicketsView },
  { path: '/map', name: 'Map', component: MapView },
  { path: '/guide', name: 'Guide', component: GuideView },
  { path: '/support', name: 'Support', component: SupportView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;