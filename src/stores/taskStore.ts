import { defineStore } from 'pinia'
import { db, type Task } from '@/db'
import { liveQuery } from 'dexie'
import { ref, toRaw } from 'vue'

export const useTaskStore = defineStore('taskStore', () => {
  const tasks = ref<Task[]>([])

  // Load tasks using liveQuery to keep reactive
  liveQuery(() => db.tasks.toArray()).subscribe((data) => {
    tasks.value = data
  })

  async function addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    // Convert Proxy to plain object to avoid DataCloneError in IndexedDB
    const rawTask = toRaw(task)
    return await db.tasks.add({
      ...rawTask,
      // Ensure dependencies is a plain array
      dependencies: rawTask.dependencies ? [...rawTask.dependencies] : [],
      createdAt: new Date().toISOString()
    })
  }

  async function updateTask(id: number, updates: Partial<Task>) {
    const original = await db.tasks.get(id)
    if (!original) return

    const rawUpdates = toRaw(updates)
    // Ensure dependencies is a plain array if it exists in updates
    if (rawUpdates.dependencies) {
      rawUpdates.dependencies = [...rawUpdates.dependencies]
    }

    await db.tasks.update(id, rawUpdates)

    // Check for dependency updates if dueDate changed
    if (rawUpdates.dueDate && rawUpdates.dueDate !== original.dueDate) {
       await updateDependentTasks(id, rawUpdates.dueDate)
    }
  }

  async function updateDependentTasks(parentId: number, parentDueDate: string) {
    const dependents = await db.tasks.where('dependencies').equals(parentId).toArray()
    
    for (const task of dependents) {
        const parentEnd = new Date(parentDueDate)
        const taskStart = new Date(task.startDate)
        
        // If dependent task starts on or before parent finishes, shift it
        if (taskStart <= parentEnd) {
            // Shift task start to parentEnd + 1 day
            const newStart = new Date(parentEnd)
            newStart.setDate(newStart.getDate() + 1)
            
            // Calculate duration to shift due date too
            const taskEnd = new Date(task.dueDate)
            const duration = taskEnd.getTime() - taskStart.getTime()
            const newEnd = new Date(newStart.getTime() + duration)
            
            const updates = {
                startDate: newStart.toISOString().split('T')[0],
                dueDate: newEnd.toISOString().split('T')[0]
            }
            
            await db.tasks.update(task.id!, updates)
            
            // Recursively update its dependents
            await updateDependentTasks(task.id!, updates.dueDate)
        }
    }
  }

  async function deleteTask(id: number) {
    return await db.tasks.delete(id)
  }

  async function checkSimilarTasks(title: string) {
    const allTasks = await db.tasks.toArray()
    // Basic similarity check
    return allTasks.filter(t => 
      t.title.toLowerCase().includes(title.toLowerCase()) || 
      title.toLowerCase().includes(t.title.toLowerCase())
    )
  }

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    checkSimilarTasks
  }
})
