<!--  -->
<template>
  <div class="content-box">
    <div ref="defectBoxRef" class="defect-box">
      <div class="box" :style="`width:${showCotentWidth}px`">
        <defectItem
          v-for="(el, idx) in pageSize"
          :id="el"
          :key="el"
          :defect-info="getLabelsByPage[idx]"
          :height="itemContent.height"
          :is-select="selectIndex === idx"
          :width="itemContent.width"
          @click="defectItemClick(getLabelsByPage[idx])"
          @initdefect-item="initDefectItem"
        />
        <!--
         -->
      </div>
    </div>
    <footer>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        background
        layout="total, pager"
        :pager-count="5"
        small
        :total="getLabels.length"
        @current-change="handleCurrentChange"
      />
    </footer>
  </div>
</template>

<script>
  import defectItem from './smallDefect.vue'
  let defectItems = []
  export default {
    components: { defectItem },
    props: {
      imgData: {
        type: Object,
        default: () => ({}),
      },
      modelValue: {
        type: Object,
        default: () => ({}),
      },
      vrsSetConfig: {
        type: Object,
        default: () => ({}),
      },

      /**
       * 产品缺陷列表选中数据
       */
      acceptProductdefect: {
        type: Object,
        default: () => ({}),
      },
    },
    emits: ['update:modelValue', 'update:acceptProductdefect'],
    data() {
      return {
        total: 4,
        colSet: 2,
        rowSet: 2,
        selectIndex: 0,
        defectWidth: 0,
        defectHeight: 0,
        currentPage: 1,
        realWidth: 0,
      }
    },
    computed: {
      pageSize() {
        return this.rowSet * this.colSet
      },
      /**
       * 总页数
       */
      totalPages() {
        return Math.ceil(this.getLabels.length / this.pageSize)
      },
      itemContent() {
        // 7 = border-left + border-right + margin-left + ceil取整冗余
        // 6 = 上下boder 2*2 + maigin-top 2
        // const pageNum = this.colSet * this.rowSet
        const _width = this.defectWidth - this.colSet * 6
        const _height = this.defectHeight - this.rowSet * 6
        const _imgWidth = Math.floor(_width / this.colSet)
        const _imgHeight = Math.floor(_height / this.rowSet)
        const _minVal = Math.min(_imgWidth, _imgHeight)
        if (_minVal >= 0) {
          return {
            width: _minVal,
            height: _minVal,
          }
        }
        return {
          width: 0,
          height: 0,
        }
      },
      /**
       * 防止行列配置不对
       */
      showCotentWidth() {
        const _width = this.colSet * (this.itemContent.width + 6)
        if (_width) return _width
        return 0
      },
      /**
       * 获取imgData labels 信息
       */
      getLabels() {
        const [_imgObj] = this.imgData
        if (!_imgObj) return []
        const _labels = _imgObj.labels
        if (!_labels?.length) return []
        const _filterLabels = _labels.filter((el) => el.labelType === 3)

        return _filterLabels
      },
      /**
       * 当前大图Id
       */
      getCurrentImgId() {
        const [_imgObj] = this.imgData
        if (!_imgObj) return ''
        return _imgObj.id
      },
      /**
       * 选中缺陷Id
       */
      selectDefectId() {
        const _id = this.modelValue.id
        if (_id) return _id
        return ''
      },
      /**
       * 分页数据
       */
      getLabelsByPage() {
        if (!this.getLabels.length) return []
        const startIdx = (this.currentPage - 1) * this.pageSize
        const endIdx = this.currentPage * this.pageSize
        return this.getLabels.slice(startIdx, endIdx)
      },
    },
    watch: {
      /**
       * 选中小图缺陷Id
       */
      selectDefectId() {
        const _idx = this.getLabels.findIndex(
          (el) => el.id === this.selectDefectId
        )
        // 判断索引+1 是否超过 表格长度 是就要翻到对应的页码上
        const _pageNUm = Math.ceil((_idx + 1) / this.pageSize)
        this.currentPage = _pageNUm
        this.$nextTick(() => {
          this.selectIndex = this.getLabelsByPage.findIndex(
            (el) => el.id === this.selectDefectId
          )
        })
      },
      /**
       * 选中大图当前的id 变化就要重置
       */
      getCurrentImgId(newVal) {
        if (newVal >= 0) {
          this.resetParamByImgId()
        }
      },
    },
    created() {
      // console.log('vrsConfig:::', this.vrsSetConfig)
      const { rowSet: _rowSet, colSet: _colSet } = this.vrsSetConfig
      this.rowSet = _rowSet ? _rowSet : this.rowSet
      this.colSet = _colSet ? _colSet : this.colSet
      const _idx = this.getLabels.findIndex(
        (el) => el.id === this.selectDefectId
      )
      // 判断索引+1 是否超过 表格长度 是就要翻到对应的页码上
      const _pageNUm = Math.ceil((_idx + 1) / this.pageSize)
      this.currentPage = _pageNUm
      this.$nextTick(() => {
        this.selectIndex = this.getLabelsByPage.findIndex(
          (el) => el.id === this.selectDefectId
        )
      })
    },

    //生命周期 - 挂载完成（访问DOM元素）
    async mounted() {
      await this.$nextTick()
      this.getDefectHeight()
    },
    unmounted() {
      defectItems.forEach((el) => {
        el.dispose()
      })
      defectItems = []
    },
    methods: {
      initDefectItem(item) {
        defectItems.push(item)
      },
      /**
       * 根据图片重置相关信息
       */
      resetParamByImgId() {
        this.currentPage = 1
        this.selectIndex = 0

        if (this.acceptProductdefect.imgInfo) {
          const _imgId = this.acceptProductdefect.imgInfo.id
          if (_imgId === this.getCurrentImgId) {
            const _labelInfo = { ...this.acceptProductdefect }
            delete _labelInfo.imgInfo
            this.$emit('update:modelValue', _labelInfo)
          } else {
            this.$emit('update:modelValue', this.getLabelsByPage[0])
          }
          this.$emit('update:acceptProductdefect', {})
        } else {
          this.$emit('update:modelValue', this.getLabelsByPage[0])
        }
      },
      /**
       * 缺陷点击
       * @param {Object} item 缺陷item
       */
      defectItemClick(item) {
        // console.log('item', item)
        if (!item) return
        this.$emit('update:modelValue', item)
      },
      /**
       * 获取展示小图缺陷区域
       */
      getDefectHeight() {
        const _defectDom = this.$refs.defectBoxRef
        if (_defectDom) {
          this.defectWidth = _defectDom.clientWidth
          this.defectHeight = _defectDom.clientHeight
        }
      },

      /**
       * 选中上一张 父组件调用
       */
      selectUp() {
        if (this.selectIndex > 0) {
          this.selectIndex--
          this.$emit(
            'update:modelValue',
            this.getLabelsByPage[this.selectIndex]
          )
        } else if (this.selectIndex === 0) {
          this.selectUpPage(true)
        }
      },
      /**
       * 选中下一张 父组件调用
       */
      selectNext() {
        if (this.selectIndex < this.getLabelsByPage.length - 1) {
          this.selectIndex++
          this.$emit(
            'update:modelValue',
            this.getLabelsByPage[this.selectIndex]
          )
        } else if (this.selectIndex === this.getLabelsByPage.length - 1) {
          this.selectNextPage()
        }
      },
      /**
       * 上一页 父组件调用
       */
      selectUpPage(isSelectLastImg = false) {
        if (this.currentPage > 1) {
          this.currentPage--
          this.handleCurrentChange(this.currentPage, isSelectLastImg)
        }
      },
      /**
       * 下一页 父组件调用
       */
      selectNextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage++
          this.handleCurrentChange(this.currentPage)
        }
      },
      /**
       * 页码改变
       */
      handleCurrentChange(newPage, isSelectLastImg = false) {
        this.currentPage = newPage
        if (isSelectLastImg) {
          this.$nextTick(() => {
            this.selectIndex = this.getLabelsByPage.length - 1
            this.$emit(
              'update:modelValue',
              this.getLabelsByPage[this.selectIndex]
            )
          })
        } else {
          this.selectIndex = 0
          // console.log('newPage::::', newPage) 默认选中第一张
          this.$emit('update:modelValue', this.getLabelsByPage[0])
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .content-box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding: 3px;
    .defect-box {
      width: 100%;
      flex: 1;
      .box {
        height: 100%;
        display: flex;
        // justify-content: space-evenly;
        align-content: baseline;
        flex-wrap: wrap;
        overflow: auto;
      }
    }
    footer {
      margin-top: 3px;
      .el-pagination {
        margin: 0;
        justify-content: flex-end;
      }
    }
  }
</style>
