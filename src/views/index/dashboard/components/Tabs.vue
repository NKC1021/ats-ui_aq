<!--
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-02-06 11:59:51
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-04-18 20:37:57
 * @FilePath: \admin-plus\src\views\index\dashboard\components\Tabs.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="tabs">
    <vab-card class="tabs-card" shadow="hover">
      <el-tabs v-model="activeName">
        <el-tab-pane :label="translate('设备产能')" name="first">
          <FilterTable
            :column-config="capacityEquipmentCol"
            :loadding="loadding"
            :table-data="tableData.capacityEquipment"
          />
        </el-tab-pane>
        <el-tab-pane :label="translate('人员产能')" name="second">
          <FilterTable
            :column-config="capacityStaffCol"
            :loadding="loadding"
            :table-data="tableData.capacityStaff"
          />
        </el-tab-pane>
        <el-tab-pane :label="translate('AI过滤')" name="third">
          <FilterTable
            :column-config="aiFilterEquipmentCol"
            :loadding="loadding"
            :table-data="tableData.aiFilter"
          />
        </el-tab-pane>
        <el-tab-pane :label="translate('缺陷分布')" name="fourth">
          <FilterTable
            :column-config="detectableCol"
            :loadding="loadding"
            :table-data="tableData.detectable"
          />
        </el-tab-pane>
      </el-tabs>
    </vab-card>
  </div>
</template>

<script setup>
  import { translate } from '@/i18n'
  import FilterTable from '@/views/components/aiFilter/FilterTable.vue'
  import {
    detectableColumns,
    aiFilterEquipmentColumns,
    capacityStaffColumns,
    capacityEquipmentColumns,
  } from '@/views/components/aiFilter/option.js'
  const detectableCol = ref({ ...detectableColumns })
  const aiFilterEquipmentCol = ref({ ...aiFilterEquipmentColumns })
  const capacityStaffCol = ref({ ...capacityStaffColumns })
  const capacityEquipmentCol = ref({ ...capacityEquipmentColumns })
  const activeName = ref('fourth')
  const props = defineProps({
    tableData: {
      type: Object,
      default: () => {
        return {
          aiFilter: [],
          detectable: [],
          capacityStaff: [],
          capacityEquipment: [],
        }
      },
    },
    loadding: {
      type: Boolean,
      default: () => {},
    },
  })
</script>

<style lang="scss" scoped>
  :deep() {
    .el-card {
      height: 383px !important;
    }
    .vab-query-form .right-panel {
      margin: 0 0 0 0 !important;
    }
  }
</style>
