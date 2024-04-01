<template>
  <div style="position: relative">
    <chartSort @sort-by="sortMethod" />
    <div
      ref="main"
      :style="`height:${props.chartsHeight}px;width:${props.chartsWidth}px`"
    ></div>
    <chart-view-details />
  </div>
</template>

<script setup>
  import * as echarts from 'echarts'
  import { ref, computed } from 'vue'
  import {
    dataZoom,
    grid,
    tooltip,
    sortByKey,
    legend,
    AILossStackBar,
    setTheme,
  } from '@/utils/echartsConst'
  import chartSort from '@/views/components/chartSort.vue'
  import chartViewDetails from '@/views/components/chartViewDetails.vue'
  const props = defineProps({
    targetVal: {
      type: Number,
      default: 0,
    },
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

  const emit = defineEmits(['chartDblClick'])
  const main = ref(null)
  const option = {
    legend: legend,
    dataZoom: dataZoom,
    title: {
      text: 'AI漏失-料号',
    },
    tooltip: { ...tooltip },
    toolbox: {},
    grid: grid,
    xAxis: [
      {
        type: 'category',
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          rotate: 0,
          formatter: (value) => {
            if (value.length >= 12) {
              return `${value.slice(0, 12)}...`
            } else {
              return value
            }
          },
        },
        splitLine: false,
        data: [],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '漏失率', //todo
        axisLine: {
          //坐标轴轴线设置
          show: true,
          symbolOffset: [0, 10],
        },
        splitLine: { show: false },
        // alignTicks: true,
        position: 'left',
        axisLabel: {
          formatter: '{value}%',
        },
        splitNumber: 5,
      },
      {
        type: 'value',
        name: '趋势', //todo
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
        splitNumber: 5,
        // splitLine: { show: true },
      },
    ],
    series: [],
  }
  const sortType = ref('null') //排序类型 升序降序 还原
  /**
   * 排序
   */
  const sortMethod = (sortStr) => {
    sortType.value = sortStr
    nextTick(() => {
      initChart()
    })
  }

  // ['ascending', 'descending', null]
  const chartDataBySort = computed(() => {
    const initData = JSON.parse(JSON.stringify(props.chartData))
    if (initData.length === 0) {
      return []
    }
    let arr = []
    arr = sortByKey(initData, 'detectable_rate_per', sortType.value)
    return arr
  })
  /**
   * 构造视图对象
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
      _obj.XData.push(el.product_name)
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

    if (chartDataObj.value && JSON.stringify(chartDataObj.value) !== '{}') {
      option.xAxis.forEach((item) => {
        item.data = chartDataObj.value.XData
      })
      option.series = AILossStackBar(chartDataObj.value, props.targetVal)
    } else {
      // 没有数据处理
      option.series = []
      option.xAxis.forEach((item) => {
        item.data = []
      })
    }
    chartContent && chartContent.setOption(option)
    chartContent &&
      chartContent.on('dblclick', (params) => {
        emit('chartDblClick', params)
      })
  }
  defineExpose({ initChart })
</script>
