<template>
  <vab-card class="rank" shadow="hover" skeleton>
    <template #header>
      <span>
        <vab-icon icon="align-top" />
        {{ translate('缺陷分布TOP10') }}
      </span>
    </template>
    <vab-chart
      class="rank-echart"
      :init-options="initOptions"
      :option="option"
      theme="aqs-echarts-theme"
    />
  </vab-card>
</template>

<script setup>
  import { translate } from '@/i18n'
  import VabChart from '@/plugins/VabChart'
  import {
    distributionOpt,
    opt,
    initDrawSeries,
    drawLineAndBar,
    sortData,
    initDistribution,
  } from '@/views/components/aiFilter/option.js'
  const props = defineProps({
    distributionData: {
      type: Array,
      default: () => [],
    },
  })
  const initOptions = ref({
    renderer: 'svg',
  })
  const option = ref({ ...distributionOpt })

  const echartData = ref([])
  watch(
    props,
    () => {
      echartData.value = []
      echartData.value = [...props.distributionData]
      if (echartData.value.length === 0) {
        option.value.title = {
          show: true, // 没数据才显示
          extStyle: {
            color: 'grey',
            fontSize: 20,
          },
          text: '暂无数据',
          left: 'center',
          top: 'center',
        }
      } else {
        option.value.title.show = false
      }
      initDistribution(option.value, echartData.value)
    },
    { deep: true }
  )
</script>
