<template>
  <div
    :key="timeStamp"
    ref="dataBox"
    v-loading="loading"
    class="scrollBar data-box"
    :style="{ width: imgsAreaWidth + 'px', height: '100%' }"
  >
    <!-- {{ pageSetByRowCol }} -->
    <el-popover placement="right" trigger="hover" width="400">
      <el-form
        ref="set"
        inline
        label-width="100"
        :model="pageSetByRowCol"
        :rules="rules"
      >
        <el-form-item :label="translate('显示设置')" prop="showType">
          <el-radio-group
            v-model="pageSetByRowCol.showType"
            @change="changeShowType"
          >
            <el-radio :label="2">{{ translate('双图显示') }}</el-radio>
            <el-radio :label="1">{{ translate('单图显示') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="translate('展示图组')">
          <el-form-item :label="translate('图组列数')" prop="col">
            <el-input-number
              v-model="pageSetByRowCol.col"
              controls
              controls-position="right"
              :label="translate('描述文字')"
              :max="6"
              :min="1"
              @blur="inputNumberBlur"
              @change="inputNumberChange"
              @focus="inputNumberFocus"
            />
          </el-form-item>
          <el-form-item :label="translate('图组行数')" prop="row">
            <el-input-number
              v-model="pageSetByRowCol.row"
              controls
              controls-position="right"
              :label="translate('描述文字')"
              :max="6"
              :min="1"
              @blur="inputNumberBlur"
              @change="inputNumberChange"
              @focus="inputNumberFocus"
            />
          </el-form-item>
        </el-form-item>
        <div style="text-align: right">
          <el-button @click="handleSet(0)">
            {{ translate('重置') }}
          </el-button>
          <el-button type="primary" @click="handleSet(1)">
            {{ translate('确定') }}
          </el-button>
        </div>
      </el-form>
      <template #reference>
        <el-icon class="icon-setting"><Setting /></el-icon>
      </template>
    </el-popover>
    <!-- {{ imgContentObj }} -->

    <!-- {{ resourceData.imgData }} -->
    <div
      v-for="(item, index) in resourceData.imgData"
      :key="index"
      :class="{ 'pic-container': true, 'select-container': item.select }"
      :style="`width:${imgContentObj.width}px;height:${imgContentObj.height}px`"
    >
      <!-- 图片容器 -->
      <div
        class="picBox"
        @click="clickPic(item, index, $event)"
        @contextmenu.prevent="showMenu($event, item, index)"
        @dblclick="imgDBclick(item)"
      >
        <!-- 双图展示 -->
        <!-- {{ imgHeight }} -->
        <!--
        {{ item.renderImgWidth }}
        {{ single_double }} -->
        <div
          v-if="single_double == 2"
          class="pic-compare"
          :style="`height:${imgHeight}px`"
        >
          <!-- 实际渲染图片宽:{{ item.renderImgWidth }} 实际渲染图片宽:{{ item.renderImgHeight }} -->
          <!-- 热力图显示在左边 -->
          <div
            :ref="'pictureRefs'"
            class="img-left"
            :t="resourceData.showImgType.leftShow"
          >
            <img
              v-for="(el, idx) in item.imageData"
              v-show="idx === 0"
              :key="idx"
              alt=""
              :src="`data:image/png;base64,${el.images}`"
            />
          </div>
          <div style="width: 2px; height: 100%"></div>
          <div class="img-right">
            <img
              v-for="(el, idx) in item.imageData"
              v-show="idx === showImgBySelf(item.imageData)"
              :key="idx"
              alt=""
              :src="`data:image/png;base64,${el.images}`"
            />
          </div>
          <!-- 显示RGB -->
          <imgCanvas
            v-if="single_double == 2"
            :key="item.id"
            :height="imgHeight"
            :img-data-list="
              getPicDataList(item.imageData, showImgBySelf(item.imageData))
            "
            :show-img-type="single_double"
            :width="imgWidth"
          />
        </div>
        <!-- 单图展示 -->
        <!-- {{ showImgBySelf(item.imageNum) }} -->
        <div
          v-if="single_double == 1"
          class="pic-compare"
          :style="`height:${imgHeight}px`"
        >
          <div v-if="isOriginalImg" :ref="'pictureRefs'" class="single">
            <img
              v-for="(el, idx) in item.imageData"
              v-show="idx === showImgBySelf(item.imageData)"
              :key="idx"
              alt=""
              draggable="false"
              :src="`data:image/png;base64,${el.images}`"
            />
          </div>
          <!-- 显示RGB -->
          <imgCanvas
            v-if="single_double == 1 && isOriginalImg"
            :key="item.id"
            :height="imgHeight"
            :img-data-list="
              getPicDataList(item.imageData, showImgBySelf(item.imageData))
            "
            :show-img-type="single_double"
            :width="imgWidth"
          />
          <renderImg
            v-if="single_double == 1 && !isOriginalImg"
            :key="item.id"
            :height="imgHeight"
            :render-id="item.id"
            :render-img-type="displayImgType"
            :rorigin-img="item"
            :width="imgWidth"
            @addview="addview"
          />
        </div>
        <div class="pic-info">
          <!-- 根据有没有传标签类型显示 v-if="resourceData.labelType" -->
          <el-row :class="{ 'picInfo-bgc': item.select }">
            <el-col class="el-col-20-result" :span="20">
              <div>
                <div
                  class="img-label-name"
                  :title="`HmEnd:${item.humanResult}${labelNameByType(item)}`"
                >
                  <span>
                    HmEnd:
                    {{ item.humanResult ? `[${item.humanResult}]` : '' }}
                    {{ labelNameByType(item) }}
                  </span>
                </div>
                <div
                  class="img-label-name"
                  :title="`AIEnd:${renderAiResult(item)}${
                    item.aiResultScore ? item.aiResultScore : ''
                  }`"
                >
                  AIEnd:
                  {{ item.aiResult ? `[${item.aiResult}]` : '' }}
                  {{ renderAiResult(item) }}
                  <span v-if="item.aiResultScore">
                    ({{ item.aiResultScore }})
                  </span>
                </div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="img-id">
                <span>
                  {{ item.id }}
                </span>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
  import renderImg from './renderImg.vue'
  import imgCanvas from './canvasImg.vue'
  let aqlabelViewList = []
  export default {
    components: { imgCanvas, renderImg },
    props: {
      modelValue: {
        type: Object,
        default: () => {
          return {}
        },
      },
      parentName: {
        type: String,
        default: '',
      },
      resourceData: {
        type: Object,
        default() {
          return {
            imgData: [],
          }
        },
      },
      showData: {
        type: Array,
        default: () => [],
      },
      keyCodeFlag: {
        type: Boolean,
        default: false,
      },
      showImgsWidth: {
        //图片展示区域宽
        type: Number,
        default: 0,
        require: true,
      },
      showImgsHeight: {
        //图片展示区域宽
        type: Number,
        default: 0,
        require: false,
      },
      /**
       * 行列配置
       */
      dataCleanViewConfig: {
        type: Object,
        default: () => {
          return {
            showType: 1, //显示设置，2：双图；1：单图
            row: 1,
            col: 1,
            step: 1,
          }
        },
      },
      /**
       * 用作恢复最原始配置(记录在数据库数据)
       */
      deafultViewConfig: {
        type: Object,
        default: () => {
          return {
            showType: 1, //显示设置，2：双图；1：单图
            row: 1,
            col: 1,
            step: 1,
          }
        },
      },
      /**
       * 是否展示原图
       */
      isOriginalImg: {
        type: Boolean,
        default: true,
      },
      /**
       * 展示图片类型 1 原图 2 AI 3 标注
       */
      displayImgType: {
        type: String,
        default: '1',
      },
      currentPageNum: {
        type: Number,
        default: 1,
      },
    },
    emits: [
      'update:modelValue',
      'handlePageNum',
      'imgdbclick',
      'deleteSelectedData',
      'addImgToDataSetType',
      'setSopCover',
      'aiTopCompare',
      'canvasContentVal',
      'setNextImgSelected',
      'clickPic',
      'update:keyCodeFlag',
      'subContextmenu'
    ],
    data() {
      const colValidator = (rule, value, callback) => {
        if (this.dataCleanViewConfig.showType == 1) {
          if (value == '') {
            callback(new Error(translate('请设置图组列数')))
          }
        }
        callback()
      }
      return {
        loading: true,
        timeStamp: new Date().getTime(),
        curItem: {}, //单击右键获取的对象
        rules: {
          col: [
            {
              required: true,
              trigger: ['blur', 'change'],
              validator: colValidator,
            },
          ],
          row: [
            {
              required: true,
              trigger: ['blur', 'change'],
              message: translate('请设置图组行数'),
            },
          ],
          showType: [
            {
              required: true,
              trigger: 'change',
              message: translate('请选择显示设置'),
            },
          ],
        },
        context: null,
        showImgIndex: 0, //展示图片
      }
    },
    computed: {
      translate() {
        return translate
      },
      ...mapStores(recordProInfo),
      pageSetByRowCol: {
        get() {
          return this.modelValue
        },
        set(newVal) {
          this.$emit('update:modelValue', newVal)
        },
      },
      /**
       * 计算行列
       */
      computedUsedSet: {
        get() {
          return this.deafultViewConfig
        },
        set() {},
      },

      keyCodeForm() {
        const _keyForm = this.projectStore.keyCodeForm
        return { ..._keyForm.clean }
      },

      // 获取当前数据最大图片数据
      maxImgNumByImgData() {
        const _imageNumList = this.resourceData.imgData.map((el) => {
          return el.imageData ? el.imageData.length : 0
        })
        const _maxVal = Math.max(..._imageNumList)
        return _maxVal
      },
      // 展示图片宽度
      imgsAreaWidth() {
        if (this.imgAreaWidth > 0 && this.imgAreaWidth < this.showImgsWidth) {
          return this.imgAreaWidth
        }
        return this.showImgsWidth
      },
      /**
       * 计算图片宽与高(包括标签信息)
       */
      imgContentObj() {
        const realContainerWid =
          this.showImgsWidth - 15 - 2 * this.computedUsedSet.col
        const realContainerHeig =
          this.showImgsHeight - (32 + 2) * this.computedUsedSet.row
        const widthVal = Math.floor(realContainerWid / this.computedUsedSet.col)
        const heightVal = Math.floor(
          realContainerHeig / this.computedUsedSet.row
        ) //32：ai结果div高度
        let _imgContentObj = {
          width: 0,
          height: 0,
        }
        if (this.computedUsedSet.showType == 2) {
          const _dbImgWidth = Math.floor((widthVal - 2) / 2)
          const _minVal = Math.min(_dbImgWidth, heightVal)
          const _widthVal = Math.floor(_minVal * 2 + 2)
          _imgContentObj = {
            width: _widthVal,
            height: _minVal + 32,
          }
        } else {
          const _minVal = Math.min(widthVal, heightVal)
          _imgContentObj = {
            width: _minVal,
            height: _minVal + 32,
          }
        }

        return _imgContentObj
      },
      imgAreaWidth() {
        return this.imgContentObj.width * this.computedUsedSet.col + 27
      },
      imgAreaHeight() {
        return this.imgContentObj.height * this.computedUsedSet.row
      }, //图片区域宽高
      /**
       * 图片宽度，展示图片内容
       */
      imgWidth() {
        return this.imgContentObj.width - 4
      },
      /**
       * 图片高度
       */
      imgHeight() {
        return this.imgContentObj.height - 32 - 4 //减去border 2*2
      },

      /**
       * 单图还是双图
       */
      single_double() {
        return this.computedUsedSet.showType
      },
    },
    watch: {
      currentPageNum() {
        aqlabelViewList.forEach((view) => {
          view?.dispose()
          view = undefined
        })
        aqlabelViewList = []
      },
    },
    /**
     * 组件销毁钩子函数
     */
    unmounted() {
      aqlabelViewList.forEach((view) => {
        view.dispose()
        view = undefined
      })
      aqlabelViewList = []
    },
    mounted() {
      this.loading = false
    },
    created() {},
    methods: {
      /**
       *
       * @param {Object} item 实例miniview对象
       */
      addview(item) {
        // console.log('实例化对象::::', item)
        aqlabelViewList.push(item)
      },

      /**
       * 显示行列
       */
      changeShowType() {
        this.pageSetByRowCol.col = 1
        this.pageSetByRowCol.row = 1
      },
      // 行列初始化设置
      handleInit(index) {
        if (index == 0) {
          this.pageSetByRowCol = { ...this.deafultViewConfig }
        }
      },

      // 行数和列数设置
      handleSet(index) {
        if (index == 0) {
          this.handleInit(0)
        } else {
          this.$refs['set'].validate(async (valid) => {
            if (valid) {
              this.$emit('handlePageNum', this.pageSetByRowCol)
              this.computedUsedSet = { ...this.pageSetByRowCol }
            }
          })
        }
      },
      /**
       * 获取要渲染到canvas数据
       *
       * */
      getPicDataList(imgData, imgIndex) {
        // 单双图模式下，渲染的数据不同
        const list = []
        switch (Number(this.single_double)) {
          case 1: {
            // } //   list.push(imgInfo.visualPic); // } else { //   list.push(imgInfo.modelPic); // } else if (this.resourceData.showImgType.modelPic) { //   list.push(imgInfo.gerberPic); // } else if (this.resourceData.showImgType.gerberPic) { //   list.push(imgInfo.dataPic); // if (this.resourceData.showImgType.show) {
            const imgObj = imgData ? imgData[imgIndex] : ''
            imgObj && list.push(imgObj.images)
            break
          }
          case 2: {
            // } //   list.push(imgData[key]); // if (imgData[key]) { // }); //   return this.resourceData.showImgType[k]; // const key = Object.keys(this.resourceData.showImgType).find((k) => { // } //   list.push(imgData.visualPic); //   // 双图模式下，热力图显示在左边 // } else { //   list.push(imgData.dataPic); // if (this.resourceData.showImgType.leftShow) {
            const _leftImg = imgData ? imgData[0] : ''
            const _rightImg = imgData ? imgData[imgIndex] : ''
            _leftImg && list.push(_leftImg.images)
            _rightImg && list.push(_rightImg.images)
            break
          }
        }
        return list
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
       * 判断人工和AI结果是否一致
       */
      isHumanAndAiSame(msg) {
        //用作比较AI判断结果显示
        let labelName = ''
        // 开启复判逻辑
        if (this.resourceData.reCheck) {
          return (labelName = msg.verifyLabelName)
        }
        // 不开启复判
        if (this.resourceData.labelType === 1) {
          labelName = msg.dataCenterLabel
        } else if (this.resourceData.labelType === 2) {
          labelName = msg.enginLabel
        } else if (this.resourceData.labelType === 3) {
          labelName = msg.customerLabel
        }
        return labelName
      },
      /**
       * 根据用户选择那种标签显示对应标签名 //todo 根据启用标签暂时过滤labelType为1,2
       */
      labelNameByType(msg) {
        let labelTypes = []
        if (this.resourceData.labelType === 1) {
          labelTypes = [1]
        }
        if (this.resourceData.labelType === 2) {
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
      imgDBclick(imgInfo) {
        this.$emit('imgdbclick', imgInfo)
      },

      deleteSelectedData() {
        this.$emit('deleteSelectedData')
      },
      addSopByType() {
        this.$emit('addImgToDataSetType')
      },

      canvasContentVal(val) {
        this.context = val
        this.$emit('canvasContentVal', val)
      },
      // 给有画布的图片设置一个标记
      clickPic(item, index, e) {
        this.$emit('clickPic', item, index, e)
      },

      // 显示鼠标右击事件, 现在只会触发选中事件，右键菜单使用通用组件
      showMenu(event, item) {
        this.curItem = item
        event.preventDefault()
        this.$emit('subContextmenu', event)

        if (!event.ctrlKey) {
          //单击单选
          if (!item.select) {
            this.resourceData.imgData.forEach((item) => {
              item.select = false
            })
            item.select = !item.select
          }
        }
        if (event.ctrlKey) {
          //单击多选
          if (!item.select) {
            item.select = !item.select
          }
        }
      },

      /**
       * 右翻图 提供给父组件调用
       */
      changeImgByRight() {
        this.controlImgChange('right')
      },
      /**
       * 左翻图 提供给父组件调用
       */
      changeImgByLeft() {
        this.controlImgChange('left')
      },
      /**
       * 行列聚焦事件
       */
      inputNumberFocus() {
        this.$emit('update:keyCodeFlag', false)
      },
      /**
       * 行列失去聚焦
       */
      inputNumberBlur() {
        this.$emit('update:keyCodeFlag', true)
      },
      inputNumberChange() {},

      /**
       * 根据图片自身imageNum大小展示图片
       */
      showImgBySelf(imgData) {
        const imageNum = imgData ? imgData.length : 0
        if (this.showImgIndex + 1 > imageNum && imageNum) {
          let _currentNum = (this.showImgIndex + 1) % imageNum
          _currentNum = _currentNum === 0 ? imageNum : _currentNum
          return _currentNum - 1
        } else {
          return this.showImgIndex
        }
      },
      /**
       * 左右切图
       * @param {String} changeType 左边切图还是右边切图
       */
      controlImgChange(changeType) {
        switch (changeType) {
          case 'left': {
            this.showImgIndex--
            if (this.showImgIndex < 0) {
              this.showImgIndex = this.maxImgNumByImgData - 1
            }
            break
          }
          case 'right': {
            this.showImgIndex++
            if (this.showImgIndex > this.maxImgNumByImgData - 1) {
              this.showImgIndex = 0
            }
            break
          }
        }
      },
    },
  }
</script>
<style>
  .el-loading-spinner .circular {
    height: 32px;
    width: 32px;
  }
</style>
<style scoped lang="scss">
  @import './index.scss';
</style>
