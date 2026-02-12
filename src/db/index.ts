import Dexie, { type Table } from 'dexie'

export interface Task {
  id?: number
  title: string
  description: string
  startDate: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'done'
  dependencies: number[]
  createdAt: string
}

export class TaskDatabase extends Dexie {
  tasks!: Table<Task>

  constructor() {
    super('TaskDatabase')
    this.version(1).stores({
      tasks: '++id, title, status, priority, startDate, dueDate, *dependencies'
    })
  }
}

export const db = new TaskDatabase()
