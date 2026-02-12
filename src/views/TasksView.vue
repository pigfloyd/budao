<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/db'
import { format } from 'date-fns'
import { Plus, CheckCircle2, Circle, Clock, Trash2, Edit2 } from 'lucide-vue-next'
import TaskForm from '@/components/tasks/TaskForm.vue'

const store = useTaskStore()
const isFormOpen = ref(false)
const editingTask = ref<Task | null>(null)

const tasks = computed(() => store.tasks)

const sortedTasks = computed(() => {
  return [...tasks.value].sort((a, b) => {
    // Sort by status (todo/inprogress -> done)
    if (a.status === 'done' && b.status !== 'done') return 1
    if (a.status !== 'done' && b.status === 'done') return -1
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
})

function openCreateModal() {
  editingTask.value = null
  isFormOpen.value = true
}

function openEditModal(task: Task) {
  editingTask.value = task
  isFormOpen.value = true
}

async function handleSave(taskData: any) {
  if (editingTask.value) {
    await store.updateTask(editingTask.value.id!, taskData)
  } else {
    await store.addTask(taskData)
  }
}

async function toggleStatus(task: Task) {
  const newStatus = task.status === 'done' ? 'todo' : 'done'
  await store.updateTask(task.id!, { status: newStatus })
}

async function deleteTask(task: Task) {
  if (confirm('確定要刪除此任務嗎？')) {
    await store.deleteTask(task.id!)
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">我的任務</h2>
      <button @click="openCreateModal" class="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
        <Plus :size="24" />
      </button>
    </div>

    <div v-if="sortedTasks.length === 0" class="text-center py-10 text-gray-500">
      <p>暫無任務，請創建一個開始吧！</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="task in sortedTasks" :key="task.id" 
           class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group">
        <div class="flex items-center space-x-3 flex-1 min-w-0">
          <button @click="toggleStatus(task)" class="text-gray-400 hover:text-blue-600 transition-colors">
            <CheckCircle2 v-if="task.status === 'done'" class="text-green-500" :size="24" />
            <Circle v-else :size="24" />
          </button>
          
          <div class="flex-1 min-w-0">
            <h3 :class="{'line-through text-gray-400': task.status === 'done'}" class="font-medium text-gray-900 truncate">{{ task.title }}</h3>
            <div class="flex items-center text-xs text-gray-500 mt-1 space-x-2">
              <span class="flex items-center">
                <Clock :size="12" class="mr-1" />
                {{ format(new Date(task.dueDate), 'yyyy/MM/dd') }}
              </span>
              <span :class="{
                'bg-red-100 text-red-700': task.priority === 'high',
                'bg-yellow-100 text-yellow-700': task.priority === 'medium',
                'bg-blue-100 text-blue-700': task.priority === 'low'
              }" class="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                {{ task.priority === 'high' ? '高' : (task.priority === 'medium' ? '中' : '低') }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-2 ml-2">
          <button @click="openEditModal(task)" class="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
            <Edit2 :size="18" />
          </button>
          <button @click="deleteTask(task)" class="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors">
            <Trash2 :size="18" />
          </button>
        </div>
      </div>
    </div>

    <TaskForm v-model="isFormOpen" :task="editingTask" @save="handleSave" />
  </div>
</template>
