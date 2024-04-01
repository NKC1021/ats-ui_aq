import { theme } from '@/plugins/VabChart/theme/aqsEchartsTheme.js'
import { useSettingsStore } from '@/store/modules/settings'

/*
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-04-06 09:29:39
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-04-18 09:54:12
 * @FilePath: \admin-plus\src\utils\echartsConst.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 视图放大缩小
export const dataZoom = [
  {
    type: 'slider', //给x轴设置滚动条
    show: true, //flase直接隐藏图形
    xAxisIndex: [0],
    bottom: 0,
    height: 10,
    showDetail: false,
    startValue: 0, //滚动条的起始位置
    endValue: 15, //滚动条的截止位置（按比例分割你的柱状图x轴长度）
  },
  {
    type: 'inside', //设置鼠标滚轮缩放
    show: true,
    xAxisIndex: [0],
    startValue: 0,
    endValue: 5,
  },
]

export const legend = {
  width: '75%',
  type: 'scroll',
  top: '3%',
}

export const grid = {
  top: '12%',
  left: '1.5%',
  right: '1.5%',
  bottom: '3%',
  containLabel: true,
}
export const tooltip = {
  trigger: 'axis',
  axisPointer: {
    type: 'shadow',
  },
  appendToBody: true,
  enterable: true,
  extraCssText: 'max-height:45%;overflow:auto',
  valueFormatter: (value) => `${value}%`,
}

/**
 *
 * @param {Array} data 需要排序数据
 * @param {String} key 根据字段排序
 * @param {String} sortType ['ascending', 'descending', null]排序类型 升序降序 还原
 */
export const sortByKey = (data = [], key, sortType) => {
  let arr = data
  const _startData = data
  if (sortType === 'null') {
    arr = _startData
  }
  if (sortType === 'ascending') {
    arr = arr.sort(
      (a, b) =>
        `${a[key]}`.replace('%', '') - 0 - `${b[key]}`.replace('%', '') - 0
    )
  }
  if (sortType === 'descending') {
    arr = arr.sort(
      (a, b) =>
        `${b[key]}`.replace('%', '') - 0 - `${a[key]}`.replace('%', '') - 0
    )
  }
  return arr
}

/**
 * @description: 设置主题
 * @param {*} echarts
 * @return {*}
 */
export const setTheme = (echarts) => {
  const {
    getTheme: { echartsThemeName },
  } = useSettingsStore()
  echarts.registerTheme(echartsThemeName, theme[echartsThemeName])
  return echartsThemeName
}
/**
 * AI漏失叠加柱状图
 * @param {Object} chartDataObj 构造视图数据
 * @param {Numbet} targetVal 根据这个值来控制背景颜色不传不需要背景
 */
export const AILossStackBar = (chartDataObj, targetVal) => {
  const seriesList = []
  const lineData = {
    name: '趋势',
    type: 'line',
    yAxisIndex: 1,
    symbol: 'circle',
    symbolSize: 6,
    label: {
      show: true,
      position: 'top',
      formatter: (params) => {
        let htmlDom = ''
        if (typeof targetVal === 'undefined') {
          return `${params.value}%`
        }
        if (params.value > targetVal) {
          htmlDom = `{a|${params.value}%}`
        } else {
          htmlDom = `{b|${params.value}%}`
        }
        return htmlDom
      },
      rich: {
        a: {
          padding: [3, 1, 1, 1],
          backgroundColor: '#f56c6c',
          borderRadius: 4,
          borderWidth: 2,
          borderColor: '#f8f8fa',
          color: '#fff',
        },
        b: {
          padding: [3, 1, 1, 1],
          backgroundColor: '#67c23a',
          borderRadius: 4,
          borderWidth: 2,
          borderColor: '#f8f8fa',
          color: '#fff',
        },
      },
    },
    data: [...chartDataObj.YData.rate],
  }
  seriesList.push(lineData)
  const AIlabel = chartDataObj.YData.AIlabel
  Object.keys(AIlabel).forEach((key) => {
    const barData = {
      name: key,
      type: 'bar',
      barMaxWidth: 40,
      stack: 'Add',
      data: AIlabel[key],
      emphasis: {
        // focus: 'series',
      },
    }
    seriesList.push(barData)
  })
  return seriesList
}
