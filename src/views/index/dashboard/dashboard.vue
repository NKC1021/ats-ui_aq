<!--
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-02-06 11:59:51
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-04-23 15:07:00
 * @FilePath: \admin-plus\src\views\index\dashboard\dashboard.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- <el-col :span="24" /> -->
      <el-col :lg="6" :md="12" :sm="24" :xl="6" :xs="24">
        <top-card
          background="blue"
          :count-config="capacityConfig"
          icon="line-chart-fill"
          :percentage="capacityConfig.percentage"
          :title="translate('设备/人员总产能')"
          type="1"
        />
      </el-col>
      <el-col :lg="6" :md="12" :sm="24" :xl="6" :xs="24">
        <top-card
          background="white"
          :count-config="aiFilterConfig"
          icon="bar-chart-box-line"
          :percentage="aiFilterConfig.percentage"
          :title="translate('报点过滤率')"
          type="1"
        />
      </el-col>
      <el-col :lg="6" :md="12" :sm="24" :xl="6" :xs="24">
        <top-card
          background="white"
          :count-config="distributionConfig"
          icon="pie-chart-2-line"
          :percentage="distributionConfig.percentage"
          :title="translate('缺陷类别总数')"
          type="2"
        />
      </el-col>
      <el-col :lg="6" :md="12" :sm="24" :xl="6" :xs="24">
        <top-card
          background="white"
          :count-config="distributionConfig1"
          icon="pie-chart-line"
          :percentage="distributionConfig1.percentage"
          :title="translate('缺陷总点数')"
          type="3"
        />
      </el-col>
      <el-col :lg="9" :md="12" :sm="24" :xl="9" :xs="24">
        <capacity :capacity-data="capacityData" />
      </el-col>
      <el-col :lg="9" :md="12" :sm="24" :xl="9" :xs="24">
        <aiFilter :ai-filter-data="aiFilterData" />
      </el-col>
      <el-col :lg="6" :md="12" :sm="24" :xl="6" :xs="24">
        <distribution :distribution-data="distributionData" />
      </el-col>
      <el-col :lg="24" :md="24" :sm="24" :xl="24" :xs="24">
        <tabs :table-data="tableData" />
      </el-col>
    </el-row>

    <div class="dashboard-query" @click="handleShowFloatOut">
      <el-button
        class="query-button"
        icon="Search"
        plain
        size="small"
        type="primary"
      >
        {{ translate('查询') }}
      </el-button>
    </div>
    <transition name="float-out">
      <div v-if="showFloatOut" class="query-form-view">
        <el-form
          class="query-form"
          :label-position="right"
          label-width="49px"
          :model="queryForm"
          @submit.prevent
        >
          <el-form-item class="refresh-frequency" :label="translate('刷新')">
            <el-select v-model="queryForm.refresh" placeholder="">
              <el-option
                v-for="item in refreshList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="query-time-arr" :label="translate('时间')">
            <el-date-picker
              v-model="queryForm.dateArr"
              :end-placeholder="translate('结束时间')"
              range-separator="To"
              :shortcuts="shortcutsList"
              :size="size"
              :start-placeholder="translate('开始时间')"
              type="datetimerange"
            />
          </el-form-item>
          <el-form-item class="query-button">
            <el-button
              icon="Search"
              native-type="submit"
              type="primary"
              @click="getRunning"
            >
              {{ translate('查询') }}
            </el-button>
            <el-button
              icon="ArrowRightBold"
              type=""
              @click="handleShowFloatOut"
            >
              {{ translate('收起') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>
  </div>
</template>

<script setup>
  import aiFilter from './components/aiFilter'
  import capacity from './components/capacity'
  import distribution from './components/distribution'
  import tabs from './components/Tabs'
  import TopCard from './components/TopCard'
  import { shortcutsList } from '@/utils/timeConst'
  import {
    findArsFilterDate,
    findArsDetectableLabel,
    findMachineCap,
    findPeopleCapInTime,
  } from '@/api/job'
  import { recordUserParma } from '@/store/modules/record'
  import { translate } from '@/i18n'
  import dayjs from 'dayjs'
  const store = recordUserParma()

  const refreshList = ref([
    {
      label: 'off',
      value: 0,
    },
    {
      label: '5s',
      value: 5000,
    },
    {
      label: '15s',
      value: 15000,
    },
    {
      label: '30s',
      value: 30000,
    },
    {
      label: '1m',
      value: 60000,
    },
    {
      label: '5m',
      value: 300000,
    },
    {
      label: '15m',
      value: 900000,
    },
    {
      label: '30m',
      value: 1800000,
    },
  ])
  const capacityConfig = ref({
    startVal: 0,
    endVal: 85.12,
    decimals: 2,
    prefix: '',
    suffix: '%',
    separator: ',',
    duration: 3000,
    percentage: '10%',
  })
  const distributionConfig = ref({
    startVal: 0,
    endVal: 100,
    decimals: 2,
    prefix: '',
    suffix: '',
    separator: ',',
    duration: 1000,
    percentage: '',
  })
  const distributionConfig1 = ref({ ...distributionConfig.value })
  const aiFilterConfig = ref({ ...distributionConfig.value })

  const queryForm = ref({
    dataSourceId: store.dataSourceId, //数据源id
    machineName: null, //机台
    modelName: null, //模型
    productName: null, //料号
    timeDimension: null, //查询时间维度
    startTime: shortcutsList[0].value()[0], //开始时间
    endTime: shortcutsList[0].value()[1], //结束时间

    dateArr: shortcutsList[1].value(),
    type: '过滤率',
    filterDisplaySet: 70, //低于设置值的变红色，可点击跳转报表

    refresh: 15000,
  })
  // 获取字典表
  const ARS_MACHINE = ref([])
  const ARS_MODEL = ref([])
  const ARS_PRODUCT = ref([])
  const TIME_DIMENSION = ref([])
  const getSysDictionary = async () => {
    const state = recordUserParma()
    ARS_MACHINE.value = state.ARS_MACHINE
    ARS_MODEL.value = state.ARS_MODEL
    ARS_PRODUCT.value = state.ARS_PRODUCT
    TIME_DIMENSION.value = state.TIME_DIMENSION
    const obj = TIME_DIMENSION.value.filter((item) => item.label === '时')
    console.log('obj.value=====', obj, obj[0].value)
    queryForm.value.timeDimension = obj[0].value
  }

  const showFloatOut = ref(false)
  const handleShowFloatOut = () => {
    showFloatOut.value = !showFloatOut.value
  }
  // 查询
  const aiFilterData = ref([])
  const distributionData = ref([])
  const tableData = ref({
    aiFilter: [],
    detectable: [],
    capacityStaff: [],
    capacityEquipment: [],
  })
  const queryData = async () => {
    aiFilterConfig.value.endVal = 0
    distributionConfig.value.endVal = 0
    distributionConfig1.value.endVal = 0
    queryForm.value.startTime = queryForm.value.dateArr[0]
    queryForm.value.endTime = queryForm.value.dateArr[1]
    await queryDetectableLabel()
    await queryFilterDate()
    await queryMachineCap()
    await queryPeopleCapInTime()
  }

  const queryDetectableLabel = async () => {
    const res = await findArsDetectableLabel(queryForm.value)
    if (res.code === 0) {
      const dataArr = res.data
      distributionData.value = [...dataArr]
      tableData.value.detectable = [...dataArr]
      distributionConfig.value.endVal = dataArr.length
      let sum = 0
      dataArr.forEach((item) => {
        sum += item.detectable_num
      })
      dataArr.sort((a, b) => {
        if (a.detectable_num < b.detectable_num) return 1
        else return -1
      })
      if (dataArr.length > 0) {
        distributionConfig.value.percentage = dataArr[0].label_name
        distributionConfig1.value.percentage = dataArr[0].detectable_num
      }
      distributionConfig1.value.endVal = sum
    }
  }

  const queryFilterDate = async () => {
    const res = await findArsFilterDate(queryForm.value)
    if (res.code === 0) {
      const dataArr = [...res.data]
      aiFilterData.value = [...dataArr]
      tableData.value.aiFilter = [...dataArr]
      dataArr.sort((a, b) => {
        if (dayjs(a.dataTime).isAfter(b.dataTime)) return -1
        else return 1
      })
      if (dataArr.length > 0) {
        const num = dataArr[0].filterRate * 100
        aiFilterConfig.value.endVal = parseFloat(num.toPrecision(4))
      }
      let percentage = ''
      if (dataArr.length > 1) {
        const num = dataArr[0].filterRate * 100 - dataArr[1].filterRate * 100
        percentage = parseFloat(num.toPrecision(4))
      }
      aiFilterConfig.value.percentage = `${percentage}%`
      aiFilterConfig.value.suffix = '%'
    }
  }
  const machineCapList = ref([])
  const queryMachineCap = async () => {
    const query = Object.assign(queryForm.value, { timeDimension: 1 })
    const res = await findMachineCap(query)
    // console.log('res1:::', res)
    machineCapList.value = res.data
  }
  const peopleCapInTimeList = ref([])
  const queryPeopleCapInTime = async () => {
    const query = Object.assign(queryForm.value, { timeDimension: 1 })
    const res = await findPeopleCapInTime(query)
    peopleCapInTimeList.value = res.data
    // console.log('res2:::', res)
  }
  const capacityData = computed(() => {
    let _map = new Map()
    peopleCapInTimeList.value.forEach((el) => {
      if (_map.has(el.DataTime)) {
        //
      } else {
        const _obj = {
          peo: el.CheckNum,
          equ: 0,
        }
        _map.set(el.DataTime, _obj)
      }
    })
    machineCapList.value.forEach((el) => {
      if (_map.has(el.DataTime)) {
        const _obj = _map.get(el.DataTime)
        _obj['equ'] = el.CheckNum
        _map.set(el.DataTime, _obj)
      } else {
        const _obj = {
          peo: 0,
          equ: el.CheckNum,
        }
        _map.set(el.DataTime, _obj)
      }
    })
    // 排序
    const _tempMap = Array.from(_map)
    _tempMap.sort((a, b) => {
      return new Date(a) - new Date(b)
    })

    _map = new Map(_tempMap)
    const capacityObj = {}
    const timeList = []
    const peoList = []
    const equList = []
    _map.forEach((val, key) => {
      const year = key.slice(0, key.indexOf('T'))
      let hour = new Date(key).getHours()
      hour = hour >= 10 ? `${hour}` : `0${hour}`
      // capacityObj[`${year}/${hour}时`] = val
      timeList.push(`${year}/${hour}时`)
      peoList.push(val.peo)
      equList.push(val.equ)
    })

    capacityObj['timeList'] = timeList
    capacityObj['peoList'] = peoList
    capacityObj['aquList'] = equList
    console.log('capacityObj::::', capacityObj)
    return capacityObj
  })

  let timer = null
  const getRunning = async () => {
    queryData()
    clearInterval(timer)
    if (queryForm.value.refresh != 0) {
      timer = setInterval(() => {
        queryData()
      }, queryForm.value.refresh)
    }
  }

  onMounted(async () => {
    await getSysDictionary()
    getRunning()
  })
  onUnmounted(() => {
    clearInterval(timer)
  })
</script>

<style lang="scss" scoped>
  .dashboard-container {
    padding: 0 !important;
    background: $base-color-background !important;

    :deep() {
      .el-card {
        height: 300px;

        [class*='-echart'] {
          width: 100%;
          height: 200px;
        }
      }
    }

    .dashboard-query {
      position: absolute;
      top: 41px;
      right: 41px;
      .query-button {
        padding: 2px 7px;
      }
    }
    .query-form-view {
      position: absolute;
      top: 21px;
      right: 21px;
      width: 451px;
      height: 166px;
      background-color: #fff;
      border-radius: var(--el-border-radius-base);
      box-shadow: 0px 12px 12px 0 rgb(0 0 0 / 7%);
      .query-form {
        padding: 15px;
      }
      :deep() {
        .el-form-item {
          margin-right: 0px !important;
        }
        .refresh-frequency .el-input {
          width: 370px;
        }
        .el-date-editor .el-range-input {
          width: 40%;
        }
      }
      .query-button {
        float: right;
      }
    }
    .float-out-enter-active {
      transition: all 0.3s ease-out;
    }
    .float-out-leave-active {
      transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
    }
    .float-out-enter,
    .float-out-leave-to {
      // width: 0px;
      opacity: 0;
      transform: translateX(100px);
    }
  }
</style>
