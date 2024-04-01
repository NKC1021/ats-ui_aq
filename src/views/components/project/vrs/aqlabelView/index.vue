<template>
  <div class="aqlabel-view">
    <header>
      <el-row>
        <el-col class="left-nav" :span="8">
          <slot></slot>
          <slot name="imgDimensions"></slot>
          <div style="display: inline-block; margin-left: 5px">
            <slot name="archiveData"></slot>
          </div>
        </el-col>

        <el-col class="right-btns" :span="16">
          <!-- <el-checkbox v-model="isEnableLabel" size="large" /> -->
          <el-button
            :type="isEnableLabel ? 'danger' : 'primary'"
            @click="enableDefaultLabel"
          >
            {{ enableLabelTitle }}
          </el-button>
          <el-select
            v-model="defaultLabel"
            class="select-label"
            :disabled="!isEnableLabel"
            @change="labelNameChange"
          >
            <el-option
              v-for="(el, index) in labelNames"
              :key="index"
              :label="el.label"
              style="padding: 0 10px 0 10px"
              :value="el.label"
            >
              <el-row :gutter="20">
                <el-col :span="18">
                  <span
                    class="select-tag-tip"
                    :style="`background:${colorTag[`${el.tagId % 10}`]}`"
                  ></span>
                  <span>{{ el.label }}</span>
                </el-col>
                <el-col :span="4">
                  <el-button
                    icon="Delete"
                    type="text"
                    @click.stop="deleteLabelName(el)"
                  />
                </el-col>
              </el-row>
            </el-option>
          </el-select>
          <div class="annotation-operate">
            <span class="tool-btn-box" :title="translate('后退')" @click="undo">
              <i class="iconfont icon-arrow-left"></i>
            </span>
            <span class="tool-btn-box" :title="translate('前进')" @click="redo">
              <i class="iconfont icon-arrow-right"></i>
            </span>
            <span
              class="tool-btn-box"
              :title="translate('保存标注(快捷键：S)')"
              @click="saveLabel"
            >
              <i class="iconfont icon-save F18"></i>
            </span>
            <el-divider direction="vertical" style="margin: 0 15px; top: 8px" />
            <span
              :class="[
                'tool-btn-box',
                { 'tool-btn-box--active': clickIndex === 4 },
              ]"
              :title="translate('移动图片')"
              @click="clickIndex = 4"
            >
              <i class="iconfont icon-eye i-active"></i>
            </span>
            <span
              :class="[
                'tool-btn-box',
                { 'tool-btn-box--active': clickIndex === 5 },
              ]"
              :title="translate('编辑模式')"
              @click="clickIndex = 5"
            >
              <i class="iconfont icon-edit"></i>
            </span>
            <span
              :class="[
                'tool-btn-box',
                { 'tool-btn-box--active': clickIndex === 6 },
              ]"
              :title="translate('自由模式')"
              @click="clickIndex = 6"
            >
              <i class="iconfont icon-rect"></i>
            </span>
            <span
              :class="[
                'tool-btn-box',
                { 'tool-btn-box--active': clickIndex === 7 },
              ]"
              :title="translate('标准模式')"
              @click="clickIndex = 7"
            >
              <i class="iconfont icon-primary-rect"></i>
            </span>
          </div>
          <el-button
            v-show="false"
            circle
            icon="EditPen"
            :title="translate('退出标注')"
            :type="setBtnsCurrentType('defectLabelTag')"
            @click="defectLabel"
          />

          <span class="span-css">{{ translate('宽') }}</span>
          <el-input-number
            v-model="standPoint.width"
            controls-position="right"
            :min="1"
            @change="standPointObjChange"
          />
          <span class="span-css">{{ translate('高') }}</span>
          <el-input-number
            v-model="standPoint.height"
            controls-position="right"
            :min="1"
            @change="standPointObjChange"
          />
        </el-col>
      </el-row>
    </header>
    <div class="aqlabel-body">
      <div
        ref="displayRef"
        class="img-single-display"
        :style="{ '--borderColor': roiFrameColor() }"
        @mousedown="mouseDown"
        @mouseup="clickPic"
      >
        <canvas
          id="fabricCore"
          :height="canvasHeight"
          :width="canvasWidth"
        ></canvas>

        <!-- 在左下角显示NG/OK -->
        <div
          :class="[
            'label-tag',
            { 'segment-tag-ok': selectCurrentImg.humanResult === 'OK' },
            { 'segment-tag-ng': selectCurrentImg.humanResult === 'NG' },
          ]"
        >
          {{ selectCurrentImg.humanResult }}
        </div>

        <!-- 在右下角显示坐标和宽高 -->
        <div :class="['x-y-tag']">
          {{ positionInfoDesc }}
        </div>
      </div>
    </div>
    <footer>
      <el-pagination
        v-model:current-page="currentPageNum"
        v-model:page-size="pageSize"
        background
        layout="total, prev, pager, next, jumper"
        small
        :total="imgTotal"
        @current-change="handleCurrentChange"
      />
    </footer>
    <addLabelCom
      v-if="isShowAddLabel"
      v-model:keycode-flag="keycodeMethodFlag"
      v-model:show="isShowAddLabel"
      :body-height="bodyHeight"
      :body-width="bodyWidth"
      :left="showLeft"
      :tags="labelNames"
      :top="showTop"
      @add-labelname="addLabelName"
      @deletelabel="deleteLabelName"
    />
    <!-- 信息错误展示 -->
    <aqvErrorCom v-model:show="aqvErrorVis" :error-msg="aqvErrorMsg" />
    <!--  -->
    <keyBoardListener
      :key-code-form="keyCodeForm"
      :key-method-flag="keyMethodFlag_"
      @down-page="handlePage($event, 'down')"
      @humanng-confirm="humanngConfirm"
      @humanok-confirm="humanokConfirm"
      @handle-letter="showTagDialog($event)"
      @up-page="handlePage($event, 'up')"
    />
    <!-- 右键菜单  -->
    <aq-context-menu ref="contextRef" :menus="menus" :width="150" />
  </div>
</template>

<script>
  import aqlabelView from 'aqlabelview'
  import { EntityType, CommandType, CommandControl } from 'aqlabelview'
  import { translate } from '@/i18n'
  import { checkImgTypeByBase64, colorTag } from './index.js'
  import AqContextMenu from '@/components/contextMenu/AqContextMenu'
  import addLabelCom from './addLabel.vue'
  import keyBoardListener from '@/views/components/project/keyboard/index.vue'
  import vrsService from '@/api/vrsService'
  import solutionController from '@/api/solution'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
  import { getStore } from '@/utils/storage'
  import aqvErrorCom from './aqvError.vue'
  let aqlabelViewObj
  export default {
    components: {
      addLabelCom,
      keyBoardListener,
      aqvErrorCom,
      AqContextMenu,
    },
    props: {
      queryCondition: {
        type: Object,
        default: () => {
          return {}
        },
      },
      currentImgNum: {
        //选中第几页第几张，用于aqimg初始化
        type: Number,
        default: 1,
      },
      selectImginfo: {
        type: Object,
        default: () => {
          return {}
        },
      },
      /**
       * 标签名列表
       */
      labelNames: {
        type: Array,
        default: () => [],
      },
      keycodeFlag: {
        type: Boolean,
        default: true,
      },
    },
    emits: [
      'update:currentImgNum',
      'update:selectImginfo',
      'update:labelNames',
      'update:keycodeFlag',
      'addLabel',
    ],

    data() {
      return {
        contextRef: null,
        menus: [
          {
            code: 'delete',
            name: translate('删除当前标注'),
            disabled: true,
            action: () => this.deleteCurrentTag(),
          },
          {
            code: 'deleteAll',
            name: translate('清空缺陷标注'),
            action: () => this.removeAllLabels(),
          },
        ],
        positionInfoDesc: 'X:,Y: | R: G: B:', //图片的位置信息描述
        isShowAddLabel: false,
        showTop: 0,
        showLeft: 0,
        //设置正方形标注宽高
        standPoint: {
          width: 100,
          height: 100,
        },
        // aqlabelViewObj: {}, // 初始化标注组件
        canvasWidth: 0, //视图宽
        canvasHeight: 0, //视图高
        rectangleId: '', //记录当前矩阵的ID
        bodyWidth: 0, //浏览器可视化宽
        bodyHeight: 0, //浏览器可视化高
        btnClickTag: '', //记录头部按钮
        isDeleteByTag: false, //右键删除单个标签
        isEnableLabel: false, //是否启用默认标签
        defaultLabel: '', //默认标签
        datasetType: 2, //表示检测模块
        clickIndex: 0,
        // ---------------------
        currentPage: 0,
        currentPageNum: 1,
        pageSize: 1,
        imgCacheObj: {},
        imgQueryVOCache: {},
        imgData: [],
        imgTotal: 0,
        isRecheckNext: false,
        isPageDown: true,
        pageStep: 1,
        currentPageNumOld: 0,
        solutionInfo: {}, //解决方案信息
        timerObj: null,
        aqvErrorVis: false,
        aqvErrorMsg: {},
      }
    },
    computed: {
      ...mapStores(recordProInfo),
      /**
       * 用户配置快捷键
       */
      keyCodeForm() {
        const keysForm = this.projectStore.keyCodeForm
        const keys = {
          ...keysForm.common,
          ...keysForm.vrs,
        }
        return keys
      },
      keyMethodFlag_() {
        // console.log('this.keyMethodFlag',this.keyMethodFlag)
        return this.keycodeFlag
      },
      keycodeMethodFlag: {
        get() {
          return this.keycodeFlag
        },
        set(newVal) {
          this.$emit('update:keycodeFlag', newVal)
        },
      },
      colorTag() {
        return colorTag
      },
      translate() {
        return translate
      },
      enableLabelTitle() {
        if (this.isEnableLabel) {
          return translate('禁用')
        } else {
          return translate('启用')
        }
      },
      /**
       * 选中当前图片
       */
      selectCurrentImg() {
        if (this.imgData.length) {
          return this.imgData[0]
        }
        return {}
      },
      /**
       * 构造标注数据结构
       */
      constructDataByLabels() {
        if (!this.selectCurrentImg) return ''
        const _labels = this.selectCurrentImg?.labels
        const filterLabels = _labels.filter((el) => {
          return (
            el.labelType === this.solutionInfo?.enableType &&
            el.algoType === this.datasetType
          )
        })
        if (!filterLabels.length) return ''
        const _regions = filterLabels.map((el) => {
          return JSON.parse(el.detail)
        })
        const labelInfo = {
          // datasetType: this.datasetType,
          detection: _regions,
        }
        return labelInfo
      },
      /**
       * 查询图片条件汇总
       */
      searchImgCondition() {
        return {
          ...this.queryCondition,
        }
      },
      /**
       *
       */
    },
    watch: {
      /**
       * 监听当前图片数据变化
       */
      async selectCurrentImg() {
        // console.log('newVal::::', newVal)
        await this.$nextTick()
        setTimeout(() => {
          this.initAqlabelView()
        }, 300)
      },
      currentPage(newVal) {
        this.currentPage = newVal
        this.$emit('update:currentImgNum', newVal)
      },
      currentPageNum: {
        handler(val, old) {
          this.currentPageNumOld = old
        },
        deep: true,
      },
      clickIndex(newVal) {
        if (newVal === 4) {
          aqlabelViewObj.commandCtrl(CommandControl.MOVE)
        } else if (newVal === 5) {
          aqlabelViewObj.commandCtrl(CommandControl.EDIT_DRAW)
        } else if (newVal === 6) {
          aqlabelViewObj.execCommand(CommandType.RECT)
        } else if (newVal === 7) {
          aqlabelViewObj.execCommand(CommandType.RECT_POINT)
        }
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    async created() {
      // this.initFilterData()
      await this.getById()
      this.initFilterData()
    },
    //生命周期 - 挂载完成（访问DOM元素）
    async mounted() {
      this.getBodyWH()
      this.getDisplayBody()
      await this.$nextTick()
      aqlabelViewObj = new aqlabelView({
        canvasId: 'fabricCore',
        styleProvider: (entType, name) => {
          // console.log('entType', entType)
          // console.log('name', name)
          if (entType === EntityType.Detection && name) {
            return {
              text: { color: this.selectColorByLabel(name) },
              border: {
                alpha: 30,
                color: this.selectColorByLabel(name),
                style: 0,
                width: 2,
              },
              brush: { alpha: 70, color: '#000333', img: 0 },
            }
          }
        },
      })
      // this.initAqlabelView()
      window.addEventListener('resize', async () => {
        await this.$nextTick()
        this.getDisplayBody()
        this.resetCanvas()
        this.getBodyWH()
      })
      this.clickIndex = 6 // 默认进入自由标注模式
      if (this.labelNames.length > 0) {
        this.defaultLabel = this.labelNames[0].label // 默认选中第一个标签
      }
    },
    beforeUnmount() {},
    unmounted() {
      aqlabelViewObj.dispose()
      aqlabelViewObj = {}
    },
    methods: {
      /**
       * 初始化组件并渲染图片
       */
      setImage() {
        const _imgageData = this.selectCurrentImg?.imageData
        const firstImg = _imgageData?.length ? _imgageData[0].images : ''
        if (!firstImg) {
          return aqlabelViewObj.clear()
        }
        const _imgSrc = `${checkImgTypeByBase64(firstImg)}${firstImg}`
        // const _imgSrc = `data:image/jpg;base64,${firstImg}`
        aqlabelViewObj.setImage(_imgSrc, () => {
          // console.log('渲染完成')
          this.renderRoi()
          this.resetHistory()
          this.setEntity()
          this.setStandardPoint()
          this.setCommandFinishEvent()
          this.aqlabelViewOn()
          this.constructDataByLabels &&
            this.setLabel(this.constructDataByLabels)
          this.$nextTick(() => {
            aqlabelViewObj.getLabel((labelInfo) => {
              const _imgInfo = Object.assign(
                { ...this.selectCurrentImg },
                { ...labelInfo.imgSize }
              )
              this.$emit('update:selectImginfo', _imgInfo)
            })
          })
        })
        // console.log('aqlabelViewObj::', aqlabelViewObj)
      },
      /**
       * 渲染ROI
       */
      renderRoi() {
        aqlabelViewObj.renderRoi([0, 0, 1, 1])
      },
      /**
       * 编辑ROI
       */
      drawRoi() {
        this.btnClickTag = 'roiTag'
        // this.resetHistory() //重置历史记录
        aqlabelViewObj.drawRoi()
      },
      /**
       * 设置实体类 设置检测模块
       */
      setEntity() {
        aqlabelViewObj.setEntity(EntityType.Detection)
      },
      /**
       * 设置检测模式下正方形宽高
       */
      setStandardPoint() {
        aqlabelViewObj.setStandardPoint(this.standPoint)
      },
      /**
       * 矩形画框结束后
       */
      setCommandFinishEvent() {
        aqlabelViewObj.setCommandFinishEvent((id) => {
          // console.log('ididididi:::', id)
          if (this.isEnableLabel) return
          this.rectangleId = id
          this.setTag(id, '')
          setTimeout(() => {
            this.isShowAddLabel = true
          }, 150)
        })
      },
      /**
       * 矩形画完框要设置标签
       * @param {String} id 当前矩形框的ID
       * @param {String} label 要设置当前画框是哪个标签
       */
      setTag(id, label) {
        aqlabelViewObj?.currentCommand.setTag(id, label)
      },
      /**
       * 回显保存到后端的标注结果
       * @param {Object} labelInfo 图片标注信息 回显
       */
      setLabel(labelInfo) {
        aqlabelViewObj.setLabel(labelInfo)
      },
      /**
       * 获取在画布标注的信息
       *
       */
      getLabel() {
        // this.btnClickTag = 'saveLabelTag'
        return new Promise((resolve) => {
          aqlabelViewObj.getLabel(async (_labelInfo) => {
            // console.log('labelInfo', _labelInfo)
            await this.updateHunmanLabel(_labelInfo)
            resolve(_labelInfo)
          })
        })
      },
      /**
       * 标注历史记录 前进
       */
      redo() {
        // console.log('前进')
        this.btnClickTag = 'advanceTag'
        aqlabelViewObj.redo()
      },
      /**
       * 标注历史记录 后退
       */
      undo() {
        // console.log('后退')
        this.btnClickTag = 'backTag'
        aqlabelViewObj.undo()
      },
      /**
       * 标注历史记录 重置
       */
      resetHistory() {
        aqlabelViewObj.resetHistory()
      },
      /**
       * 退出编辑模式
       */
      quitDraw() {
        aqlabelViewObj.commandCtrl(CommandControl.QUIT_DRAW)
      },
      /**
       * 重置视图
       */
      resetCanvas() {
        aqlabelViewObj.resetCanvas(this.canvasWidth, this.canvasHeight)
      },
      /**
       *移除实体类所有对象 检测模块
       */
      clearAllObject() {
        aqlabelViewObj.clearAllObject(EntityType.Detection)
      },

      /**
       *当前画布是否存在活动对象
       @returns
       */
      hasActive() {
        return aqlabelViewObj.hasActive()
      },
      /**
       * 画布有活动实例对象才执行删除
       */
      delete() {
        aqlabelViewObj.delete()
      },
      /**
       * 设置当前标注名称
       * @param {String} labelName 设置当前标签名
       */
      setCurrentTag(labelName) {
        aqlabelViewObj.setCurrentTag(labelName)
      },
      aqlabelViewOn() {
        aqlabelViewObj.on('point:RGB', (e) => {
          if (e.x) {
            this.positionInfoDesc = `X:${e.x},Y:${e.y} | R:${e.R} G:${e.G} B:${e.B}`
          } else {
            this.positionInfoDesc = `X:,Y: | R: G: B:`
          }
        })
      },

      // ---------------------------------------------------------------------------
      /**
       * 获取解决方案信息
       */
      async getById() {
        const res = await solutionController.getById()
        if (res.code === 0) {
          this.solutionInfo = res.data
        }
      },

      /**
       * 启用默认标签
       */
      enableDefaultLabel() {
        this.isEnableLabel = !this.isEnableLabel
        if (this.isEnableLabel) {
          this.setCurrentTag(this.defaultLabel)
        } else {
          this.setCurrentTag('')
          this.setCommandFinishEvent()
        }
      },
      /**
       * 初始化图片
       */
      initAqlabelView() {
        this.setImage()
        // console.log('constructDataByLabels', this.constructDataByLabels)
      },
      /**
       * 画布区域鼠标事件
       * @param {*} e
       */
      clickPic(e) {
        // console.log('鼠标弹起:::', e)
        this.showTop = e.clientY
        this.showLeft = e.clientX
        this.checkHasActive()
        e.button === 2 && this.openContextmenu(e)
      },

      /**
       * 获取图片展示区域宽和高
       */
      getDisplayBody() {
        const _dom = this.$refs.displayRef
        if (!_dom) return
        const _width = _dom.clientWidth
        const _height = _dom.clientHeight
        this.canvasWidth = _width
        this.canvasHeight = _height
        // console.log('_width', _width)
        // console.log('_height', _height)
      },
      /**
       * 右键事件
       */
      openContextmenu(e) {
        this.menus.find((item) => item.code === 'delete').disabled =
          !this.isDeleteByTag
        this.$refs.contextRef.openContextDialog(e)
      },
      /**
       * 宽高值改变
       */
      standPointObjChange() {
        this.setStandardPoint()
      },
      // 获取测量框颜色
      roiFrameColor() {
        const frameColor = getStore({ name: 'roiFrameColor' })
        // console.log('frameColor:::::', frameColor)
        return frameColor ? frameColor : '#00ff00'
      },
      /**
       * 添加标签组件传递出来的参数
       *@param {String} labelName
       @param {Boolean} isNewAdd 是否新增标签
       */
      addLabelName(labelname, isNewAdd = false) {
        if (isNewAdd) {
          //
          return this.$messageBox
            .confirm(translate('列表中无此标签,是否添加?'), translate('提示'))
            .then(() => {
              // this.tagsList.push(labelname)
              const _labelNames = this.labelNames
              _labelNames.push({
                tagId: this.labelNames.length,
                label: labelname,
              })
              this.$emit('update:labelNames', _labelNames)
              this.$nextTick(() => [this.setTag(this.rectangleId, labelname)])
            })
        }
        this.setTag(this.rectangleId, labelname)
      },
      /**
       * 缺陷标注
       */
      defectLabel() {
        this.btnClickTag = 'defectLabelTag'
        this.quitDraw()
      },
      /**
       * 获取浏览器可视化 宽和高
       */
      getBodyWH() {
        const _width =
          window.innerWidth ||
          document.documentElement.clientWidth ||
          document.body.clientWidth
        const _height =
          window.innerHeight ||
          document.documentElement.clientHeight ||
          document.body.clientHeight
        this.bodyWidth = _width
        this.bodyHeight = _height
        // console.log('_dom:::width', _width)
        // console.log('_dom:::height', _height)
      },
      /**
       *设置按钮类型
       @param {String} type
       */
      setBtnsCurrentType(type) {
        if (this.btnClickTag === type) return 'primary'
        return ''
      },
      /**
       * 清空所有缺陷标注
       */
      removeAllLabels() {
        this.clearAllObject()
      },
      /**
       * 进入编辑标注是检查是否可有操作实体类
       *
       */
      checkHasActive() {
        const _flag = this.hasActive()
        this.isDeleteByTag = false
        _flag && (this.isDeleteByTag = true)
      },
      /**
       * 删除选中标注结果
       */
      deleteCurrentTag() {
        this.delete()
      },

      /**
       * 比较两个对象是否相等
       */
      isObjEqual(object1, object2) {
        const o1keys = Object.keys(object1)
        const o2keys = Object.keys(object2)
        if (o2keys.length !== o1keys.length) return false
        for (let i = 0; i <= o1keys.length - 1; i++) {
          const key = o1keys[i]
          if (!o2keys.includes(key)) return false
          if (object2[key] !== object1[key]) return false
        }
        return true
      },
      /**
       * 重新发起一次缓存图片请求逻辑
       * @param {Integer} currentPage 当前页（实际页码-1）
       * @param {Boolean} isResetRedisCache  是否重置后台redis缓存
       * @param {Integer} selectIndexMax  选择图片的最大索引
       */
      async getImgCacheList(currentPage, isResetRedisCache, selectIndexMax) {
        const loading = this.$loading({
          lock: true,
          text: '请稍候',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0)',
        })
        if (currentPage === 0) {
          this.currentPage = 0
          this.currentPageNum = 1
        }
        const endPageNum = 4
        const startPageNum = currentPage - 2

        // 请求当前页与后三页
        for (let i = currentPage; i < currentPage + endPageNum; i++) {
          if (i === currentPage) {
            // 当前页请求完成后，关闭loading，查询图片统计信息
            await this.pageImgData(i, isResetRedisCache, selectIndexMax, true)
            // this.selectFirstImg()
            loading.close()
          } else {
            await this.pageImgData(i, isResetRedisCache, selectIndexMax)
          }
          //缓存图片的请求第一次告诉后台重置redis即可，后续不用再重复重置
          isResetRedisCache = false

          // 判断this.imgCacheObj是否为空,跳出循环
          if (JSON.stringify(this.imgCacheObj) === '{}') {
            break
          }
        }
        // 请求前两页
        for (let i = startPageNum; i < startPageNum + 2; i++) {
          // console.log('kkkxunhaun', isResetRedisCache);
          await this.pageImgData(i, isResetRedisCache, selectIndexMax)
        }
      },
      /**
       * 分页获取图片数据
       * @param {Integer} pageNum 请求页码
       * @param {Boolean} isResetRedisCache  是否重置后台redis缓存
       * @param {Integer} selectIndexMax 选中图片中的最大序号
       * @param {Boolean} isClear  当前页的请求需要清空缓存
       */
      async pageImgData(pageNum, isResetRedisCache, selectIndexMax, isClear) {
        if (pageNum < 0 || (this.pageTotal && pageNum >= this.pageTotal)) {
          return
        }
        const queryInfo = {
          pageCondition: {
            page: pageNum,
            // pageSize: this.pageSize,
            pageSize: 1,
          },
          resetImgIdCache: true,
          imgType: 1,
          ...this.searchImgCondition,
        }
        if (this.isObjEqual(this.imgQueryVOCache, this.searchImgCondition)) {
          queryInfo.resetImgIdCache = false
        }
        if (isResetRedisCache) {
          queryInfo.resetImgIdCache = true
        }
        this.imgQueryVOCache = { ...this.searchImgCondition }
        const res = await vrsService.page(queryInfo)
        if (isClear) {
          this.imgCacheObj = {}
          this.imgData = []
        }
        if (res.data !== null) {
          this.imgTotal = res.data.total
          if (!res.data.list) return
          this.pageTotal = Math.ceil(this.imgTotal / this.pageSize)
          const dataList = res.data.list

          // console.log('数据::::', dataList);
          this.imgCacheObj[`${pageNum}`] = dataList
          if (pageNum === this.currentPage) {
            const bol = Object.prototype.hasOwnProperty.call(
              this.imgCacheObj,
              this.currentPage
            )
            if (bol) {
              this.imgData = [...this.imgCacheObj[`${this.currentPage}`]]
            }
          }

          // 对象超过6个Key值就要删除多余对象
          if (Object.keys(this.imgCacheObj).length > 6) {
            if (this.isPageDown) {
              delete this.imgCacheObj[`${this.currentPage - 3}`]
            } else {
              delete this.imgCacheObj[`${this.currentPage + 4}`]
            }
          }
          // this.selectMaxIndexNext(selectIndexMax)
        } else if (res.data === null) {
          this.$msg.error(translate('暂无数据'))
          this.imgData = []
          this.imgTotal = 0
          this.pageTotal = 0
        }
      },
      /**
       * 上一页
       * @param {Integer} pageStep  翻页的页距
       * @param {Integer} isClick  是否为直接操作页码栏
       */
      async pageUp(pageStep, isClick) {
        await this.checkImgCompareLabel()
        pageStep = pageStep ? pageStep : 1
        this.isPageDown = false
        this.pageStep = pageStep
        if (this.currentPage > 0) {
          const bol = Object.prototype.hasOwnProperty.call(
            this.imgCacheObj,
            this.currentPage - pageStep
          )

          // this.imgCacheObj.hasOwnProperty(this.currentPage - pageStep);
          if (bol) {
            this.currentPage -= pageStep
            // this.currentPageNum = this.currentPageNumOld + pageStep;
            if (!isClick) this.currentPageNum -= pageStep
            this.imgData = this.imgCacheObj[`${this.currentPage}`]

            for (
              let i = this.currentPage;
              i < this.currentPage + pageStep;
              i++
            ) {
              if (i - 2 >= 0) {
                this.pageImgData(i - 2)
              }
            }
            // this.selectFirstImg()
          } else {
            this.$notify.closeAll()
            this.$notify({
              title: translate('警告'),
              message: translate('数据请求未返回,请稍候'),
              type: 'warning',
            })
            if (isClick) this.currentPageNum = this.currentPageNumOld
          }
        }
      },

      /**
       * 下一页
       * @param {Integer} pageStep  翻页的页距
       * @param {Integer} isClick  是否为直接操作页码栏
       */
      async pageDown(pageStep, isClick) {
        await this.checkImgCompareLabel()

        const _flag = this.currentPageNum + 1 > this.imgTotal
        _flag && this.callBackInAQV()
        pageStep = pageStep ? pageStep : 1
        this.isPageDown = true
        this.pageStep = pageStep
        // console.log('翻页======this.currentPageNum,this.pageTotal', this.currentPageNum, this.pageTotal);
        let pageDownFlag = this.currentPageNum < this.pageTotal
        if (isClick) pageDownFlag = this.currentPageNum <= this.pageTotal
        if (pageDownFlag) {
          const bol = Object.prototype.hasOwnProperty.call(
            this.imgCacheObj,
            this.currentPage + pageStep
          )
          if (bol) {
            this.currentPage += pageStep
            if (!isClick) this.currentPageNum += pageStep
            this.imgData = this.imgCacheObj[`${this.currentPage}`]
            for (let i = pageStep; i > 0; i--) {
              if (this.currentPage + [3, 2, 1][i - 1] <= this.pageTotal) {
                this.pageImgData(this.currentPage + [3, 2, 1][i - 1])
              }
            }
            // this.selectFirstImg()
          } else {
            this.$notify.closeAll()
            this.$notify({
              title: translate('警告'),
              message: translate('数据请求未返回,请稍候'),
              type: 'warning',
            })
            if (isClick) this.currentPageNum = this.currentPageNumOld
          }
        }
      },

      /**
       * 翻页事件
       * @param {Integer} newPage 即将跳转的新页面页码
       */
      async handleCurrentChange(newPage) {
        // console.log('点击翻页=======newPage, this.currentPageNumOld,this.currentPageNum==', newPage, this.currentPageNumOld, this.currentPageNum);
        // this.keyMethodFlag = true;
        await this.$nextTick()
        // await this.checkImgCompareLabel()
        this.isRecheckNext = false
        if (newPage > this.currentPageNumOld) {
          this.isPageDown = true
          this.pageStep = newPage - this.currentPageNumOld
          // 往后翻页的页距超过3页时候（点击页标），要重新请求缓存
          if (newPage - this.currentPageNumOld > 3) {
            this.imgCacheObj = {}
            this.currentPage = newPage - 1
            this.getImgCacheList(this.currentPage)
          } else {
            //从缓存中那数据
            this.pageDown(this.pageStep, true)
          }
        } else if (newPage < this.currentPageNumOld) {
          this.pageStep = this.currentPageNumOld - newPage
          // 往前翻页的页距超过2页时候（点击页标），要重新请求缓存
          if (this.currentPageNumOld - newPage > 2) {
            this.imgCacheObj = {}
            this.currentPage = newPage - 1
            this.getImgCacheList(this.currentPage)
          } else {
            //从缓存中那数据
            this.pageUp(this.pageStep, true)
          }
        }
      },
      // 上一页下一页
      handlePage(e, type) {
        // console.log('eeee::', e)
        switch (type) {
          case 'up':
            this.timerObj && clearTimeout(this.timerObj)
            this.timerObj = setTimeout(() => {
              this.pageUp()
            }, 300)
            break
          case 'down':
            this.timerObj && clearTimeout(this.timerObj)
            this.timerObj = setTimeout(() => {
              this.pageDown()
            }, 300)
            break
        }
      },
      showTagDialog(e) {
        if (e.key !== 's') return
        this.timerObj && clearTimeout(this.timerObj)
        this.timerObj = setTimeout(() => {
          // console.log('eeeeeeeee,', e)
          this.saveLabel()
        }, 300)
      },

      /**
       * 提供方法给父组件调用
       */
      initGetImgData() {
        this.initFilterData(true)
      },
      /**
       * 初始化数据
       * @param {Boolean} reset 是否重置后端
       */
      async initFilterData(reset = false) {
        this.$nextTick(async () => {
          if (JSON.stringify(this.queryCondition) === '{}') return
          this.currentPage = this.currentImgNum
          this.currentPageNum = this.currentImgNum + 1
          await this.getImgCacheList(this.currentImgNum, reset)
        })
      },
      /**
       * 保存标注
       */
      async saveLabel() {
        this.resetHistory()
        // this.quitDraw()
        await this.getLabel()
      },
      /**
       * 更新label标注
       * @param {Object} labelInfo 标注结果
       */
      async updateHunmanLabel(labelInfo) {
        const _labelInfo = {
          // datasetType: this.datasetType,
          regions: labelInfo['detection'],
          // imgSize: labelInfo['imgSize'],
        }
        const imgIds = this.imgData.map((el) => el.id)
        const query = {
          operator: 1,
          imgIds,
          aqlabel: JSON.stringify(_labelInfo),
          condition: {
            pageCondition: {
              page: this.currentPage,
              pageSize: this.pageSize,
            },
            ...this.searchImgCondition,
          },
        }
        const res = await vrsService.updateHumanLabel(query)
        if (res.code === 0) {
          this.$msg.success(res.msg)
          this.imgData[0]['labels'] = res.data
        }
      },
      /**
       * 标签名更改
       */
      labelNameChange() {
        this.btnClickTag = ''
        this.setCurrentTag(this.defaultLabel)
      },
      /**
       *
       */
      mouseDown(e) {
        // console.log('鼠标点击::', e)
        e.button === 1 && this.aqlabelMove()
      },
      /**
       * 根据标签名返回对应颜色
       * @param {String} label 标签名
       */
      selectColorByLabel(label) {
        const _obj = this.labelNames.find((el) => el.label === label)
        if (!_obj) return '#18ac37'
        return colorTag[`${_obj.tagId % 10}`]
      },
      /**
       * 删除标签
       */
      deleteLabelName(item) {
        this.$confirm(translate(`是否删除标签？`), translate('提示'), {
          type: 'warning',
        }).then(() => {
          const _labels = this.labelNames.filter(
            (el) => el.label !== item.label
          )
          this.$emit('update:labelNames', _labels)
        })
      },
      /**
       * 回写到AQV数据库
       */
      async callBackInAQV() {
        if (!this.imgData.length) return
        const _res = await this.$confirm(
          translate('是否VRS结果回写AQV数据库'),
          translate('提示'),
          {
            type: 'warning',
          }
        ).catch(() => {})

        if (_res === 'confirm') {
          const _query = {
            imgType: 1,
            pageCondition: {
              page: this.currentPage,
              pageSize: this.pageSize,
            },
            ...this.searchImgCondition,
          }
          const res = await vrsService.callback(_query)
          if (res.code === 0) {
            this.aqvErrorMsg = res.data ? res.data : {}
            res.data && (this.aqvErrorVis = true)
            return res.data ? true : false
          }
        }
        return false
      },
      /**
       * 对比标注图片标注信息是否更改过
       */
      async checkImgCompareLabel() {
        const historyStep = aqlabelViewObj.getHistoryOperateStep()
        // console.log('historyStep', historyStep) //后退个数 undoStep  前进个数 redoStep
        const tag = historyStep.undoStep
        if (tag) {
          const _res = await this.$confirm(
            translate('检测到当前标注有改动,是否保存并跳转'),
            translate('提示'),
            {
              type: 'warning',
              cancelButtonText: translate('不保存只跳转'),
              confirmButtonText: translate('保存并跳转'),
            }
          ).catch(() => {})
          if (_res === 'confirm') {
            await this.saveLabel()
          }
        }
      },
      /**
       * 图片OK/NG
       */
      async updateHumanResult(type) {
        let operator = 0
        let _imgIds = []
        operator = 1
        _imgIds = this.imgData.map((el) => el.id)
        if (!_imgIds.length) return this.$msg.error(translate('请选择图片'))
        const _query = {
          operator,
          imgIds: _imgIds,
          humanResult: type,
          condition: {
            pageCondition: {
              page: this.currentPage,
              pageSize: this.pageSize,
            },
            ...this.searchImgCondition,
          },
        }
        const res = await vrsService.updateHumanResult(_query)
        if (res.code === 0) {
          this.$msg.success(res.msg)
          this.imgData.forEach((el) => {
            el.humanResult = type
          })
        }
      },
      /**
       * 快捷键触发ng
       */
      humanngConfirm() {
        this.updateHumanResult('NG')
      },
      /**
       * 快捷键触发ok
       */
      humanokConfirm() {
        this.updateHumanResult('OK')
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  @import './index.scss';
  .img-single-display {
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
