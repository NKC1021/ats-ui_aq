<template>
  <div
    class="canvas-content"
    @mousedown.prevent="mousedown"
    @mouseleave.prevent="mouseleave"
    @mousemove.prevent="mousemove"
    @mouseup.prevent="mouseup"
  >
    <!-- {{ this.width }}-{{ this.height }} -->
    <!-- {{ (this.imgNatureWidth, this.width) }} -->
    <canvas ref="canvasImgRef" :height="height" :width="width"></canvas>
    <canvas
      ref="canvasRgbRef"
      :height="height"
      style="z-index: 2023"
      :width="width"
    ></canvas>
    <img
      alt=""
      draggable="false"
      oncontextmenu="return false;"
      :src="`${checkImgTypeByBase64(imgUrl)}${imgUrl}`"
    />
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
      <p v-show="roiPrecision() !== 0.0">
        <span>{{ translate('长度值') }}:</span>
        {{ precisionMsgVal }}
      </p>
      <p>
        <span>{{ translate('灰度值') }}:</span>
        {{ getRgbVal }}
      </p>
    </div>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import { getStore } from '@/utils/storage'
  export default {
    props: {
      width: {
        type: Number,
        default: 0,
      },
      height: {
        type: Number,
        default: 0,
      },
      imgUrl: {
        type: String,
        default: '',
      },
      imgRealWidth: {
        type: Number,
        default: 0,
      },
      imgRealHeight: {
        type: Number,
        default: 0,
      },
      modelValue: {
        type: Object,
        default: () => {
          return {
            width: 0,
            height: 0,
          }
        },
      },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        // 记录图片原始尺寸宽高
        imgNatureWidth: 0, // 真实渲染后得出
        imgNatureHeight: 0, // 真实渲染后得出
        imgRenderWidth: 0,
        imgRenderHeight: 0,
        isCanDraw: false,
        showMsgFlag: false,
        startPointX: 0,
        startPointY: 0,
        endPointX: 0,
        endPointY: 0,
        canvasImgTxt: null,
        showMsgPoint: { x: 0, y: 0 }, //显示信息位置
        msgContentWid: 0, //显示详情宽
        msgContentHig: 0, //显示详情高
      }
    },
    computed: {
      translate() {
        return translate
      },

      // 图片比例
      imgScale() {
        if (this.imgNatureWidth && this.imgNatureHeight) {
          const _maxVal = Math.max(this.imgNatureWidth, this.imgNatureHeight)
          return Number(_maxVal / this.height).toFixed(2)
        }
        return Number(this.imgNatureWidth / this.imgRenderWidth).toFixed(2)
      },
      /**
       * 长度
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
        return `${_val.toFixed(2)}
        (${realLength.toFixed(2)}X
        ${realHeight.toFixed(2)})um`
      },
      /**
       * 距离
       */
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
        } else {
          return ''
        }
      },
    },
    watch: {
      width() {
        this.$nextTick(() => {
          this.resetDrawImgCanvas()
          this.drawImgCanvas()
        })
      },
      imgUrl() {
        this.$nextTick(() => {
          this.resetDrawImgCanvas()
          this.drawImgCanvas()
        })
      },
      imgNatureWidth() {
        const _imgRealWH = {
          width: this.imgNatureWidth,
          height: this.imgNatureHeight,
        }
        this.$emit('update:modelValue', _imgRealWH)
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    async mounted() {
      await this.$nextTick()
      this.resetDrawImgCanvas()
      this.drawImgCanvas()
    },
    methods: {
      /**
       * 图片隐射到画布上
       */
      drawImgCanvas() {
        const imgCanvas = this.$refs.canvasImgRef
        if (!imgCanvas) return
        const canvasText = imgCanvas.getContext('2d', {
          willReadFrequently: true,
        })
        this.canvasImgTxt = canvasText
        const imageObj = new Image()
        imageObj.src = `${this.checkImgTypeByBase64(this.imgUrl)}${this.imgUrl}`
        imageObj.onload = () => {
          const _width = imageObj.width
          const _height = imageObj.height
          this.imgNatureWidth = _width
          this.imgNatureHeight = _height
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
          canvasText.drawImage(imageObj, _left, _top, _imgWidth, _imgHeight)
        }
      },
      /**
       * 重置画布
       */
      resetDrawImgCanvas() {
        const imgCanvas = this.$refs.canvasImgRef
        const canvasText = imgCanvas.getContext('2d')
        canvasText.clearRect(0, 0, this.width, this.height)
      },
      /**
       * 重置灰度值
       */
      resetImgRgbCanvas() {
        const imgCanvas = this.$refs.canvasRgbRef
        const canvasText = imgCanvas.getContext('2d')
        canvasText.clearRect(0, 0, this.width, this.height)
      },
      /**
       * 鼠标点击
       */
      mousedown(e) {
        // 鼠标左键
        if (e.button === 0) {
          // console.log('画布e::::::', e.offsetX);
          // console.log('画布e::::::', e.offsetY);
          // this.resetImgRgbCanvas()
          this.startPointX = e.offsetX
          this.startPointY = e.offsetY
          this.isCanDraw = true
        }
      },
      /**
       * 鼠标弹起
       */
      mouseup() {
        this.isCanDraw = false
        this.showMsgFlag = false
        this.resetImgRgbCanvas()
      },
      /**
       * 鼠标移动
       */
      mousemove(e) {
        if (this.isCanDraw) {
          this.endPointX = e.offsetX
          this.endPointY = e.offsetY
          this.resetImgRgbCanvas()
          this.drawReact(e)
          this.getMsgContentWH()
          this.getMsgPosition()
          this.showMsgFlag = true
        }
      },
      /**
       * 鼠标离开
       */
      mouseleave() {
        this.isCanDraw = false
        this.showMsgFlag = false
        this.resetImgRgbCanvas()
      },
      /**
       * 画布画矩阵
       */
      drawReact(e) {
        const imgCanvas = this.$refs.canvasRgbRef
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
      /**
       * 计算展示信息的位置
       */
      getMsgPosition() {
        const pointVal = this.msgContentWid + this.endPointX + 10
        const yHeightVal = this.msgContentHig + this.endPointY + 10
        if (pointVal > this.width) {
          this.showMsgPoint.x = this.endPointX - (pointVal - this.width) - 5
        } else {
          this.showMsgPoint.x = this.endPointX
        }
        if (yHeightVal > this.height) {
          this.showMsgPoint.y = this.endPointY - this.msgContentHig - 30
        } else {
          this.showMsgPoint.y = this.endPointY
        }
      },
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
      checkImgTypeByBase64(baseInfo = '') {
        if (!baseInfo) return `data:image/png;base64,`
        const _sliceStr = baseInfo.slice(0, 3)
        const imgTypeMap = new Map()
        imgTypeMap.set('/9j', 'jpg')
        imgTypeMap.set('iVB', 'png')
        imgTypeMap.set('Qk0', 'bmp')
        imgTypeMap.set('SUk', 'tiff')
        imgTypeMap.set('JVB', 'pdf')
        imgTypeMap.set('UEs', 'ofd')
        // console.log('ccccccccccc', imgTypeMap.get(_sliceStr))
        return `data:image/${imgTypeMap.get(_sliceStr)};base64,`
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .canvas-content {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    // background-color: aquamarine;
    canvas {
      position: absolute;
      top: 0;
      left: 0;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      vertical-align: bottom;
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
