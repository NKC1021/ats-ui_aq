<template>
  <div class="chart-sort-btn">
    <el-tooltip :content="switchContent" effect="dark" placement="top">
      <el-button
        v-show="props.showSwitch"
        icon="switch"
        link
        type="primary"
        @click="chartSwitch"
      />
    </el-tooltip>
    <el-tooltip :content="translate('排序')" effect="dark" placement="top">
      <el-button icon="Sort" link type="primary" @click="sortMethod" />
    </el-tooltip>
    <el-tooltip :content="translate('刷新')" effect="dark" placement="top">
      <el-button icon="Refresh" link type="primary" @click="refreshMethod" />
    </el-tooltip>
  </div>
</template>
<script setup>
  import { translate } from '@/i18n'
  import { ref, computed } from 'vue'
  const props = defineProps({
    showSwitch: {
      type: Boolean,
      default: false,
    },
  })
  const emit = defineEmits(['sort-by', 'refresh', 'chartSwitch'])
  let sortClickNUm = 0
  const sortList = ['ascending', 'descending', null]
  // ['ascending', 'descending', null] //排序类型 升序降序 还原
  const sortMethod = () => {
    //
    if (sortClickNUm > 1) sortClickNUm = 0
    const sortType = sortList[sortClickNUm]
    sortClickNUm++
    emit('sort-by', sortType)
  }
  const refreshMethod = () => {
    emit('refresh')
    emit('sort-by', 'null')
  }
  const switchFlag = ref(false) //false表示班次 true表示时间
  const chartSwitch = () => {
    switchFlag.value = !switchFlag.value
    emit('chart-switch')
  }
  const switchContent = computed(() => {
    if (switchFlag.value) {
      return '时间维度'
    } else {
      return '班次维度'
    }
  })
</script>

<style scoped lang="scss">
  .chart-sort-btn {
    position: absolute;
    top: 9px;
    right: 2%;
    z-index: 1;
  }
  .el-button :deep(.el-icon) {
    font-size: 14px !important;
  }
</style>
