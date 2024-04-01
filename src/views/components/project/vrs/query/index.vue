<!--  -->
<template>
  <div class="query-content">
    <div class="form-body">
      <el-form ref="formRef" label-width="75px" :model="queryForm">
        <el-form-item label="SN" prop="SN">
          <scannerInput
            ref="snRef"
            v-model="queryForm.SN"
            @blur="blurMethod"
            @focus="focusMethod"
            @snfinish="queryFormSubmit"
          />
        </el-form-item>

        <div v-show="!isOnlySN">
          <el-form-item :label="translate('日期')" prop="dateTimes">
            <el-date-picker
              v-model="queryForm.dateTimes"
              :default-time="defaultTime"
              :end-placeholder="translate('结束时间')"
              :range-separator="translate('至')"
              :shortcuts="shortcuts"
              :start-placeholder="translate('开始时间')"
              type="datetimerange"
            />
          </el-form-item>
          <el-form-item :label="translate('机台')" prop="machineName">
            <el-select
              v-model="queryForm.machineName"
              allow-create
              clearable
              collapse-tags
              collapse-tags-tooltip
              :filter-method="filterMachineMethod"
              filterable
              multiple
              style="width: 100%"
              @blur="blurMethod"
              @focus="focusMethod"
            >
              <el-option
                v-for="(el, index) in filterMachineNames"
                :key="index"
                :label="el"
                :value="el"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="translate('批号')" prop="batchName">
            <el-select
              v-model="queryForm.batchName"
              allow-create
              clearable
              collapse-tags
              collapse-tags-tooltip
              :filter-method="filterBatchMenthod"
              filterable
              multiple
              style="width: 100%"
              @blur="blurMethod"
              @focus="focusMethod"
            >
              <el-option
                v-for="(el, index) in filterBatchNames"
                :key="index"
                :label="el"
                :value="el"
              />
            </el-select>
          </el-form-item>

          <el-form-item
            :label="translate('过检/漏检')"
            prop="type"
            :title="translate('产品维度、产品的漏检过检情况')"
          >
            <el-select
              v-model="queryForm.type"
              clearable
              multiple
              style="width: 100%"
              @clear="queryForm.type = []"
            >
              <el-option :label="translate('过检')" value="isAboveInspect" />
              <el-option :label="translate('漏检')" value="isLossInspect" />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="translate('最终结果')"
            prop="productFinalResult"
            :title="translate('产品维度、最终结果情况')"
          >
            <el-select
              v-model="queryForm.productFinalResult"
              clearable
              multiple
              style="width: 100%"
              @clear="queryForm.productFinalResult = []"
            >
              <el-option :label="translate('OK')" value="OK" />
              <el-option :label="translate('NG')" value="NG" />
            </el-select>
          </el-form-item>
        </div>

        <el-row style="width: 100%; text-align: right">
          <el-col>
            <el-button
              :icon="isOnlySN ? 'ArrowDown' : 'ArrowUp'"
              @click="isOnlySN = !isOnlySN"
            >
              {{ isOnlySN ? translate('显示') : translate('隐藏') }}
            </el-button>
            <el-button icon="Refresh" @click="resetQuery">
              {{ translate('重置') }}
            </el-button>
            <el-tooltip
              :content="
                translate(
                  '时间范围如果范围比较大并且没有选SN的时候，需要等待时间可能较长'
                )
              "
              effect="dark"
              placement="bottom"
            >
              <el-button icon="Search" type="primary" @click="queryFormSubmit">
                {{ translate('查询') }}
              </el-button>
            </el-tooltip>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <el-divider style="margin: 6px 0" />
    <div class="table-body">
      <div
        :class="{
          'table-content': true,
          'table-content_flex': isShowProductTable,
        }"
      >
        <switchTable
          ref="tableRef"
          :check-type="queryForm.type"
          :product-final-result="queryForm.productFinalResult"
          :table-data="tableData"
          :table-show="isShowProductTable"
          @table-row-click="tableClick"
        >
          <el-button
            :icon="!isShowProductTable ? 'ArrowDown' : 'ArrowUp'"
            @click="isShowProductTable = !isShowProductTable"
          >
            {{ !isShowProductTable ? translate('显示') : translate('隐藏') }}
          </el-button>
        </switchTable>
      </div>
      <el-divider v-show="showDefectByAirender" style="margin: 6px 0" />
      <div v-show="showDefectByAirender" class="defectlist-header">
        <div class="defectlist-title">{{ translate('产品缺陷') }}</div>
        <div>
          <el-button
            :icon="!defectListShow ? 'ArrowDown' : 'ArrowUp'"
            @click="defectListShow = !defectListShow"
          >
            {{ !defectListShow ? translate('显示') : translate('隐藏') }}
          </el-button>
        </div>
      </div>
      <div
        v-show="defectListShow && showDefectByAirender"
        class="defectlists-body"
      >
        <slot name="defectList"></slot>
      </div>
    </div>
  </div>
</template>
<script>
  import vrsService from '@/api/vrsService.js'
  import { translate } from '@/i18n'
  import { shortcutsList } from '@/utils/timeConst'
  import switchTable from './switchTable.vue'
  import scannerInput from './scannerGun.vue'
  export default {
    components: { switchTable, scannerInput },
    props: {
      modelValue: {
        type: Object,
        default: () => ({}),
      },
      machineNames: {
        type: Array,
        default: () => [],
      },
      batchNames: {
        type: Array,
        default: () => [],
      },

      /**
       * 是否查看归档数据字段
       */
      backupMode: {
        type: Boolean,
        default: false,
      },
      bankeycode: {
        type: Boolean,
        default: false,
      },
      showDefectByAirender: {
        type: Boolean,
        default: true,
      },
    },
    emits: ['update:modelValue', 'queryConditionClick', 'update:bankeycode'],
    data() {
      return {
        queryForm: {
          dateTimes: [],
          SN: '',
          machineName: [],
          batchName: [],
          type: [],
          productFinalResult: [],
        },
        tableData: [],
        recordQuery: {}, // 记录查询条件 父组件需要用到
        searchMachineStr: '',
        searchBatchStr: '',
        defaultTime: [
          new Date(2000, 1, 1, 0, 0, 0),
          new Date(2000, 2, 1, 23, 59, 59),
        ],
        isOnlySN: true, //只展示SN标记
        defectListShow: true, // 展示缺陷表格
        isShowProductTable: true, //展示产品
      }
    },
    computed: {
      translate() {
        return translate
      },
      shortcuts() {
        return shortcutsList
      },
      filterMachineNames() {
        if (this.searchMachineStr) {
          return this.$pinyinSearch.matchPinyin(
            this.machineNames,
            this.searchMachineStr
          )
        }
        return this.machineNames
      },
      filterBatchNames() {
        if (this.searchBatchStr) {
          return this.$pinyinSearch.matchPinyin(
            this.batchNames,
            this.searchBatchStr
          )
        }
        return this.batchNames
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {
      const _week = shortcutsList[1]
      this.queryForm.dateTimes = _week.value()
    },
    methods: {
      blurMethod() {
        this.$emit('update:bankeycode', true)
      },
      focusMethod() {
        this.$emit('update:bankeycode', false)
      },
      /**
       *
       */
      tableClick(rowInfo) {
        let _query = {
          listCondition: { ...this.recordQuery },
        }
        _query = Object.assign(_query, { ...rowInfo })
        this.$emit('update:modelValue', _query)
        this.$nextTick(() => {
          this.$emit('queryConditionClick')
        })
      },
      filterMachineMethod(str) {
        this.searchMachineStr = str
      },
      filterBatchMenthod(str) {
        this.searchBatchStr = str
      },
      /**
       * 重置
       */
      resetQuery() {
        this.$refs.formRef.resetFields()
      },
      /**
       * 提供一个方法给父组件调用
       */
      focusSn(e) {
        this.$refs.snRef.inputFocus(e)
      },
      /**
       * 表单提交
       * @param {boolean} [isIgnore=false] isIgnore 表示弹窗加载数量过多给出的提示
       */
      async queryFormSubmit(e, isIgnore = false) {
        if (
          !this.queryForm.SN &&
          (!this.queryForm.dateTimes || !this.queryForm.dateTimes.length)
        )
          return this.$message.error(translate('请选择时间或SN'))
        const _query = {
          detectTimeFrom: null,
          detectTimeTo: null,
          SN: this.queryForm.SN ? [this.queryForm.SN] : [],
          backupMode: this.backupMode,
          ignoreWarn: isIgnore,
          machineName: this.queryForm.machineName,
          batchName: this.queryForm.batchName,
        }

        if (this.queryForm.dateTimes.length) {
          _query.detectTimeFrom = this.queryForm.dateTimes[0]
          _query.detectTimeTo = this.queryForm.dateTimes[1]
        }
        this.recordQuery = { ..._query }
        const res = await vrsService.list(_query)
        if (res.code === 0) {
          if (res.data && res.data.length === 0) {
            this.tableData = []
            return this.$message.error('暂无产品数据')
          }
          this.tableData = res.data
          this.$nextTick(() => {
            this.$refs.tableRef.selectFirstData()
          })
        }
        if (res.code === 1) {
          this.$confirm(res.msg, translate('提示'), {
            type: 'warning',
          }).then(() => {
            this.queryFormSubmit(e, true)
          })
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .query-content {
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    .form-body {
      .el-form {
        :deep() {
          .el-form-item {
            margin-bottom: 5px;
          }
        }
      }
    }
    .table-body {
      flex: 1;
      overflow: auto;
      display: flex;
      flex-direction: column;
      .table-content {
        width: 100%;
        overflow: auto;
      }
      .table-content_flex {
        flex: 1;
      }

      .defectlist-header {
        margin-bottom: 3px;
        display: flex;
        justify-content: space-between;
        background: var(--el-color-primary-light-9);
        padding: 3px;
        .defectlist-title {
          line-height: 32px;
          font-weight: bold;
          padding-left: 12px;
          color: black;
        }
      }
      .defectlists-body {
        flex: 2;
        overflow: auto;
      }
    }
  }
</style>
