<!--  -->
<template>
  <div class="defect-box">
    <!-- {{ labels }} -->
    <el-table
      ref="defectTableRef"
      :cell-style="cellStyle"
      :data="labels"
      height="100%"
      :row-class-name="tableRowClassName"
      :show-header="false"
      @row-click="defectRowClick"
    >
      <el-table-column
        label="产品缺陷列表"
        prop="labelName"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div class="defect-cell-css">
            {{ scope.row.labelName }}
          </div>
        </template>
      </el-table-column>
    </el-table>
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
    },
    emits: ['defectRowClick'],
    data() {
      return {
        labels: [],
        currentPage: 1,
        pageSize: 10,
        totalNum: 0,
        recordIndex: -1,
        navPicObj: {}, //记录导航栏点击的点位
      }
    },
    computed: {
      translate() {
        return translate
      },
      /**
       * 总共页数
       */
      totalPages() {
        return Math.ceil(this.totalNum / this.pageSize)
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    async mounted() {
      await this.$nextTick()
      this.addTableScroll()
    },
    methods: {
      defectRowClick(rowInfo) {
        // console.log('rowInfo::', rowInfo)
        this.recordIndex = rowInfo.index
        this.$emit('defectRowClick', rowInfo)
      },
      /**
       * 给表格添加滚轮事件
       */
      addTableScroll() {
        this.$nextTick(() => {
          const tableWrap = this.$refs.defectTableRef.scrollBarRef.wrapRef
          // console.log('tabletabletable::', tableWrap)
          if (tableWrap) {
            tableWrap.addEventListener('scroll', () => {
              const scrollHeight = tableWrap.clientHeight + tableWrap.scrollTop
              const totalHeight = tableWrap.scrollHeight
              if (scrollHeight === totalHeight) {
                // console.log('已经滚动到底部')
                this.getPageByScroll()
                // 其他操作...
              } else {
                // console.log('未滚动到底部')
              }
            })
          }
        })
      },
      /**
       * 滚轮获取缺陷
       */
      getPageByScroll() {
        if (this.currentPage < this.totalPages) {
          this.currentPage++
          this.getPage()
        }
      },
      /**
       * 获取缺陷
       * @param {resetImg}
       */
      async getPage(resetImg = false) {
        const queryInfo = {
          pageCondition: {
            page: this.currentPage - 1,
            pageSize: this.pageSize,
          },
          resetImgIdCache: resetImg,
          imgType: 0,
          ...this.queryCondition,
          ...this.navPicObj,
        }
        const res = await vrsService.listProductDefect(queryInfo)
        if (res.code === 0) {
          this.totalNum = res.data.total
          // labelType === 3
          const _list = res.data.list
          if (_list && _list.length) {
            this.labels = _list.reduce((acc, el) => {
              let _labels = el.labels ? el.labels : []
              if (_labels) {
                _labels = _labels.filter((it) => {
                  if (it.labelType === 3) {
                    it['cacheIndex'] = el.cacheIndex
                    it['imgInfo'] = el
                    return it
                  }
                })
              }
              acc = acc.concat(_labels)
              return acc
            }, this.labels)
            // console.log('labels::::', this.labels)
          }
        }
      },
      /**
       * 初始化获取缺陷 提供父组件调用
       * @param {Object} navPicInfo 接受点击导航栏对象信息
       */
      async initDefectListByPage(navPicInfo = {}) {
        this.currentPage = 1
        this.labels = []
        this.recordIndex = -1
        this.navPicObj = navPicInfo
        this.$nextTick(() => {
          this.getPageByInit()
        })
      },
      /**
       * 初始化 要保证表格里有滚轮 递归调接口
       */
      async getPageByInit() {
        await this.getPage(true)
        await this.$nextTick()
        if (this.labels.length < 10 && this.currentPage < this.totalPages) {
          this.currentPage++
          this.getPageByInit()
        }
      },
      /**
       * 表格样式
       */
      cellStyle({ row }) {
        const _imgInfo = row.imgInfo
        if (_imgInfo.aiResult === 'OK') {
          return {
            padding: '0',
            color: 'var(--el-color-success)',
          }
        } else if (_imgInfo.aiResult === 'NG') {
          return {
            padding: '0',
            color: 'var(--el-color-danger)',
          }
        } else {
          return {
            padding: '0',
          }
        }
      },
      /**
       *
       */
      /**
       * 给每一行添加一个索引
       */
      tableRowClassName({ row, rowIndex }) {
        row.index = rowIndex
        if (this.recordIndex === rowIndex) {
          return 'row-select'
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  .defect-box {
    width: 100%;
    height: 100%;
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
    .defect-cell-css {
      // color: var(--el-color-danger);
      font-weight: bold;
      font-size: 18px;
      font-family: serif;
    }
  }
</style>
<style>
  .row-select {
    /* border: 3px solid var(--el-color-primary); */
    background: var(--el-color-primary-light-9) !important;
  }
</style>
