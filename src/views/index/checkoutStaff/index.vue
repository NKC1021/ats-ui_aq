<!--
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-03-20 15:54:09
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-04-17 10:50:48
 * @FilePath: \admin-plus\src\views\index\checkoutStaff\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div ref="contentRef" class="staff-management-container echarts-container">
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
      <Bar
        ref="barRef"
        :chart-data="chartData"
        :charts-height="cardHeight"
        :charts-width="cardWidth"
      />
    </div>
  </div>
</template>

<script setup>
  import { translate } from '@/i18n'
  import Bar from './component/bar.vue'
  import { ref, nextTick, onMounted } from 'vue'
  import { findArsDetectablePeople } from '@/api/job'
  import searchHeadNav from '@/views/components/searchHeadNav.vue'
  import { recordUserParma } from '@/store/modules/record'
  const store = recordUserParma()
  const searchInfo = ref({
    productName: null,
    machineName: null,
    dateTimes: [],
  })
  const barRef = ref(null)
  const chartData = ref([])
  const contentRef = ref(null)
  const headNavRef = ref(null)
  const searchRef = ref(null)
  const contentHeight = ref(0)
  const cardWidth = ref(0)
  const cardHeight = ref(0)
  onMounted(async () => {
    contentHeight.value = contentRef.value.clientHeight
    cardWidth.value = contentRef.value.clientWidth - 20 * 2
    cardHeight.value =
      contentHeight.value - headNavRef.value.clientHeight - 20 * 2
    await nextTick()
    barRef.value.initChart()
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
    const res = await findArsDetectablePeople(query)
    if (res.code === 0) {
      chartData.value = res.data
      // console.log('value:::', chartData.value)
      nextTick(() => {
        barRef.value.initChart()
      })
    }
    //
  }
</script>
