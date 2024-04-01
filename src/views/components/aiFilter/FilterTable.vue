<template>
  <div
    class="custom-table-container"
    :class="{ 'vab-fullscreen': isFullscreen }"
  >
    <vab-query-form>
      <vab-query-form-left-panel />
      <vab-query-form-right-panel>
        <div class="stripe-panel">
          <el-checkbox v-model="stripe">{{ translate('斑马纹') }}</el-checkbox>
        </div>
        <div class="border-panel">
          <el-checkbox v-model="border">
            {{ translate('边框（可拉伸列）') }}
          </el-checkbox>
        </div>
        <el-popover popper-class="custom-table-checkbox" trigger="hover">
          <template #reference>
            <el-button
              style="margin: 0 0 10px 0 !important"
              text
              type="primary"
            >
              <vab-icon icon="settings-line" />
            </el-button>
          </template>
          <el-checkbox-group v-model="checkList">
            <vab-draggable
              v-bind="dragOptions"
              item-key="{ element }"
              :list="columns"
            >
              <template #item="{ element }">
                <div>
                  <vab-icon icon="drag-drop-line" />
                  <el-checkbox
                    :disabled="element.disableCheck === true"
                    :label="element.label"
                  >
                    {{ element.label }}
                  </el-checkbox>
                </div>
              </template>
            </vab-draggable>
          </el-checkbox-group>
        </el-popover>
      </vab-query-form-right-panel>
    </vab-query-form>

    <el-table
      ref="tableSortRef"
      v-loading="listLoading"
      :border="border"
      :data="tableList"
      :height="height"
      :size="lineHeight"
      :stripe="stripe"
      @selection-change="setSelectRows"
    >
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column
        align="center"
        :label="translate('序号')"
        show-overflow-tooltip
        width="55"
      >
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>

      <!--  TODO element-plus未知原因不支持拖拽后宽度重新计算，暂时放弃 -->
      <el-table-column
        v-for="(item, index) in finallyColumns"
        :key="index"
        align="center"
        :label="item.label"
        :prop="item.prop"
        :sortable="item.sortable"
        width="auto"
      >
        <template #default="scope" v-if="item.prop === 'dataTime'">
          {{ formatDate(scope.row.dataTime) }}
          <!-- {{ dayjs(scope.row.dataTime).format('YYYY-MM-DD') }} -->
        </template>
      </el-table-column>
      <template #empty>
        <el-empty class="vab-data-empty" description="暂无数据" />
      </template>
    </el-table>
  </div>
</template>

<script setup>
  import { translate } from '@/i18n'
  import VabDraggable from 'vuedraggable'
  import { aiFilterEquipmentColumns } from '@/views/components/aiFilter/option.js'
  import { formatDate } from '@/utils/format'
  const props = defineProps({
    tableData: {
      type: Array,
      default: () => [],
    },
    loadding: {
      type: Boolean,
      default: () => {},
    },
    columnConfig: {
      type: Object,
      default: () => {
        return {
          columns: [],
          checkList: [],
        }
      },
    },
  })
  const checkList = ref(props.columnConfig.checkList)
  const columns = ref(props.columnConfig.columns)
  const height = ref(props.columnConfig.height)
  watch(
    () => props.columnConfig,
    () => {
      console.log('进入表格子组件')
      checkList.value = props.columnConfig.checkList
      columns.value = props.columnConfig.columns
      height.value = props.columnConfig.height
    }
  )
  const tableList = computed({
    get: () => {
      return props.tableData
    },
  })
  const listLoading = computed({
    get: () => {
      return props.loadding
    },
  })
  const tableSortRef = ref(null)
  const border = ref(false)
  const stripe = ref(true)
  const lineHeight = ref('small')
  const isFullscreen = ref(false)
  const selectRows = ref('')

  const dragOptions = computed(() => {
    return {
      animation: 600,
      group: 'description',
    }
  })
  const finallyColumns = computed(() => {
    return columns.value.filter((item) => checkList.value.includes(item.label))
  })

  const setSelectRows = (val) => {
    selectRows.value = val
  }
  onMounted(() => {})
</script>

<style lang="scss" scoped>
  @use 'sass:math';
  .custom-table-container {
    :deep() {
      i {
        cursor: pointer;
      }
    }

    .right-panel {
      .stripe-panel,
      .border-panel {
        margin: 0 10px #{math.div($base-margin, 2)} 10px !important;

        :deep() {
          .el-checkbox__label {
            margin-left: 0 !important;
          }
        }
      }

      [class*='ri'] {
        font-size: $base-font-size-big;
        color: var(--el-color-black);
      }
    }
  }
</style>
<style lang="scss">
  html body .custom-table-checkbox {
    [class*='ri'] {
      vertical-align: -0.5px !important;
      cursor: pointer;
    }

    .el-checkbox {
      margin: 5px 0 5px 8px;
    }
  }

  .custom-table-radio {
    width: 240px !important;
  }
</style>
