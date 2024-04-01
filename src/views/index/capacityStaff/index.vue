<template>
  <div
    ref="containerRef"
    class="capacity-management-container echarts-container"
  >
    <el-tabs :style="`height: ${boxHeight}px`" tab-position="left">
      <el-tab-pane :label="translate('人员')">
        <div ref="headRef">
          <searchHeadNav v-model="searchInfo">
            <el-button type="primary" @click="searchDataByPeople">
              {{ translate('查询') }}
            </el-button>
          </searchHeadNav>
        </div>
        <Bar
          ref="barByPeople"
          :chart-data="chartDataByPeople"
          :chart-height="cardHeight"
          :chart-width="cardWidth"
        />
      </el-tab-pane>
      <el-tab-pane :label="translate('日期')">
        <div>
          <searchHeadNav v-model="searchInfoByDate">
            <el-button type="primary" @click="searchDataByTime">
              {{ translate('查询') }}
            </el-button>
          </searchHeadNav>
        </div>
        <Bar
          ref="barByTime"
          :chart-data="chartDataByTime"
          :chart-height="cardHeight"
          :chart-width="cardWidth"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
  import Bar from './component/bar'
  import searchHeadNav from '@/views/components/searchHeadNav.vue'
  import { ref, onMounted, nextTick } from 'vue'
  import { findPeopleCapInPeople, findPeopleCapInTime } from '@/api/job'
  import { recordUserParma } from '@/store/modules/record'
  import { translate } from '@/i18n'
  const store = recordUserParma()
  const searchInfo = ref({
    dateTimes: [],
    machineName: null,
    productName: null,
  })
  const searchInfoByDate = ref({
    dateTimes: [],
    machineName: null,
    productName: null,
    peopleName: null,
    timeDimension: 3,
  })
  const chartDataByPeople = ref([])
  const chartDataByTime = ref([])
  const barByPeople = ref(null)
  const barByTime = ref(null)
  const containerRef = ref(null)
  const headRef = ref(null)
  const boxHeight = ref(0)
  const cardWidth = ref(0)
  const cardHeight = ref(0)
  onMounted(async () => {
    boxHeight.value = containerRef.value?.clientHeight - 20 * 2
    await nextTick()
    cardWidth.value = headRef.value?.clientWidth
    cardHeight.value = boxHeight.value - headRef.value?.clientHeight
    await nextTick()
    barByPeople.value.initChart()
    barByTime.value.initChart()
    searchDataByPeople()
    searchDataByTime()
  })
  /**
   * 人员维度
   */
  const searchDataByPeople = async () => {
    const query = {
      dataSourceId: store.dataSourceId,
      machineName: searchInfo.value.machineName,
      productName: searchInfo.value.productName,
      startTime: searchInfo.value.dateTimes[0],
      endTime: searchInfo.value.dateTimes[1],
    }
    const res = await findPeopleCapInPeople(query)
    chartDataByPeople.value = res.data
    nextTick(() => {
      barByPeople.value.initChart()
    })
  }
  /**
   * 时间维度
   */
  const searchDataByTime = async () => {
    const query = {
      dataSourceId: store.dataSourceId,
      machineName: searchInfoByDate.value.machineName,
      productName: searchInfoByDate.value.productName,
      peopleName: searchInfoByDate.value.peopleName,
      startTime: searchInfoByDate.value.dateTimes[0],
      endTime: searchInfoByDate.value.dateTimes[1],
      timeDimension: searchInfoByDate.value.timeDimension,
    }
    const res = await findPeopleCapInTime(query)
    chartDataByTime.value = res.data
    nextTick(() => {
      barByTime.value.initChart()
    })
  }
</script>
<style scoped lang="scss">
  .box-content {
    width: 100%;
    height: 100%;
    display: flex;
    // flex-direction: column;
    .box-content-top,
    .box-content-bottom {
      width: 100%;
      height: 100%;
      flex: 1;
      // background-color: #e9f7e4;
    }
    .box-content-top {
      padding-right: 10px;
    }
    .box-content-bottom {
      padding-left: 10px;
    }
  }
  .card-content {
    height: 100%;
    width: 100%;
    // background-color: rgb(234, 253, 247);
  }
</style>
