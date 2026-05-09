import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Loading',
    component: () => import('../views/LoadingPage.vue'),
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
  },
  {
    path: '/city/:city',
    name: 'CityMap',
    component: () => import('../views/CityMapPage.vue'),
  },
  {
    path: '/temple/:id',
    name: 'TempleDetail',
    component: () => import('../views/TempleDetailPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundPage.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
