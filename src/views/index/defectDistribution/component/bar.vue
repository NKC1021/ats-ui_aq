<!--
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-03-30 17:15:49
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-04-18 09:37:02
 * @FilePath: \admin-plus\src\views\index\defectDistribution\component\bar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div style="position: relative">
    <chart-sort @sort-by="sortBy" />
    <div
      ref="main"
      :style="`height:${props.chartsHeight}px;width:${props.chartsWidth}px`"
    ></div>
  </div>
</template>

<script setup>
  import { translate } from '@/i18n'
  import * as echarts from 'echarts'
  import {
    dataZoom,
    grid,
    sortByKey,
    legend,
    setTheme,
  } from '@/utils/echartsConst'
  import { ref, computed } from 'vue'
  import chartSort from '@/views/components/chartSort.vue'
  const props = defineProps({
    chartsWidth: {
      type: Number,
      default: 0,
    },
    chartsHeight: {
      type: Number,
      default: 0,
    },

    chartData: {
      type: Array,
      default: () => {
        return []
      },
    },
  })
  const main = ref(null)
  const option = {
    legend: legend,
    title: {
      text: translate('缺陷分布'),
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    toolbox: {},
    grid: grid,
    dataZoom: dataZoom,
    xAxis: [
      {
        type: 'category',
        splitLine: false,
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: { rotate: 45 },
        data: [],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: translate('点数'), //todo
        axisLine: {
          //坐标轴轴线设置
          show: true,
          // symbol: ['none', 'arrow'],
          symbolOffset: [0, 10],
        },
      },
    ],
    series: [
      {
        name: translate('点数'),
        type: 'bar',
        barMaxWidth: 40,
        label: {
          show: true,
          position: 'top',
        },
        data: [],
      },
    ],
  }
  const sortType = ref('null')
  /**
   * 排序类型
   */
  const sortBy = (val) => {
    sortType.value = val
    nextTick(() => {
      initCharts()
    })
  }
  /**
   * 排序数据
   */
  const chartDataBySort = computed(() => {
    if (props.chartData.length === 0) {
      return []
    }
    let arr = []
    const startVal = JSON.parse(JSON.stringify(props.chartData))
    arr = sortByKey(startVal, 'detectable_num', sortType.value)
    return arr
  })
  const chartDataObj = computed(() => {
    if (chartDataBySort.value.length === 0) return {}
    const obj = { XData: [], YData: [] }
    chartDataBySort.value.forEach((item) => {
      obj.XData.push(item.label_name)
      obj.YData.push(item.detectable_num)
    })
    return obj
  })
  let chartContent = null
  /**
   * 初始化视图
   */
  const initCharts = () => {
    if (chartContent) {
      chartContent.dispose()
    }
    const echartsThemeName = setTheme(echarts)
    chartContent = main.value && echarts.init(main.value, echartsThemeName)
    if (JSON.stringify(chartDataObj.value) !== '{}') {
      for (let i = 0; i < option.xAxis.length; i++) {
        option.xAxis[i].data = chartDataObj.value.XData
      }
      for (let i = 0; i < option.series.length; i++) {
        option.series[i].data = chartDataObj.value.YData
      }
    } else {
      // 处理空数据
      option.xAxis.forEach((item) => {
        item.data = []
      })
      option.series.forEach((item) => {
        item.data = []
      })
    }
    option && chartContent.setOption(option)
  }

  defineExpose({
    initCharts,
  })
</script>
