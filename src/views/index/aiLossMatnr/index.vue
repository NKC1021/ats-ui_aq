<template>
  <div ref="contentRef" class="ailoss-management-container echarts-container">
    <div ref="headNavRef">
      <search-head-nav v-model="searchInfo">
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
        :target-val="searchInfo.targetVal"
        @chart-dbl-click="chartDblClick"
      />
    </div>
    <chart-view-details ref="chartDetailsRef" :chart-param="chartParam" />
    <FilterTable :column-config="aiFilterEquipmentColumns" />
  </div>
</template>

<script setup>
  import Bar from './component/bar.vue'
  import { translate } from '@/i18n'
  import { findLossRateProduct } from '@/api/job'
  import { ref, onMounted, nextTick } from 'vue'
  import searchHeadNav from '@/views/components/searchHeadNav.vue'
  import chartViewDetails from '@/views/components/chartViewDetails.vue'
  import FilterTable from '@/views/components/aiFilter/FilterTable.vue'
  import { recordUserParma } from '@/store/modules/record'
  const state = recordUserParma()
  const searchInfo = ref({
    machineName: null,
    modelName: null,
    productName: null,
    dateTimes: [],
    targetVal: 0,
  })
  const aiFilterEquipmentColumns = {
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
  const chartParam = ref({})
  const chartDetailsRef = ref(null)
  const barRef = ref(null)
  const contentRef = ref(null)
  const headNavRef = ref(null)
  const contentHeight = ref(0)
  const cardWidth = ref(0)
  const cardHeight = ref(0)
  const chartData = ref([])
  onMounted(async () => {
    contentHeight.value = contentRef.value.clientHeight - 20 * 2
    cardWidth.value = contentRef.value.clientWidth - 20 * 2
    cardHeight.value = contentHeight.value - headNavRef.value.clientHeight
    await nextTick()
    barRef.value.initChart()
    searchData()
  })

  /**
   * 查询料号数据
   */
  const searchData = async () => {
    const query = {
      dataSourceId: state.dataSourceId,
      machineName: searchInfo.value.machineName,
      modelName: searchInfo.value.modelName,
      productName: searchInfo.value.productName,
      startTime: searchInfo.value.dateTimes[0],
      endTime: searchInfo.value.dateTimes[1],
    }
    const res = await findLossRateProduct(query)
    if (res.code === 0) {
      chartData.value = res.data
      nextTick(() => {
        barRef.value.initChart()
      })
    }
  }
  /**
   * 视图双击事件
   */
  const chartDblClick = (param) => {
    const params = JSON.parse(JSON.stringify(searchInfo.value))
    params.productName = param.name
    chartParam.value = params

    nextTick(() => {
      chartDetailsRef.value.initData()
    })
  }
</script>
