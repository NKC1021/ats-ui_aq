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
  import { ref, computed } from 'vue'
  import {
    dataZoom,
    grid,
    sortByKey,
    legend,
    setTheme,
    AILossStackBar,
    tooltip,
  } from '@/utils/echartsConst'
  import chartSort from '@/views/components/chartSort.vue'
  import { translate } from '@/i18n'
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
    dataZoom: dataZoom,
    title: {
      text: 'AI漏失-时间',
    },
    tooltip: tooltip,
    toolbox: {},
    grid: grid,
    xAxis: [
      {
        type: 'category',
        axisTick: {
          alignWithLabel: true,
        },
        splitLine: {
          show: false,
        },
        axisLabel: { rotate: 0 },
        data: [],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: translate('漏失率'), //todo
        axisLine: {
          //坐标轴轴线设置
          show: true,
          // symbol: ['none', 'arrow'],
          symbolOffset: [0, 10],
        },
        // alignTicks: true,
        position: 'left',
        axisLabel: {
          formatter: '{value}%',
        },
      },
      {
        type: 'value',
        name: translate('趋势'), //todo
        axisLine: {
          //坐标轴轴线设置
          show: false,
          // onZero: false,
        },
        offset: 0,
        position: 'right',
        axisLabel: {
          formatter: '{value}%',
        },
      },
    ],
    series: [],
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
   * 构造排序数据
   */
  const chartDataBySort = computed(() => {
    let arr = []
    const startVal = JSON.parse(JSON.stringify(props.chartData))
    if (startVal.length === 0) {
      return []
    }
    arr = sortByKey(startVal, 'detectable_rate_per', sortType.value)
    return arr
  })
  /**
   * 构造视图数据
   */
  const chartDataObj = computed(() => {
    if (chartDataBySort.value.length === 0) {
      return {}
    }
    const _obj = {
      XData: [],
      YData: {
        rate: [],
        AIlabel: {},
      },
    }
    const map = new Map()
    chartDataBySort.value.forEach((el) => {
      _obj.XData.push(el.date)
      const rate = el.detectable_rate_per.replace('%', '') - 0
      _obj.YData.rate.push(rate)
      el.AiLabelInfo.forEach((item) => {
        if (map.has(item.LabelName)) {
          const arr = map.get(item.LabelName)
          const DetectableRate = item.DetectableRate.replace('%', '') - 0
          arr.push(DetectableRate)
          map.set(item.LabelName, arr)
        } else {
          const _arr = []
          const DetectableRate = item.DetectableRate.replace('%', '') - 0
          _arr.push(DetectableRate)
          map.set(item.LabelName, _arr)
        }
      })
    })
    map.forEach((val, key) => {
      _obj.YData.AIlabel[key] = val
    })
    return _obj
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
      option.xAxis.forEach((item) => {
        item.data = chartDataObj.value.XData
      })
      option.series = AILossStackBar(chartDataObj.value)
    } else {
      // 处理空数据
      option.xAxis.forEach((item) => {
        item.data = []
      })
      option.series = []
    }
    option && chartContent.setOption(option)
  }

  defineExpose({ initChart })
</script>
