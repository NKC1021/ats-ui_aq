<script lang="ts" setup>
  import { useSettingsStore } from '@/store/modules/settings'
  import { onMounted, ref } from 'vue'

  const $pub: any = inject('$pub')

  const settingsStore = useSettingsStore()
  const { theme } = storeToRefs(settingsStore)

  const handleOpenTheme = () => {
    $pub('theme')
  }
  // 检查用户是否有系统设置权限
  const checkThemeSettingView = ref(false) // 是否显示系统设置
  const usrBtnAccess = JSON.parse(localStorage.getItem('usrBtnAccess') || '[]')
  const checkThemeBtn = () => {
    if (usrBtnAccess.includes('themeSetting')) {
      checkThemeSettingView.value = true
    }
  }
  onMounted(() => {
    checkThemeBtn() // 组件挂载后检查用户权限
  })
</script>

<template>
  <span v-if="checkThemeSettingView">
    <vab-icon icon="brush-2-line" @click="handleOpenTheme" />
  </span>
</template>
