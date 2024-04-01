<!--  -->
<template>
  <div class="main-table-box">
    <div ref="tableBoxRef" class="table-box">
      <el-table
        ref="tableRef"
        :cell-style="cellStyle"
        :data="tableDataWithArea"
        height="100%"
        :row-class-name="tableRowClassName"
        :row-style="rowStyle"
        @row-click="rowClick"
      >
        <el-table-column label="图片名称" show-overflow-tooltip>
          <template #default="scope">
            {{ getImgName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="productArea" width="100px">
          <template #header>
            <el-tooltip
              :content="translate('产品区域')"
              effect="dark"
              placement="top"
            >
              {{ translate('区域') }}
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="aiResult" width="60px">
          <template #header>
            <el-tooltip
              :content="translate('AI结果')"
              effect="dark"
              placement="top"
            >
              AI
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="humanResult" width="60px">
          <template #header>
            <el-tooltip
              :content="translate('人工结果')"
              effect="dark"
              placement="top"
            >
              {{ translate('人工') }}
            </el-tooltip>
          </template>
          <template #default="scope">{{ scope.row.humanResult }}</template>
        </el-table-column>
        <template #empty>
          <!-- <el-empty description="description" :image-size="100" /> -->
        </template>
      </el-table>
    </div>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      background
      layout="total, sizes, prev, pager, next"
      :page-sizes="[1, 10, 20, 30]"
      small
      :total="totalNum"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script>
  import vrsService from '@/api/vrsService'
  import { translate } from '@/i18n'
  export default {
    props: {
      queryCondition: {
        type: Object,
        default: () => ({}),
      },
      productArea: {
        type: Object,
        default: () => ({}),
      },

      imgcacheObj: {
        type: Object,
        default: () => ({}),
      },
    },
    emits: ['rowClick', 'initImgData'],
    data() {
      return {
        currentPage: 1,
        pageSize: 10,
        totalNum: 0,
        tableData: [],
        recordIndex: 0,
        contentHeight: 0,
      }
    },
    computed: {
      translate() {
        return translate
      },
      tableDataWithArea() {
        return this.tableData.map((el) => {
          el['productArea'] = this.productArea[`${el.capturePos}`]
          return el
        })
      },
      totalPage() {
        return Math.ceil(this.totalNum / this.pageSize)
      },
    },
    watch: {
      recordIndex(newVal) {
        this.$nextTick(() => {
          const currentScrollTop =
            this.$refs.tableRef.scrollBarRef.wrapRef.scrollTop
          // 数据在可视范围内的最小偏移量
          const _scrollTopMin = Math.max(
            (newVal + 1) * 40 - this.contentHeight,
            0
          )
          // 数据在可视范围内的最大偏移量
          const _scrollTopMax = newVal * 40
          if (currentScrollTop < _scrollTopMin) {
            this.$refs.tableRef.setScrollTop(_scrollTopMin)
          }
          if (currentScrollTop > _scrollTopMax) {
            this.$refs.tableRef.setScrollTop(_scrollTopMax)
          }
        })
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    async mounted() {
      await this.$nextTick()
      this.getTableHeight()
    },
    methods: {
      /**
       * 显示缺陷名字
       */
      getImgName(rowInfo) {
        const _detailInfos = rowInfo.detailInfos
        if (!_detailInfos) return ''
        const _jsonObj = JSON.parse(_detailInfos)
        const _Images = _jsonObj.Images
        const [ImgObj] = _Images
        return ImgObj.pictureName
      },
      /**
       * 页码改变
       */
      async handleCurrentChange(newPage, focusLatest = false) {
        this.currentPage = newPage
        await this.getTableList(focusLatest)
        this.$nextTick(() => {
          const currPageIndex = focusLatest ? this.tableData.length - 1 : 0
          const _rowInfo = this.tableData.length
            ? this.tableData[currPageIndex]
            : {}
          // console.log('ddddddddddd', (this.currentPage - 1) * this.pageSize)
          this.$emit(
            'rowClick',
            _rowInfo,
            (this.currentPage - 1) * this.pageSize + currPageIndex
          )
        })
      },
      async handleSizeChange(newSize) {
        this.pageSize = newSize
        this.currentPage = 1
        await this.getTableList()
        this.$nextTick(() => {
          const _rowInfo = this.tableData.length ? this.tableData[0] : {}
          this.$emit('initImgData', _rowInfo, 0)
        })
      },
      /**
       * 给每一行添加一个索引
       */
      tableRowClassName({ row, rowIndex }) {
        row.index = rowIndex
      },
      /**
       * 行样式
       */
      rowStyle({ rowIndex }) {
        if (this.recordIndex === rowIndex) {
          return {
            background: 'var(--el-color-primary)',
            color: 'var(--el-color-white)',
          }
        }
      },
      cellStyle({ column, row }) {
        if (column.property === 'aiResult' && row.aiResult) {
          if (row.aiResult === 'NG') {
            return {
              backgroundColor: 'var(--el-color-danger) !important',
              color: 'var(--el-color-white) !important',
            }
          } else if (row.aiResult === 'OK') {
            return {
              backgroundColor: 'var(--el-color-success) !important',
              color: 'var(--el-color-white) !important',
            }
          }
        }
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
      getTableHeight() {
        const _dom = this.$refs.tableBoxRef
        if (!_dom) return
        // console.log('_dom::::', _dom.clientHeight)
        this.contentHeight = _dom.clientHeight - 49
      },
      /**
       * 提供一个方法给父组件调用
       */
      async initGetTableData() {
        this.currentPage = 1
        this.pageSize = 10
        await this.getTableList(false, true)
        this.$nextTick(() => {
          const _rowInfo = this.tableData.length ? this.tableData[0] : {}
          this.$emit('initImgData', _rowInfo, 0)
        })
      },
      /**
       * 获取表格数据
       * @param {Boolean} focusLatest
       * @param {Boolean} resetImg 重置缓存
       */
      async getTableList(focusLatest = false, resetImg = false) {
        const queryInfo = {
          pageCondition: {
            page: this.currentPage - 1,
            pageSize: this.pageSize,
          },
          imgType: 0,
          ...this.queryCondition,
          resetImgIdCache: resetImg,
        }
        const res = await vrsService.page(queryInfo)
        if (res.code === 0) {
          this.tableData = res.data.list ? res.data.list : []
          this.totalNum = res.data.total
          this.tableData.length === 0 &&
            this.$message.error(translate('图片数据为0'))
          if (focusLatest) {
            this.recordIndex = this.tableData.length - 1
          } else {
            this.recordIndex = 0
          }
        }
      },
      /**
       * 表格行数据点击
       */
      rowClick(row) {
        // 点击同一行不处理
        if (this.recordIndex === row.index) {
          return
        }
        const _pageNum = (this.currentPage - 1) * this.pageSize + row.index
        this.recordIndex = row.index
        this.$emit('rowClick', row, _pageNum)
      },
      /**
       * 提供方法给父组件调用，更新人工OK/NG
       */
      updateHumanResult(result) {
        this.tableData[this.recordIndex].humanResult = result
      },
      /**
       * 上一条数据
       */
      selectUpRow() {
        if (this.recordIndex > 0) {
          const _num = this.recordIndex - 1
          const _pageNum = (this.currentPage - 1) * this.pageSize + _num
          if (!this.imgcacheObj[_pageNum]) return
          this.rowClick(this.tableData[_num])
        } else if (this.recordIndex === 0) {
          this.selectUpPage()
        }
      },
      /**
       * 选择下一条数据
       */
      selectNextRow() {
        if (this.recordIndex < this.tableData.length - 1) {
          const _num = this.recordIndex + 1
          const _pageNum = (this.currentPage - 1) * this.pageSize + _num
          if (!this.imgcacheObj[_pageNum]) return
          this.rowClick(this.tableData[_num])
        } else if (this.recordIndex === this.tableData.length - 1) {
          this.selectNextPage()
        }
      },
      /**
       * 上一页
       */
      selectUpPage() {
        if (this.currentPage > 1) {
          this.currentPage--
          this.handleCurrentChange(this.currentPage, true)
        }
      },
      /**
       * 下一页
       */
      selectNextPage() {
        if (this.currentPage < this.totalPage) {
          this.currentPage++
          this.handleCurrentChange(this.currentPage)
        }
      },
      /**
       * 接受父组件 传进来的参数 点击小缺项 定位到具体哪一行
       */
      async setSelectRowBycacheIndex(cacheIndex) {
        // 判断当前小缺项是否在 当前页码上 是 就不用发请求 否则 发请求
        const _currentPage = Math.ceil((cacheIndex + 1) / this.pageSize)
        const _index = cacheIndex % this.pageSize
        if (_currentPage === this.currentPage) {
          this.rowClick(this.tableData[_index])
        } else {
          this.currentPage = _currentPage
          await this.getTableList()
          this.$nextTick(() => {
            this.recordIndex = -1
            this.rowClick(this.tableData[_index])
          })
        }
      },
      /**
       * 刷新表格数据 删除数据时候
       * @param {Boolean} isAlldelete 全部删除
       */
      async refreshTableByDelete(isAlldelete = false) {
        const _index = this.recordIndex - 0
        await this.getTableList(false, true)
        if (isAlldelete) {
          return 0
        } else {
          this.recordIndex = _index
          return this.pageSize * (this.currentPage - 1) + _index
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  .main-table-box {
    width: 100%;
    height: 100%;
    overflow: hidden;
    .table-box {
      height: calc(100% - 29px);
    }
    .el-pagination {
      margin: 5px 0 0 0;
      justify-content: end;
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
</style>
