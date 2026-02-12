<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore'

const store = useTaskStore()

async function exportData() {
  const data = JSON.stringify(store.tasks, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'thesis-tasks.json'
  a.click()
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">設置</h2>
    
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 bg-gray-50">
        <h3 class="font-semibold text-gray-700">數據管理</h3>
      </div>
      <div class="p-4">
        <p class="text-sm text-gray-500 mb-4">導出您的任務為 JSON 格式以進行備份或外部使用。</p>
        <button @click="exportData" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          導出任務為 JSON
        </button>
      </div>
    </div>
  </div>
</template>
