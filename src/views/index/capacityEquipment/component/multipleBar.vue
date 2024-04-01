<template>
  <div style="position: relative">
    <chart-sort @sort-by="sortBy" />
    <div
      ref="main"
      :style="`height:${props.chartHeight}px;width:${props.chartWidth}px`"
    ></div>
  </div>
</template>

<script setup>
  import * as echarts from 'echarts'
  import { ref, nextTick } from 'vue'
  import {
    dataZoom,
    setTheme,
    grid,
    sortByKey,
    legend,
  } from '@/utils/echartsConst'
  import chartSort from '@/views/components/chartSort.vue'
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
    isClasses: {
      //是否班次
      type: Boolean,
      default: false,
    },
  })
  const sortType = ref('null')
  const main = ref(null)
  const option = {
    legend: legend,
    title: {
      text: '产能-设备',
      left: '0%',
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
        splitLine: {
          show: false,
        },
        axisLabel: {
          rotate: 0,
          // formatter: (value) => {
          //   const endIndex = value.indexOf('T')
          //   let h = new Date(value).getHours()
          //   h = h >= 10 ? h : `0${h}`
          //   return `${value.slice(0, endIndex)}\n/${h}时`
          // },
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '板数', //todo
        axisLine: {
          //坐标轴轴线设置
          show: true,
          // symbol: ['none', 'arrow'],
          // symbolOffset: [0, 10],
        },
      },
    ],
    series: [],
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
    const startVal = JSON.parse(JSON.stringify(props.chartData))
    let arr = []
    if (props.isClasses) {
      //
      arr = sortByKey(startVal, 'CheckNum', sortType.value)
    } else {
      arr = sortByKey(startVal, 'CheckNum', sortType.value)
    }
    return arr
  })

  const chartDataObj = computed(() => {
    if (chartDataBySort.value.length === 0) {
      return {}
    }
    const _obj = {
      XData: [],
      YData: {},
    }
    const CheckNum = []
    const day = []
    const night = []
    chartDataBySort.value.forEach((el) => {
      // const endIndex = el.DataTime.indexOf('T')
      // _obj.XData.push(el.DataTime.slice(0, endIndex))
      _obj.XData.push(el.DataTime)
      CheckNum.push(el.CheckNum)
      if (props.isClasses) {
        day.push(el.DayShiftCount)
        night.push(el.NightShiftCount)
      }
    })
    if (props.isClasses) {
      _obj.YData.day = day
      _obj.YData.night = night
    }
    _obj.YData.CheckNum = CheckNum
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
      if (props.isClasses) {
        const _yAxis = [
          {
            type: 'value',
            name: '板数', //todo
            axisLine: {
              //坐标轴轴线设置
              show: true,
            },
          },
          {
            type: 'value',
            name: '总板数', //todo
            axisLine: {
              //坐标轴轴线设置
              show: true,
            },
          },
        ]
        option.yAxis = _yAxis
        console.log('chartDataObj.value::', chartDataObj.value)
        option.xAxis.forEach((item) => {
          item.data = chartDataObj.value.XData
        })
        const _series = [
          {
            name: '白班(8:00-20:00)',
            type: 'bar',
            barMaxWidth: 70,
            label: {
              show: true,
              position: 'inside',
              textBorderColor: 'inherit',
              textBorderWidth: 2,
            },
            data: [...chartDataObj.value.YData.day],
          },
          {
            name: '晚班(20:00-8:00)',
            type: 'bar',
            barMaxWidth: 70,
            label: {
              show: true,
              position: 'inside',
              textBorderColor: 'inherit',
              textBorderWidth: 2,
            },
            data: [...chartDataObj.value.YData.night],
          },
          {
            name: '总板数',
            type: 'line',

            label: {
              show: true,
              position: 'top',
            },
            tooltip: {
              // valueFormatter: (value) => `${value}%`,
            },
            yAxisIndex: 1,
            data: [...chartDataObj.value.YData.CheckNum],
          },
        ]
        option.series = _series
      } else {
        option.xAxis.forEach((item) => {
          item.data = chartDataObj.value.XData
        })
        const _yAxis = [
          {
            type: 'value',
            name: '板数', //todo
            axisLine: {
              show: true,
            },
          },
        ]
        const _series = [
          {
            name: '板数',
            type: 'bar',
            barMaxWidth: 70,
            label: {
              show: true,
              position: 'top',
            },
            tooltip: {},
            yAxisIndex: 0,
            data: [...chartDataObj.value.YData.CheckNum],
          },
        ]
        option.yAxis = _yAxis
        option.series = _series
      }
    } else {
      option.series = []
      option.xAxis.forEach((el) => {
        el.data = []
      })
    }
    option && chartContent.setOption(option)
  }
  defineExpose({ initChart })
</script>
