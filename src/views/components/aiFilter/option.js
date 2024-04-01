import { deepClone } from '@/utils/index'
import { translate } from '@/i18n'
import dayjs from 'dayjs'

export const opt = {
  data: [],
  title: {
    text: '机台AI过滤',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999',
      },
    },
  },
  legend: {
    show: true,
    bottom: '14%',
  },
  xAxis: [
    {
      type: 'category',
      data: [],
      axisTick: {
        show: true,
        alignWithLabel: false,
      },
      splitLine: {
        show: false,
      },
      axisPointer: {
        type: 'shadow',
      },
      axisLabel: {
        // rotate: 20,
        interval: 0,
        formatter: function (params) {
          let newParamsName = '' // 拼接后的新字符串
          const paramsNameNumber = params.length // 实际标签数
          const provideNumber = 10 // 每行显示的字数
          const rowNumber = Math.ceil(paramsNameNumber / provideNumber) // 如需换回，算出要显示的行数

          if (paramsNameNumber > provideNumber) {
            /** 循环每一行,p表示行 */
            for (let i = 0; i < rowNumber; i++) {
              let tempStr = '' // 每次截取的字符串
              const start = i * provideNumber // 截取位置开始
              const end = start + provideNumber // 截取位置结束
              // 最后一行的需要单独处理
              if (i == rowNumber - 1) {
                tempStr = params.substring(start, paramsNameNumber)
              } else {
                tempStr = `${params.substring(start, end)}\n`
              }
              newParamsName += tempStr
            }
          } else {
            newParamsName = params
          }
          return newParamsName
        },
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      name: translate('点数'),
      min: 0,
      max: 'dataMax',
      splitNumber: 4,
      splitLine: { show: true },
      axisLine: {
        show: true,
      },

      axisLabel: {
        interval: 0,
        /*rotate: 35, */
        formatter: '{value}',
      },
    },
    {
      type: 'value',
      name: translate('假点去除率'),
      min: 0,
      max: 'dataMax',
      splitNumber: 4,
      splitLine: { show: false },
      axisLine: {
        show: false,
      },
      axisLabel: {
        formatter: '{value} %',
      },
    },
  ],
  dataZoom: [
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
  ],
  series: [],
}

export const distributionOpt = {
  title: {
    show: false,
  },
  tooltip: {
    trigger: 'axis',
    extraCssText: 'z-index:1',
  },
  grid: {
    top: '6%',
    left: '2%',
    right: '20%',
    bottom: '0%',
    containLabel: true,
  },
  xAxis: [
    {
      splitLine: {
        show: false,
      },
      type: 'value',
      show: false,
    },
  ],
  yAxis: [
    {
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      type: 'category',
      axisTick: {
        show: false,
      },
      data: [],
    },
  ],
  series: [
    {
      name: translate('缺陷分布'),
      type: 'bar',
      barWidth: 15,
      label: {
        show: true,
        position: 'right',
        fontSize: 12,
      },
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      data: [],
    },
  ],
}

export const lineOpt = {
  symbol: 'circle',
  symbolSize: 5,
  label: {
    show: true,
    position: 'top',
    formatter: function (val) {
      return `{green|${val.value}%}`
    },
    rich: {
      green: {
        padding: 1,
        backgroundColor: '#67c23a',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#f8f8fa',
        color: '#fff',
      },
    },
  },
  data: [],
  type: 'line',
  name: 'line',
  //   name: this.$t('i18_spec_rate4filter'),
  yAxisIndex: 1,
  tooltip: {
    valueFormatter: function (value) {
      return `${value} %`
    },
  },
}

export const barLeft = {
  //   name: this.$t('i18_spec_dot4ave'),
  name: 'barLeft',
  type: 'bar',
  barMaxWidth: 70,
  barGap: '10%',
  tooltip: {
    valueFormatter: function (value) {
      return `${value}`
    },
  },
  data: [],
  label: {
    show: true,
    rotate: 30,
    // position: 'top'
    textBorderColor: 'inherit',
    textBorderWidth: 2,
  },
}

export const barRight = {
  //   name: this.$t('i18_spec_dot4ave_report'),
  name: 'barRight',
  type: 'bar',
  barMaxWidth: 70,
  tooltip: {
    valueFormatter: function (value) {
      return `${value}`
    },
  },
  data: [],
  label: {
    show: true,
    rotate: 30,
    // position: 'top'
  },
}

export const aiFilterEquipmentColumns = {
  height: '230px',
  columns: [
    {
      label: translate('时间'),
      prop: 'dataTime',
      sortable: true,
      disableCheck: true,
    },
    {
      label: translate('模型'),
      prop: 'modelName',
      sortable: true,
    },
    {
      label: translate('机台'),
      prop: 'machineName',
      sortable: true,
    },
    {
      label: translate(),
      prop: 'productName',
      sortable: true,
    },
    {
      label: translate('批次'),
      prop: 'batchName',
      sortable: true,
    },
    {
      label: translate('板数'),
      prop: 'boardNum',
      sortable: true,
    },
    {
      label: translate('总点数'),
      prop: 'defectPointNum',
      sortable: true,
    },
    {
      label: translate('真点数'),
      prop: 'huNgPointNum',
      sortable: true,
    },
    {
      // aing/总点
      label: translate('真点率'),
      prop: 'okPointRate',
      sortable: true,
    },
    {
      //aing/总点
      label: translate('真图率'),
      prop: 'huNgPicRate',
      sortable: true,
    },
    {
      label: translate('过滤点'),
      prop: 'aiAndHuOkPointNum',
      sortable: true,
    },
    {
      label: translate('过滤图'),
      prop: 'aiAndHuOkPicNum',
      sortable: true,
    },
    {
      label: translate('过滤率'),
      prop: 'filterRate',
      sortable: true,
    },
    {
      label: translate('假点去除率'),
      prop: 'okPointRate',
      sortable: true,
    },
    {
      label: translate('假图去除率'),
      prop: 'okPicRate',
      sortable: true,
    },
  ],
  checkList: [
    translate('时间'),
    translate('模型'),
    translate('机台'),
    translate('料号'),
    translate('批次'),
    translate('板数'),
    translate('总点数'),
    translate('真点数'),
    translate('真点率'),
    translate('过滤点'),
    translate('假点去除率'),
    translate('筛选率'),
  ],
}

export const detectableColumns = {
  height: '230px',
  columns: [
    {
      label: translate('缺陷名'),
      prop: 'label_name',
      sortable: true,
      disableCheck: true,
    },
    {
      label: translate('缺陷数量'),
      prop: 'detectable_num',
      sortable: true,
    },
  ],
  checkList: [translate('缺陷名'), translate('缺陷数量')],
}

export const capacityStaffColumns = {
  height: '230px',
  columns: [
    {
      label: translate('时段'),
      prop: 'label_name',
      sortable: true,
      disableCheck: true,
    },
    {
      label: translate('人员产能'),
      prop: 'detectable_num',
      sortable: true,
    },
  ],
  checkList: [translate('时段'), translate('人员产能')],
}

export const capacityEquipmentColumns = {
  height: '230px',
  columns: [
    {
      label: translate('时段'),
      prop: 'label_name',
      sortable: true,
      disableCheck: true,
    },
    {
      label: translate('设备产能'),
      prop: 'detectable_num',
      sortable: true,
    },
  ],
  checkList: [translate('时段'), translate('设备产能')],
}

export const sortData = (echartData, type, setForm, sortType) => {
  if (typeof sortType == 'undefined') {
    switch (type) {
      case 'time':
        echartData.sort((a, b) => {
          if (dayjs(a.dataTime).isAfter(b.dataTime)) return 1
          else return -1
        })
        break
      case 'matnr':
        echartData.sort((a, b) => {
          if (a.productName > b.productName) return 1
          else return -1
        })
        break
      case 'equipment':
        echartData.sort((a, b) => {
          if (a.machineName > b.machineName) return 1
          else return -1
        })
        break
    }
  }
  if (sortType) {
    switch (setForm.filterType) {
      case '过滤率':
        echartData.sort((a, b) => {
          if (a.filterRate > b.filterRate) return 1
          else return -1
        })
        break
      case '假点过滤率':
        echartData.sort((a, b) => {
          if (a.okPointRate > b.okPointRate) return 1
          else return -1
        })
        break
      case '假图过滤率':
        echartData.sort((a, b) => {
          if (a.okPicRate > b.okPicRate) return 1
          else return -1
        })
        break
    }
  } else if (typeof sortType != 'undefined') {
    switch (setForm.filterType) {
      case '过滤率':
        echartData.sort((a, b) => {
          if (a.filterRate < b.filterRate) return 1
          else return -1
        })
        break
      case '假点过滤率':
        echartData.sort((a, b) => {
          if (a.okPointRate < b.okPointRate) return 1
          else return -1
        })
        break
      case '假图过滤率':
        echartData.sort((a, b) => {
          if (a.okPicRate < b.okPicRate) return 1
          else return -1
        })
        break
    }
  }
}

export const initDistribution = (opt, echartData) => {
  echartData.sort((a, b) => {
    if (a.detectable_num < b.detectable_num) return 1
    else return -1
  })
  const arr = echartData.slice(0, 10)
  opt.yAxis[0].data = []
  opt.series[0].data = []
  arr.reverse()
  arr.map((item) => {
    opt.yAxis[0].data.push(item.label_name)
    opt.series[0].data.push(item.detectable_num)
  })
}

// 放置图形数据
export const initDrawSeries = (opt, echartData, setForm, type) => {
  // 1. 初始化
  opt.series = []
  opt.series.push(deepClone(barLeft))
  opt.series.push(deepClone(barRight))
  opt.series.push(deepClone(lineOpt))
  opt.series[0].name = translate('过滤前平均报点')
  opt.series[1].name = translate('过滤后平均报点')
  opt.series[2].name = translate('假点去除率')
  opt.xAxis[0].data = []
  opt.series[0].data = []
  opt.series[1].data = []
  opt.series[2].data = []
  if (echartData.length === 0) return
  // 2. 放置数据
  echartData.map((item) => {
    if (type === 'matnr') {
      opt.xAxis[0].data.push(item.productName)
    }
    if (type === 'equipment') {
      opt.xAxis[0].data.push(item.machineName)
    }
    if (type === 'time') {
      opt.xAxis[0].data.push(
        // `${dayjs(item.dataTime).format('YYYY-MM-DD/HH')}时`
        item.dataTime
      )
    }
    switch (setForm.filterType) {
      // 点过滤率 = 过滤数 / 总点数 = (AI OK ∪ 人工 OK) / 总点数
      // 假图去除率（标准）= (图AI_OK ∩ 图人工_OK) / (总图数 - 图人工_NG)  假图去除率（灵活）= 图AI_OK / (总图数 * (1 - 真图比例))
      // 假点去除率（标准）= (点AI_OK ∩ 点人工_OK) / (总点数 - 点人工_NG)  假点去除率（灵活）= 点AI_OK / (总点数 * (1 - 真点比例))
      case '过滤率':
        opt.series[0].data.push(item.defectPointNum)
        opt.series[1].data.push(item.aiNgPointNum)
        opt.series[2].data.push(parseFloat(item.filterRate * 100).toFixed(2))
        break
      case '假点过滤率':
        opt.series[0].data.push(item.defectPointNum)
        opt.series[1].data.push(item.aiNgPointNum)
        opt.series[2].data.push(parseFloat(item.okPointRate * 100).toFixed(2))
        break
      case '假图过滤率':
        opt.series[0].data.push(item.picNum)
        opt.series[1].data.push(item.aiNgPicNum)
        opt.series[2].data.push(parseFloat(item.okPicRate * 100).toFixed(2))
        break
    }
  })
  const arr3 = opt.series[0].data.concat(opt.series[1].data)
  opt.yAxis[0].max = Math.max.apply(null, arr3)
  opt.yAxis[1].max = Math.max.apply(null, opt.series[2].data)
}

// 重新渲染折线图和柱状图的颜色
export const drawLineAndBar = (opt, num) => {
  let data1 = opt.series[1].data
  let data2 = opt.series[2].data
  const redArr = [] //记录需要变红的位置
  data2 = data2.map((m) => {
    if (m > num) {
      redArr.push(false)
      return {
        value: m,
      }
    } else {
      redArr.push(true)
      return {
        value: m,
        label: {
          show: true,
          position: 'top',
          formatter: function (val) {
            return `{red|${val.value}%}`
          },
          rich: {
            red: {
              padding: 1,
              backgroundColor: '#f56c6c',
              borderRadius: 4,
              borderWidth: 2,
              borderColor: '#f8f8fa',
              color: '#fff',
            },
          },
        },
        itemStyle: {
          color: '#9bbb5d', //改变折线点的颜色
        },
      }
    }
  })

  data1 = data1.map((value, index) => {
    const redBol = redArr[index]
    if (redBol) {
      return {
        value: value,
        itemStyle: {
          color: '#ff1a16', //改变折线点的颜色
        },
      }
    } else {
      return {
        value: value,
      }
    }
  })
  opt.series[1].data = data1
  opt.series[2].data = data2
}

export const filterOption = [
  {
    value: '过滤率',
    label: translate('过滤率'),
  },
  {
    value: '假点过滤率',
    label: translate('假点过滤率'),
  },
  {
    value: '假图过滤率',
    label: translate('假图过滤率'),
  },
]
