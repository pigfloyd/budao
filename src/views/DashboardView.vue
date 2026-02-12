<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore'
import { computed } from 'vue'
import { format } from 'date-fns'

const store = useTaskStore()
const pendingTasks = computed(() => store.tasks.filter(t => t.status !== 'done'))
const completedTasks = computed(() => store.tasks.filter(t => t.status === 'done'))
const upcomingTasks = computed(() => 
  [...pendingTasks.value]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)
)
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-gray-500 text-xs font-medium uppercase tracking-wider">待辦</h3>
        <p class="text-3xl font-bold text-blue-600 mt-2">{{ pendingTasks.length }}</p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-gray-500 text-xs font-medium uppercase tracking-wider">已完成</h3>
        <p class="text-3xl font-bold text-green-600 mt-2">{{ completedTasks.length }}</p>
      </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h2 class="text-sm font-semibold text-gray-700">即將截止</h2>
      </div>
      <div v-if="upcomingTasks.length === 0" class="p-4 text-center text-gray-500 text-sm">
        無即將截止的任務
      </div>
      <ul v-else class="divide-y divide-gray-100">
        <li v-for="task in upcomingTasks" :key="task.id" class="px-4 py-3">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-gray-900 line-clamp-1">{{ task.title }}</p>
              <p class="text-xs text-gray-500 mt-1">截止：{{ format(new Date(task.dueDate), 'yyyy/MM/dd') }}</p>
            </div>
            <span :class="{
              'bg-red-100 text-red-700': task.priority === 'high',
              'bg-yellow-100 text-yellow-700': task.priority === 'medium',
              'bg-blue-100 text-blue-700': task.priority === 'low'
            }" class="px-2 py-0.5 rounded-full text-xs font-medium">
              {{ task.priority === 'high' ? '高' : (task.priority === 'medium' ? '中' : '低') }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
