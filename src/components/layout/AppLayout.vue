<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { LayoutDashboard, ListTodo, Calendar, Settings } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm px-4 py-3 sticky top-0 z-10">
      <h1 class="text-xl font-bold text-gray-800">論文寫作助手</h1>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-4 pb-20">
      <RouterView />
    </main>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 pb-safe z-20">
      <RouterLink to="/" class="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600" active-class="text-blue-600">
        <LayoutDashboard :size="24" />
        <span class="text-xs mt-1">儀表板</span>
      </RouterLink>
      <RouterLink to="/tasks" class="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600" active-class="text-blue-600">
        <ListTodo :size="24" />
        <span class="text-xs mt-1">任務</span>
      </RouterLink>
      <RouterLink to="/calendar" class="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600" active-class="text-blue-600">
        <Calendar :size="24" />
        <span class="text-xs mt-1">日曆</span>
      </RouterLink>
      <RouterLink to="/settings" class="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600" active-class="text-blue-600">
        <Settings :size="24" />
        <span class="text-xs mt-1">設置</span>
      </RouterLink>
    </nav>
  </div>
</template>
