<!--
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-03-30 17:15:49
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-04-18 09:36:13
 * @FilePath: \admin-plus\src\views\index\checkoutTime\component\stackBar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
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
  import { ref } from 'vue'
  import {
    dataZoom,
    tooltip,
    grid,
    sortByKey,
    legend,
    setTheme,
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
    chartDataObj: {
      type: Object,
      default: () => {
        return {}
      },
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
      text: translate('检出-时间'),
    },
    tooltip: tooltip,
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
          formatter: (value) => {
            return `${value}%`
          },
        },
      },
      {
        type: 'value',
        name: '', //todo
        axisLine: {
          //坐标轴轴线设置
          show: false,
          // symbol: ['none', 'arrow'],
          // symbolOffset: [0, 10],
          onZero: false,
        },
        axisLabel: {
          formatter: (value) => {
            return `${value}%`
          },
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
   * 得到排序数据
   */
  const chartDataBySort = computed(() => {
    if (props.chartData.length === 0) {
      return []
    }
    let arr = []
    const startVal = JSON.parse(JSON.stringify(props.chartData))
    arr = sortByKey(startVal, 'detectable_rate', sortType.value)
    return arr
  })
  /**
   * 构造echart渲染数据
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
      const rate = el.detectable_rate.replace('%', '') - 0
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
  let chartContent
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
      const seriesList = []
      const lineData = {
        name: '趋势',
        type: 'line',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
        },
        data: [],
      }

      lineData.data = chartDataObj.value.YData.rate
      seriesList.push(lineData)
      const _obj = chartDataObj.value.YData.AIlabel
      Object.keys(_obj).forEach((key) => {
        const barData = {
          name: key,
          type: 'bar',
          barMaxWidth: 40,
          stack: 'Add',
          data: _obj[key],
          emphasis: {
            // focus: 'series',
          },
        }
        seriesList.push(barData)
      })
      option.series = seriesList
    } else {
      // 处理空数据
      option.xAxis.forEach((item) => {
        item.data = []
      })
      option.series = []
    }
    option && chartContent.setOption(option)
  }
  defineExpose({
    initChart,
  })
</script>
