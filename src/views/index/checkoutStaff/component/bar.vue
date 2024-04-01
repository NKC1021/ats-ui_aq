<template>
  <div style="position: relative">
    <chartSort @sort-by="sortMethod" />
    <div
      ref="main"
      :style="`height:${props.chartsHeight}px;width:${props.chartsWidth}px`"
    ></div>
  </div>
</template>

<script setup>
  import * as echarts from 'echarts'
  import { translate } from '@/i18n'
  import { ref } from 'vue'
  import {
    dataZoom,
    grid,
    sortByKey,
    // legend,
    setTheme,
  } from '@/utils/echartsConst'
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
      type: Object,
      default: () => {
        return []
      },
    },
  })
  const main = ref(null)
  const option = {
    dataZoom: dataZoom,
    // legend: {},
    title: {
      text: translate('检出-人员'),
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      valueFormatter: (value) => `${value}%`,
    },
    toolbox: {},
    grid: grid,
    xAxis: [
      {
        type: 'category',
        splitLine: false,
        data: [],
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: { rotate: 0 },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: translate('占比'), //todo
        axisLine: {
          //坐标轴轴线设置
          show: true,
          // symbol: ['none', 'arrow'],
          symbolOffset: [0, 10],
        },
        axisLabel: {
          formatter: '{value} %',
        },
      },
    ],
    series: [
      {
        name: translate('人员检出分布'),
        type: 'bar',
        barMaxWidth: 40,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
        },
        data: [],
      },
    ],
  }
  // ['ascending', 'descending', null]排序类型 升序降序 还原
  const sortType = ref('null')
  const sortMethod = (sortStr) => {
    sortType.value = sortStr
    nextTick(() => {
      initChart()
    })
  }

  /**
   * 构造数据
   */
  const chartDataBySort = computed(() => {
    if (props.chartData.length === 0) {
      return []
    }
    let arr = []
    const startVal = JSON.parse(JSON.stringify(props.chartData))
    arr = sortByKey(startVal, 'DetectableRate', sortType.value)
    return arr
  })
  const chartDataObj = computed(() => {
    if (chartDataBySort.value.length === 0) {
      return {}
    }
    const obj = {
      XData: [],
      YData: [],
    }
    chartDataBySort.value.forEach((el) => {
      obj.XData.push(el.FqcName)
      const rate = el.DetectableRate.replace('%', '') - 0
      obj.YData.push(rate)
    })
    return obj
  })
  let chartContent = null
  /**
   * 初始化视图
   */
  const initChart = () => {
    if (chartContent) {
      chartContent.dispose()
    }
    const echartsThemeName = setTheme(echarts)
    chartContent = main.value && echarts.init(main.value, echartsThemeName)
    if (JSON.stringify(chartDataObj.value) !== '{}') {
      //

      option.xAxis.forEach((el) => {
        el.data = chartDataObj.value.XData
      })
      option.series.forEach((el) => {
        el.data = chartDataObj.value.YData
      })
    } else {
      // debugger
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
    initChart,
  })
</script>
