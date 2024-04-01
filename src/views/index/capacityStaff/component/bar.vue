<template>
  <div style="position: relative">
    <chartSort @sort-by="sortBy" />
    <div
      ref="main"
      :style="`height:${props.chartHeight}px;width:${props.chartWidth}px`"
    ></div>
  </div>
</template>

<script setup>
  import * as echarts from 'echarts'
  import { ref } from 'vue'
  import chartSort from '@/views/components/chartSort.vue'
  import { grid, dataZoom, setTheme, sortByKey } from '@/utils/echartsConst'
  import { translate } from '@/i18n'
  const props = defineProps({
    chartWidth: {
      type: Number,
      default: 0,
    },
    chartHeight: {
      type: Number,
      default: 0,
    },
    chartData: {
      type: Array,
      default: () => [],
    },
  })
  const sortType = ref('null')
  const main = ref(null)
  const option = {
    // legend: {},
    title: {
      text: translate('产能-人员'),
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
        data: [],
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          rotate: 0,
          formatter: (value) => {
            const index = value.indexOf('/')
            if (index !== -1) {
              return `${value.slice(0, index)}\n${value.slice(index)}`
            }
            return value
          },
        },
        splitLine: {
          show: false,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: translate('板数'), //todo
        axisLine: {
          //坐标轴轴线设置
          show: true,
          // symbol: ['none', 'arrow'],
          // symbolOffset: [0, 10],
        },
      },
    ],
    series: [
      {
        name: '板数',
        type: 'bar',
        barMaxWidth: 70,
        label: {
          show: true,
          position: 'top',
        },
        data: [],
      },
    ],
  }
  /**
   * 排序
   */
  const sortBy = (type) => {
    sortType.value = type
    nextTick(() => {
      initChart()
    })
  }
  const chartDataBySort = computed(() => {
    if (props.chartData.length === 0) {
      return []
    }
    const startVal = JSON.parse(JSON.stringify(props.chartData))
    let arr = []
    arr = sortByKey(startVal, 'CheckNum', sortType.value)
    return arr
  })
  const chartDataObj = computed(() => {
    if (chartDataBySort.value.length === 0) {
      return {}
    }
    const _obj = {
      XData: [],
      YData: [],
    }
    chartDataBySort.value.forEach((item) => {
      let yData = null
      if (typeof item.PeopleName === 'undefined') {
        const endIndex = item.DataTime.indexOf('T')
        let h = new Date(item.DataTime).getHours()
        h = h >= 10 ? h : `0${h}`
        yData = `${item.DataTime.slice(0, endIndex)}/${h}时`
      } else {
        yData = item.PeopleName
      }
      _obj.XData.push(yData)
      _obj.YData.push(item.CheckNum)
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
    // console.log('chartDataObj', chartDataObj.value)
    if (JSON.stringify(chartDataObj.value) !== '{}') {
      option.xAxis.forEach((item) => {
        item.data = chartDataObj.value.XData
      })
      option.series.forEach((item) => {
        item.data = chartDataObj.value.YData
      })
    } else {
      option.xAxis.forEach((item) => {
        item.data = []
      })
      option.series.forEach((item) => {
        item.data = []
      })
    }
    option && chartContent.setOption(option)
  }
  defineExpose({ initChart })
</script>
