<!--  -->
<template>
  <div
    v-show="getImgSrc"
    :class="[
      'defect-content',
      { 'defect-select': isSelect },
      { 'has-img': getImgSrc },
    ]"
  >
    <canvas :id="`defectCanvas${id}`" :height="height" :width="width"></canvas>
  </div>
</template>

<script>
  import { Base64 } from 'js-base64'
  import { EntityType, MiniView, CommandControl } from 'aqlabelview'
  import { getStore } from '@/utils/storage'
  let aqlabelviewObj
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
      id: {
        type: Number,
        default: 0,
      },
      defectInfo: {
        type: Object,
        default: () => ({}),
      },
      isSelect: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['initdefectItem'],
    data() {
      return {
        staticViewObj: {},
      }
    },
    computed: {
      getImgSrc() {
        const _imgList = this.defectInfo.imageData
        if (!_imgList?.length) return ''
        const [imgObj] = _imgList
        const _imgSrc = imgObj.images
        return _imgSrc
      },
      getDefectInfo() {
        const detail = this.defectInfo.detail
        let cutPoints = this.defectInfo.cutPoints
        cutPoints = JSON.parse(cutPoints)
        if (!detail) return ''
        const _detailInfo = JSON.parse(detail)
        const _extInfo = _detailInfo.ext_info
        _detailInfo.polygon.outer.points = cutPoints
        if (!_extInfo) return { testLabel: [_detailInfo] }
        let _names = []
        _names.push(_detailInfo.name)
        let _area = _extInfo?.area.value
        _area = _area ? `面积${Number(Base64.decode(_area)).toFixed(2)}` : ''
        _names.push(_area)
        let _width = _extInfo?.width.value
        _width = _width ? `长${Number(Base64.decode(_width)).toFixed(1)}` : ''
        _names.push(_width)
        let _height = _extInfo?.height.value
        _height = _height
          ? `宽${Number(Base64.decode(_height)).toFixed(1)}`
          : ''
        _names.push(_height)
        _names = _names.filter((el) => el !== '')
        const _nameStr = _names.join('，')
        _detailInfo.name = _nameStr

        // console.log('_detailInfo::', _detailInfo)
        return { testLabel: [_detailInfo] }
      },
      getDefectDetail() {
        const detail = this.defectInfo.detail
        if (!detail) return ''
        const _detailInfo = JSON.parse(detail)
        const _extInfo = _detailInfo.ext_info

        let _names = []
        _names.push(_detailInfo.name)
        let _area = _extInfo?.area.value
        _area = _area ? `面积${Number(Base64.decode(_area)).toFixed(2)}` : ''
        _names.push(_area)
        let _width = _extInfo?.width.value
        _width = _width ? `长${Number(Base64.decode(_width)).toFixed(1)}` : ''
        _names.push(_width)
        let _height = _extInfo?.height.value
        _height = _height
          ? `宽${Number(Base64.decode(_height)).toFixed(1)}`
          : ''
        _names.push(_height)
        _names = _names.filter((el) => el !== '')
        const _nameStr = _names.join('，')
        return _nameStr
      },
    },
    watch: {
      getImgSrc() {
        // console.log('变化了')
        this.$nextTick(() => {
          !this.getImgSrc && this.clear()
          this.getImgSrc && this.setImage()
        })
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    unmounted() {
      aqlabelviewObj?.dispose()
    },
    async mounted() {
      await this.$nextTick()
      setTimeout(() => {
        const _canvasId = `defectCanvas${this.id}`
        aqlabelviewObj = new MiniView({
          canvasId: _canvasId,
          styleProvider: (entType, name) => {
            if (entType === EntityType.TestLabel && name) {
              return {
                text: {
                  color: this.roiFontColor('#28bc47'),
                  scale: 1,
                  scoreScale: 1,
                },
                border: {
                  alpha: 30,
                  color: this.roiFrameColor('#28bc47'),
                  style: 0,
                  width: 2,
                },
                brush: {
                  alpha: 70,
                  color: '#000333',
                  img: 0,
                  fill: '#bef3ca42',
                },
              }
            }
          },
        })
        this.$emit('initdefectItem', aqlabelviewObj)
        this.staticViewObj = aqlabelviewObj
        // console.log('_staticView::', _staticView)
        // console.log('_staticView::', this.defectInfo)
        this.setImage()
      }, 100)
    },
    methods: {
      /**
       * 根据名称长度设置比例系数
       */
      scaleByNameLength(nameStr = '') {
        const _num = nameStr.length
        const _numTag = 5
        if (_num <= _numTag) return 1
        if (_num > _numTag && _num <= _numTag * 2) return 3
        if (_num > _numTag * 2 && _num <= _numTag * 3) return 4
        if (_num > _numTag * 3 && _num <= _numTag * 4) return 5
        if (_num > _numTag * 4) return 2
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
      setImage() {
        if (!this.getImgSrc) return
        const _src = `${this.checkImgTypeByBase64(this.getImgSrc)}${
          this.getImgSrc
        }`
        this.staticViewObj.setImage(_src, () => {
          // console.log('渲染完成')
          this.aqlabelMove()
          // console.log('this.getDefectInfo::', this.getDefectInfo)
          this.getDefectInfo && this.setLabel(this.getDefectInfo)
        })
      },
      clear() {
        this.staticViewObj.clear()
      },
      /**
       * 回显保存到后端的标注结果
       * @param {Object} labelInfo 图片标注信息 回显
       */
      setLabel(labelInfo) {
        this.staticViewObj.setLabel(labelInfo)
      },
      /**
       * 移动图片
       */
      aqlabelMove() {
        this.staticViewObj.commandCtrl(CommandControl['MOVE'])
      },
      /**
       * 获取测量框颜色
       */
      roiFrameColor(defaultColor) {
        const frameColor = getStore({ name: 'roiFrameColor' })
        return frameColor ? frameColor : defaultColor // 默认颜色
      },
      /**
       * 获取测量框文字颜色
       */
      roiFontColor(defaultColor) {
        const fontColor = getStore({ name: 'roiFontColor' })
        return fontColor ? fontColor : defaultColor
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .defect-content {
    border: 2px solid transparent;
    box-sizing: border-box;
    margin: 2px 0 0 2px;
    display: flex;
    flex-direction: column;
    // background: #f1f1f1;
  }
  .defect-select {
    border-color: var(--el-color-primary);
  }
  .has-img {
    background: #f1f1f1;
  }
</style>
