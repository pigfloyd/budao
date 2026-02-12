<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns'
import type { Task } from '@/db'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const store = useTaskStore()
const currentDate = ref(new Date())

const days = computed(() => {
  const start = startOfWeek(startOfMonth(currentDate.value))
  const end = endOfWeek(endOfMonth(currentDate.value))
  return eachDayOfInterval({ start, end })
})

function prevMonth() {
  currentDate.value = subMonths(currentDate.value, 1)
}

function nextMonth() {
  currentDate.value = addMonths(currentDate.value, 1)
}

function isCurrentMonth(date: Date) {
  return format(date, 'M') === format(currentDate.value, 'M')
}

const tasksByDate = computed(() => {
  const map = new Map()
  store.tasks.forEach(task => {
    const date = task.dueDate
    if (!map.has(date)) map.set(date, [])
    map.get(date).push(task)
  })
  return map
})

function getTasksForDay(date: Date) {
  const dateStr = format(date, 'yyyy-MM-dd')
  return tasksByDate.value.get(dateStr) || []
}

const minDate = computed(() => {
    if (store.tasks.length === 0) return new Date()
    return new Date(Math.min(...store.tasks.map(t => new Date(t.startDate).getTime())))
})

const maxDate = computed(() => {
    if (store.tasks.length === 0) return new Date()
    return new Date(Math.max(...store.tasks.map(t => new Date(t.dueDate).getTime())))
})

const totalDuration = computed(() => {
    const diff = maxDate.value.getTime() - minDate.value.getTime()
    return diff === 0 ? 86400000 : diff // default 1 day if 0
})

function getTaskStyle(task: Task) {
    const start = new Date(task.startDate).getTime()
    const end = new Date(task.dueDate).getTime()
    const min = minDate.value.getTime()
    
    const left = ((start - min) / totalDuration.value) * 100
    const width = ((end - start) / totalDuration.value) * 100
    
    return {
        left: `${left}%`,
        width: `${Math.max(width, 5)}%` // Minimum 5% width for visibility
    }
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-800">日曆 ({{ format(currentDate, 'yyyy年MM月') }})</h2>
        <div class="flex items-center space-x-2">
          <button @click="prevMonth" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft :size="20" />
          </button>
          <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight :size="20" />
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-7 gap-1 text-center mb-2">
        <div v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="text-xs font-medium text-gray-500">
          {{ day }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <div v-for="day in days" :key="day.toString()" 
             class="aspect-square bg-white border border-gray-100 rounded-lg p-1 relative hover:shadow-md transition-shadow"
             :class="{'opacity-40': !isCurrentMonth(day)}">
          <span class="text-xs text-gray-700 block mb-1" :class="{'font-bold text-blue-600': isSameDay(day, new Date())}">{{ format(day, 'd') }}</span>
          
          <div class="space-y-0.5 overflow-hidden h-[calc(100%-1.5rem)]">
            <div v-for="task in getTasksForDay(day)" :key="task.id" 
                 class="text-[8px] leading-tight bg-blue-50 text-blue-700 px-1 py-0.5 rounded truncate border border-blue-100">
              {{ task.title }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="store.tasks.length > 0">
        <h3 class="text-lg font-bold mb-4">項目時間軸</h3>
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <div class="relative h-auto min-h-[200px]">
                <div class="flex justify-between text-xs text-gray-400 mb-2 border-b pb-1">
                    <span>{{ format(minDate, 'MM/dd') }}</span>
                    <span>{{ format(maxDate, 'MM/dd') }}</span>
                </div>
                <div class="relative space-y-2">
                    <div v-for="(task, index) in store.tasks" :key="task.id" 
                         class="relative h-6 rounded-md bg-indigo-500 text-white text-xs flex items-center px-2 truncate shadow-sm hover:bg-indigo-600 transition-colors cursor-default"
                         :style="getTaskStyle(task)"
                         :title="`${task.title}: ${task.startDate} to ${task.dueDate}`">
                         {{ task.title }}
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
