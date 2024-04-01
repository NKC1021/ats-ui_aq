<template>
  <div ref="contentRef" class="time-management-container echarts-container">
    <div ref="headNavRef">
      <search-head-nav ref="searchRef" v-model="searchInfo">
        <template #search>
          <el-button type="primary" @click="searchData">
            {{ translate('查询') }}
          </el-button>
        </template>
      </search-head-nav>
    </div>

    <div>
      <StackBar
        ref="chartRef"
        :chart-data="chartData"
        :chart-data-obj="chartDataObj"
        :charts-height="cardHeight"
        :charts-width="cardWidth"
      />
    </div>
  </div>
</template>

<script setup>
  import { translate } from '@/i18n'
  import { ref, onMounted, nextTick } from 'vue'
  import { findArsDetectableDate } from '@/api/job'
  import StackBar from './component/stackBar.vue'
  import searchHeadNav from '@/views/components/searchHeadNav.vue'
  import { recordUserParma } from '@/store/modules/record'
  const store = recordUserParma()
  const searchInfo = ref({
    productName: null,
    machineName: null,
    dateTimes: [],
  })
  const chartDataObj = ref({})
  const contentRef = ref(null)
  const headNavRef = ref(null)
  const chartRef = ref(null)
  const searchRef = ref(null)
  const contentHeight = ref(0)
  const cardWidth = ref(0)
  const cardHeight = ref(0)
  const chartData = ref([])
  onMounted(async () => {
    contentHeight.value = contentRef.value.clientHeight
    cardWidth.value = contentRef.value.clientWidth - 20 * 2
    cardHeight.value =
      contentHeight.value - headNavRef.value.clientHeight - 20 * 2
    await nextTick()
    chartRef.value.initChart()
    searchData()
  })
  /**
   * 查询数据
   */
  const searchData = async () => {
    const query = {
      dataSourceId: store.dataSourceId,
      machineName: searchInfo.value.machineName,
      productName: searchInfo.value.productName,
      startTime: searchInfo.value.dateTimes[0],
      endTime: searchInfo.value.dateTimes[1],
    }
    const res = await findArsDetectableDate(query)
    if (res.code === 0) {
      chartData.value = [...res.data]
    }

    nextTick(() => {
      chartRef.value.initChart()
    })
  }
</script>
