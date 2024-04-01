<!--
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-03-20 15:55:00
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-04-18 20:30:26
 * @FilePath: \admin-plus\src\views\index\aiFilterEquipment\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="echarts-container ai-filter">
    <!-- 顶部操作区域 -->
    <div class="query-form">
      <query-form
        ref="queryFormRef"
        :query-type="queryType"
        :query-type-val="queryTypeVal"
        @ClearQueryTypeVal="ClearQueryTypeVal"
        @get-data="getData"
        @handle-is-show-table="HandleIsShowTable"
        @loadding="handleLoadding"
      />
    </div>
    <div style="position: relative">
      <!-- 统计图右上方操作区域 -->
      <div v-show="!isShowTable" class="chart-option">
        <el-tooltip effect="dark" placement="top">
          <template #content>
            <span>
              {{
                translate(
                  '过滤率 = 过滤数 / 总点数 = (AI OK ∪ 人工 OK) / 总点数'
                )
              }}
            </span>
            <br />
            <span>
              {{
                translate(
                  '假点去除率（标准）= (点AI_OK ∩ 点人工_OK) / (总点数 - 点人工_NG)'
                )
              }}
            </span>
            <br />
            <span>
              {{
                translate(
                  '假图去除率（标准）= (图AI_OK ∩ 图人工_OK) / (总图数 - 图人工_NG)'
                )
              }}
            </span>
            <br />
          </template>
          <vab-icon icon="question-line" style="margin-right: 5px" />
        </el-tooltip>
        <el-select
          v-model="setForm.filterType"
          :placeholder="translate('请选择类型')"
          size="small"
          @change="popoverSubmit"
        >
          <el-option
            v-for="item in filterOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input-number
          id="percentInput"
          v-model="setForm.filterDisplaySet"
          :max="100"
          :min="0"
          :precision="2"
          size="small"
          :step="10"
          style="margin-left: 5px"
          @change="popoverSubmit"
        />
        <el-tooltip :content="translate('排序')" placement="bottom">
          <el-button
            icon="Sort"
            link
            style="margin-left: 10px"
            type="primary"
            @click="handleSort(true)"
          />
        </el-tooltip>
        <el-tooltip :content="translate('还原')" placement="bottom">
          <el-button
            icon="Refresh"
            link
            type="primary"
            @click="handleSort(false)"
          />
        </el-tooltip>
      </div>
      <!-- 统计图 -->
      <vab-chart
        v-show="!isShowTable"
        :init-options="initOptions"
        :option="option"
        theme="aqs-echarts-theme"
        @chart-dbl-click="chartDblClick"
      />
      <!-- 统计表 -->
      <FilterTable
        v-show="isShowTable"
        :column-config="aiFilterEquipmentCol"
        :loadding="loadding"
        :table-data="tableData"
      />
    </div>
  </div>
</template>

<script setup>
  import VabChart from '@/plugins/VabChart'
  import QueryForm from '@/views/components/aiFilter/QueryForm.vue'
  import FilterTable from '@/views/components/aiFilter/FilterTable.vue'
  import { translate } from '@/i18n'
  import {
    opt,
    initDrawSeries,
    drawLineAndBar,
    sortData,
    filterOption,
    aiFilterEquipmentColumns,
  } from '@/views/components/aiFilter/option.js'
  // 表格高度
  const aiFilterEquipmentCol = ref({ ...aiFilterEquipmentColumns })
  const $baseTableHeight = inject('$baseTableHeight')
  aiFilterEquipmentCol.value.height = $baseTableHeight(1)
  const queryFormRef = ref(null)
  const queryTypeVal = ref('')
  const queryType = ref({
    type: 'matnr',
  })
  const initOptions = ref({
    renderer: 'svg',
  })
  const setForm = ref({
    filterType: '过滤率',
    filterDisplaySet: 70, //低于设置值的变红色，可点击跳转报表
  })
  const option = ref(opt)
  const echartData = ref([])
  const tableData = ref([])
  option.value.title.text = translate('AI过滤-料号')
  const getData = (data) => {
    isShowTable.value = data.isShowTable
    if (!isShowTable.value) {
      echartData.value = [...data.data]
      sortData(echartData.value, 'matnr', setForm.value)
      initDrawSeries(option.value, echartData.value, setForm.value, 'matnr')
      drawLineAndBar(option.value, setForm.value.filterDisplaySet)
      console.log('触发查询', option.value, option.value.series[0].data)
    } else {
      tableData.value = [...data.data]
    }
  }

  const loadding = ref(false)
  const handleLoadding = (data) => {
    loadding.value = data
  }

  const popoverSubmit = () => {
    // setForm.value = { ...data }
    sortData(echartData.value, 'matnr', setForm.value)
    initDrawSeries(option.value, echartData.value, setForm.value, 'matnr')
    drawLineAndBar(option.value, setForm.value.filterDisplaySet)
  }

  const isShowTable = ref(false)
  const HandleIsShowTable = (data) => {
    console.log('显示', data)
    isShowTable.value = data
  }

  const ClearQueryTypeVal = () => {
    queryTypeVal.value = ''
  }

  const sortType = ref(true)
  const handleSort = (bol) => {
    bol
      ? sortData(
          echartData.value,
          'matnr',
          setForm.value,
          (sortType.value = !sortType.value)
        )
      : sortData(echartData.value, 'matnr', setForm.value)
    initDrawSeries(option.value, echartData.value, setForm.value, 'matnr')
    drawLineAndBar(option.value, setForm.value.filterDisplaySet)
  }
  /**
   * 视图双击
   */
  const chartDblClick = (params) => {
    queryTypeVal.value = params.name
    nextTick(() => {
      queryFormRef.value.HandleIsShowTable()
    })
  }
  onMounted(() => {})
</script>

<style lang="scss" scoped></style>
