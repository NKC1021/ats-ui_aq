<template>
  <vab-card class="trend" shadow="hover" skeleton>
    <template #header>
      <span>
        <vab-icon icon="line-chart-fill" />
        {{ translate('设备/人员时段产能') }}
      </span>
    </template>
    <vab-chart
      class="trend-echart"
      :init-options="state.initOptions"
      :option="state.option"
      theme="aqs-echarts-theme"
    />
  </vab-card>
</template>

<script setup>
  import { translate } from '@/i18n'
  import VabChart from '@/plugins/VabChart'
  import { reactive, watch } from 'vue'
  import { dataZoom } from '@/utils/echartsConst'
  const props = defineProps({
    capacityData: {
      type: Object,
      default: () => {},
    },
  })
  const state = reactive({
    initOptions: {
      renderer: 'svg',
    },
    option: {
      tooltip: {
        trigger: 'axis',
        extraCssText: 'z-index:1',
      },
      dataZoom: dataZoom,
      grid: {
        top: '2%',
        left: '2%',
        right: '5.1%',
        bottom: '5%',
        containLabel: true,
      },
      xAxis: [
        {
          data: [],
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: (val) => {
              let htmlDom = ''
              const endIndex = val.indexOf('/')
              htmlDom = `${val.slice(0, endIndex)}\n${val.slice(endIndex)}`
              return htmlDom
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: [
        {
          name: '设备产能',
          type: 'line',
          data: [],
          symbol: 'circle',
          smooth: true,
          yAxisIndex: 0,
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
          },
        },
        {
          name: '人员产能',
          type: 'line',
          data: [],
          symbol: 'circle',
          smooth: true,
          yAxisIndex: 0,
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
          },
        },
      ],
    },
  })
  watch(
    () => props.capacityData,
    () => {
      state.option.xAxis.forEach((el) => {
        el.data = props.capacityData['timeList']
      })
      state.option.series[0].data = props.capacityData['aquList']
      state.option.series[1].data = props.capacityData['peoList']
    }
  )
</script>
