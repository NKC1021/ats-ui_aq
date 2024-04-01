<!--  -->
<template>
  <div ref="detailTableRef" class="detail-table-box">
    <el-table
      ref="tableRef"
      :cell-style="cellStyle"
      :data="getDefectLabels"
      height="100%"
      :row-style="rowStyle"
      @row-click="rowClick"
    >
      <el-table-column
        :label="translate('人工')"
        prop="humanResult"
        width="60px"
      />
      <el-table-column :label="translate('缺陷类别')" prop="labelName" />
      <el-table-column :label="translate('缺陷面积')">
        <template #default="scope">
          {{ showDefectValByType(scope.row.detail, 'area', 2) }}
        </template>
      </el-table-column>
      <el-table-column :label="translate('缺陷长度')">
        <template #default="scope">
          {{ showDefectValByType(scope.row.detail, 'width', 1) }}
        </template>
      </el-table-column>
      <el-table-column :label="translate('缺陷宽度')">
        <template #default="scope">
          {{ showDefectValByType(scope.row.detail, 'height', 1) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { Base64 } from 'js-base64'
  import { translate } from '@/i18n'
  export default {
    props: {
      imgData: {
        type: Array,
        default: () => [],
      },
      modelValue: {
        type: Object,
        default: () => ({}),
      },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        roriginImg: '',

        contentHeight: 0,
      }
    },
    computed: {
      translate() {
        return translate
      },
      /**
       * 显示缺陷
       */
      getDefectLabels() {
        const [_ImgObj] = this.imgData
        if (!_ImgObj) return []
        let _labels = _ImgObj.labels
        if (!_labels) return []
        _labels = _labels.filter((el) => {
          return el.labelType === 3
        })
        return _labels
      },
      /**
       * 选中缺陷Id
       */
      selectDefectId() {
        const _id = this.modelValue.id
        if (_id) return _id
        return ''
      },
    },
    watch: {
      selectDefectId() {
        this.$nextTick(() => {
          const _idx = this.getDefectLabels.findIndex(
            (el) => el.id === this.selectDefectId
          )
          const currentScrollTop =
            this.$refs.tableRef.scrollBarRef.wrapRef.scrollTop
          // 数据在可视范围内的最小偏移量
          const _scrollTopMin = Math.max(
            (_idx + 1) * 40 - this.contentHeight,
            0
          )
          // 数据在可视范围内的最大偏移量
          const _scrollTopMax = _idx * 40
          if (currentScrollTop < _scrollTopMin) {
            this.$refs.tableRef.setScrollTop(_scrollTopMin)
          }
          if (currentScrollTop > _scrollTopMax) {
            this.$refs.tableRef.setScrollTop(_scrollTopMax)
          }
        })
      },
    },
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    async mounted() {
      this.getTableHeight()
    },
    methods: {
      rowClick(row) {
        this.$emit('update:modelValue', row)
      },
      rowStyle({ row }) {
        // console.log('row:::', row)
        if (this.selectDefectId === row.id) {
          return {
            background: 'var(--el-color-primary)',
            color: 'var(--el-color-white)',
          }
        }
      },
      getTableHeight() {
        const _dom = this.$refs.detailTableRef
        if (!_dom) return
        this.contentHeight = _dom.clientHeight - 49
        // console.log('_dom::::', _dom.clientHeight)
        // console.log('_dom::::', this.contentHeight)
      },
      /**
       * @param {String} decode 密码
       * @param {Number} num 保留几位小数
       */
      showDefectMoreDetail(decode, num = 1) {
        return Number(Base64.decode(decode)).toFixed(num)
      },
      /**
       * 根据类型显示对应的值
       */
      showDefectValByType(detail = '', type, num = 1) {
        if (!detail) return ''
        const _detailInfo = JSON.parse(detail)
        const _extInfo = _detailInfo.ext_info
        if (!_extInfo) return ''
        const _decode = _extInfo[type].value
        return this.showDefectMoreDetail(_decode, num)
      },
      /**
       * 表格样式
       * @param {*} param
       */
      cellStyle({ column, row }) {
        if (column.property === 'humanResult' && row.humanResult) {
          if (row.humanResult === 'NG') {
            return {
              backgroundColor: 'var(--el-color-danger) !important',
              color: 'var(--el-color-white) !important',
            }
          } else if (row.humanResult === 'OK') {
            return {
              backgroundColor: 'var(--el-color-success) !important',
              color: 'var(--el-color-white) !important',
            }
          }
        }
      },
      /**
       * 更新表格人工
       */
      updateHunmanResult(type) {
        this.getDefectLabels.forEach((el) => {
          if (el.id === this.selectDefectId) {
            el.humanResult = type
          }
        })
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .detail-table-box {
    width: 100%;
    height: 100%;
    overflow: hidden;
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
</style>
