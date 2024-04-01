1
<!--  -->
<template>
  <div
    v-loading="loading"
    class="render-box"
    element-loading-text="Loading..."
    :style="{ '--borderColor': roiFrameColor() }"
    @mouseup="aqlabelMouseup"
  >
    <canvas
      v-show="isHasImgData"
      :id="`renderImgId${renderId}`"
      :height="height"
      :width="width"
    ></canvas>
    <div v-show="!isHasImgData" class="no-img-tag">
      <span>读取图片失败，原始路径图片可能被删除、损坏或者没有读取权限!</span>
    </div>
  </div>
</template>

<script>
  import aqlabelView from 'aqlabelview'
  import { Base64 } from 'js-base64'
  import {
    EntityType,
    CommandType,
    CommandControl,
    // MiniView,
  } from 'aqlabelview'
  import { getStore } from '@/utils/storage'
  export default {
    inject: ['enableType', 'labelNames'],
    props: {
      width: {
        type: Number,
        default: 0,
      },
      height: {
        type: Number,
        default: 0,
      },
      roriginImg: {
        type: Object,
        default: () => {
          return {}
        },
      },
      /**
       * 图片渲染类型 2AI效果 3标注效果
       */
      renderImgType: {
        type: String,
        default: '2',
      },
      renderId: {
        type: Number,
        default: 0,
      },
    },
    emits: ['addview'],
    data() {
      return {
        aqlabelViewObj: {},
        proEnableType: this.enableType, //项目启用类型
        middleBtnClick: false, //鼠标中键 用做切换测量和移动图 true:移动图片 false:测量
        loading: false,
        labelNameList: this.labelNames,
        colorTag: {
          0: '#8ec67b',
          1: '#19c13c',
          2: '#ffbc45',
          3: '#7d73ff',
          4: '#ff7b7b',
          5: '#c347ee',
          6: '#cab310',
          7: '#33d173',
          8: '#f91dff',
          9: '#ff9c82',
        },
      }
    },
    computed: {
      /**
       * 构造显示页面标注信息
       */
      renderImgData() {
        if (this.renderImgType === '1') return ''
        let _labels = this.roriginImg.labels
        if (_labels) {
          if (this.renderImgType === '2') {
            _labels = _labels.filter((el) => {
              return el.labelType === 3
            })
          }
          if (this.renderImgType === '3') {
            _labels = _labels.filter((el) => {
              return el.labelType === this.proEnableType && el.algoType === 2
            })
          }
          _labels = _labels.map((el) => {
            const _detailInfo = JSON.parse(el.detail)
            const _extInfo = _detailInfo.ext_info
            if (!_extInfo) return _detailInfo
            let _names = []
            _names.push(_detailInfo.name)
            let _area = _extInfo?.area.value
            _area = _area
              ? `面积${Number(Base64.decode(_area)).toFixed(2)}`
              : ''
            _names.push(_area)
            let _width = _extInfo?.width.value
            _width = _width
              ? `长${Number(Base64.decode(_width)).toFixed(1)}`
              : ''
            _names.push(_width)
            let _height = _extInfo?.height.value
            _height = _height
              ? `宽${Number(Base64.decode(_height)).toFixed(1)}`
              : ''
            _names.push(_height)
            _names = _names.filter((el) => el !== '')
            const _nameStr = _names.join('，')
            _detailInfo.name = _nameStr
            return _detailInfo
          })
          if (!_labels.length) return ''
          if (this.renderImgType === '3') {
            return {
              detection: _labels,
            }
          }
          if (this.renderImgType === '2') {
            return {
              testLabel: _labels,
            }
          }
        }
        return ''
      },
      /**
       * 是否有源数据
       */
      isHasImgData() {
        const _imgageData = this.roriginImg?.imageData
        if (_imgageData) {
          return true
        } else {
          return false
        }
      },
    },
    watch: {
      renderImgType() {
        console.log('renderImgData:::', this.renderImgData)
        // this.setImage()
        this.$nextTick(() => {
          this.renderImgByType()
        })
      },
      width() {
        this.$nextTick(() => {
          this.resetCanvas()
        })
      },
      renderId() {
        this.$nextTick(() => {
          // this.loading = true
          // this.setImage()
        })
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {
      this.loading = true
      // console.log('roriginImg', this.roriginImg)
      // console.log('enableType', this.enableType)
    },
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {
      const _aqlabelViewObj = new aqlabelView({
        canvasId: `renderImgId${this.renderId}`,
        styleProvider: (entType, name) => {
          // console.log('entType', entType)
          // console.log('name', name)
          if (entType === EntityType.Detection && name) {
            return {
              text: {
                color: this.selectColorByLabel(name),
                scale: this.scaleByNameLength(name),
                scoreScale: 1,
              },
              border: {
                alpha: 30,
                color: this.selectColorByLabel(name),
                style: 0,
                width: 2,
              },
              brush: { alpha: 70, color: '#000333', img: 0 },
            }
          }
          if (entType === EntityType.TestLabel && name) {
            return {
              text: {
                color: this.roiFontColor('#28bc47'),
                scale: this.scaleByNameLength(name),
                scoreScale: 1,
              },
              border: {
                alpha: 30,
                color: this.roiFrameColor('#28bc47'),
                style: 0,
                width: 2,
              },
              brush: { alpha: 70, color: '#000333', img: 0, fill: '#bef3ca42' },
            }
          }
        },
        // displayConfig: {
        //   showDetails: true,
        // },
      })
      this.aqlabelViewObj = _aqlabelViewObj
      this.setImage()
      this.$emit('addview', _aqlabelViewObj)
    },
    unmounted() {
      // console.log('组件销毁', this.aqlabelViewObj)
      // aqlabelViewList.forEach((view) => {
      //   view.dispose()
      //   view = undefined
      // })
      // aqlabelViewObj.dispose()
      // aqlabelViewObj = undefined
      // this.aqlabelViewObj = undefined
    },
    methods: {
      setImage() {
        const _imgageData = this.roriginImg?.imageData
        if (!_imgageData) {
          return (this.loading = false)
        }
        const firstImg = _imgageData.length ? _imgageData[0].images : ''
        const _imgSrc = `${this.checkImgTypeByBase64(firstImg)}${firstImg}`
        this.aqlabelViewObj.setImage(_imgSrc, () => {
          // console.log('渲染完成')
          this.getLabel()
          this.aqlabelMove()
          this.renderImgByType()
          setTimeout(() => {
            this.loading = false
          }, 500)
        })
      },
      /**
       * 渲染ROI
       */
      renderRoi() {
        this.aqlabelViewObj.renderRoi([0, 0, 1, 1])
      },
      /**
       * 设置实体类 设置检测模块
       * @param {String} entype 实体类型 测试 TestLabel 检测 Detection
       */
      setEntity(entype) {
        this.aqlabelViewObj.setEntity(EntityType[entype])
      },

      /**
       * 回显保存到后端的标注结果
       * @param {Object} labelInfo 图片标注信息 回显
       */
      setLabel(labelInfo) {
        this.aqlabelViewObj.setLabel(labelInfo)
      },
      /**
       * 重置视图
       */
      resetCanvas() {
        this.aqlabelViewObj.resetCanvas(this.width, this.height)
      },
      /**
       *
       * @param {*} baseInfo
       */
      /**
       * 移动图片
       */
      aqlabelMove() {
        this.aqlabelViewObj.commandCtrl(CommandControl['MOVE'])
      },
      /**
       * 清楚画布
       */
      clearRenderObject() {
        this.aqlabelViewObj.clearRenderObject()
      },
      /**
       * 设置标注模式
       * @param {String} cmdType  设置什么类型 自由标柱 RECT
       */
      execCommand(cmdType) {
        this.aqlabelViewObj.execCommand(CommandType[cmdType])
      },
      /**
       * 退出编辑模式
       * @param {String} cmdType 类型
       */
      quitDraw() {
        // QUIT_DRAW
        this.aqlabelViewObj.commandCtrl(CommandControl['QUIT_DRAW'])
      },
      /**
       * 获取在画布标注的信息
       *
       */
      getLabel() {
        this.aqlabelViewObj.getLabel((_labelInfo) => {
          // console.log('labelInfo', _labelInfo.imgSize)
          Object.assign(this.roriginImg, {
            ..._labelInfo.imgSize,
          })
          // this.$emit('update:modelValue', _imgObj)
        })
      },
      // -------------------------------------------
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
      /**
       * 根据名称长度设置比例系数
       */
      scaleByNameLength(nameStr = '') {
        const _num = nameStr.length
        // console.log('num:::', _num)
        const _numTag = 5
        if (_num <= _numTag) return 1
        if (_num > _numTag && _num <= _numTag * 2) return 2
        if (_num > _numTag * 2 && _num <= _numTag * 3) return 3
        if (_num > _numTag * 3 && _num <= _numTag * 4) return 4
        if (_num > _numTag * 4) return 5
      },
      aqlabelMouseup() {
        // console.log('event:::::', e)
        // if (e.button === 1) {
        //   this.middleBtnClick = !this.middleBtnClick
        //   this.quitDraw()
        // }
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
      /**
       * 渲染图片类型 根据选择显示图片类型
       */
      renderImgByType() {
        // AI标注效果 就设置 测试实体类
        if (['2'].includes(this.renderImgType)) {
          // this.setEntity('TestLabel')
        }
        /**
         * 原图 标注效果 就设置 检测实体类
         */
        if (['1', '3'].includes(this.renderImgType)) {
          // this.setEntity('Detection')
        }
        this.clearRenderObject()
        // this.renderRoi()
        console.log('renderImgData:::', this.renderImgData)
        this.renderImgData && this.setLabel(this.renderImgData)
      },
      /**
       * 根据标签名返回对应颜色
       * @param {String} label 标签名
       */
      selectColorByLabel(label) {
        // console.log('labelNames:::', this.labelNames)
        const _obj = this.labelNameList.find((el) => el.label === label)
        if (!_obj) return '#28bc47'
        return this.colorTag[`${_obj.tagId % 10}`]
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */

  .render-box {
    position: absolute;
    top: 0;
    left: 0;
    background: #f7f7f7;
    .no-img-tag {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      color: var(--el-color-primary);
    }
    :deep() {
      .canvas-container {
        .xLine {
          border-top-color: var(--borderColor) !important;
        }
        .yLine {
          border-left-color: var(--borderColor) !important;
        }
      }
    }
  }
</style>
