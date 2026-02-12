<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Task } from '@/db'
import { useTaskStore } from '@/stores/taskStore'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  task?: Task | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', task: Omit<Task, 'id' | 'createdAt'>): void
}>()

const store = useTaskStore()
const availableTasks = computed(() => store.tasks.filter(t => t.id !== props.task?.id))

const formData = ref<Partial<Task>>({
  title: '',
  description: '',
  startDate: '',
  dueDate: '',
  priority: 'medium',
  status: 'todo',
  dependencies: []
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.task) {
      formData.value = { ...props.task }
    } else {
      formData.value = {
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        priority: 'medium',
        status: 'todo',
        dependencies: []
      }
    }
  }
})

async function handleSubmit() {
  if (!formData.value.title) return
  
  if (!props.task) {
    const similar = await store.checkSimilarTasks(formData.value.title!)
    if (similar.length > 0) {
      if (!confirm(`發現 ${similar.length} 個相似任務。是否繼續？`)) return
    }
  }

  // Ensure dependencies is array
  if (!formData.value.dependencies) formData.value.dependencies = []

  emit('save', formData.value as any)
  emit('update:modelValue', false)
}
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
    <div class="bg-white rounded-t-xl sm:rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 class="text-lg font-bold text-gray-900">{{ task ? '編輯任務' : '新建任務' }}</h2>
        <button @click="$emit('update:modelValue', false)" class="text-gray-400 hover:text-gray-600">
          <X :size="20" />
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">標題</label>
          <input v-model="formData.title" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="例如：文獻綜述" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <textarea v-model="formData.description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
            <input v-model="formData.startDate" type="date" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
            <input v-model="formData.dueDate" type="date" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">優先級</label>
          <select v-model="formData.priority" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">依賴任務</label>
          <div class="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
            <div v-if="availableTasks.length === 0" class="text-gray-400 text-sm">無其他可用任務</div>
            <div v-for="t in availableTasks" :key="t.id" class="flex items-center mb-1">
              <label class="flex items-center space-x-2 cursor-pointer w-full hover:bg-gray-50 p-1 rounded">
                <input type="checkbox" :value="t.id" v-model="formData.dependencies" class="rounded text-blue-600 focus:ring-blue-500" />
                <span class="text-sm text-gray-700">{{ t.title }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="pt-4">
          <button type="submit" class="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors">
            {{ task ? '更新任務' : '創建任務' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
