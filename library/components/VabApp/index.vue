<script lang="ts" setup>
  import { pwa } from '@/config'
  import { enLocale, zhLocale, twLocale } from '@/i18n/index'
  const { locale: language } = useI18n()

  const locale = computed(() => {
    // language.value === 'en' ? enLocale : zhLocale
    if (language.value === 'en') {
      return enLocale
    }
    if (language.value === 'zh') {
      return zhLocale
    }
    if (language.value === 'tw') {
      return twLocale
    }
  })

  const VabUpdate = defineAsyncComponent(
    () => import('@/plugins/VabUpdate/index.vue')
  )
</script>
<template>
  <el-config-provider
    :button="{
      autoInsertSpace: true,
    }"
    :locale="locale"
  >
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
    <vab-update v-if="pwa" ref="vabUpdateRef" />
  </el-config-provider>
</template>
