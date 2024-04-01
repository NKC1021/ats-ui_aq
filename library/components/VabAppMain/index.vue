<script lang="ts" setup>
  import { useRoutesStore } from '@/store/modules/routes'
  import { handleActivePath } from '@/utils/routes'
  import { VabRoute } from '/#/router'
  import downloadProgress from '@/views/components/project/downloadProgress/index.vue'
  import keysDrawer from '@/views/components/project/showKeys/index.vue'

  const route: VabRoute = useRoute()

  const routesStore: any = useRoutesStore()
  const { tab, activeMenu } = storeToRefs(routesStore)

  watch(
    route,
    () => {
      if (tab.value.data !== route.matched[0].name)
        tab.value.data = route.matched[0].name
      activeMenu.value.data = handleActivePath(route)
    },
    { immediate: true }
  )
</script>

<template>
  <div class="vab-app-main">
    <section>
      <VabRouterView />
    </section>
    <vab-footer v-if="false" />
    <downloadProgress />
    <keysDrawer />
  </div>
</template>
