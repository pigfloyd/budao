import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: DashboardView
        },
        {
          path: '/tasks',
          name: 'tasks',
          component: () => import('@/views/TasksView.vue')
        },
        {
          path: '/calendar',
          name: 'calendar',
          component: () => import('@/views/CalendarView.vue')
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue')
        }
      ]
    }
  ]
})

export default router
