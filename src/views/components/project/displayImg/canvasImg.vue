<template>
  <div class="canvas-container">
    <div class="canvas-body">
      <!-- 渲染图片在画布上 -->
      <canvas
        ref="imgCanvasRef"
        class="canvas-img"
        :height="height"
        :width="width"
      ></canvas>
      <!-- 用户操作矩阵框在此画布 -->
      <canvas
        ref="rgbCanvasRef"
        class="canvas-edit"
        :height="height"
        style="z-index: 999"
        :width="width"
        @mousedown="mousedown"
        @mouseleave="mouseleave"
        @mousemove="mousemove($event)"
        @mouseup="mouseup"
      ></canvas>

      <div
        v-show="showMsgFlag"
        ref="msgContentRef"
        class="msg-content"
        :style="`top:${showMsgPoint.y + 23}px;left:${
          showMsgPoint.x + 8
        }px;color:${roiFontColor()};z-index:899`"
      >
        <p>
          <span>{{ translate('像素值') }}:</span>
          {{ distanceVal }}
        </p>
        <p v-if="roiPrecision() !== 0.0">
          <span>{{ translate('长度值') }}:</span>
          {{ precisionMsgVal }}
        </p>
        <p>
          <span>{{ translate('灰度值') }}:</span>
          {{ getRgbVal }}
        </p>
      </div>
    </div>
  </div>
</template>
<script>
  import { getStore } from '@/utils/storage'
  import { translate } from '@/i18n'
  export default {
    props: {
      // 图片类型 1单图 2双图
      showImgType: {
        type: Number,
        default: 1,
      },
      width: {
        type: Number,
        default: 0,
      },
      height: {
        type: Number,
        default: 0,
      },
      imgDataList: {
        type: Array,
        default: () => [],
      },
      // 图片实际宽
      imgRealWidth: {
        type: Number,
        default: 0,
      },
      // 图片实际高
      imgRealHeight: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        rgbCanvasCtx: null, //图片隐射到canvas，用作获取灰度值
        startPoint: { x: 0, y: 0 }, //记录鼠标开始点
        endPoint: { x: 0, y: 0 }, //鼠标弹起点
        canvasFlag: false, //画矩阵标记
        canvasContent: null,
        lineWidth: 0,
        lineHeight: 0,
        pointObj: {},
        showMsgFlag: false,
        rgbMsgVal: '',
        lengthMsgVal: '', //显示长度值
        showMsgPoint: { x: 0, y: 0 }, //显示信息位置
        msgContentWid: 0, //显示详情宽
        msgContentHig: 0, //显示详情高
        // ------------------------------
        canvasImgTxt: null, //清除画布显示内容
        isCanDraw: false,
        startPointX: 0,
        startPointY: 0,
        endPointX: 0,
        endPointY: 0,
        imgRealWidthSize: 0, // 真是图片宽
        imgRealHeightSize: 0, // 真是图片高
      }
    },
    computed: {
      translate() {
        return translate
      },

      // 图片比例
      imgScale() {
        if (this.imgRealWidth && this.imgRealHeight) {
          const _maxVal = Math.max(this.imgRealWidth, this.imgRealHeight)
          return Number(_maxVal / this.height).toFixed(2)
        }
        const _maxVal = Math.max(this.imgRealWidthSize, this.imgRealHeightSize)
        return Number(_maxVal / this.height).toFixed(2)
      },
      /**
       * 左侧图片
       */
      imgLeftUrl() {
        if (this.imgDataList.length) {
          return this.imgDataList[0]
        }
        return ''
      },
      /**
       * 右侧图片
       */
      imgRightUrl() {
        if (this.imgDataList.length > 1) {
          const _length = this.imgDataList.length
          return this.imgDataList[_length - 1]
        }
        return ''
      },
      /**
       *长度值
       */
      precisionMsgVal() {
        const length = Math.abs(this.endPointX - this.startPointX)
        const height = Math.abs(this.endPointY - this.startPointY)
        const realLength =
          Math.ceil(length * this.imgScale) * this.roiPrecision()
        const realHeight =
          Math.ceil(height * this.imgScale) * this.roiPrecision()
        const _val = Math.sqrt(
          Math.pow(realLength, 2) + Math.pow(realHeight, 2)
        )
        return `${_val.toFixed(2)}(${realLength.toFixed(
          2
        )}X${realHeight.toFixed(2)})um`
      },
      // 距离
      distanceVal() {
        const length = Math.abs(this.endPointX - this.startPointX)
        const height = Math.abs(this.endPointY - this.startPointY)
        const realLength = Math.ceil(length * this.imgScale)
        const realHeight = Math.ceil(height * this.imgScale)
        const _val = Math.sqrt(
          Math.pow(realLength, 2) + Math.pow(realHeight, 2)
        )
        return `${_val.toFixed(2)}(${realLength}X${realHeight})PX`
      },
      /**
       * 计算开始点跟结束点灰度值
       */
      getRgbVal() {
        if (this.canvasImgTxt) {
          const strObj = this.canvasImgTxt.getImageData(
            this.startPointX,
            this.startPointY,
            1,
            1
          ).data
          const endObj = this.canvasImgTxt.getImageData(
            this.endPointX,
            this.endPointY,
            1,
            1
          ).data
          const srtRgbVal = (
            0.299 * strObj[0] +
            0.587 * strObj[1] +
            0.114 * strObj[2]
          ).toFixed(2)
          const endRgbVal = (
            0.299 * endObj[0] +
            0.587 * endObj[1] +
            0.114 * endObj[2]
          ).toFixed(2)
          const rgbVal = Math.ceil(Math.abs(srtRgbVal - endRgbVal))
          return `diff:${rgbVal},str:${srtRgbVal},end:${endRgbVal}`
        }
        return ''
      },
    },
    watch: {
      async imgDataList(newVal, oldVal) {
        // 防止多次执行
        if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return false
        // console.log('新值旧值一样吗');
        await this.$nextTick()
        this.drawImgToCanvasByOne__()
        this.drawImgToCanvasByTwo__()
        // this.drawImgToCanvasByOne()
        // this.drawImgToCanvasByTwo()
      },
      async width() {
        // console.log('newVal::::', newVal);
        await this.$nextTick()
        this.drawImgToCanvasByOne__()
        this.drawImgToCanvasByTwo__()
        // this.drawImgToCanvasByOne()
        // this.drawImgToCanvasByTwo()
      },
      // 废弃
      canvasContentRgb(newVal) {
        this.canvasContent = newVal
      },
    },
    created() {},
    async mounted() {
      await this.$nextTick()
      this.drawImgToCanvasByOne__()
      this.drawImgToCanvasByTwo__()
      // this.drawImgToCanvasByOne()
      // this.drawImgToCanvasByTwo()
    },
    methods: {
      /**
       * 获取显示信息的长＆宽
       */
      getMsgContentWH() {
        this.$nextTick(() => {
          const msgDiv = this.$refs.msgContentRef
          if (msgDiv) {
            this.msgContentWid = msgDiv.clientWidth
            this.msgContentHig = msgDiv.clientHeight
          }
        })
      },
      // 获取测量框颜色
      roiFrameColor() {
        const frameColor = getStore({ name: 'roiFrameColor' })
        return frameColor ? frameColor : '#00ff00'
      },
      // 获取测量框文字颜色
      roiFontColor() {
        const fontColor = getStore({ name: 'roiFontColor' })
        return fontColor ? fontColor : '#000000'
      },
      /**
       * 获取测量框精度
       */
      roiPrecision() {
        const precision = getStore({ name: 'roiPrecision' })
        return precision ? precision : 0.0
      },

      mousedown(e) {
        // this.pointObj = {};
        // this.canvasFlag = true;
        // this.startPoint.x = e.offsetX;
        // this.startPoint.y = e.offsetY;
        // if (this.canvasContent) {
        //   this.canvasContent.clearRect(0, 0, this.contentWid, this.contentHig);
        // }
        this.startPointX = e.offsetX
        this.startPointY = e.offsetY
        this.isCanDraw = true
        // this.showMsgFlag = true;
      },
      mouseup() {
        this.isCanDraw = false
        this.showMsgFlag = false
        this.resetImgRgbCanvas()
      },
      mouseleave(e) {
        this.endPointX = e.offsetX
        this.endPointY = e.offsetY
        this.isCanDraw = false
      },
      mousemove(e) {
        if (this.isCanDraw) {
          this.showMsgFlag = true
          this.endPointX = e.offsetX
          this.endPointY = e.offsetY
          this.resetImgRgbCanvas()
          this.drawReact(e)
          this.getMsgContentWH()
          this.getMsgPosition()
        }
      },
      /**
       * 计算两点之间的灰度值
       * @param {object} startPoint
       * @param {object} endPoint
       */
      computedRGBVal(startPoint, endPoint) {
        // var rgbVal = null;
        const strObj = this.rgbCanvasCtx.getImageData(
          startPoint.x,
          startPoint.y,
          1,
          1
        ).data
        const endObj = this.rgbCanvasCtx.getImageData(
          endPoint.x,
          endPoint.y,
          1,
          1
        ).data
        const srtRgbVal = (
          0.299 * strObj[0] +
          0.587 * strObj[1] +
          0.114 * strObj[2]
        ).toFixed(2)
        const endRgbVal = (
          0.299 * endObj[0] +
          0.587 * endObj[1] +
          0.114 * endObj[2]
        ).toFixed(2)
        const rgbVal = Math.ceil(Math.abs(srtRgbVal - endRgbVal))
        return {
          srtRgbVal: srtRgbVal,
          endRgbVal: endRgbVal,
          rgbVal: rgbVal,
        }
      },
      /**
       * 计算展示信息的位置
       */
      getMsgPosition() {
        const pointVal = this.msgContentWid + this.endPointX + 10
        if (pointVal > this.width) {
          this.showMsgPoint.x = this.endPointX - (pointVal - this.width) - 5
        } else {
          this.showMsgPoint.x = this.endPointX
        }
        this.showMsgPoint.y = this.endPointY
      },

      drawImgToCanvasByOne__() {
        if (this.showImgType === 1) {
          this.resetDrawImgCanvas()
          const _imgCanvasDom = this.$refs.imgCanvasRef
          if (!_imgCanvasDom) return
          const canvasText = _imgCanvasDom.getContext('2d', {
            willReadFrequently: true,
          })
          this.canvasImgTxt = canvasText
          const _imgLeft = new Image()
          _imgLeft.src = `data:image/png;base64,${this.imgLeftUrl}`
          _imgLeft.crossOrigin = 'anonymous'
          _imgLeft.onload = () => {
            const _width = _imgLeft.width
            const _height = _imgLeft.height
            this.imgRealWidthSize = _width
            this.imgRealHeightSize = _height
            const _maxVal = Math.max(_width, _height)
            // 计算比例
            const _sacle = this.height / _maxVal
            // 在正方形渲染图片宽高
            const _imgWidth = Math.ceil(_width * _sacle)
            const _imgHeight = Math.ceil(_height * _sacle)
            let _left = this.width - _imgWidth
            _left = _left >= 0 ? Math.ceil(_left / 2) : 0
            let _top = this.height - _imgHeight
            _top = _top >= 0 ? Math.ceil(_top / 2) : 0
            canvasText.drawImage(_imgLeft, _left, _top, _imgWidth, _imgHeight)
          }
        }
      },
      /**
       * 把图片隐射到画布上单图情况
       */
      drawImgToCanvasByOne() {
        if (this.showImgType === 1) {
          this.resetDrawImgCanvas()
          const _imgCanvasDom = this.$refs.imgCanvasRef
          const _imgLeftDom = this.$refs.imgLeftRef
          if (_imgCanvasDom) {
            const imgWidth = _imgLeftDom.clientWidth
              ? _imgLeftDom.clientWidth
              : this.width
            const imgHeight = _imgLeftDom.clientHeight
              ? _imgLeftDom.clientHeight
              : this.height //渲染高度
            const renderCenterWidth = Math.ceil((this.width - imgWidth) / 2)
            const renderCenterHeight = Math.ceil((this.height - imgHeight) / 2)
            const canvasText = _imgCanvasDom.getContext('2d', {
              willReadFrequently: true,
            })
            this.canvasImgTxt = canvasText
            const _imgLeft = new Image()
            _imgLeft.src = `data:image/png;base64,${this.imgLeftUrl}`
            _imgLeft.crossOrigin = 'anonymous'
            _imgLeft.onload = () => {
              // console.log('image对象::::', _imgLeft);
              // let canvasText = _imgCanvasDom.getContext('2d');
              canvasText.drawImage(
                _imgLeft,
                renderCenterWidth,
                renderCenterHeight,
                imgWidth,
                imgHeight
              )
              // this.canvasImgTxt = canvasText;
            }
          }
        }
      },
      drawImgToCanvasByTwo__() {
        if (this.showImgType === 2) {
          this.resetDrawImgCanvas()
          const _imgCanvasDom = this.$refs.imgCanvasRef
          if (!_imgCanvasDom) return
          const canvasText = _imgCanvasDom.getContext('2d', {
            willReadFrequently: true,
          })
          this.canvasImgTxt = canvasText
          // 双图要处理父盒子的宽
          const _fatherWidth = Math.ceil((this.width - 2) / 2)
          const _imgLeft = new Image()
          _imgLeft.src = `data:image/png;base64,${this.imgLeftUrl}`
          _imgLeft.crossOrigin = 'anonymous'
          _imgLeft.onload = () => {
            const _width = _imgLeft.width
            const _height = _imgLeft.height
            this.imgRealWidthSize = _width
            this.imgRealHeightSize = _height
            const _maxVal = Math.max(_width, _height)
            // 计算比例
            const _sacle = this.height / _maxVal
            // 在正方形渲染图片宽高
            const _imgWidth = Math.ceil(_width * _sacle)
            const _imgHeight = Math.ceil(_height * _sacle)
            let _left = _fatherWidth - _imgWidth
            _left = _left >= 0 ? Math.ceil(_left / 2) : 0
            let _top = this.height - _imgHeight
            _top = _top >= 0 ? Math.ceil(_top / 2) : 0
            canvasText.drawImage(_imgLeft, _left, _top, _imgWidth, _imgHeight)
          }
          if (!this.imgRightUrl) return
          const _imgRight = new Image()
          _imgRight.src = `data:image/png;base64,${this.imgRightUrl}`
          _imgRight.crossOrigin = 'anonymous'
          _imgRight.onload = () => {
            const _width = _imgLeft.width
            const _height = _imgLeft.height
            const _maxVal = Math.max(_width, _height)
            // 计算比例
            const _sacle = this.height / _maxVal
            // 在正方形渲染图片宽高
            const _imgWidth = Math.ceil(_width * _sacle)
            const _imgHeight = Math.ceil(_height * _sacle)
            let _left = _fatherWidth - _imgWidth
            _left = _left >= 0 ? Math.ceil(_left / 2) : 0
            _left = _left + _fatherWidth + 2
            let _top = this.height - _imgHeight
            _top = _top >= 0 ? Math.ceil(_top / 2) : 0
            canvasText.drawImage(_imgLeft, _left, _top, _imgWidth, _imgHeight)
          }
        }
      },
      /**
       * 双图情况
       */
      drawImgToCanvasByTwo() {
        if (this.showImgType === 2) {
          this.resetDrawImgCanvas()
          const _imgCanvasDom = this.$refs.imgCanvasRef
          const _imgRightDom = this.$refs.imgRightRef
          const _imgLeftDom = this.$refs.imgLeftRef
          const _imgWidth = Math.ceil((this.width - 2) / 2)
          // console.log('图片节点:::', _imgDom);
          // console.log('图片节点:::', _imgCanvasDom);
          if (_imgCanvasDom) {
            const imgLeftWid = _imgLeftDom.clientWidth
              ? _imgLeftDom.clientWidth
              : _imgWidth
            const imgLeftHig = _imgLeftDom.clientHeight
              ? _imgLeftDom.clientHeight
              : _imgWidth //渲染高度
            const imgRightWid = _imgRightDom.clientWidth
              ? _imgRightDom.clientWidth
              : _imgWidth
            const imgRightHig = _imgRightDom.clientHeight
              ? _imgRightDom.clientHeight
              : _imgWidth //渲染高度
            const renderCenterWidthL = Math.ceil((_imgWidth - imgLeftWid) / 2)
            const renderCenterHeightL = Math.floor((_imgWidth - imgLeftHig) / 2)
            const renderCenterWidthR = Math.ceil((_imgWidth - imgRightWid) / 2)
            const renderCenterHeightR = Math.floor(
              (_imgWidth - imgRightHig) / 2
            )
            const canvasText = _imgCanvasDom.getContext('2d')
            this.canvasImgTxt = canvasText
            const _imgLeft = new Image()
            const _imgRight = new Image()
            _imgLeft.src = `data:image/png;base64,${this.imgLeftUrl}`
            _imgRight.src = `data:image/png;base64,${this.imgRightUrl}`
            _imgLeft.crossOrigin = 'anonymous'
            _imgRight.crossOrigin = 'anonymous'
            _imgLeft.onload = () => {
              canvasText.drawImage(
                _imgLeft,
                renderCenterWidthL,
                renderCenterHeightL,
                imgLeftWid,
                imgLeftHig
              )
            }
            _imgRight.onload = () => {
              // let canvasText = _imgCanvasDom.getContext('2d');
              canvasText.drawImage(
                _imgRight,
                _imgWidth + renderCenterWidthR + 2,
                renderCenterHeightR,
                imgRightWid,
                imgRightHig
              )
              // this.canvasImgTxt = canvasText;
            }
          }
        }
      },
      /**
       * 清除图片在画布上面渲染
       */
      resetDrawImgCanvas() {
        if (this.canvasImgTxt) {
          this.canvasImgTxt.clearRect(0, 0, this.width, this.height)
        }
      },
      /**
       * 重置灰度值
       */
      resetImgRgbCanvas() {
        const imgCanvas = this.$refs.rgbCanvasRef
        const canvasText = imgCanvas.getContext('2d')
        canvasText.clearRect(0, 0, this.width, this.height)
      },
      /**
       * 画布画矩阵
       */
      drawReact(e) {
        const imgCanvas = this.$refs.rgbCanvasRef
        const canvasText = imgCanvas.getContext('2d')
        // ------------描绘矩阵
        canvasText.beginPath()
        // ------------样式todo
        canvasText.width = 1
        canvasText.fillStyle = this.roiFontColor()
        canvasText.strokeStyle = this.roiFrameColor()
        // ----------------------
        canvasText.moveTo(this.startPointX, this.startPointY)
        canvasText.lineTo(e.offsetX, e.offsetY)
        canvasText.stroke()
        // ------------
        canvasText.strokeRect(
          this.startPointX,
          this.startPointY,
          e.offsetX - this.startPointX,
          e.offsetY - this.startPointY
        )
        // console.log('距离::::', this.distanceVal);
        // console.log('灰度::::', this.getRgbVal);
      },
    },
  }
</script>

<style lang="scss" scoped>
  .canvas-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    .canvas-body {
      width: 100%;
      height: 100%;
      position: relative;

      .canvas-img {
        position: absolute;
        top: 0;
        left: 0;
      }
      .canvas-edit {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 99;
      }
    }
  }

  .msg-content {
    position: absolute;
    padding: 3px;
    font-size: 12px;
    z-index: 999;
    box-shadow: 0 0 8px #fff;
    background-color: #fff;
    border-radius: 3px;
    p {
      margin: 5px 0;
    }
  }
</style>
