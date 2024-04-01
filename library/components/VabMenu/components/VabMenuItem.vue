<!--
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-02-06 11:59:51
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-04-13 14:24:14
 * @FilePath: \admin-plus\library\components\VabMenu\components\VabMenuItem.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script lang="ts" setup>
  import { useSettingsStore } from '@/store/modules/settings'
  import { isExternal } from '@/utils/validate'
  import { translate } from '@/i18n'
  import { isHashRouterMode } from '@/config'
  import { VabRoute } from '/#/router'

  const props = defineProps({
    itemOrMenu: {
      type: Object,
      default() {
        return null
      },
    },
  })

  const route: VabRoute = useRoute()
  const router = useRouter()

  const $pub: any = inject('$pub')

  const settingsStore = useSettingsStore()
  const { device } = storeToRefs(settingsStore)
  const { foldSideBar } = settingsStore

  const handleLink = () => {
    const routePath = props.itemOrMenu.path
    const target = props.itemOrMenu.meta.target
    if (target === '_blank') {
      if (isExternal(routePath)) window.open(routePath)
      else if (route.path !== routePath)
        isHashRouterMode
          ? window.open(`/#${routePath}`)
          : window.open(routePath)
    } else {
      if (isExternal(routePath)) window.location.href = routePath
      else if (route.path !== routePath) {
        if (device.value === 'mobile') foldSideBar()
        router.push(props.itemOrMenu.path)
      } else $pub('reload-router-view')
    }
  }
</script>

<template>
  <el-menu-item :index="itemOrMenu.path" @click="handleLink">
    <vab-icon
      v-if="itemOrMenu.meta.icon"
      :icon="itemOrMenu.meta.icon"
      :is-custom-svg="itemOrMenu.meta.isCustomSvg"
      :title="translate(itemOrMenu.meta.title)"
    />
    <span :title="translate(itemOrMenu.meta.title)">
      {{ translate(itemOrMenu.meta.title) }}
    </span>
    <el-tag v-if="itemOrMenu.meta.badge" effect="dark" type="danger">
      {{ itemOrMenu.meta.badge }}
    </el-tag>
    <span v-if="itemOrMenu.meta.dot" class="vab-dot vab-dot-error">
      <span />
    </span>
  </el-menu-item>
</template>

<style lang="scss" scoped>
  @use 'sass:math';
  :deep(.el-tag) {
    position: absolute;
    right: 20px;
    height: 16px;
    padding-right: 4px;
    padding-left: 4px;
    // margin-top: #{math.div($base-menu-item-height - 16, 2)};
    line-height: 16px;
    border: 0;
  }

  .vab-dot {
    position: absolute !important;
    right: 20px;
    // margin-top: #{math.div($base-menu-item-height - 6, 2)};
  }
</style>
