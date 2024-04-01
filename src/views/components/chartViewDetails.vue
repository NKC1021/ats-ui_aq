<template>
  <el-dialog
    v-model="dialogVisible"
    :before-close="handleClose"
    class="chart-detail"
    :close-on-click-modal="false"
    top="12vh"
    width="75%"
  >
    <template #header>
      <search-head-nav ref="searchRef" v-model="searchInfo">
        <template #search>
          <el-button type="primary" @click="searchData">
            {{ translate('查询') }}
          </el-button>
        </template>
      </search-head-nav>
    </template>
    <el-table :data="tableData" :max-height="650">
      <el-table-column :label="translate('时间')" prop="time_name" />
      <el-table-column :label="translate('模型')" prop="model_name" />
      <el-table-column :label="translate('机台')" prop="machine_name" />
      <el-table-column :label="translate('料号')" prop="product_name" />
      <el-table-column :label="translate('批次')" prop="batch_name" />
      <el-table-column :label="translate('板数')" prop="board_num" />
      <el-table-column :label="translate('点总数')" prop="defect_num" />
      <el-table-column :label="translate('真点数')" prop="ai_ng_num" />
      <el-table-column :label="translate('真点率')" prop="ai_ng_per" />
      <el-table-column :label="translate('漏失点')" prop="loss_num" />
      <el-table-column :label="translate('漏失率')" prop="loss_rate" />
      <template #empty>
        <el-empty class="vab-data-empty" :description="translate('暂无数据')" />
      </template>
    </el-table>
  </el-dialog>
</template>
<script setup>
  import { ref } from 'vue'
  import { findLossRateDetail } from '@/api/job'
  import { translate } from '@/i18n'
  import searchHeadNav from '@/views/components/searchHeadNav.vue'
  import { recordUserParma } from '@/store/modules/record'
  const store = recordUserParma()
  const props = defineProps({
    chartParam: {
      type: Object,
      default: () => {
        return {}
      },
    },
  })
  const searchRef = ref(null)
  const dialogVisible = ref(false)
  const tableData = ref([])
  const searchInfo = ref({
    machineName: '',
    modelName: '',
    dateTimes: [],
    targetVal: 0,
  })
  const handleClose = () => {
    searchInfo.value = {
      machineName: '',
      modelName: '',
      dateTimes: [],
      targetVal: 0,
    }
    dialogVisible.value = false
  }
  /**
   * 初始化数据
   */
  const searchData = async () => {
    const _obj = Object.assign({ ...props.chartParam }, { ...searchInfo.value })
    const query = {
      dataSourceId: store.dataSourceId,
      machineName: _obj.machineName === '' ? null : _obj.machineName,
      modelName: _obj.modelName === '' ? null : _obj.modelName,
      productName: _obj.productName === '' ? null : _obj.productName,
      startTime: _obj.dateTimes[0],
      endTime: _obj.dateTimes[1],
    }
    const res = await findLossRateDetail(query)
    tableData.value = res.data
  }
  /**
   * 向父组件抛出一个方法
   */
  const initData = async () => {
    dialogVisible.value = true
    await nextTick()
    Object.keys(searchInfo.value).forEach((key) => {
      searchInfo.value[key] = props.chartParam[key]
    })
    searchData()
  }

  defineExpose({
    initData,
  })
</script>
<style lang="scss">
  .chart-detail {
    header {
      padding-bottom: 0px !important;
    }
    .el-dialog__body {
      padding-top: 0px !important;
    }
  }
</style>
