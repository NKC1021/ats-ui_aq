<!--  -->
<template>
  <div ref="mainViewRef" class="main-box">
    <div
      v-show="currentImgData"
      :class="[{ 'select-img': currentImgData?.select }]"
    >
      <div
        v-show="!imgDataSource"
        class="no-img-tag"
        :style="`width:${imgContentBox.width}px;height:${imgContentBox.height}px`"
      >
        <span class="tetx-color">
          读取图片失败，原始路径图片可能被删除、损坏或者没有读取权限
        </span>
      </div>
      <div
        v-show="imgDataSource"
        class="main-canvas"
        :style="`width:${imgContentBox.width}px;height:${imgContentBox.height}px`"
      >
        <canvas
          id="canvasId"
          :height="imgContentBox.height"
          :width="imgContentBox.width"
        ></canvas>
      </div>

      <div
        :class="['main-info', { 'picInfo-bgc': currentImgData?.select }]"
        :style="`width:${imgContentBox.width}px`"
      >
        <div class="info-left">
          <span class="left-top">
            HmEnd:
            {{
              currentImgData.humanResult
                ? `[${currentImgData.humanResult}]`
                : ''
            }}
            {{ labelNameByType(currentImgData) }}
          </span>
          <span class="left-bottom" :title="renderAiResult(currentImgData)">
            AIEnd:
            {{ currentImgData.aiResult ? `[${currentImgData.aiResult}]` : '' }}
            {{ renderAiResult(currentImgData) }}
            <span v-show="currentImgData.aiResultScore">
              ({{ currentImgData.aiResultScore }})
            </span>
          </span>
        </div>
        <div class="info-right">{{ currentImgData.id }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import { Base64 } from 'js-base64'
  import { getStore } from '@/utils/storage'
  import aqlabelView from 'aqlabelview'
  import { EntityType, CommandControl } from 'aqlabelview'
  import { translate } from '@/i18n'
  let aqlabelViewObj
  export default {
    inject: ['enableType'],
    props: {
      imgData: {
        type: Array,
        default: () => [1],
      },
      /**
       * 选中item 渲染对应的颜色
       */
      selectDefectItem: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      return {
        newAqlabelView: {},
        mainViewClient: {
          width: 0,
          height: 0,
        },
      }
    },
    computed: {
      translate() {
        return translate
      },
      /**
       * 图片宽高
       */
      imgContentBox() {
        const _width = this.mainViewClient.width - 2 * 4 - 3
        const _height = this.mainViewClient.height - 2 * 4 - 36 - 3
        // const _minVal = Math.min(_width, _height)
        const _newWidth = _width
        const _newHeight = _height
        // console.log('_newWidth', _newWidth)
        // console.log('_newHeight', _newHeight)
        if (_newHeight && _newWidth) {
          return {
            width: _newWidth,
            height: _newHeight,
          }
        } else {
          return {
            width: 0,
            height: 0,
          }
        }
      },
      /**
       * 图片源
       */
      imgDataSource() {
        const [_imageData] = this.imgData
        if (!_imageData) return ''
        const _imgSource = _imageData?.imageData
        if (!_imgSource) return ''
        const [imgObj] = _imgSource
        const _imgSrc = imgObj.images
        if (!_imgSrc) return ''
        return _imgSrc
      },
      /**
       * 图片数据
       */
      currentImgData() {
        const [_imageData] = this.imgData
        if (!_imageData) return ''
        return _imageData
      },
      /**
       * 构造显示页面标注信息
       */
      renderImgData() {
        if (!this.currentImgData) return ''
        let _labels = this.currentImgData.labels
        if (_labels) {
          // 过滤AI效果数据
          _labels = _labels.filter((el) => {
            return el.labelType === 3
          })
          _labels = _labels.map((el) => {
            const _detailInfo = JSON.parse(el.detail)
            const _extInfo = _detailInfo.ext_info
            _detailInfo.id = el.id
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
          return {
            testLabel: _labels,
          }
        }
        return ''
      },
      /**
       * 选中缺陷Item Id
       */
      DefectItemId() {
        const _id = this.selectDefectItem.id
        if (!_id) return ''
        return _id
      },
    },
    watch: {
      imgDataSource() {
        this.$nextTick(() => {
          !this.imgDataSource && this.clear()
          this.resetCanvas()
          this.imgDataSource && this.setImage()
        })
      },
      DefectItemId(newVal, oldVal) {
        // console.log('DefectItemId::', this.DefectItemId)
        this.$nextTick(() => {
          this.updateObjectStyle(oldVal, '#28bc47', '#bef3ca42', '#28bc47')
          this.updateObjectStyle(this.DefectItemId, 'red', '#b541413d', 'red')
        })
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    unmounted() {
      aqlabelViewObj.dispose()
      aqlabelViewObj = {}
    },
    async mounted() {
      await this.$nextTick()
      this.getMainViewClient()
      aqlabelViewObj = new aqlabelView({
        canvasId: 'canvasId',
        styleProvider: (entType, name) => {
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
      })
      // console.log('aqlabelViewObj::', aqlabelViewObj)
      this.newAqlabelView = aqlabelViewObj
    },
    methods: {
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
       * 提供给父组件调用
       */
      resetCanvasByResize() {
        this.getMainViewClient()
        if (!Object.keys(this.newAqlabelView).length) return
        this.resetCanvas()
        this.setImage()
      },
      /**
       * 获取主视图的宽高
       */
      getMainViewClient() {
        const _dom = this.$refs.mainViewRef
        if (_dom) {
          this.mainViewClient.width = _dom.clientWidth
          this.mainViewClient.height = _dom.clientHeight
        }
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
      /**
       * 渲染ai结果
       */
      renderAiResult(info) {
        if (info.labels) {
          const _aiLabels = info.labels.filter((el) => el.labelType === 3)
          const _aiNames = _aiLabels.map((el) => el.labelName)
          if (_aiNames.length) {
            const aiNameStr = _aiNames.toString()
            return aiNameStr
          }
        } else {
          return ''
        }
      },
      /**
       * 根据用户选择那种标签显示对应标签名 //todo 根据启用标签暂时过滤labelType为1,2
       */
      labelNameByType(msg) {
        let labelTypes = []
        if (this.enableType === 1) {
          labelTypes = [1]
        }
        if (this.enableType === 2) {
          labelTypes = [2]
        }
        if (msg.labels) {
          const _labels = msg.labels.filter((el) =>
            labelTypes.includes(el.labelType)
          )
          const _labelNames = _labels.map((el) => {
            const _names = []
            if (el.enginName) _names.push(el.enginName)
            if (el.labelName) _names.push(el.labelName)
            return _names.join('-')
          })
          if (_labelNames.length) {
            const labelNameStr = _labelNames.toString()
            return labelNameStr
          } else {
            return ''
          }
        } else {
          return ''
        }
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
      /**
       * 初始化图片到组件
       */
      setImage() {
        if (!this.imgDataSource) return
        const _imgSrc = `${this.checkImgTypeByBase64(this.imgDataSource)}${
          this.imgDataSource
        }`
        this.newAqlabelView.setImage(_imgSrc, () => {
          // console.log('渲染完成')
          // console.log('this.renderImgData::', this.renderImgData)
          this.aqlabelMove()
          this.renderImgData && this.setLabel(this.renderImgData)
          this.updateObjectStyle(this.DefectItemId, 'red', '#b541413d', 'red')
        })
      },
      /**
       * 渲染ROI
       */
      renderRoi() {
        this.newAqlabelView.renderRoi([0, 0, 1, 1])
      },
      resetCanvas() {
        this.newAqlabelView.resetCanvas(
          this.imgContentBox.width,
          this.imgContentBox.height
        )
      },
      /**
       * 移动图片
       */
      aqlabelMove() {
        this.newAqlabelView.commandCtrl(CommandControl['MOVE'])
      },
      /**
       * 回显保存到后端的标注结果
       * @param {Object} labelInfo 图片标注信息 回显
       */
      setLabel(labelInfo) {
        this.newAqlabelView.setLabel(labelInfo)
      },
      clear() {
        this.newAqlabelView.clear()
      },
      /**
       * 更新标注颜色
       * @param {Number} id 标注Id
       * @param {String} stroke 边框颜色
       * @param {String} fill 填充颜色
       * @param {String} textColor 文本颜色
       */
      updateObjectStyle(id, stroke, fill, textColor) {
        this.newAqlabelView.updateObjectStyle(id, stroke, fill, textColor)
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .main-box {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .select-img {
      border: 2px solid var(--el-color-primary);
    }
    .main-canvas {
      background: #f5f7fa;
    }

    .main-info {
      display: flex;
      width: 100%;
      height: 34px;
      padding: 2px;
      background: #f1f1f1;
      font-size: 12px;
      cursor: pointer;
      overflow: hidden;
      .info-left {
        flex: 1;
        overflow: hidden;
        .left-top {
          display: block;
          height: 16px;
          line-height: 16px;
          white-space: nowrap;
        }
        .left-bottom {
          display: block;
          height: 16px;
          line-height: 16px;
          white-space: nowrap;
        }
      }
      .info-right {
        width: 50px;
        line-height: 32px;
        text-align: end;
      }
    }
    .picInfo-bgc {
      background-color: var(--el-color-primary);
      color: #fff;
    }
  }
  .no-img-tag {
    width: 100%;
    height: 100%;
    // position: absolute;
    // top: 0;
    // left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    .tetx-color {
      color: var(--el-color-primary);
    }
  }
</style>
