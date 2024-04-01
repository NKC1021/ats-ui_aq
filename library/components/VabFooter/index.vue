<!--
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-02-06 11:59:51
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-04-04 16:23:50
 * @FilePath: \admin-plus\library\components\VabFooter\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script lang="ts" setup>
  import { useSettingsStore } from '@/store/modules/settings'

  const fullYear = new Date().getFullYear()
  const settingsStore = useSettingsStore()
  const { title } = storeToRefs(settingsStore)
</script>

<template>
  <footer class="vab-footer">
    Copyright
    <vab-icon icon="copyright-line" />
    {{ fullYear }} {{ title }}
  </footer>
</template>

<style lang="scss" scoped>
  .vab-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    // min-height: 55px;
    padding: 0 $base-padding 0 $base-padding;
    color: rgba(0, 0, 0, 0.45);
    background: var(--el-color-white);
    border-top: 1px dashed $base-border-color;

    i {
      margin: 0 5px;
    }
  }
</style>
