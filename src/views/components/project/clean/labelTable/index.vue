<template>
  <div class="effective-label">
    <!-- {{ concatTableData }} -->
    <div class="effective-content">
      <div v-show="isMultipleSelectedImg" class="table-content">
        <el-row class="head-nav">
          <el-col>
            <el-checkbox
              v-model="okVal"
              border
              :label="translate('ok')"
              @change="addSpecialLabel($event, translate('ok'))"
            />
            <el-checkbox
              v-model="lossVal"
              border
              :label="translate('漏检')"
              @change="addSpecialLabel($event, translate('漏检'))"
            />
            <el-checkbox
              v-model="aboveVal"
              border
              :label="translate('过检')"
              @change="addSpecialLabel($event, translate('过检'))"
            />
          </el-col>
        </el-row>

        <el-table
          border
          :cell-style="cellStyle"
          :data="concatTableData"
          height="100%"
          :row-style="rowStyle"
          :span-method="mergeCell"
          @cell-click="cellClicked"
          @mousedown="tableMouseDown"
        >
          <el-table-column
            v-for="(item, index) in tableColumn"
            :key="index"
            :label="item.label"
            :prop="item.prop"
          />
          <template #empty>
            <el-empty />
          </template>
        </el-table>
      </div>
      <div v-show="!isMultipleSelectedImg" class="empty-css">
        <el-empty :description="translate('请选中一张图片')" />
      </div>
    </div>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  export default {
    props: {
      tableData: {
        type: Array,
        default: () => [],
      },
      /**
       * 选中图片信息
       */
      selectImgInfo: {
        type: Object,
        default: () => {},
      },
      /**
       * 解决方案启用哪种标签
       */
      solutionEnableType: {
        type: Number,
        default: 0,
      },
      isMultipleSelectedImg: {
        type: Boolean,
        default: false,
      },
      keyCodeFlag: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['labelTableClick', 'update:keyCodeFlag'],
    data() {
      return {
        // tableData: [{ labelName: '测试值' }],
        rowStyle: {
          height: '25px',
        },
      }
    },
    computed: {
      translate() {
        return translate
      },
      tableColumn() {
        let _tableColumn = [
          { label: translate('AI工程'), prop: 'enginName' },
          { label: translate('标签名'), prop: 'labelName' },
          { label: translate('可放行'), prop: '' },
          { label: translate('不确定'), prop: '' },
          { label: translate('不可放行'), prop: '' },
        ]
        if (this.solutionEnableType === 1) {
          _tableColumn = _tableColumn.filter((el) => el.prop !== 'enginName')
        }
        return _tableColumn
      },
      /**
       * 结合tableData和图片自身信息构造的数组
       */
      concatTableData() {
        const _labels = this.selectImgInfo ? this.selectImgInfo.labels : ''
        let labelsMap = []
        let _arrMap = []
        let _cancatMap = []
        if (_labels) {
          // 要过滤属于启用那种标签类型
          labelsMap = _labels.filter(
            (el) => el.labelType === this.solutionEnableType
          )
        }
        _arrMap = this.tableData
        _cancatMap = [..._arrMap, ...labelsMap]
        _cancatMap = this.filetrSameTableData(_cancatMap)
        // 特殊处理漏检和过检
        const _filterMsg = [
          translate('漏检'),
          translate('过检'),
          translate('ok'),
        ]
        _cancatMap = _cancatMap.filter((el) => {
          return !(
            _filterMsg.includes(el.enginName) ||
            _filterMsg.includes(el.labelName)
          )
        })
        _cancatMap.sort((a, b) => {
          return a.enginName && a.enginName.localeCompare(b.enginName)
        })
        return _cancatMap
      },
      /**
       * 合并单元格工程
       */
      mergeCellByEngin() {
        const _map = new Map()
        const arr = []
        this.concatTableData.forEach((el) => {
          if (_map.has(el.enginName)) {
            let _count = _map.get(el.enginName)
            _count++
            _map.set(el.enginName, _count)
          } else {
            _map.set(el.enginName, 1)
          }
        })
        _map.forEach((val) => {
          arr.push(val)
        })
        const _mergeMap = arr.map((el) => {
          const _arr = []
          _arr.push(el)
          for (let i = 1; i < el; i++) {
            _arr.push(0)
          }
          return _arr
        })
        let _mergeList = []
        _mergeMap.forEach((el) => {
          _mergeList = _mergeList.concat(el)
        })
        return _mergeList
      },
      /**
       * 可打标签 工程标签-客户标签
       */
      availableLabel() {
        let _labelNames = []
        _labelNames = this.tableData.map((el) => {
          return `${el.enginName}-${el.labelName}`
        })
        return _labelNames
      },
      lossVal: {
        get() {
          const _labels = this.selectImgInfo ? this.selectImgInfo.labels : ''
          if (_labels) {
            return _labels.some((el) => {
              const _labelNames = [el.enginName, el.labelName]
              return (
                _labelNames.includes(translate('漏检')) &&
                el.labelType === this.solutionEnableType
              )
            })
          } else {
            return false
          }
        },
        set() {},
      },
      aboveVal: {
        // 图片包含过检，返回true
        get() {
          const _imgLabels = this.selectImgInfo ? this.selectImgInfo.labels : ''
          if (_imgLabels) {
            return _imgLabels.some((el) => {
              const _labelNames = [el.enginName, el.labelName]
              return (
                _labelNames.includes(translate('过检')) &&
                el.labelType === this.solutionEnableType
              )
            })
          } else {
            return false
          }
        },
        set() {},
      },
      okVal: {
        get() {
          const _labels = this.selectImgInfo ? this.selectImgInfo.labels : ''
          if (_labels) {
            return _labels.some((el) => {
              const _labelNames = [el.enginName, el.labelName]
              return (
                _labelNames.includes(translate('ok')) &&
                el.labelType === this.solutionEnableType
              )
            })
          } else {
            return false
          }
        },
        set() {},
      },
    },
    watch: {},
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      mergeCell({ column, rowIndex }) {
        if (column.property === 'enginName') {
          // 只合并AI工程
          if (this.mergeCellByEngin[rowIndex]) {
            return [this.mergeCellByEngin[rowIndex], 1]
          } else {
            return [0, 0]
          }
        }
      },
      /**
       * 过滤重复数据
       */
      filetrSameTableData(tableData = []) {
        const _arr = []
        const _tempMap = new Map()
        tableData.length &&
          tableData.forEach((el) => {
            const _key = `${el.enginName}-${el.labelName}`
            _tempMap.set(_key, el)
          })
        _tempMap.forEach((value) => {
          _arr.push(value)
        })
        return _arr
      },
      /**
       * 表格样式1
       */
      cellStyle({ row, column }) {
        if (column.label === translate('可放行') && row.passType === 1) {
          return {
            backgroundColor: '#67C23A',
          }
        }
        if (column.label === translate('不确定') && row.passType === 2) {
          return {
            backgroundColor: '#E6A23C',
          }
        }
        if (column.label === translate('不可放行') && row.passType === 3) {
          return {
            backgroundColor: '#F56C6C',
          }
        }
        return {
          padding: '5px',
          fontSize: '14px',
        }
      },
      /**
       * 表格点击1可放行、2不确定、3不可放行
       */
      cellClicked(row, column) {
        this.$emit('update:keyCodeFlag', false)
        const query = {
          passType: 1,
          enginName: row.enginName,
          labelName: row.labelName,
          labelType: this.solutionEnableType,
        }

        const headLabel = [
          translate('可放行'),
          translate('不确定'),
          translate('不可放行'),
        ]
        if (!headLabel.includes(column.label)) return
        switch (column.label) {
          case translate('可放行'): {
            query.passType = 1
            if (row.passType === 1) {
              query.isMove = true
            } else {
              query.isSave = true
            }
            break
          }
          case translate('不确定'): {
            query.passType = 2
            if (row.passType === 2) {
              query.isMove = true
            } else {
              query.isSave = true
            }
            break
          }
          case translate('不可放行'): {
            query.passType = 3
            if (row.passType === 3) {
              query.isMove = true
            } else {
              query.isSave = true
            }
            break
          }
        }
        if (query.isSave) {
          const _keys = `${row.enginName}-${row.labelName}`
          // 不在可打标签范围
          if (!this.availableLabel.includes(_keys)) {
            this.$emit('update:keyCodeFlag', true)
            return this.$message.error('不在可打标签范围内')
          }
        }
        this.$emit('labelTableClick', query)
      },
      /**
       *给图片添加特殊标签
       */
      addSpecialLabel(newFlag, labelName) {
        const query = {
          labelName: labelName,
          labelType: this.solutionEnableType,
          isSpecial: true,
        }

        if (this.solutionEnableType === 2) {
          query.enginName = labelName
        }
        if (newFlag) {
          query.isSave = true
        } else {
          query.isMove = true
        }
        this.$emit('labelTableClick', query)
      },
      tableMouseDown() {
        this.$emit('update:keyCodeFlag', false)
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .effective-label {
    width: 100%;
    height: 100%;
    .effective-content {
      width: 100%;
      height: 100%;
      .head-nav {
        padding-bottom: 5px;
        .el-checkbox {
          margin-right: 5px;
        }
      }
      .table-content {
        height: calc(100% - 37px);
      }
    }
    .empty-css {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
