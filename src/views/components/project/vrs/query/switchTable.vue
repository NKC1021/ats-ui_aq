<!--  -->
<template>
  <div class="switch-table">
    <el-row v-if="false">
      <el-col :span="12">
        <div v-show="tableType === 'col'">
          <el-button
            icon="DArrowLeft"
            link
            :title="translate('第一条')"
            type="primary"
            @click="firstTableIndex"
          />
          <el-button
            icon="ArrowLeft"
            link
            :title="translate('上一条')"
            type="primary"
            @click="subTableIndex"
          />
          <el-button
            icon="ArrowRight"
            link
            :title="translate('下一条')"
            type="primary"
            @click="addTableIndex"
          />
          <el-button
            icon="DArrowRight"
            link
            :title="translate('最后一条')"
            type="primary"
            @click="lastTableIndex"
          />
        </div>
      </el-col>
      <el-col :span="12" style="line-height: 32px; text-align: right">
        <el-button
          circle
          icon="Switch"
          size="small"
          @click="changeSwitchTable"
        />
      </el-col>
    </el-row>
    <div class="head-set">
      <slot></slot>
      <el-popover placement="bottom" trigger="click" width="200px">
        <el-form label-width="80px">
          <el-form-item
            v-for="(el, index) in showHeaderList"
            :key="index"
            :label="el.label"
          >
            <el-checkbox v-model="el.show" style="margin-right: 15px" />
            <el-button
              circle
              :disabled="index === 0"
              size="small"
              style="color: var(--el-color-primary)"
              text
              @click="changeHeaderOrder(index, index - 1)"
            >
              <vab-icon icon="arrow-up-line" />
            </el-button>
            <el-button
              circle
              :disabled="index === showHeaderList.length - 1"
              size="small"
              style="color: var(--el-color-primary)"
              text
              @click="changeHeaderOrder(index, index + 1)"
            >
              <vab-icon icon="arrow-down-line" />
            </el-button>
          </el-form-item>
        </el-form>
        <template #reference>
          <el-button icon="Setting" type="primary">
            {{ translate('表头') }}
          </el-button>
        </template>
      </el-popover>
    </div>
    <div v-loading="loading" class="table-content">
      <!-- ------------------------------------------------------- -->
      <el-table
        v-show="tableShow && tableType === 'row'"
        :cell-style="cellStyle"
        :data="tableValue"
        height="100%"
        :row-class-name="tableRowClassName"
        :row-style="rowStyle"
        @row-click="rowClick"
      >
        <template v-for="(el, index) in showHeaderList">
          <el-table-column
            v-if="el.show"
            :key="index"
            :formatter="headerConfigs[el.prop].formatter"
            :label="el.label"
            :prop="el.prop"
            :sortable="headerConfigs[el.prop].sortable"
            :width="headerConfigs[el.prop].width"
          />
        </template>
      </el-table>
    </div>
  </div>
</template>

<script>
  import { formatTimeToStr } from '@/utils/date'
  import { translate } from '@/i18n'
  export default {
    props: {
      tableData: {
        type: Array,
        default: () => [],
      },
      checkType: {
        type: Array,
        default: () => [],
      },
      productFinalResult: {
        type: Array,
        default: () => [],
      },
      tableShow: {
        type: Boolean,
        default: true,
      },
    },
    emits: ['tableRowClick'],
    data() {
      return {
        tableIndex: 0, //表格索引，用作切换
        tableType: 'row', //row 表头横向,col表头纵向
        loading: false,
        aiResultFilters: [
          { text: translate('OK'), value: 'OK' },
          { text: translate('NG'), value: 'NG' },
        ],
        headerConfigs: {
          SN: {
            sortable: true,
          },
          productFinalResult: {
            width: '100px',
          },
          productName: {
            sortable: true,
          },
          batchName: {
            sortable: true,
          },
          humanResult: {
            sortable: true,
            width: '150px',
            formatter: this.showCheckType,
          },
          machineName: {
            sortable: true,
            width: '105px',
          },
          detectTimeAt: {
            sortable: true,
            width: '105px',
            formatter: this.timeFormatter,
          },
        },
        headers: [
          {
            label: translate('检测时间'),
            prop: 'detectTimeAt',
            sortable: true,
            width: 105,
          },
          {
            label: translate('机台号'),
            prop: 'machineName',
            sortable: true,
            width: 105,
          },
          {
            label: translate('料号'),
            prop: 'productName',
            sortable: true,
          },
          {
            label: translate('SN'),
            prop: 'SN',
            sortable: true,
          },
          {
            label: translate('最终结果(产品)'),
            prop: 'productFinalResult',
            sortable: true,
            width: 105,
          },
          {
            label: translate('漏检/过检(产品)'),
            prop: 'humanResult',
            sortable: true,
            width: 105,
          },
        ],
        highLightIndex: 0,
        showHeaderList: [
          {
            label: translate('SN'),
            prop: 'SN',
            show: true,
          },
          {
            label: translate('最终结果'),
            prop: 'productFinalResult',
            show: true,
          },
          {
            label: translate('料号'),
            prop: 'productName',
            show: false,
          },
          {
            label: translate('批号'),
            prop: 'batchName',
            show: false,
          },
          {
            label: translate('漏检/过检'),
            prop: 'humanResult',
            show: false,
          },
          {
            label: translate('机台号'),
            prop: 'machineName',
            show: false,
          },
          {
            label: translate('检测时间'),
            prop: 'detectTimeAt',
            show: false,
          },
        ],
      }
    },
    computed: {
      translate() {
        return translate
      },
      /**
       * 表格头部
       */
      tableHeaders() {
        if (this.tableType === 'col') {
          return this.colTableVal
            .reduce((pre, cur, index) => pre.concat(`value${index}`), ['title'])
            .map((el, index) => {
              if (index === 0) {
                return {
                  prop: el,
                  width: 100,
                }
              } else {
                return {
                  prop: el,
                }
              }
            })
        }
        return []
      },
      /**
       * 表格数据
       */
      tableValue() {
        if (this.tableType === 'row') {
          return this.filterTableData
        }
        if (this.tableType === 'col') {
          return this.headers.map((item) => {
            return this.colTableVal.reduce(
              (pre, cur, index) =>
                Object.assign(pre, { [`value${index}`]: cur[item.prop] }),
              { title: item.label }
            )
          })
        }
        return []
      },
      /**
       * 纵向表格数据，只支持一条,数据来源tableData
       */
      colTableVal() {
        if (this.filterTableData.length) {
          return [this.filterTableData[this.tableIndex]]
        }
        return []
      },
      /**
       * 过滤表格数据 过检/漏检
       */
      filterTableData() {
        let _list = this.tableData
        if (this.checkType.length) {
          _list = _list.filter((el) => {
            const _searchStr = this.checkType.join(',')
            const _strs = _searchStr.includes(',') && _searchStr.split(',')
            if (_strs) {
              return el[`${_strs[0]}`] || el[`${_strs[1]}`]
            } else {
              return el[_searchStr]
            }
          })
        }
        if (this.productFinalResult.length) {
          _list = _list.filter((el) =>
            this.productFinalResult.includes(el.productFinalResult)
          )
        }
        return _list
      },
    },
    watch: {
      tableData() {
        this.highLightIndex = 0
      },
    },
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      /**
       * AI结果过滤
       */
      aiREsultFilterHandler(value, row, column) {
        const property = column['property']
        return row[property] === value
      },
      /**
       * 样式
       */
      cellStyle({ columnIndex, row, column }) {
        if (this.tableType === 'col' && columnIndex === 0) {
          return {
            textAlign: 'right',
            backgroundColor: '#f7fbff',
          }
        } else if (
          column.property === 'productFinalResult' &&
          row.productFinalResult
        ) {
          if (row.productFinalResult === 'NG') {
            return {
              backgroundColor: 'var(--el-color-danger) !important',
              color: 'var(--el-color-white) !important',
            }
          } else if (row.productFinalResult === 'OK') {
            return {
              backgroundColor: 'var(--el-color-success) !important',
              color: 'var(--el-color-white) !important',
            }
          }
        }
      },
      rowStyle({ rowIndex }) {
        if (this.highLightIndex === rowIndex) {
          return {
            background: 'var(--el-color-primary)',
            color: 'var(--el-color-white)',
          }
        }
      },
      /**
       * 给每一行添加一个索引
       */
      tableRowClassName({ row, rowIndex }) {
        row.index = rowIndex
      },
      /**
       * 表格行点击
       * @param {*} row
       */
      rowClick(row) {
        this.highLightIndex = row.index
        this.$emit('tableRowClick', row)
      },
      /**
       * 纵向表头点击
       */
      cellClick() {
        this.$emit('tableRowClick', ...this.colTableVal)
      },
      /**
       * 默认选中第一个
       */
      selectFirstData() {
        if (this.filterTableData.length) {
          this.$emit('tableRowClick', this.tableData[0])
        } else {
          this.$emit('tableRowClick', {})
        }
      },

      /**
       * 展示漏检过检字段信息
       */
      showCheckType(row) {
        if (row.isLossInspect && row.isAboveInspect) {
          return translate('漏检') + translate('过检')
        }
        if (!row.isLossInspect && !row.isAboveInspect) {
          return ''
        }
        if (row.isAboveInspect) {
          return translate('过检')
        }
        if (row.isLossInspect) {
          return translate('漏检')
        }
      },

      changeSwitchTable() {
        const _type = this.tableType
        this.tableType = _type === 'row' ? 'col' : 'row'
        this.loading = true
        setTimeout(() => {
          this.loading = false
        }, 500)
      },
      /**
       * 切换上一条
       */
      subTableIndex() {
        if (this.tableIndex > 0) {
          this.tableIndex--
        }
      },
      /**
       * 切换下一条
       */
      addTableIndex() {
        const _length = this.tableData.length
        if (this.tableIndex < _length - 1) {
          this.tableIndex++
        }
      },
      /**
       * 切换第一条数据
       */
      firstTableIndex() {
        this.tableIndex = 0
      },
      /**
       * 最后一条
       */
      lastTableIndex() {
        const _length = this.tableData.length
        this.tableIndex = _length - 1
      },
      /**
       * 格式化时间
       */
      timeFormatter(row, column) {
        const date = row.detectTimeAt ? row.detectTimeAt : column
        return formatTimeToStr(date)
      },
      // 交换表头位置
      changeHeaderOrder(x, y) {
        if (
          x < 0 ||
          y < 0 ||
          x > this.showHeaderList.length ||
          y > this.showHeaderList.length
        ) {
          return
        }
        this.showHeaderList.splice(
          x,
          1,
          ...this.showHeaderList.splice(y, 1, this.showHeaderList[x])
        )
      },
    },
  }
</script>
<style scoped lang="scss">
  .switch-table {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .head-set {
      margin-bottom: 3px;
      text-align: right;
    }
    .table-content {
      // height: calc(100% - 32px);
      flex: 1;
      height: 100%;
      overflow: auto;
    }
  }
  .el-table {
    :deep() {
      .el-table__row {
        height: 40px !important;
      }
      tbody tr:hover > td {
        background-color: transparent !important;
      }
      .el-table__body tr.hover-row > td {
        background-color: transparent;
      }
      .el-table__body tr > td > .cell {
        color: inherit;
      }
    }
  }
  .el-form {
    :deep() {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }
  /* @import url(); 引入css类 */
</style>
