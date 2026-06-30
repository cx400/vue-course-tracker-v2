<template>
  <div class="app-layout">
    <AppSidebar ref="sidebarRef" :collapsed="collapsed" />

    <div class="main-wrapper">
      <Topbar :collapsed="collapsed" @toggle-sidebar="toggleSidebar" @refresh="handleRefresh" />

      <TabsView />

      <main class="content">
        <router-view v-slot="{ Component, route: r }">
          <keep-alive :max="8">
            <component :is="Component" :key="r.path + ':' + (refreshKeys[r.path] || 0)" />
          </keep-alive>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import NProgress from 'nprogress'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import Topbar from '@/components/layout/Topbar.vue'
import TabsView from '@/components/TabsView.vue'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

const sidebarRef = ref(null)
const collapsed = ref(false)
const refreshKeys = reactive({})

function toggleSidebar() {
  if (window.innerWidth <= 768) {
    sidebarRef.value?.toggleMobile()
  } else {
    collapsed.value = !collapsed.value
  }
}

async function handleRefresh() {
  NProgress.start()
  const path = route.path
  refreshKeys[path] = (refreshKeys[path] || 0) + 1
  await nextTick()
  NProgress.done()
}

watch(() => route.path, (path) => {
  if (route.meta.title) {
    tabsStore.addTab({ path, title: route.meta.title })
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: var(--bg-page);
  transition: background 0.3s;
}

@media (max-width: 768px) {
  .content { padding: 16px; }
}
</style>
