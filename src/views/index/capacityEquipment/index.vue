<template>
  <div
    ref="containerRef"
    class="capacity-management-container echarts-container"
  >
    <div ref="headRef">
      <searchHeadNav ref="searchRef" v-model="searchInfo">
        <el-button v-show="!showByTime" type="primary" @click="serachData">
          {{ translate('查询') }}
        </el-button>
        <el-button v-show="showByTime" type="primary" @click="serachData1">
          {{ translate('查询') }}
        </el-button>
      </searchHeadNav>
    </div>
    <MBar
      ref="barRef"
      :chart-data="chartData"
      :chart-height="cardHeight"
      :chart-width="cardWidth"
      :is-classes="showByTime"
    />
  </div>
</template>

<script setup>
  import { translate } from '@/i18n'
  import searchHeadNav from '@/views/components/searchHeadNav.vue'
  import MBar from './component/multipleBar'
  import dayjs from 'dayjs'
  import { ref, onMounted, nextTick } from 'vue'
  import { findMachineCap, findPeopleCapInShift } from '@/api/job'
  import { recordUserParma } from '@/store/modules/record'
  const store = recordUserParma()
  const searchInfo = ref({
    dateTimes: [],
    machineName: null,
    productName: null,
    timeDimension: 3,
  })
  const chartData = ref([])
  const searchRef = ref(null)
  const containerRef = ref(null)
  const headRef = ref(null)
  const barRef = ref(null)
  const boxHeight = ref(0)
  const cardWidth = ref(0)
  const cardHeight = ref(0)
  /**
   * 根据班次维度调用不同接口
   */
  const showByTime = computed(() => {
    if (searchInfo.value.timeDimension === '班次') {
      return true
    } else {
      return false
    }
  })
  onMounted(async () => {
    searchRef.value.addTimeList({ label: '班次', value: '班次' })
    boxHeight.value = containerRef.value.clientHeight - 20 * 2
    cardWidth.value = headRef.value.clientWidth
    cardHeight.value = boxHeight.value - headRef.value.clientHeight
    await nextTick()
    barRef.value.initChart()
    serachData()
  })
  /**
   * 查询数据
   */
  const serachData = async () => {
    const query = {
      dataSourceId: store.dataSourceId,
      machineName: searchInfo.value.machineName,
      productName: searchInfo.value.productName,
      timeDimension: searchInfo.value.timeDimension,
      startTime: searchInfo.value.dateTimes[0],
      endTime: searchInfo.value.dateTimes[1],
    }
    const res = await findMachineCap(query)
    chartData.value = getDateByTimeDimension(
      res.data,
      searchInfo.value.timeDimension
    )
    nextTick(() => {
      barRef.value.initChart()
    })
  }
  /**
   * 班次
   */
  const serachData1 = async () => {
    const query = {
      dataSourceId: store.dataSourceId,
      machineName: searchInfo.value.machineName,
      productName: searchInfo.value.productName,
      startTime: searchInfo.value.dateTimes[0],
      endTime: searchInfo.value.dateTimes[1],
    }
    const res = await findPeopleCapInShift(query)
    chartData.value = res.data
    nextTick(() => {
      barRef.value.initChart()
    })
  }
  /**
   * 根据维度来控制时间范围
   */
  const getDateByTimeDimension = (data = [], timeDimension) => {
    let _tempData = []
    // 时 1  // 日2
    if ([1, 2].includes(timeDimension)) {
      _tempData = data.filter((el) => {
        const start = el.dataTime
        el.dataTime = `${dayjs(start).format('YYYY-MM-DD HH')}时`
        return el
      })
    }

    // 周 3
    if (timeDimension === 3) {
      _tempData = data.filter((el) => {
        const start = el.dataTime
        const end = new Date(
          new Date(start).getTime() + 1000 * 60 * 60 * 24 * 7 - 1000
        )
        el.dataTime = `${dayjs(start).format('YYYY-MM-DD HH')}时|${dayjs(
          end
        ).format('YYYY-MM-DD HH')}时`
        return el
      })
    }
    // 月 4
    if (timeDimension === 4) {
      _tempData = data.filter((el) => {
        const start = el.dataTime
        const end = new Date(
          new Date(start).getTime() + 1000 * 60 * 60 * 24 * 30 - 1000
        )
        el.dataTime = `${dayjs(start).format('YYYY-MM-DD HH')}时|${dayjs(
          end
        ).format('YYYY-MM-DD HH')}时`
        return el
      })
    }
    console.log('lllllllllll', _tempData)
    return _tempData
  }
</script>
<style scoped lang="scss"></style>
