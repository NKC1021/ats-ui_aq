<template>
  <div ref="boxRef" class="defect-management-container echarts-container">
    <div ref="headRef">
      <search-head-nav ref="searchRef" v-model="searchInfo">
        <el-button type="primary" @click="serachData">查询</el-button>
      </search-head-nav>
    </div>
    <div>
      <charts
        ref="chartsRef"
        :chart-data="chartData"
        :charts-data-obj="chartsDataObj"
        :charts-height="charstHeight"
        :charts-width="charstWidth"
      />
    </div>
  </div>
</template>

<script setup>
  import { findArsDetectableLabel } from '@/api/job'
  import { ref, onMounted, nextTick } from 'vue'
  import Charts from './component/bar'
  import searchHeadNav from '@/views/components/searchHeadNav.vue'
  import { recordUserParma } from '@/store/modules/record'
  const store = recordUserParma()
  const searchInfo = ref({
    machineName: null,
    productName: null,
    dateTimes: [],
  })
  const chartData = ref([])
  const chartsDataObj = ref({})
  const chartsRef = ref(null)
  const boxRef = ref(null)
  const headRef = ref(null)
  const searchRef = ref(null)
  const contentHeight = ref(0)
  const charstWidth = ref(0)
  const charstHeight = ref(0)
  onMounted(async () => {
    contentHeight.value =
      boxRef.value?.clientHeight - headRef.value?.clientHeight - 20 * 2
    charstWidth.value = headRef.value?.clientWidth
    charstHeight.value = contentHeight.value
    await nextTick()
    chartsRef.value.initCharts()
    serachData()
  })
  /**
   * 查询数据
   */
  const serachData = async () => {
    const query = {
      dataSourceId: store.dataSourceId, //todo
      machineName: searchInfo.value.machineName,
      productName: searchInfo.value.productName,
      startTime: searchInfo.value.dateTimes[0],
      endTime: searchInfo.value.dateTimes[1],
    }
    const res = await findArsDetectableLabel(query)
    chartData.value = res.data
    nextTick(() => {
      chartsRef.value.initCharts()
    })
  }
</script>
