<template>
  <vab-card class="branch" shadow="hover" skeleton>
    <template #header>
      <div class="card-header">
        <span>
          <vab-icon icon="bar-chart-box-line" />
          {{ translate('AI过滤') }}
        </span>
        <div>
          <el-tooltip :content="translate('排序')" placement="bottom">
            <el-button
              icon="Sort"
              style="margin-left: 10px"
              type="text"
              @click="handleSort(true)"
            />
          </el-tooltip>
          <el-tooltip :content="translate('还原')" placement="bottom">
            <el-button icon="Refresh" type="text" @click="handleSort(false)" />
          </el-tooltip>
        </div>
      </div>
    </template>
    <vab-chart
      class="branch-echart"
      :init-options="initOptions"
      :option="option"
      theme="aqs-echarts-theme"
    />
  </vab-card>
</template>

<script setup>
  import { translate } from '@/i18n'
  import VabChart from '@/plugins/VabChart'
  import {
    opt,
    initDrawSeries,
    drawLineAndBar,
    sortData,
  } from '@/views/components/aiFilter/option.js'
  const props = defineProps({
    aiFilterData: {
      type: Array,
      default: () => [],
    },
  })

  const initOptions = ref({
    renderer: 'svg',
  })
  const setForm = ref({
    filterType: '过滤率',
    filterDisplaySet: 70, //低于设置值的变红色，可点击跳转报表
  })
  const option = ref({ ...opt })
  Reflect.deleteProperty(option.value, 'title')
  option.value.grid = {
    top: '15%',
    right: '8%',
    left: '10%',
    bottom: '20%',
  }
  option.value.dataZoom[0].endValue = 5

  const echartData = ref([])
  watch(
    props,
    () => {
      echartData.value = []
      echartData.value = [...props.aiFilterData]
      sortData(echartData.value, 'time', setForm.value)
      initDrawSeries(option.value, echartData.value, setForm.value, 'time')
      drawLineAndBar(option.value, setForm.value.filterDisplaySet)
    },
    { deep: true }
  )

  const sortType = ref(true)
  const handleSort = (bol) => {
    bol
      ? sortData(
          echartData.value,
          'time',
          setForm.value,
          (sortType.value = !sortType.value)
        )
      : sortData(echartData.value, 'time', setForm.value)
    initDrawSeries(option.value, echartData.value, setForm.value, 'time')
    drawLineAndBar(option.value, setForm.value.filterDisplaySet)
  }
</script>
<style lang="scss" scoped>
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 18px;
  }
</style>
