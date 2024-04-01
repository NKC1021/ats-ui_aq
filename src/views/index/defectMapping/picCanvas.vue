<template>
  <div ref="imgViewRef" class="pic-mapping">
    <div class="mapping-content">
      <div class="mappingImg-content">
        <canvas id="mappingCanvas" class="mappingImg-canvas"></canvas>
      </div>
    </div>

    <div id="colorSet" class="color-set">
      <canvas id="smallImg" height="200" width="200"></canvas>
    </div>
  </div>
</template>
<script setup>
  import { ref, defineEmits } from 'vue'

  const props = defineProps({
    //父组件--图片和缺陷点数据
    picData: {
      type: Object,
      default() {
        return { gerberImage: '', mappingDefectList: [], redraw: 0 }
      },
    },
    //父组件--缺陷点配色
    defectColor: {
      type: Object,
      default() {},
    },
    //父组件--是否渲染缺陷点或热力图
    redrawPic: {
      type: Object,
      default() {
        return { defect: null, hotPic: null, redraw: 0 }
      },
    },
  })
  const emit = defineEmits(['picEvent'])

  watch(
    () => [props.picData.redraw, props.redrawPic.redraw],
    () => {
      initCavas()
    },
    () => imgViewRef.value.clientHeight,
    () => {
      console.log('高度改变了=========')
      initCavas()
    }
  )

  const mappingImg = ref(HTMLImageElement)
  const startPos = ref({ x: 0, y: 0 }) // 开始坐标
  const movePos = ref({ x: 0, y: 0 }) // 存储移动坐标位置
  const imgX = ref(0) // 图片原点X轴位置（左上角）
  const imgY = ref(0) // 图片原点Y轴位置（左上角）
  const imgInitOffsetX = ref(0) // 图片X轴初始化相对于画布的原点（左上角）偏移量
  const imgInitOffsetY = ref(0) // 图片Y轴初始化相对于画布的原点（左上角）偏移量
  const xRate = ref(1)
  const yRate = ref(1)
  const isMove = ref(false) // 是否移动
  const imgScale = ref(1) // 图片缩放比例
  const MINIMUM_SCALE = ref(0.1) // 最小缩放
  const MAX_SCALE = ref(10) // 最大缩放
  const drawImgWidth = ref(0) //绘制的大图实际宽
  const drawImgHeight = ref(0) //绘制的大图实际高
  const hotpicPoint = ref([]) // 热力图数据点
  const defectPoint = ref([]) // 缺陷数据点
  const hotPicMin = ref(0) // 热力图点数据最小值
  const hotPicMax = ref(100) // 热力图点数据最大值
  // canvas画板
  const canvasRef = ref(HTMLCanvasElement) //展示用的画布
  const ctx = ref(CanvasRenderingContext2D)
  const canvasLayer1 = ref(HTMLCanvasElement) // 图层1（图片）
  const ctx1 = ref(CanvasRenderingContext2D)
  const canvasLayer2 = ref(HTMLCanvasElement) // 图层1（缺陷点和热力图）
  const ctx2 = ref(CanvasRenderingContext2D)
  // TODO 动态取div大小
  // const canvasWidth = ref(600)
  const canvasHeight = ref(600)
  const hotPicRadius = ref(15) // 热力图圆半径

  // 缩略图相关
  const smallImgCanvas = ref(HTMLCanvasElement)
  const smallImgCtx = ref(CanvasRenderingContext2D)
  const drawSmallImgWidth = ref(0) //绘制的缩略图实际宽
  const drawSmallImgHeight = ref(0) //绘制的缩略图实际高
  const smallInitX = ref(0) // 图片初始化X轴位置
  const smallInitY = ref(0) // 图片初始化Y轴位置
  const xSmallRate = ref(1)
  const ySmallRate = ref(1)

  /**
   * 初始化底层画板
   */
  const initCavas = async () => {
    // 初始化大图底层canvas
    canvasRef.value = document.getElementById('mappingCanvas')
    const { width, height } = canvasRef.value.getBoundingClientRect()
    canvasRef.value.width = canvasWidth.value
    canvasRef.value.height = canvasWidth.value
    ctx.value = canvasRef.value.getContext('2d')

    //初始化缩略图canvas
    smallImgCanvas.value = document.getElementById('smallImg')
    smallImgCtx.value = smallImgCanvas.value.getContext('2d')

    await loadImage(`data:image/png;base64,${props.picData.gerberImage}`)
    initImgSize()
    drawCanvas(true)
    // 事件监听
    canvasRef.value.addEventListener('mousedown', startMouse.bind(this))
    canvasRef.value.addEventListener('mousemove', moveMouse.bind(this))
    canvasRef.value.addEventListener('mouseup', endMouse.bind(this))
    canvasRef.value.addEventListener('mousewheel', mouseWheel.bind(this)) // 监听滚轮
    canvasRef.value.addEventListener('wheel', mouseWheel.bind(this)) // 监听滚轮
    canvasRef.value.addEventListener('click', clickCanvas.bind(this)) // 点击事件
  }

  /**
   * 图片加载
   */
  const loadImage = (url) => {
    return new Promise((reject, resolve) => {
      mappingImg.value = new Image()
      mappingImg.value.crossOrigin = 'Anonymous'
      mappingImg.value.onload = function () {
        reject('')
      }
      mappingImg.value.onerror = function (error) {
        console.error(error, 'error=====')
        resolve(error)
      }
      mappingImg.value.src = url
    })
  }

  // 初始化计算图片展示的宽高
  const initImgSize = () => {
    let scale = 1
    let scaleWidth = 0
    let scaleHeight = 0
    if (
      mappingImg.value.width > canvasRef.value.width ||
      mappingImg.value.height > canvasRef.value.height
    ) {
      scaleWidth =
        Math.floor((canvasRef.value.width / mappingImg.value.width) * 100) / 100
      scaleHeight =
        Math.floor((canvasRef.value.height / mappingImg.value.height) * 100) /
        100
      scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight
    }
    drawImgWidth.value = mappingImg.value.width * scale
    drawImgHeight.value = mappingImg.value.height * scale
    console.log(
      '大图片宽高',
      mappingImg.value.width,
      mappingImg.value.height,
      scaleWidth,
      scaleHeight,
      drawImgWidth.value,
      drawImgHeight.value
    )

    if (
      mappingImg.value.width > smallImgCanvas.value.width ||
      mappingImg.value.height > smallImgCanvas.value.height
    ) {
      scaleWidth =
        Math.floor(
          (smallImgCanvas.value.width / mappingImg.value.width) * 1000
        ) / 1000
      scaleHeight =
        Math.floor(
          (smallImgCanvas.value.height / mappingImg.value.height) * 1000
        ) / 1000
      scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight
    }
    drawSmallImgWidth.value = mappingImg.value.width * scale
    drawSmallImgHeight.value = mappingImg.value.height * scale

    xSmallRate.value = drawSmallImgWidth.value / mappingImg.value.width
    ySmallRate.value = drawSmallImgHeight.value / mappingImg.value.height
    // smallImgCanvas.value.width = drawSmallImgWidth.value;
    // smallImgCanvas.value.height = drawSmallImgHeight.value;
    console.log(
      '缩略图的宽高',
      smallImgCanvas.value.width,
      smallImgCanvas.value.height
    )
  }

  // 初始化缺陷点数据
  const initPointValue = () => {
    hotpicPoint.value = []
    defectPoint.value = []
    const arr = props.picData.mappingDefectList

    let min = 0
    let max = 0
    for (let i = 0; i < arr.length; i++) {
      const data = arr[i]
      const x = data.picScaleX * xRate.value + imgX.value
      const y = data.picScaleY * yRate.value + imgY.value
      const num = data.defectNum
      const point = {
        x: Math.floor(x),
        y: Math.floor(y),
        value: num,
        showX: data.x,
        showY: data.y,
        defectNum: num,
        defectType: data.defectType,
      }
      hotpicPoint.value.push(point)
      defectPoint.value.push({
        x: Math.floor(x),
        y: Math.floor(y),
        value: num,
      })
      if (num < min) min = num
      if (num > max) max = num
    }
    hotPicMin.value = min
    hotPicMax.value = max
    // console.log('绘制点数据最大最小值：', hotPicMin.value, hotPicMax.value);
  }

  //在canvas画布上进行绘制
  const drawCanvas = async (bol) => {
    // 1.清除上一帧绘制
    await ctx.value.clearRect(
      0,
      0,
      canvasRef.value.width,
      canvasRef.value.height
    )
    // 2.添加两个图层，图层1绘制图片和缺陷点，图层2绘制热力图
    canvasLayer1.value = document.createElement('canvas')
    canvasLayer1.value.width = canvasWidth.value
    canvasLayer1.value.height = canvasWidth.value
    ctx1.value = canvasLayer1.value.getContext('2d')
    ctx1.value.fillStyle = '#f6f8f9'
    ctx1.value.fillRect(
      0,
      0,
      canvasLayer1.value.width,
      canvasLayer1.value.height
    )
    canvasLayer2.value = document.createElement('canvas')
    canvasLayer2.value.width = canvasWidth.value
    canvasLayer2.value.height = canvasWidth.value
    ctx2.value = canvasLayer2.value.getContext('2d')
    // 3.画图片
    drawImg(bol)
    xRate.value = (drawImgWidth.value * imgScale.value) / mappingImg.value.width
    yRate.value =
      (drawImgHeight.value * imgScale.value) / mappingImg.value.height
    // 4.计算缺陷点位置
    initPointValue()
    // 5.画缩略图
    drawSmallImgArea(bol)
    // 6.画热力图
    if (props.redrawPic.hotPic) {
      drawHotPic(hotPicRadius.value)
    }
    // 7.画缺陷点
    if (props.redrawPic.defect) {
      drawDefectPoints()
    }

    // 8.叠加图层，并最终显示（canvas图像混排模式）
    ctx.value.save()
    ctx.value.globalCompositeOperation = 'source-over'
    ctx.value.drawImage(
      canvasLayer1.value,
      0,
      0,
      canvasWidth.value,
      canvasWidth.value,
      0,
      0,
      canvasWidth.value,
      canvasWidth.value
    )
    ctx.value.drawImage(
      canvasLayer2.value,
      0,
      0,
      canvasWidth.value,
      canvasWidth.value,
      0,
      0,
      canvasWidth.value,
      canvasWidth.value
    )
    ctx.value.restore()
  }

  // 绘制缩略区域
  const drawSmallImgArea = async (bol) => {
    await drawSmallImg()
    drawSmallImgRectangle()
  }

  // 绘制缩略图
  const drawSmallImg = async (bol) => {
    //首次初始化要绘制图片
    await smallImgCtx.value.clearRect(
      0,
      0,
      smallImgCanvas.value.width,
      smallImgCanvas.value.height
    )
    smallImgCtx.value.fillStyle = '#f6f8f9'
    smallImgCtx.value.fillRect(
      0,
      0,
      smallImgCanvas.value.width,
      smallImgCanvas.value.height
    )
    smallInitX.value =
      (smallImgCanvas.value.width - drawSmallImgWidth.value) / 2
    smallInitY.value =
      (smallImgCanvas.value.height - drawSmallImgHeight.value) / 2
    await smallImgCtx.value.drawImage(
      mappingImg.value,
      0,
      0,
      mappingImg.value.width,
      mappingImg.value.height,
      smallInitX.value,
      smallInitY.value,
      drawSmallImgWidth.value,
      drawSmallImgHeight.value
    )
  }

  // 绘制缩略图的矩形框
  const drawSmallImgRectangle = () => {
    //大画布换算成图片真实像素的长宽值
    const ysSize = (canvasWidth.value / xRate.value) * imgScale.value

    //以下点的命名规则：(x1,y1),(x2,y2),(x3,y3),(x4,y4)（左上角->右上角->右下角->左下角）
    // 1. 图片的四个角在canvas画布上的绘制时使用的坐标点
    const showX1 = imgX.value
    const showY1 = imgY.value
    const showX2 = showX1 + drawImgWidth.value * imgScale.value
    const showY2 = showY1 + drawImgHeight.value * imgScale.value

    // 2. 图片的四个角缩放之后的缩放坐标
    const sfX1 = (imgX.value * imgScale.value) / xRate.value
    const sfY1 = (imgY.value * imgScale.value) / yRate.value
    const sfWidth = mappingImg.value.width * imgScale.value
    const sfHeight = mappingImg.value.height * imgScale.value
    const sfX2 = sfX1 + sfWidth
    const sfY3 = sfY1 + sfHeight
    // 2.1 图片缩放后，由cavas画布划出的局部区域的四个点的缩放坐标点
    const x1 = sfX1 > 0 ? 0 : -sfX1
    const y1 = sfY1 > 0 ? 0 : -sfY1
    const x2 = showX2 > canvasWidth.value ? sfWidth - (sfX2 - ysSize) : sfWidth
    const y2 = y1
    const x3 = x2
    const y3 =
      showY2 > canvasWidth.value ? sfHeight - (sfY3 - ysSize) : sfHeight
    const x4 = x1
    const y4 = y3
    // 2.1 图片缩放后，由cavas画布划出的局部区域的四个点的原始坐标点
    const ysX1 = Math.floor(x1 / imgScale.value)
    const ysY1 = Math.floor(y1 / imgScale.value)
    const ysX2 = Math.floor(x2 / imgScale.value)
    const ysY2 = Math.floor(y2 / imgScale.value)
    const ysX3 = Math.floor(x3 / imgScale.value)
    const ysY3 = Math.floor(y3 / imgScale.value)
    const ysX4 = Math.floor(x4 / imgScale.value)
    const ysY4 = Math.floor(y4 / imgScale.value)
    // 3.缩略图的坐标点处理
    const smallX1 = ysX1 * xSmallRate.value + smallInitX.value
    const smallY1 = ysY1 * ySmallRate.value + smallInitY.value
    const smallX2 = ysX2 * xSmallRate.value + smallInitX.value
    const smallY3 = ysY3 * ySmallRate.value + smallInitY.value
    const width = smallX2 - smallX1
    const height = smallY3 - smallY1
    console.log(
      `1.大图矩形框缩放坐标点：(${x1},${y1}),(${x2},${y2}),(${x3},${y3}),(${x4},${y4}),`
    )
    console.log(
      `2.大图矩形框原始坐标点：(${ysX1},${ysY1}),(${ysX2},${ysY2}),(${ysX3},${ysY3}),(${ysX4},${ysY4}),`
    )
    console.log(
      `3.缩略图矩形框画图信息，坐标(${smallX1},${smallY1})，宽高(${width},${height})`
    )
    // 4.缩略图的矩形框绘制
    smallImgCtx.value.lineWidth = 2
    smallImgCtx.value.strokeStyle = '#f00'
    smallImgCtx.value.strokeRect(smallX1, smallY1, width, height)
  }

  // 绘制图片
  const drawImg = (bol) => {
    if (bol) {
      // 是否为初始化渲染
      imgX.value = (canvasRef.value.width - drawImgWidth.value) / 2
      imgY.value = (canvasRef.value.height - drawImgHeight.value) / 2
      imgInitOffsetX.value = imgX.value
      imgInitOffsetY.value = imgY.value
      imgScale.value = 1
    }
    console.log('坐标', imgX.value, imgY.value, startPos.value, movePos.value)
    console.log(
      '宽高',
      drawImgWidth.value * imgScale.value,
      drawImgHeight.value * imgScale.value,
      mappingImg.value.width,
      mappingImg.value.height
    )
    //绘制图片
    ctx1.value.drawImage(
      mappingImg.value,
      0,
      0,
      mappingImg.value.width,
      mappingImg.value.height,
      imgX.value,
      imgY.value,
      drawImgWidth.value * imgScale.value,
      drawImgHeight.value * imgScale.value
    )
  }

  // 画缺陷点
  const drawDefectPoints = () => {
    for (let i = 0; i < hotpicPoint.value.length; i++) {
      const data = hotpicPoint.value[i]
      ctx2.value.beginPath() //开始绘制
      ctx2.value.arc(data.x, data.y, 2, 0, Math.PI * 2, false) //arc 的意思是“弧”
      const color = props.defectColor[data.defectType]
        ? props.defectColor[data.defectType]
        : 'red'
      ctx2.value.fillStyle = color //设置填充颜色
      ctx2.value.strokeStyle = color //设置线条颜色
      ctx2.value.fill() //开始填充
    }
  }

  // 画热力图
  const drawHotPic = (radius) => {
    hotpicPoint.value.forEach((point) => {
      const { x, y, value } = point
      ctx2.value.beginPath()
      ctx2.value.arc(x, y, radius, 0, 2 * Math.PI)
      ctx2.value.closePath()

      // 创建渐变色: r,g,b取值比较自由，我们只关注alpha的数值
      const radialGradient = ctx2.value.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius
      )
      radialGradient.addColorStop(0.0, 'rgba(0,0,0,1)')
      radialGradient.addColorStop(1.0, 'rgba(0,0,0,0)')
      ctx2.value.fillStyle = radialGradient

      // 设置globalAlpha: 需注意取值需规范在0-1之间
      const globalAlpha =
        (value - hotPicMin.value) / (hotPicMax.value - hotPicMin.value)
      ctx2.value.globalAlpha = Math.max(Math.min(globalAlpha, 1), 0)

      // 填充颜色
      ctx2.value.fill()
    })

    // 像素着色
    const palette = new Palette(ctx2.value)
    const imageData = ctx2.value.getImageData(
      0,
      0,
      canvasWidth.value,
      canvasWidth.value
    )
    const data = imageData.data
    for (let i = 3; i < data.length; i += 4) {
      const alpha = data[i]
      const color = palette.colorPicker(alpha)
      data[i - 3] = color[0]
      data[i - 2] = color[1]
      data[i - 1] = color[2]
    }
    ctx2.value.putImageData(imageData, 0, 0)
  }

  // 调色板
  const defaultColorStops = ref({
    0: '#0ff',
    0.2: '#0f0',
    0.4: '#ff0',
    1: '#f00',
  })
  const width = 20,
    height = 256
  class Palette {
    constructor(opts) {
      Object.assign(this, opts)
      this.init()
    }
    init() {
      const colorStops = defaultColorStops.value

      // 创建canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx1 = canvas.getContext('2d')

      // 创建线性渐变色
      const linearGradient = ctx1.createLinearGradient(0, 0, 0, height)
      for (const key in colorStops) {
        linearGradient.addColorStop(key, colorStops[key])
      }

      // 绘制渐变色条
      ctx1.fillStyle = linearGradient
      ctx1.fillRect(0, 0, width, height)

      // 读取像素数据
      this.imageData = ctx1.getImageData(0, 0, 1, height).data

      // const element = document.getElementById('colorSet');
      // var delEle = element.getElementsByTagName('canvas');
      // let length = delEle.length;
      // for (var i = length - 1; i >= 0; i--) {
      //   element.removeChild(delEle[i]);
      // }
      // element.appendChild(canvas);
      this.canvas = canvas
    }
    /**
     * 取色器
     * @param {Number} position 像素位置
     * @return {Array.<Number>} [r, g, b]
     */
    colorPicker(position) {
      return this.imageData.slice(position * 4, position * 4 + 3)
    }
  }

  //添加canvas点击事件
  const clickCanvas = (e) => {
    const p = getEventPosition(e)
    const x = p.x
    const y = p.y
    const arr = hotpicPoint.value
    const resultArr = []
    arr.forEach((val, index) => {
      const forX = val.x
      const forY = val.y
      // 误差小于1px的都算在内
      if (forX - 5 < x && x < forX + 5 && forY - 5 < y && y < forY + 5) {
        resultArr.push(val)
      }
    })
    console.log('点击坐标点', p.x, p.y)
    emit('picEvent', resultArr)
  }

  // 获取canvas画布的实际坐标点
  const getEventPosition = (ev) => {
    let x, y
    if (ev.layerX || ev.layerX == 0) {
      x = ev.layerX
      y = ev.layerY
    } else if (ev.offsetX || ev.offsetX == 0) {
      x = ev.offsetX
      y = ev.offsetY
    }
    return { x: x, y: y }
  }

  // 开始拖拽
  const startMouse = (e) => {
    const { pageX, pageY } = e
    isMove.value = true
    startPos.value = windowToCanvas(pageX, pageY)
  }

  // 拖拽移动
  const moveMouse = (e) => {
    if (!isMove.value) return false
    const { pageX, pageY } = e
    movePos.value = windowToCanvas(pageX, pageY)
    const x = movePos.value.x - startPos.value.x,
      y = movePos.value.y - startPos.value.y
    imgX.value += x
    imgY.value += y
    startPos.value = { ...movePos.value } // 更新最新位置
    drawCanvas()
  }

  // 拖拽结束
  const endMouse = (e) => {
    isMove.value = false
  }

  // 监听滚轮
  const mouseWheel = (e) => {
    const { clientX, clientY, wheelDelta } = e
    const pos = windowToCanvas(clientX, clientY)
    // 计算图片的位置
    const newPos = {
      x: Number(((pos.x - imgX.value) / imgScale.value).toFixed(2)),
      y: Number(((pos.y - imgY.value) / imgScale.value).toFixed(2)),
    }
    // 判断是放大还是缩小
    if (wheelDelta > 0) {
      // 放大
      imgScale.value += 0.1
      if (imgScale.value >= MAX_SCALE.value) {
        imgScale.value = MAX_SCALE.value
      }
    } else {
      // 缩小
      imgScale.value -= 0.1
      if (imgScale.value <= MINIMUM_SCALE.value) {
        imgScale.value = MINIMUM_SCALE.value
      }
    }
    // 计算图片的位置， 根据当前缩放比例，计算新的位置
    imgX.value = (1 - imgScale.value) * newPos.x + (pos.x - newPos.x)
    imgY.value = (1 - imgScale.value) * newPos.y + (pos.y - newPos.y)
    drawCanvas() // 开始绘制图片
  }

  // 处理鼠标的位置
  const windowToCanvas = (startX, startY) => {
    const { left, top, width, height } = canvasRef.value.getBoundingClientRect()
    const obj = {
      x: startX - left - (width - canvasRef.value.width) / 2,
      y: startY - top - (height - canvasRef.value.height) / 2,
    }
    return obj
  }

  // 勾股定理，求两点间的直线距离
  const getDistance = (p1, p2) => {
    const x = p2.pageX - p1.pageX
    const y = p2.pageY - p1.pageY
    return Math.sqrt(x * x + y * y)
  }

  const imgViewRef = ref(null)
  onMounted(() => {
    console.log('容器的高度====', imgViewRef.value.clientHeight)
    canvasWidth.value = imgViewRef.value.clientHeight
  })

  const canvasWidth = computed(() => {
    console.log('容器的高度1====', imgViewRef.value.clientHeight)
    return imgViewRef.value.clientHeight - 50
  })
</script>
<style lang="scss">
  .pic-mapping {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    .color-set {
      position: relative;
      top: 239px;
      left: 20px;
      width: 200px;
      height: 200px;
    }

    .mapping-content {
      position: relative;
      padding: 20px;
    }

    .mappingImg-canvas1 {
      position: absolute;
      z-index: 50;
      margin: 0 auto;
      overflow: hidden;
    }

    .mappingImg-canvas {
      position: relative;
      margin: 0 auto;
      overflow: hidden;
      cursor: move;
    }

    .mappingImg-content {
      position: relative;
      margin: 0 auto;
      overflow: hidden;
    }
  }
</style>
