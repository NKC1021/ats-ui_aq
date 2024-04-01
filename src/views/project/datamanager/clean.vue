<template>
  <div
    :class="[
      { 'data-clean-body': !isOpenFullScreen },
      { 'full-screen-content': isOpenFullScreen },
    ]"
  >
    <div id="dataClean" :class="['dataContainer', 'data-clean']">
      <!-- 左侧图片容器 -->
      <div
        id="dataOperate"
        ref="dataOperateRef"
        class="dataOperate"
        :class="[{ 'is-wide-screen': isWideScreen }]"
      >
        <!-- 图片上方操作栏 -->
        <!-- 图片上方操作栏 -->
        <el-row class="clean-header">
          <el-col :span="12">
            <el-select
              v-model="searchCondition.dataSetIds"
              collapse-tags
              multiple
              :placeholder="translate('数据集为空,默认全选')"
              style="width: 250px"
              @blur="blurFlagMethod"
              @focus="focusFlagMethod"
              @visible-change="dataSetVisChange"
            >
              <!-- :indeterminate="isIndeterminate" -->
              <!-- <el-checkbox style="padding: 0 20px" v-model="check" @change="selectAll">
                {{ $t('i18_select_all') }}
              </el-checkbox> -->
              <el-option
                v-for="item in allListDatalist"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <!-- {{ keyMethodFlag }} -->
            <!-- {{ dataCleanViewConfig }} -->
            <!-- {{ labelTreeCondition }} -->
            <!-- {{ searchImgCondition }} -->
          </el-col>
          <el-col class="head-right" :span="12">
            <div class="clean-head-content">
              <vab-icon
                class="clean-head-btn"
                icon="fullscreen-line"
                @click="fullScreenMethod"
              />
              <vab-icon
                class="clean-head-btn"
                icon="logout-box-r-line"
                @click="isWideScreenMethod"
              />
              <el-divider direction="vertical" />
            </div>

            <el-radio-group v-model="imgSelectRadio">
              <el-radio
                label="1"
                style="margin-right: 10px"
                @click.prevent="imgSelectClick('1')"
              >
                {{ translate('当前页全选') }}
              </el-radio>
              <el-radio label="2" @click.prevent="imgSelectClick('2')">
                {{ translate('所有页全选') }}
              </el-radio>
            </el-radio-group>
            <el-dropdown
              placement="bottom-start"
              trigger="click"
              @visible-change="visibleChange"
            >
              <el-button icon="Operation" type="primary">
                {{ translate('更多操作') }}
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="moveImg(1)">
                    {{ translate('复制图片') }}
                  </el-dropdown-item>
                  <el-dropdown-item @click="moveImg(2)">
                    {{ translate('移动图片') }}
                  </el-dropdown-item>
                  <el-dropdown-item @click="deleteDuplicateImg">
                    {{ translate('去重图片') }}
                  </el-dropdown-item>
                  <el-dropdown-item @click="deleteImg">
                    {{ translate('删除图片') }}
                  </el-dropdown-item>
                  <el-dropdown-item @click="exportImg">
                    {{ translate('导出图片') }}
                  </el-dropdown-item>
                  <el-dropdown-item @click="pickImgExportShow">
                    {{ translate('分图导出') }}
                  </el-dropdown-item>
                  <el-dropdown-item @click="agreeAiResult">
                    {{ translate('认同AI') }}
                  </el-dropdown-item>
                  <el-dropdown-item @click="updateImgInfoVis = true">
                    {{ translate('修改信息') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-col>
          <el-col :span="5" />
        </el-row>

        <div
          id="data-operate-content"
          ref="imgsContentRef"
          class="data-operate-content"
        >
          <!-- {{ dataCleanViewConfig }} -->
          <imgDisplay
            ref="imgDisplay"
            v-model="dataCleanViewConfig"
            v-model:key-code-flag="keyMethodFlag"
            :deafult-view-config="defaultDataCleanViewConfig"
            :parent-name="'dataClean'"
            :resource-data="resourceData"
            :show-imgs-height="showImgsHeight"
            :show-imgs-width="showImgsWidth"
            @click-pic="clickPic"
            @handle-page-num="handlePageNum"
            @imgdbclick="imgDBclick"
            @set-next-img-selected="setNextImgSelected"
            @sub-contextmenu="openContextMenu($event)"
          />
        </div>
        <!-- 图片统计信息容器 -->
        <footer>
          <el-row class="footer-content">
            <el-col class="footer-left" :span="12">
              <span>
                {{ translate('图片总数') }}:
                {{ imgTotal }}
              </span>
            </el-col>
            <el-col class="footer-right" :span="12">
              <el-pagination
                ref="paginationRef"
                v-model:current-page="currentPageNum"
                background
                layout=" prev, pager, next, jumper"
                :page-size="pageSize"
                small
                :total="imgTotal"
                @current-change="handleCurrentChange"
              />
            </el-col>
          </el-row>
        </footer>
      </div>

      <!-- 右侧操作容器 -->
      <div
        ref="dataTags"
        class="dataTags"
        :class="[{ 'is-wide-screen-hide': isWideScreen }]"
      >
        <el-tabs
          v-model="activeName"
          class="dataTag"
          style="height: 100%"
          type="border-card"
          @tab-click="tabClick"
        >
          <el-tab-pane :label="translate('树状目录')" name="1">
            <div :style="`height:${rightTabsHeight}px`">
              <conditionTree
                ref="labelTreeConfigRef"
                v-model="labelTreeConfig"
                v-model:key-method-flag="keyMethodFlag"
                v-model:label-tree-condition="labelTreeCondition"
                :dataset-ids="searchCondition.dataSetIds"
                @label-tree-node-check="labelTreeNodeCheck"
                @save-or-update-pick-pic-export="saveOrUpdateUserProjectConfig"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane :label="translate('可打标签')" name="3">
            <div :style="`height:${rightTabsHeight}px`">
              <labelTable
                v-model:key-code-flag="keyMethodFlag"
                :is-multiple-selected-img="isMultiple"
                :select-img-info="getSelectImgInfo"
                :solution-enable-type="solutionEnableType"
                :table-data="enableLabelTableArr"
                @label-table-click="labelTableClick"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane :label="translate('图片详情')" name="4">
            <div :style="`height: ${rightTabsHeight}px; overflow: auto`">
              <imgDetails
                :is-multiple-selected-img="isAddSopSelectedImg"
                :selected-img-info="getSelectImgInfo"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane :label="translate('加入SOP')" name="5">
            <div :style="`height:${rightTabsHeight}px`">
              <addSop
                :is-connect="true"
                :is-multiple-selected-img="isAddSopSelectedImg"
                :selected-img-info="getSelectImgInfo"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 移动图片操作弹窗 -->
      <el-dialog
        v-model="moveImgDialog"
        :close-on-click-modal="false"
        :modal-append-to-body="false"
        :show-close="false"
        top="30vh"
        width="20%"
      >
        <el-form ref="moveFormRef" label-width="220px" :model="moveImgForm">
          <el-form-item
            :label="`是否需要把图片移至${translate('数据集')}:`"
            prop="toDataSetId"
            :rules="{
              required: true,
              message: translate('必填'),
              trigger: 'change',
            }"
          >
            <el-select v-model="moveImgForm.toDataSetId" filterable>
              <el-option
                v-for="(item, index) in moveImgDataList"
                :key="index"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button type="primary" @click="moveFormSubmit">
            {{ translate('确定') }}
          </el-button>
          <el-button @click="moveFormCancel">
            {{ translate('取消') }}
          </el-button>
        </template>
      </el-dialog>
    </div>
    <!-- 键盘监听 -->
    <keyBoardListener
      :key-code-form="keyCodeForm"
      :key-method-flag="keyMethodFlag_"
      @change-img-by-left="changeImgByLeft"
      @change-img-by-right="changeImgByRight"
      @change-img-type-by-params="changeImgTypeByParams"
      @choose-all-page="imgSelectClick('2')"
      @choose-cur-page="imgSelectClick('1')"
      @close-modify-dialog="closeModifyDialog"
      @delete-img="deleteImg"
      @down-arrow="handleArrow($event, 'down')"
      @down-page="handlePage($event, 'down')"
      @fullscreen="fullScreenMethod"
      @handle-agree-ai="agreeAiResult"
      @left-arrow="handleArrow($event, 'left')"
      @right-arrow="handleArrow($event, 'right')"
      @show-detail-page="showDetailPage"
      @switch-tab="isWideScreenMethod"
      @up-arrow="handleArrow($event, 'up')"
      @up-page="handlePage($event, 'up')"
      @view-large-img="spaceLookImg"
    />
    <!-- 放大图  -->
    <enlargeView
      v-model:visible="lookBigImgVis"
      :img-list="getImgDataByHash()"
    />
    <!-- 更新图片信息 -->
    <updateImgInfo
      v-model:show="updateImgInfoVis"
      :criteria-data="criteriaData"
      @update-img-info="updateImgInfo"
    />
    <!-- 分图导出 -->
    <pickImgExport
      v-model:show="pickImgExportDialog"
      @export-submit="pickImgExportSubmit"
    />
    <downloadImgCom v-model:show="downloadImgVis" @download-img="downloadImg" />
    <!-- 右键菜单 -->
    <aq-context-menu ref="contextRef" :menus="menus" :width="150" />
  </div>
</template>

<script>
  // import { deepClone } from '@/components/pcbWebCommon/utils/util.js'
  import { translate } from '@/i18n'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
  // import statusCodes from '@/const/enumList'
  // ------------------------------------------

  import solutionController from '@/api/solution'
  import imgExportApi from '@/api/solutionExport'
  import solutionSource from '@/api/solutionSource'
  import solutionConfig from '@/api/solutionConfig'
  import solutionDatalist from '@/api/solutionDataSet'
  import solutionFile from '@/api/solutionFile'
  import addSop from '@/views/components/project/clean/addSop/index.vue'
  import imgDisplay from '@/views/components/project/displayImg/index.vue'
  import enlargeView from '@/views/components/project/enlargeImg/index.vue'
  import keyBoardListener from '@/views/components/project/keyboard/index.vue'
  import labelTable from '@/views/components/project/clean/labelTable/index.vue'
  import imgDetails from '@/views/components/project/clean/detailsImg/index.vue'
  import pickImgExport from '@/views/components/project/clean/exportImg/index.vue'
  import downloadImgCom from '@/views/components/project/clean/downloadImg/index.vue'
  import updateImgInfo from '@/views/components/project/clean/updateImgInfo/index.vue'
  import conditionTree from '@/views/components/project/clean/conditionTree/index.vue'
  import {handleDownload, handleDownloadProgress} from '@/utils/request'
  import AqContextMenu from '@/components/contextMenu/AqContextMenu'

  export default {
    components: {
      keyBoardListener,
      enlargeView,
      labelTable,
      imgDisplay,
      imgDetails,
      addSop,
      updateImgInfo,
      conditionTree,
      pickImgExport,
      downloadImgCom,
      AqContextMenu,
    },

    data() {
      return {
        contextRef: null,
        menus: [
          { icon: 'delete-bin-line', code: 'delete', name: translate('删除'), action: () => (this.deleteImg()) },
        ],
        pickImgExportDialog: false,
        imgQueryVOCache: {},
        enableLabelTableArr: [],
        showKeyListener: true, //离开页面设置为false,否则控件影响其他页面
        rowColSet: {}, //行列设置
        activeName: '1',
        imgData: [], // 图片数据
        currentPage: 0, //发送后台请求时候的页码
        currentPageNum: 1, //当前页面的页码
        currentPageNumOld: 1, //翻页之前的页码
        imgTotalNum: 0, //用作切换页数
        controlRadio: true,
        selectNum: '',
        ctrlFlag: true, // 单选或多选切换变量
        imgIndex: -1, //快捷键切换图片索引
        imgTotal: 0,
        showDefectPosition: true, //展示缺陷图位置
        keyMethodFlag: true, //快捷键触发标志：true打开快捷键，false关闭快捷键。
        AZKeyMetnodFlag: true, //AZ键盘事件
        selectedAllPicTag: false, //全选按钮标注
        isImgBack: false, //获取img接口是否已返回结果
        labelType: 0, //启用标签
        isUpdateLabel: true, //防止修改得太快
        imgSelectRadio: '', //1为当前页全选，2为所有页全选
        bigImgList: [],
        imgCacheObj: {}, //图片缓存对象（缓存六页：前两页、当前页、后三页）
        pageTotal: '', //页面总数（总共有多少页）
        isPageDown: '', //向后翻页标识
        pageStep: 1, //翻页的页距
        pageSize: 1,
        debounceTimer: null, //防抖定时器
        debounceFlag: true,
        lookBigImgVis: false, //查看图片
        updateRoiFlag: false, //是否开启快速修改图片Roi
        //展示图片类型标记
        showImgType: {
          modelPic: true,
          gerberPic: false,
          dataPic: false,
          visualPic: false,
          show: true, //单图模式时，控件显示
          leftShow: true, //双图模式下，热力图在左图片显示
        },
        moveImgDialog: false,
        labelDataList: [],
        isMultiplely: false,
        isModelTableClick: false,
        selectImgIndex: 0,
        downloadImgVis: false,
        exportImgType: 1,
        copyImgDataList: [],
        deleteImgIndex: 0, //记录删除单张图片索引
        isRecheckNext: false, //区分数字和下一个发请求标记
        isIndeterminate: true,
        check: false,
        showImgsWidth: 0, //获取展示图片宽度
        showImgsHeight: 0, //获取展示图片高度
        rightTabsHeight: 0, // 右侧侧边栏可以用高度
        conditionTree: {}, // 树状目录 记录点击的对象
        labelTreeCondition: {}, //标签树筛选条件
        listLabelNameByIdMap: new Map(), //记录图片可打标签
        allListDatalist: [], //全部数据集
        solutionInfo: {}, //当前解决方案信息
        // 查询条件
        searchCondition: {
          dataSetIds: [],
        },
        moveImgType: 0, // 1复制 2移动
        moveImgForm: {
          toDataSetId: '',
        },
        exportImgForm: {
          exportType: 1,
        },
        userProConfig: {}, //获取用户项目配置
        labelTreeConfig: [], // 标签树配置
        conditionTreeConfig: [], // 条件筛选树配置
        // 行和列设置
        dataCleanViewConfig: {
          showType: 1, //显示设置，2：双图；1：单图
          row: 1,
          col: 1,
          step: 1,
        },
        defaultDataCleanViewConfig: {}, //重置到用户设置的值记录用户开始配置
        dataSetIdsVis: [], // 记录数据集下拉框张开默认值
        imgDataMap: new Map(), //用来存储大图 hash值作为key值
        checkBigImgPedding: false, //防止初始化就查看大图
        recorddbImgHash: '', // 记录双击图片hash值
        updateImgInfoVis: false, //更新图片信息弹窗
        criteriaData: {}, //更新图片信息需要 的参数
        isOpenFullScreen: false,
        isWideScreen: false,
      }
    },

    computed: {
      translate() {
        return translate
      },
      ...mapStores(recordProInfo),
      resourceData() {
        return {
          reCheck: false,
          idName: 'data-operate-content',
          updateRoiFlag: this.updateRoiFlag,
          labelType: this.solutionEnableType, //启用标签类型
          showImgType: this.showImgType,
          imgData: this.imgData,
          showDefectPosition: this.showDefectPosition,
        }
      },
      isMultiple() {
        const _list = this.imgData.filter((el) => el.select)
        if (_list.length >= 1) {
          return true
        } else {
          return false
        }
      },

      // 是否启用工程标签标记

      keyMethodFlag_() {
        // console.log('this.keyMethodFlag',this.keyMethodFlag)
        return this.keyMethodFlag
      },

      labelTypeByEngine() {
        let flag = false
        this.labelType === 2 ? (flag = true) : (flag = false)
        return flag
      },
      /**
       * 用户配置快捷键
       */
      keyCodeForm() {
        const keysForm = this.projectStore.keyCodeForm
        const keys = {
          ...keysForm.common,
          ...keysForm.clean,
        }
        return keys
      },
      // drawerFlag() {
      //   return this.$store.state.core.drawerFlag
      // },

      // dataSetCodeStatus() {
      //   return statusCodes.data_set_code
      // },

      // 语言种类
      // languageType() {
      //   return this.$store.getters.localLang
      // },
      /**
       * 获取选中图片工位、相机、点位、光照方式 信息拼接作为Map key值
       */
      selectImgEnableLabel() {
        const _img = this.imgData.find((el) => el.select)
        if (_img) {
          //工位、相机、点位、光照方式
          return `${_img.stationName}-${_img.cameraName}-${_img.capturePos}-${_img.opticalMode}`
        } else {
          return ''
        }
      },

      /**
       * 查询图片条件汇总 包含 树状目录 标签树 数据集
       */
      searchImgCondition() {
        const _condition = {
          ...this.conditionTree,
          ...this.labelTreeCondition,
          ...this.searchCondition,
        }
        return _condition
      },
      /**
       * 解决方案启用标签类型
       */
      solutionEnableType() {
        const _enableType = this.solutionInfo.enableType
        if (_enableType) {
          return _enableType
        }
        return 0
      },
      /**
       * 选中图片的信息(取第一张)
       */
      getSelectImgInfo() {
        const _imgInfo = this.imgData.find((el) => el.select)
        if (_imgInfo) {
          return _imgInfo
        } else {
          return {}
        }
      },
      /**
       * 移动图片选的数据集
       */
      moveImgDataList() {
        let arr = []
        arr = this.allListDatalist
        return arr
      },
      isAddSopSelectedImg() {
        const selectedLength = this.imgData.filter((el) => el.select).length
        if (selectedLength === 1) {
          return true
        } else {
          return false
        }
      },
    },

    watch: {
      drawerFlag(val) {
        if (val) {
          this.keyMethodFlag = false
        } else {
          this.keyMethodFlag = true
        }
      },
      pickImgExportDialog(val) {
        if (val) {
          this.keyMethodFlag = false
        } else {
          this.keyMethodFlag = true
        }
      },
      moveImgDialog(val) {
        if (val) {
          this.keyMethodFlag = false
        } else {
          this.keyMethodFlag = true
        }
      },
      downloadImgVis(val) {
        if (val) {
          this.keyMethodFlag = false
        } else {
          this.keyMethodFlag = true
        }
      },
      currentPage(newVal) {
        this.currentPage = newVal
      },
      currentPageNum: {
        handler(val, old) {
          this.currentPageNumOld = old
          if (this.imgSelectRadio === '1') {
            this.imgSelectRadio = ''
          }
        },
        deep: true,
      },
      /**
       * 获取选中图片可用标签
       */
      async selectImgEnableLabel(newVal) {
        if (newVal) {
          let _arr = this.listLabelNameByIdMap.get(this.selectImgEnableLabel)
          if (!_arr) {
            await this.getLabelNameByCondition()
            _arr = this.listLabelNameByIdMap.get(this.selectImgEnableLabel)
          }
          if (_arr) {
            this.enableLabelTableArr = _arr
          }
        }
      },

      /**
       * 查看大图
       */
      lookBigImgVis(isVis) {
        this.keyMethodFlag = !isVis
      },
      updateImgInfoVis(newVal) {
        if (!newVal) {
          this.keyMethodFlag = true
        } else {
          this.keyMethodFlag = false
        }
      },
    },
    deactivated() {
      this.showKeyListener = false
    },
    unmounted() {
      this.projectStore.datasetToClean = {}
    },
    async mounted() {
      this.keyMethodFlag = true
      this.$nextTick(() => {
        this.getRightTabsEffectHeight()
        //浏览器大小改变
        window.addEventListener('resize', async () => {
          this.getRightTabsEffectHeight()
          this.getShowImgContent()
        })
        // 获取展示图片区域
        this.getShowImgContent()
        // 分页组件的输入框事件
        // const dom = document.getElementsByClassName('el-pagination')[0]
        // const input = dom
        //   .querySelector('span')
        //   .querySelector('div')
        //   .querySelector('input')
        // input.addEventListener('focus', () => {
        //   this.keyMethodFlag = false
        // })
        // input.addEventListener('blur', () => {
        //   this.keyMethodFlag = true
        // })
      })
    },
    async created() {
      // console.log('数据清洗页面created');
      this.getCriteriaData()
      await this.getUserProjectConfig()
      await this.listDataSet() // 获取当前项目所有数据集
      await this.getById()
      await this.initFilterData()
      await this.$nextTick()
      this.updateTreeComponent()
    },

    methods: {
      /**
       *
       */
      showDetailPage() {
        this.activeName = '4'
      },

      /**
       * 开启全屏方法
       */
      async fullScreenMethod() {
        this.isOpenFullScreen = !this.isOpenFullScreen
        await this.$nextTick()
        this.getShowImgContent()
        this.getRightTabsEffectHeight()
      },

      /**
       * @description: 隐藏右侧工具栏
       */
      async isWideScreenMethod() {
        this.isWideScreen = !this.isWideScreen
        await this.$nextTick()
        this.getShowImgContent()
        this.getRightTabsEffectHeight()
      },
      /**
       * 查看大图根据hash值
       */
      getImgDataByHash() {
        return this.imgDataMap.get(this.recorddbImgHash) || []
      },
      /**
       * tabClick
       */
      tabClick() {
        document
          .getElementById('data-operate-content')
          .setAttribute('tabIndex', '-1')
        document.getElementById('data-operate-content').focus()
      },
      /**
       * 获取展示图片区域
       */
      getShowImgContent() {
        const imgsAreaDom = this.$refs.imgsContentRef
        // console.log('imgsAreaDom::::', imgsAreaDom);
        if (imgsAreaDom) {
          this.showImgsWidth = imgsAreaDom.clientWidth
          this.showImgsHeight = imgsAreaDom.clientHeight
        }
      },

      /**
       * 更多操作
       */
      visibleChange() {
        // if (val) {
        //   this.focusFlagMethod()
        // } else {
        //   this.blurFlagMethod()
        // }
        document
          .getElementById('data-operate-content')
          .setAttribute('tabIndex', '-1')
        document.getElementById('data-operate-content').focus()
      },

      /**
       * 输入框聚焦
       */
      focusFlagMethod() {
        this.keyMethodFlag = false
      },

      /**
       * 输入框失去聚焦
       */
      blurFlagMethod() {
        this.keyMethodFlag = true
      },
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
       *双击查看图片大小
       */
      imgDBclick(imgInfo) {
        this.keyMethodFlag = false
        this.recorddbImgHash = `${imgInfo.hash}.${imgInfo.imgSuffix}`
        this.lookBigImgVis = true
      },

      /**
       * 所有页全选或当前页全选
       */
      imgSelectClick(index) {
        if (this.imgSelectRadio === index) {
          this.imgSelectRadio = ''
          this.imgData.forEach((item) => {
            item.select = false
          })
          return
        }
        this.imgSelectRadio = index
        this.selectAllPic()
      },
      /**
       * 全选图片
       *
       * */
      selectAllPic() {
        this.imgData.forEach((item) => {
          item.select = true
        })
        this.selectedAllPicTag = true
      },
      // 鼠标右键事件list
      // 关闭修改标签弹窗
      closeModifyDialog() {
        this.$refs.modlabelRef.dialogClosed()
        this.keyMethodFlag = true
      },

      /**
       * 数据集下拉框显示隐藏
       */
      dataSetVisChange(val) {
        // console.log('下拉框值:::', val);
        if (val) {
          // 记录开始默认值
          this.dataSetIdsVis = this.searchCondition.dataSetIds
        } else {
          // 收上去就要检查是否发请求
          const _dataSetIds = this.searchCondition.dataSetIds
          const flag =
            _dataSetIds.length === this.dataSetIdsVis.length &&
            _dataSetIds.some((el) => this.dataSetIdsVis.includes(el))
          // console.log('布尔值:::', flag);
          if (!flag) {
            this.$nextTick(async () => {
              this.updateTreeComponent()
              await this.getImgCacheList(0, true)
            })
          }
        }
      },
      /**
       * 删除图片
       * 有SOP图片时需要提示
       */
      async deleteImg() {
        const selectedImg = this.imgData.filter((el) => el.select)
        if (selectedImg.length === 0) {
          return this.$message.error(this.$t('i18_please_select_img'))
        }
        let operator = 0
        let _imgIds = []
        if (this.imgSelectRadio === '2') {
          operator = 2
        } else {
          operator = 1
          _imgIds = this.imgData.filter((el) => el.select).map((el) => el.id)
        }
        const query = {
          operator,
          imgIds: _imgIds,
          imgQueryVO: { ...this.searchImgCondition },
        }
        // 删除全部要提示
        if (operator === 2) {
          this.$confirm('是否删除全部数据', {
            type: 'warning',
          }).then(() => {
            this.deleteSourceImage(query)
          })
        } else {
          this.deleteSourceImage(query)
        }
      },

      /**
       * 初始化数据
       */
      async initFilterData() {
        // console.log('route::::', this.projectStore.datasetToClean)
        const _routeObj = this.projectStore.datasetToClean
        if (JSON.stringify(_routeObj) !== '{}') {
          const _ids = _routeObj.dataSetIds
          this.searchCondition.dataSetIds.push(_ids)
          // console.log('dataSetIds::', _ids)
        } else if (this.allListDatalist.length) {
          const _dataSetId = [this.allListDatalist[0].id]
          this.searchCondition.dataSetIds = _dataSetId
        }
        const _config = { ...this.dataCleanViewConfig }
        this.rowColSet = { ...this.dataCleanViewConfig }
        this.pageSize = _config.col * _config.row
        this.$nextTick(async () => {
          await this.getImgCacheList(0, true)
        })
      },

      // 行列变化后重新计算页码，请求数量
      async handlePageNum(data) {
        // console.log('hanglie:::', data);
        this.rowColSet = { ...data }
        this.pageSize = data.col * data.row
        this.saveOrUpdateUserProjectConfig()
        this.$nextTick(async () => {
          await this.getImgCacheList(0, false)
        })
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
        this.isImgBack = false
        const queryInfo = {
          currentPage: pageNum,
          imgQueryVO: {
            ...this.searchImgCondition,
          },
          imgType: 2,
          moduleCode: 3,
          pageSize: this.pageSize,
          resetImgIdCache: true,
        }

        if (this.isObjEqual(this.imgQueryVOCache, this.searchImgCondition)) {
          queryInfo.resetImgIdCache = false
        }
        if (isResetRedisCache) {
          queryInfo.resetImgIdCache = true
        }
        this.imgQueryVOCache = { ...this.searchImgCondition }

        const res = await solutionSource.pageImgData(queryInfo)
        if (isClear) {
          this.imgCacheObj = {}
          this.imgData = []
        }
        if (res.data !== null && res.code == 0) {
          this.imgTotal = res.data.total
          if (!res.data.list) return
          this.pageTotal = Math.ceil(this.imgTotal / this.pageSize)
          const dataList = res.data.list
          dataList.forEach((el) => {
            el.select = false
          })
          this.isImgHashInImgDataMap(dataList)
          // this.transformImageData(dataList);
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
          this.selectMaxIndexNext(selectIndexMax)
        } else if (res.data === null) {
          this.$message.error(translate('无数据'))
          this.imgData = []
          this.imgTotal = 0
          this.pageTotal = 0
        }
        this.isImgBack = true
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

      // 点击图片操作
      clickPic(item, index, e) {
        this.keyMethodFlag = true
        // const ctrlFlag = e.ctrlKey

        //单击单选
        if (!e.ctrlKey) {
          item.select = true
          this.imgData.forEach((it, i) => {
            if (index !== i) {
              it.select = false
            }
          })
          //标记ROI设置为true
        }
        //单击多选
        if (e.ctrlKey) {
          item.select = !item.select
        }

        this.imgSelectRadio = ''
      },

      changeImgTypeByParams(imgType, e) {
        const single_double = this.$refs.imgDisplay.single_double
        switch (imgType) {
          //对比模板图
          case 'dataPic':
            Object.keys(this.showImgType).forEach((k) => {
              if (k !== 'dataPic') {
                this.showImgType[k] = false
                this.showImgType.leftShow = true
              }
            })
            if (e.type == 'keydown') {
              // 键盘按下不松开
              if (single_double == 1) {
                // 如果是单图模式，则隐藏datapic，显示模板图
                this.showImgType.show = false
                this.showImgType.modelPic = true
              } else {
                this.showImgType.dataPic = true
                this.showImgType.modelPic = this.showImgType.dataPic
                  ? false
                  : true
              }
            } else {
              // 松开
              if (single_double == 1) {
                this.showImgType.show = true
                this.showImgType.modelPic = false
              } else {
                this.showImgType.dataPic = false
                this.showImgType.modelPic = this.showImgType.dataPic
                  ? false
                  : true
              }
            }
            break
          //首件图
          case 'modelPic':
            // console.log('this.$options.data().showImgType', this.$options.data().showImgType);
            this.$data.showImgType = this.$options.data().showImgType
            break
          //其他的图
          default:
            if (single_double == 2) {
              if (imgType == 'visualPic') {
                this.showImgType.visualPic = !this.showImgType.visualPic
                this.showImgType.leftShow = !this.showImgType.leftShow
              } else {
                if (this.showImgType.gerberPic) {
                  this.showImgType.gerberPic = false
                  this.showImgType.modelPic = true
                  if (this.$refs.imgDisplay.single_double == 2) {
                    this.showImgType.show = true
                  }
                } else {
                  this.showImgType.gerberPic = true
                  this.showImgType.modelPic = false
                }
              }
              return
            }
            if (this.showImgType[imgType]) {
              this.showImgType[imgType] = false
              this.showImgType.modelPic = true
              if (this.$refs.imgDisplay.single_double == 1) {
                this.showImgType.show = true
              }
            } else {
              this.showImgType[imgType] = true
              Object.keys(this.showImgType).forEach((k) => {
                if (k !== imgType) {
                  this.showImgType[k] = false
                }
              })
            }
            break
        }
        // 如果是单图模式
      },

      // 上一张下一张左一张右一张
      handleArrow(e, type) {
        switch (type) {
          case 'up':
            this.setUpImgSelected()
            break
          case 'down':
            this.setDownImgSelected()
            break
          case 'left':
            if (this.debounceTimer && this.debounceFlag) {
              clearTimeout(this.debounceTimer)
            }
            if (this.debounceFlag) {
              this.setFrontImgSelected()
              this.debounceFlag = false
              this.debounceTimer = setTimeout(() => {
                this.debounceFlag = true
              }, 100)
            }
            break
          case 'right':
            if (this.debounceTimer && this.debounceFlag) {
              clearTimeout(this.debounceTimer)
            }
            if (this.debounceFlag) {
              this.setNextImgSelected()
              this.debounceFlag = false
              this.debounceTimer = setTimeout(() => {
                this.debounceFlag = true
              }, 100)
            }
            break
        }
      },

      // 上一页下一页
      handlePage(e, type) {
        switch (type) {
          case 'up':
            if (this.debounceTimer && this.debounceFlag) {
              clearTimeout(this.debounceTimer)
            }
            if (this.debounceFlag) {
              //
              this.pageUp()
              this.debounceFlag = false
              this.debounceTimer = setTimeout(() => {
                this.debounceFlag = true
              }, 100)
            }
            break
          case 'down':
            if (this.debounceTimer && this.debounceFlag) {
              clearTimeout(this.debounceTimer)
            }
            if (this.debounceFlag) {
              this.isRecheckNext = true
              this.pageDown()
              this.debounceFlag = false
              this.debounceTimer = setTimeout(() => {
                this.debounceFlag = true
              }, 100)
            }
            break
        }
      },
      async setFrontImgSelected() {
        // 快捷键控制左一张图片
        // 单选才有效
        if (this.ctrlFlag) {
          const selectFlag = this.imgData.filter((item) => item.select)
          // 默认选中第一个
          if (selectFlag.length === 0) {
            this.imgData[0]['select'] = true
          }
          // 找出索引号
          this.imgIndex = this.imgData.findIndex((item) => item.select)
          if (this.imgIndex > 0) {
            this.imgData[this.imgIndex]['select'] = false
            this.imgIndex--
            this.imgData[this.imgIndex]['select'] = true
          } else {
            if (this.isImgBack) {
              await this.pageUp()
            }
          }
        }
      },
      // 快捷键控制右一张图片
      setNextImgSelected() {
        if (this.ctrlFlag) {
          // 单选才有效
          this.imgIndex = this.imgData.findIndex((item) => item.select)
          const selectedPic = this.imgData.filter((item) => item.select)
          // 默认选中第一个
          if (selectedPic.length === 0) {
            this.imgData[0]['select'] = true
          }
          this.imgIndex++
          if (this.imgIndex < this.imgData.length) {
            this.imgData.forEach((el) => {
              el.select = false
            })
            this.imgData[this.imgIndex]['select'] = true
          } else {
            this.isRecheckNext = true
            this.pageDown()
          }
        }
      },
      // 控制上一张图片
      setUpImgSelected() {
        if (this.ctrlFlag) {
          const selectedPic = this.imgData.filter((item) => item.select)
          // 默认选中第一个
          if (selectedPic.length === 0) {
            this.imgData[0]['select'] = true
            // this.$set(this.imgData[0], 'select', true)
          }
          this.imgIndex = this.imgData.findIndex((item) => item.select)
          this.imgIndex -= this.rowColSet.col
          if (this.imgIndex >= 0) {
            this.imgData.forEach((item) => {
              item.select = false
            })
            this.imgData[this.imgIndex]['select'] = true
            // this.$set(this.imgData[this.imgIndex], 'select', true)
          }
        }
      },

      /**
       * 控制下一张图片
       */
      setDownImgSelected() {
        if (this.ctrlFlag) {
          const selectedPic = this.imgData.filter((item) => item.select)
          // 默认选中第一个
          if (selectedPic.length === 0) {
            this.imgData[0]['select'] = true
            // this.$set(this.imgData[0], 'select', true)
            return false
          }
          this.imgIndex = this.imgData.findIndex((item) => item.select)
          this.imgIndex += this.rowColSet.col
          if (this.imgIndex < this.imgData.length) {
            this.imgData.forEach((item) => {
              item['select'] = false
            })
            this.imgData[this.imgIndex]['select'] = true
            // this.$set(this.imgData[this.imgIndex], 'select', true)
          }
        }
      },

      /**
       * 选中当前页面第一张图片
       */
      selectFirstImg() {
        this.$nextTick(() => {
          if (this.imgSelectRadio === '2') {
            this.imgData.forEach((item) => {
              item.select = true
            })
          } else {
            for (const i in this.imgData) {
              this.imgData[i].select = false
            }
            if (this.isModelTableClick) {
              //根据模型切换记录选中图片Index执行该逻辑
              this.imgData[this.selectImgIndex].select = true
              this.isModelTableClick = false
            } else {
              // 删除操作要特殊处理
              if (this.deleteImgIndex > 0) {
                if (this.imgData.length < this.deleteImgIndex + 1) {
                  this.imgData[this.deleteImgIndex - 1].select = true
                } else {
                  this.imgData[this.deleteImgIndex].select = true
                }
                this.deleteImgIndex = 0
              } else if (this.imgData[0]) {
                this.imgData[0].select = true
              }
            }
          }
        })
      },

      /**
       * 选中此前最大编号的下一张
       * @param {Integer} selectIndexMax  选中图片的最大编号
       */
      selectMaxIndexNext(selectIndexMax) {
        this.$nextTick(() => {
          if (this.imgSelectRadio === '2') {
            this.imgData.forEach((item) => {
              item['select'] = true
            })
          } else {
            if (typeof selectIndexMax == 'undefined') return
            const index = selectIndexMax
            for (const i in this.imgData) {
              this.imgData[i]['select'] = false
            }
            this.imgData[index]['select'] = true
            // this.$set(this.imgData[index], 'select', true)
            document
              .getElementById('dataOperatePic0')
              .setAttribute('tabIndex', '-1')
          }
        })
      },

      /**
       * 上一页
       * @param {Integer} pageStep  翻页的页距
       * @param {Integer} isClick  是否为直接操作页码栏
       */
      pageUp(pageStep, isClick) {
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
            this.selectFirstImg()
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
      pageDown(pageStep, isClick) {
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
            this.selectFirstImg()
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
       * 认同AI结果
       * 有SOP图片时需要提示
       */
      async agreeAiResult() {
        const selectedImg = this.imgData.filter((el) => el.select)
        if (selectedImg.length === 0) {
          return this.$message.error('请选择图片')
        }
        let operator = 0
        let _imgIds = []
        if (this.imgSelectRadio === '2') {
          operator = 2
        } else {
          operator = 1
          _imgIds = this.imgData.filter((el) => el.select).map((el) => el.id)
        }
        const query = {
          imgQueryVO: { ...this.searchImgCondition },
          imgIds: _imgIds,
          operator,
        }
        const res = await solutionSource.agreeAiResult(query)
        if (res.code === 0) {
          //单张图片就
          if (_imgIds.length === 1) {
            this.$message.success(res.msg)
            this.listImgLabel(_imgIds[0])
          } else {
            // 当前页面刷新
            this.getImgCacheList(this.currentPageNum - 1, false)
          }
        }
      },
      /**
       *查询图片标签 获取的标签要改变
       */
      async listImgLabel(id) {
        const query = {
          id,
        }
        const res = await solutionSource.listImgLabel(query)
        if (res.code === 0) {
          this.imgData.forEach((el) => {
            el.select && (el['labels'] = res.data)
          })
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
            this.selectFirstImg()
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
       * 页数输入框方法，防止快捷键触发
       */
      pageClick() {
        this.keyMethodFlag = false
      },

      getIdArr(data) {
        const idArr = []
        const forFn = function (data) {
          for (let i = 0; i < data.length; i++) {
            idArr.push(data[i].id)
            if (data[i].children.length > 0) {
              forFn(data[i].children)
            }
          }
        }
        forFn(data)
        return idArr
      },

      /**
       * @param type 保留图片操作 2:移动 1:复制
       */
      moveImg(type) {
        const selectedImg = this.imgData.filter((el) => el.select)
        if (selectedImg.length === 0) {
          return this.$message.error('请选择图片')
        }
        this.moveImgType = type
        this.moveImgDialog = true
      },
      moveFormCancel() {
        this.$refs.moveFormRef.resetFields()
        this.moveImgDialog = false
      },
      /**
       * 移动图片
       */
      async moveFormSubmit() {
        this.$refs.moveFormRef.validate(async (val) => {
          if (!val) return
          let _operator // 1:选中图片id 2:图片查询条件
          let _imgIds = []
          if (this.imgSelectRadio === '2') {
            _operator = 2
          } else {
            _operator = 1
            _imgIds = this.imgData.filter((el) => el.select).map((el) => el.id)
          }
          const _oldDataSetIds = this.searchCondition.dataSetIds
          const query = {
            operator: _operator,
            imgIds: _imgIds,
            isCopy: this.moveImgType,
            oldDataSetIds: _oldDataSetIds,
            toDataSetId: this.moveImgForm.toDataSetId,
            imgQueryVO: { ...this.searchImgCondition },
          }
          const loading = this.$loading({
            lock: true,
            text: translate('请稍等'),
            background: 'rgba(0, 0, 0, 0.7)',
          })
          const res = await solutionSource.moveSourceImage(query)
          loading.close()
          if (res.code === 0) {
            this.imgSelectRadio = ''
            this.$message.success(res.msg)
            this.moveFormCancel()
            if (_operator === 2) {
              // 按查询条件操作的，重新请求图片缓存。操作完回到第0页
              this.getImgCacheList(0, true)
            } else {
              // 多选复制图片不需要考虑最后一页，操作完依旧回到当前页
              let _pageIndex = this.currentPageNum - 1
              _pageIndex = _pageIndex < 0 ? 0 : _pageIndex
              this.getImgCacheList(_pageIndex, true)
            }
          }
        })
      },

      /**
       * 空格查看放大图
       */
      spaceLookImg() {
        const lookObj = this.imgData.find((el) => el.select)
        if (this.lookBigImgVis) {
          this.lookBigImgVis = false
          this.keyMethodFlag = true
          return
        }
        if (lookObj) {
          this.imgDBclick(lookObj)
        }
      },

      /**
       * 下载图片
       * @param {*} _query 接受子组件参数
       */
      async downloadImg(_query) {
        let _operator = 0
        let _imgIds = []
        if (this.imgSelectRadio === '2') {
          _operator = 2
        } else {
          _operator = 1
          _imgIds = this.imgData.filter((el) => el.select).map((el) => el.id)
        }
        const query = {
          ..._query,
          exportFilter: {
            imgQueryVO: { ...this.searchImgCondition },
            operator: _operator,
            imgIds: _imgIds,
          },
        }
        const res = await solutionFile.downloadOriginImg(query, handleDownloadProgress())
        handleDownload(res)
      },

      /**
       * 图片详情复判结果删除要改变选中图片数据
       */
      preImgDataChange(infoList) {
        // console.log('数据清洗页面', infoList);
        const _obj = this.imgData.find((el) => el.select)
        if (infoList.length === 0) {
          _obj['verifyDetails'] = []
          _obj['verifyInfos'] = []
          // this.$set(_obj, 'verifyDetails', [])
          // this.$set(_obj, 'verifyInfos', [])
        } else {
          const _preImgObj = infoList.find((el) => el.infoId === _obj.infoId)
          _obj['verifyDetails'] = _preImgObj.verifyDetails
          _obj['verifyInfos'] = _preImgObj.verifyInfos
          // this.$set(_obj, 'verifyDetails', _preImgObj.verifyDetails)
          // this.$set(_obj, 'verifyInfos', _preImgObj.verifyInfos)
        }
      },
      /**
       * 获取右边栏TAB页可以用高度
       */
      getRightTabsEffectHeight() {
        this.$nextTick(() => {
          const _rightDom = this.$refs.dataTags
          if (_rightDom) {
            const _height = _rightDom.clientHeight
            this.rightTabsHeight = _height - 50
          }
        })
      },
      /**
       * 条件筛选树点击
       */
      async conditionTreeClick() {
        await this.$nextTick()
        this.$refs.labelTreeConfigRef.selectCascaderFirst()
        this.labelTreeCondition = {}
        // 要刷新可打标签里面的缓存
        this.listLabelNameByIdMap = new Map()
        this.getImgCacheList(0, true)
      },
      /**
       * 标签树点击选中
       */
      labelTreeNodeCheck() {
        // console.log('labelTreeCondition', this.labelTreeCondition);
        this.$nextTick(() => {
          this.getImgCacheList(0, true)
        })
      },
      /**
       * 获取可以使用的标签
       * @param {Object} condition 查询条件
       * @returns
       */
      async listLabelNameByCondition(condition = {}) {
        const res = await solutionSource.listLabelNameByCondition(condition)
        if (res.code === 0) {
          return res.data
        } else {
          return []
        }
      },
      /**
       * 获取图片可用标签 如果前端已经请求过就不用发请求
       */
      async getLabelNameByCondition() {
        if (this.listLabelNameByIdMap.has(this.selectImgEnableLabel)) return
        const selectImg = this.imgData.find((el) => el.select)
        if (!selectImg) return
        const param = {
          cameraName: null,
          capturePos: null,
          opticalMode: null,
          stationName: null,
        }
        Object.keys(param).forEach((el) => {
          param[el] = selectImg[el]
        })
        const query = {
          imgQueryVO: { ...param },
          targetType: this.solutionEnableType,
        }
        const _arr = await this.listLabelNameByCondition(query)
        if (_arr.length) {
          const _labelList = []
          _arr.forEach((el) => {
            const _label = {}
            // 启用AI工程标签加上去
            if (el.parentCriteria && this.solutionEnableType === 2) {
              _label['enginName'] = el.parentCriteria.criteria.key
            } else {
              _label['enginName'] = null
            }
            _label['labelName'] = el.criteria.key
            _labelList.push(_label)
          })
          this.listLabelNameByIdMap.set(this.selectImgEnableLabel, _labelList)
        } else {
          this.listLabelNameByIdMap.set(this.selectImgEnableLabel, [])
        }
      },
      /**
       * 删除原始数据
       */
      async deleteSourceImage(condition) {
        const res = await solutionSource.deleteSourceImage(condition)
        if (res.code === 0) {
          this.imgSelectRadio = ''
          if (condition.operator === 2) {
            this.getImgCacheList(0, true)
          } else {
            this.$message.success(res.msg)
            // 最后一页删除
            const _currentPage = Math.ceil(this.imgTotal / this.pageSize)
            if (
              this.currentPageNum === _currentPage &&
              this.imgData.length === condition.imgIds.length
            ) {
              let _pageNum = this.currentPageNum - 2
              _pageNum = _pageNum < 0 ? 0 : _pageNum
              this.getImgCacheList(_pageNum, true)
            } else {
              let _pageNum = this.currentPageNum - 1
              _pageNum = _pageNum < 0 ? 0 : _pageNum
              this.getImgCacheList(_pageNum, true)
            }
          }
        }
      },

      /**
       * 临时方法,更改请求数据返回imageData结构
       * @returns
       */
      transformImageData(data = []) {
        data.forEach((el) => {
          const _imgageData = el.imageData
          if (_imgageData) {
            const dataWidth = _imgageData.map((el) => el.width)[0]
            const dataHeight = _imgageData.map((el) => el.height)[0]
            const _imgs = _imgageData.map((el) => el.images)
            const imgNameObj = {
              dataPic: null,
              modelPic: null,
              gerberPic: null,
              visualPic: null,
              roiPic: null,
            }
            _imgs.forEach((item, index) => {
              const _key = Object.keys(imgNameObj)[index]
              imgNameObj[_key] = item
            })
            el.imageData = { ...imgNameObj, dataWidth, dataHeight }
          }
        })
      },
      /**
       * 获取当前项目数据集
       */
      async listDataSet() {
        const res = await solutionDatalist.listDataSet()
        if (res.code === 0) {
          this.allListDatalist = res.data
        }
      },
      /**
       * 可打标签点击事件
       */
      async labelTableClick(query) {
        // console.log('query::::', query)
        const isSpecial = !query.isSpecial
        delete query.isSpecial
        const flag = this.isMulImgHasSameLightSource()
        if (!flag && isSpecial)
          return this.$message.error(translate('选中图片含有不同光源'))
        if (query.isSave) {
          this.saveImgLabel(query)
        }
        if (query.isMove) {
          this.removeImgLabel(query)
        }
      },
      /**
       *保存图片人工结果
       */
      async saveImgLabel(query) {
        delete query.isSave
        const _ids = this.imgData.filter((el) => el.select).map((el) => el.id)
        let _operator = 0
        if (this.imgSelectRadio === '2') {
          _operator = 2
        } else {
          _operator = 1
        }
        const params = {
          imgIds: _ids,
          labelInfo: { ...query },
          imgQueryVO: { ...this.searchImgCondition },
          operator: _operator,
        }
        const res = await solutionSource.saveImgLabel(params)
        if (res.code === 0) {
          // 判断返回是不是特殊标签
          const _specialLabel = [
            translate('ok'),
            translate('漏检'),
            translate('过检'),
          ]
          const backObj = res.data
          const flag =
            _specialLabel.includes(backObj.enginName) ||
            _specialLabel.includes(backObj.labelName)
          // 所有页全选就刷新
          if (_operator === 2) {
            this.getImgCacheList(0, false)
          } else {
            this.imgData.forEach((el) => {
              if (el.select) {
                let _labels = el.labels ? [...el.labels] : []
                const _map = new Map()
                flag &&
                  (_labels = _labels.filter((item) => {
                    return !(
                      _specialLabel.includes(item.enginName) ||
                      _specialLabel.includes(item.labelName)
                    )
                  }))
                _labels.forEach((item) => {
                  const _key = `${item.enginName}-${item.labelName}-${item.labelType}`
                  _map.set(_key, item)
                })
                const _backKey = `${res.data.enginName}-${res.data.labelName}-${res.data.labelType}`
                _map.set(_backKey, res.data)
                const _arr = []
                _map.forEach((value) => {
                  _arr.push(value)
                })
                // console.log('labels::::', _arr);
                el['labels'] = _arr
              }
            })
          }
        }
        this.keyMethodFlag = true
      },
      /**
       *移除图片人工结果
       */
      async removeImgLabel(query) {
        delete query.isMove
        const _ids = this.imgData.filter((el) => el.select).map((el) => el.id)
        let _operator = 0
        if (this.imgSelectRadio === '2') {
          _operator = 2
        } else {
          _operator = 1
        }
        const params = {
          imgIds: _ids,
          labelInfo: { ...query },
          imgQueryVO: { ...this.searchImgCondition },
          operator: _operator,
        }
        const res = await solutionSource.removeImgLabel(params)
        if (res.code === 0) {
          if (_operator === 2) {
            this.getImgCacheList(0, false)
          } else {
            this.imgData.forEach((el) => {
              if (el.select) {
                const _labels = el.labels.filter((item) => {
                  const strList = []
                  Object.keys(query).forEach((it) => {
                    strList.push(item[it] === query[it])
                  })
                  const allTrue = strList.every((i) => i === true)
                  return !allTrue
                })
                el['labels'] = _labels
                // this.$set(el, 'labels', _labels)
              }
            })
          }
        }
        this.keyMethodFlag = true
      },

      /**
       * 导出图片
       */
      exportImg() {
        const selectedImg = this.imgData.filter((el) => el.select)
        if (selectedImg.length === 0) {
          return this.$message.error('请选择图片')
        }
        this.downloadImgVis = true
      },
      /**
       * 更新子组件方法 条件筛选树 和标签树
       */
      updateTreeComponent() {
        // this.$refs.imgConstructConfigRef.selectCascaderFirst()
        this.$refs.labelTreeConfigRef.selectCascaderFirst()
      },
      /**
       * 获取项目当前配置信息
       */
      async getUserProjectConfig() {
        const res = await solutionConfig.getUserProjectConfig({})
        if (res.code === 0) {
          this.userProConfig = res.data ? { ...res.data } : {}
          const _labelTreeConfig = res.data ? res.data.labelTreeConfig : ''
          this.labelTreeConfig = _labelTreeConfig
            ? JSON.parse(_labelTreeConfig)
            : []
          const _conditionTreeConfig = res.data
            ? res.data.conditionTreeConfig
            : ''
          this.conditionTreeConfig = _conditionTreeConfig
            ? JSON.parse(_conditionTreeConfig)
            : []
          const _dataCleanViewConfig = res.data
            ? res.data.dataCleanViewConfig
            : ''
          this.dataCleanViewConfig = _dataCleanViewConfig
            ? JSON.parse(_dataCleanViewConfig)
            : { ...this.dataCleanViewConfig }
          this.defaultDataCleanViewConfig = { ...this.dataCleanViewConfig }
        }
      },
      /**
       * 保存用户配置
       */
      async saveOrUpdateUserProjectConfig() {
        const query = { ...this.userProConfig }
        query.labelTreeConfig = JSON.stringify(this.labelTreeConfig)
        query.conditionTreeConfig = JSON.stringify(this.conditionTreeConfig)
        query.dataCleanViewConfig = JSON.stringify(this.dataCleanViewConfig)
        await solutionConfig.saveOrUpdateUserProjectConfig(query)
        this.getUserProjectConfig()
      },
      /**
       * 判断返回数据是否有清晰图 hash值，没有则重新获取
       */
      isImgHashInImgDataMap(imgData = []) {
        // 需要重新获取图片信息的hash列表
        const needHashList = imgData
          .map((img) => {
            if (img.hash && img.imgSuffix) {
              return `${img.hash}.${img.imgSuffix}`
            }
            return ''
          })
          .filter((el) => el)
          .filter((fullHashVal) => !this.imgDataMap.has(fullHashVal))
        if (needHashList.length > 0) {
          this.getImgDataBy(needHashList)
        }
      },
      /**
       * 不存在ImgDataMap就请求清晰图
       */
      async getImgDataBy(needHashList = []) {
        const res = await solutionSource.getMapByKey({
          hash: needHashList,
          imageType: 1,
        }) // Vrs界面
        if (res.code === 0 && res.data) {
          // 1. 放置图片Bytes到缓存中
          for (const [key, value] of Object.entries(res.data)) {
            this.imgDataMap.set(key, value)
          }
          // 2. 当前缓存的图片哈希列表。如果切页导致hash不在预加载页中，需要及时清除
          const _curCacheHashList = Object.values(this.imgCacheObj)
            .flatMap((el) => el)
            .map((el) => `${el.hash}.${el.imgSuffix}`)
          this.imgDataMap.forEach((_, key) => {
            if (!_curCacheHashList.includes(key)) {
              this.imgDataMap.delete(key)
            }
          })
        }
      },
      /**
       * 获取标准管理一些参数
       */
      async getCriteriaData() {
        const res = await imgExportApi.getCriteriaData({})
        if (res.code === 0) {
          this.criteriaData = res.data ? { ...res.data } : {}
        }
      },
      /**
       * 更新图片信息
       */
      async updateImgInfo(updateInfo) {
        const query = {
          imgIds: [],
          imgInfo: { ...updateInfo },
          imgQueryVO: { ...this.searchImgCondition },
          operator: 0,
        }
        const _imgIds = this.imgData
          .filter((el) => el.select)
          .map((el) => el.id)
        query.imgIds = _imgIds
        if (this.imgSelectRadio === '2') {
          query.operator = 2
        } else {
          query.operator = 1
        }
        const res = await solutionSource.updateImgInfo(query)
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.updateImgInfoVis = false
          this.imgSelectRadio === '2' && this.getImgCacheList(0)
          this.imgSelectRadio !== '2' && this.getImgCacheList(this.currentPage)
        }
      },
      /**
       * 判断多选图片是不是同一光源
       */
      isMulImgHasSameLightSource() {
        const _imgList = this.imgData.filter((el) => el.select)
        const _imgSourceObj = {}
        _imgList.forEach((el) => {
          const _source = `${el.stationName}-${el.cameraName}-${el.capturePos}-${el.opticalMode}`
          if (_imgSourceObj[_source]) {
            const _list = _imgSourceObj[_source]
            _list.push(el)
            _imgSourceObj[_source] = _list
          } else {
            const _list = []
            _list.push(el)
            _imgSourceObj[_source] = _list
          }
        })
        const _sourceLgn = Object.keys(_imgSourceObj).length
        if (_sourceLgn === 1) {
          return true
        } else {
          return false
        }
      },
      /**
       * 去重图片
       */
      async deleteDuplicateImg() {
        const selectedImg = this.imgData.filter((el) => el.select)
        if (selectedImg.length <= 1 && this.imgSelectRadio !== '2') {
          // 全选不需要判断选择图片数量
          return this.$message.error(translate('请选择至少两张或以上图片'))
        }
        let _operator = 0 // 1:选中图片id 2:图片查询条件
        let _imgIds = []
        if (this.imgSelectRadio === '2') {
          _operator = 2
        } else {
          _operator = 1
          _imgIds = this.imgData.filter((el) => el.select).map((el) => el.id)
        }
        const query = {
          operator: _operator,
          imgIds: _imgIds,
          imgQueryVO: { ...this.searchImgCondition },
        }
        const loading = this.$loading({
          lock: true,
          text: translate('请稍等'),
          background: 'rgba(0, 0, 0, 0.7)',
        })
        const res = await solutionSource.deleteDuplicateImg(query)
        loading.close()
        if (res.code === 0) {
          if (res.data) {
            this.$message.success(
              translate('清除成功!本次清除冗余图片') + res.data?.value
            )
          } else {
            this.$message.warning(translate('选中图片无重复'))
          }
          // 按查询条件操作的，重新请求图片缓存
          this.getImgCacheList(0, true)
        }
      },
      pickImgExportShow() {
        const selectedImg = this.imgData.filter((el) => el.select)
        if (selectedImg.length === 0) {
          return this.$message.error('请选择图片')
        }
        this.pickImgExportDialog = true
      },
      /**
       * 分图导出
       */
      async pickImgExportSubmit(pickInfo) {
        let _operator = 0
        let _imgIds = []
        if (this.imgSelectRadio === '2') {
          _operator = 2
        } else {
          _operator = 1
          _imgIds = this.imgData.filter((el) => el.select).map((el) => el.id)
        }
        const query = {
          operator: _operator,
          imgIds: _imgIds,
          imgQueryVO: { ...this.searchImgCondition },
        }
        const param = {
          solutionImgFilterVO: query,
          pickPicExportDO: pickInfo,
          type: 2,
          exportType: 2,
        }
        const res = await imgExportApi.pickImgExport(param)
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.pickImgExportDialog = false
        }
      },
      /**
       * 左切图
       */
      changeImgByLeft() {
        this.$refs.imgDisplay.changeImgByLeft()
      },
      /**
       * 右切图
       */
      changeImgByRight() {
        this.$refs.imgDisplay.changeImgByRight()
      },
      // 右键菜单
      openContextMenu(e) {
        this.$refs.contextRef.openContextDialog(e)
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import './clean.scss';
  :deep() {
    // .dataTag .el-tabs__item {
    //   // padding: 0 10px;
    // }
    .dataTag .el-tabs__content {
      padding: 5px;
    }
    .el-tabs--border-card {
      border: 0px;
    }
    .el-divider--vertical {
      top: -3px;
      height: 18px;
    }
  }
</style>
