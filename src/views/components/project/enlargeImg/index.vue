<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      append-to-body
      :before-close="dialogClose"
      class="enlarge-dialog"
      :show-close="false"
      top="40px"
      width="760px"
    >
      <div
        ref="viewContentRef"
        v-loading="isRenderLoading"
        class="view-content"
      >
        <div
          ref="viewRef"
          class="view-list"
          :style="`width:${viewListWidth}%;height:${viewListHeight}%;top:${viewListTop}px;left:${viewListLeft}px`"
          @mousedown="start"
          @mouseleave="leave"
          @mousemove="move"
          @mouseup="stop"
          @mousewheel.prevent="viewWheel"
        >
          <viewCanvas
            v-if="dialogVisible"
            v-model="canvasParams"
            v-model:img-url="imgUrl"
            :height="canvasHeight"
            :width="canvasWidth"
          />
        </div>
      </div>

      <el-row class="view-footer">
        <el-col class="footer-content" :span="4">
          <el-tag>imgTotal:{{ startIndex + 1 }}/{{ imgList.length }}</el-tag>
        </el-col>
        <el-col class="footer-content" :span="4">
          <el-tag>
            imgSize:{{ canvasParams.width + ' X ' + canvasParams.height }}
          </el-tag>
        </el-col>
        <el-col class="footer-content" :span="8">
          <el-button circle icon="el-icon-arrow-left" @click="imgLeft" />
          <el-button circle icon="el-icon-arrow-right" @click="imgRight" />
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
  import imgCanvas from './imgCanvas.vue'
  export default {
    components: { viewCanvas: imgCanvas },
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      imgList: {
        type: Array,
        default: () => [],
      },
    },
    emits: ['update:visible'],
    data() {
      return {
        viewContentWidth: 720, //像素
        viewContentHeight: 720,
        viewListWidth: 100, //百分比
        viewListHeight: 100,
        viewListTop: 0,
        viewListLeft: 0,
        timer: null,
        isCanDrag: false,
        startPointX: 0,
        startPointY: 0,
        endPointX: 0,
        endPointY: 0,
        startIndex: 0,
        canvasParams: {
          width: 0, // 图片真实解析的宽
          height: 0, // 图片真实解析的高
        },
      }
    },
    computed: {
      dialogVisible: {
        get() {
          return this.visible
        },
        set(newVal) {
          this.$emit('update:visible', newVal)
        },
      },
      // 图片放大比例
      imgScale() {
        return this.viewListWidth / 100
      },
      // 图片索引
      imgUrl: {
        get() {
          const _imgUrlObj = this.imgList[this.startIndex]
          const _imgUrl = _imgUrlObj ? _imgUrlObj.images : ''
          if (_imgUrl) {
            return _imgUrl
          } else {
            return ''
          }
        },
        set() {},
      },
      //传入数据长度
      imgListLength() {
        return this.imgList.length
      },
      /**
       * 没有图片就转圈圈
       */
      isRenderLoading() {
        if (this.imgList.length) {
          return false
        } else {
          return true
        }
      },
      // 画布宽
      canvasWidth() {
        return Math.ceil(this.viewContentWidth * this.imgScale)
      },
      // 画布高
      canvasHeight() {
        return Math.ceil(this.viewContentHeight * this.imgScale)
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      dialogClose() {
        this.resetRelateParams()
        this.startIndex = 0
        this.dialogVisible = false
      },

      /**
       *图片点击左边
       */
      imgLeft() {
        if (this.startIndex > 0) {
          this.startIndex--
        } else {
          this.startIndex = this.imgListLength - 1
        }
        this.resetRelateParams()
      },
      /**
       * 图片点击左边
       *  */
      imgRight() {
        if (this.startIndex < this.imgListLength - 1) {
          this.startIndex++
        } else {
          this.startIndex = 0
        }
        this.resetRelateParams()
      },
      /**
       * 重置相关参数
       */
      resetRelateParams() {
        this.viewListWidth = 100 //百分比
        this.viewListHeight = 100
        this.viewListTop = 0
        this.viewListLeft = 0
      },
      /**
       * 滚轮放大图片
       */
      async viewWheel(event) {
        const { clientX, clientY } = event
        const { top, left } = this.$refs.viewContentRef.getBoundingClientRect()
        const offsetX = clientX - left
        const offsetY = clientY - top
        //  获取目标Top,Left值
        const domStyle = this.$refs.viewRef.style
        const domTop = Number(domStyle.top.slice(0, -2))
        const domLeft = Number(domStyle.left.slice(0, -2))
        const _offsetTop = offsetY - domTop
        const _offsetLeft = offsetX - domLeft
        const _offsetX = _offsetLeft / this.imgScale
        const _offsetY = _offsetTop / this.imgScale
        const initScale = this.imgScale
        const direction = event.deltaY > 0 ? 'down' : 'up'
        if (direction === 'up') {
          if (this.viewListWidth < 1800) {
            this.viewListWidth += this.viewListWidth * 0.1
            this.viewListHeight += this.viewListHeight * 0.1
          }
        } else {
          // 滑轮向下滚动
          if (this.viewListWidth > 20) {
            this.viewListWidth -= this.viewListWidth * 0.1
            this.viewListHeight -= this.viewListHeight * 0.1
          }
        }
        // this.imgScale 此时该参数已发生变化
        const newTop = _offsetY * (initScale - this.imgScale)
        const newLeft = _offsetX * (initScale - this.imgScale)

        this.viewListTop += newTop
        this.viewListLeft += newLeft
      },

      start(e) {
        // 中键
        if (e.button === 1) {
          this.startPointX = e.offsetX
          this.startPointY = e.offsetY
          this.isCanDrag = true
        }
      },
      stop() {
        this.isCanDrag = false
      },
      /**
       * 图片拖拽
       */
      move(e) {
        if (this.isCanDrag) {
          this.endPointX = e.offsetX
          this.endPointY = e.offsetY
          this.viewListTop += this.endPointY - this.startPointY
          this.viewListLeft += this.endPointX - this.startPointX
        }
      },
      leave() {
        this.isCanDrag = false
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  :deep() {
    .enlarge-dialog .el-dialog__header {
      padding: 0px;
      border-bottom: none;
    }
  }

  :deep() {
    .enlarge-dialog .el-dialog__body {
      padding: 0 !important;
    }
  }

  .view-content {
    width: 720px;
    height: 720px;
    margin: auto;
    background-color: #f4f4f5;
    position: relative;
    overflow: hidden;
    .view-list {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .view-canvas {
      width: 100%;
      height: 100%;
      display: flex;
    }
  }
  .view-footer {
    width: 740px;
    margin: auto;
    .footer-content {
      text-align: center;
      margin-top: 5px;
      line-height: 30px;
      .el-tag + .el-tag {
        margin-left: 5px;
      }
    }
  }
</style>
