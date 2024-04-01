<!--  -->
<template>
  <div class="aqimg-view">
    <header>
      <el-row>
        <el-col :span="12">
          <slot></slot>
          <span style="display: inline-block; width: 10px"></span>
          <el-button type="primary" @click="updateHumanResultByok()">
            {{ translate('人工OK') }}
          </el-button>
          <el-button type="danger" @click="updateHumanResultByng()">
            {{ translate('人工NG') }}
          </el-button>
          <el-select v-model="displayImgType" class="img-type-select">
            <el-option :label="translate('查看原图')" value="1" />
            <el-option :label="translate('查看AI效果')" value="2" />
            <el-option :label="translate('查看标注')" value="3" />
          </el-select>
          <slot name="imgDimensions"></slot>
        </el-col>
        <el-col class="more-operation" :span="12">
          <div class="clean-head-content">
            <slot name="controlBtns"></slot>
            <el-divider direction="vertical" />
          </div>
          <slot name="archiveData"></slot>
          <el-radio-group v-model="imgSelectRadio" style="margin-right: 15px">
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
          <el-dropdown placement="bottom-start" trigger="click">
            <el-button icon="Operation" type="primary">
              {{ translate('更多操作') }}
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="deleteImg">
                  {{ translate('删除图片') }}
                </el-dropdown-item>
                <el-dropdown-item @click="exportImg">
                  {{ translate('导出图片') }}
                </el-dropdown-item>
                <el-dropdown-item @click="agreeAiResult">
                  {{ translate('认同AI') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-col>
      </el-row>
    </header>
    <div ref="aqimgRef" class="aqimg-body">
      <imgDisplay
        v-if="showDisplay"
        v-model="dataCleanViewConfig"
        v-model:key-code-flag="keyMethodFlag"
        :current-page-num="currentPageNum"
        :deafult-view-config="defaultDataCleanViewConfig"
        :display-img-type="displayImgType"
        :is-original-img="isOriginalImg"
        :parent-name="'dataClean'"
        :resource-data="resourceData"
        :show-imgs-height="clientHeight"
        :show-imgs-width="clientWidth"
        @click-pic="clickPic"
        @handle-page-num="handlePageNum"
        @set-next-img-selected="setNextImgSelected"
        @sub-contextmenu="openContextMenu"
      />
    </div>
    <footer class="aqimg-footer">
      <el-pagination
        v-model:current-page="currentPageNum"
        v-model:page-size="pageSize"
        background
        layout="total,prev, pager, next, jumper"
        small
        :total="imgTotal"
        @current-change="handleCurrentChange"
      />
    </footer>
    <!-- 键盘监听 -->
    <keyBoardListener
      :key-code-form="keyCodeForm"
      :key-method-flag="keyMethodFlag_"
      @choose-all-page="imgSelectClick('2')"
      @choose-cur-page="imgSelectClick('1')"
      @close-modify-dialog="closeModifyDialog"
      @delete-img="deleteImg"
      @down-arrow="handleArrow($event, 'down')"
      @down-page="handlePage($event, 'down')"
      @handle-agree-ai="agreeAiResult"
      @humanng-confirm="humanngConfirm"
      @humanok-confirm="humanokConfirm"
      @left-arrow="handleArrow($event, 'left')"
      @right-arrow="handleArrow($event, 'right')"
      @showai-pic="showaiPic"
      @showhunman-pic="showhunmanPic"
      @showorigin-pic="showoriginPic"
      @up-arrow="handleArrow($event, 'up')"
      @up-page="handlePage($event, 'up')"
      @view-large-img="spaceLookImg"
    />

    <!-- 下载图片 -->
    <downloadImgCom v-model:show="downloadImgVis" @download-img="downloadImg" />
    <!-- 一键unmarked -->
    <el-dialog
      v-model="unmarkedVis"
      align-center
      :close-on-click-modal="false"
      :title="translate('提示')"
      width="25%"
    >
      <el-checkbox
        v-model="onlyUpdateUncheck"
        :label="translate('限定Unmarked图片')"
      />
      <template #footer>
        <span>
          <el-button @click="unmarkedCancel">
            {{ translate('取消') }}
          </el-button>
          <el-button type="primary" @click="unmarkedSubmit">
            {{ translate('确定') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 右键菜单 -->
    <aq-context-menu ref="contextRef" :menus="menus" :width="150" />
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'

  import vrsService from '@/api/vrsService'
  import solutionController from '@/api/solution'
  import solutionSource from '@/api/solutionSource'
  import solutionConfig from '@/api/solutionConfig'

  import imgDisplay from '@/views/components/project/displayImg/index.vue'
  import keyBoardListener from '@/views/components/project/keyboard/index.vue'
  import downloadImgCom from '@/views/components/project/clean/downloadImg/index.vue'
  import AqContextMenu from '@/components/contextMenu/AqContextMenu.vue'
  import { handleDownload, handleDownloadProgress } from '@/utils/request'

  export default {
    components: { imgDisplay, keyBoardListener, downloadImgCom, AqContextMenu },
    provide() {
      return {
        enableType: computed(() => this.solutionInfo.enableType),
      }
    },
    props: {
      queryCondition: {
        type: Object,
        default: () => {
          return {}
        },
      },
      currentImgNum: {
        //选中第几页第几张，用于aqlabel初始化
        type: Number,
        default: 1,
      },
      selectImginfo: {
        type: Object,
        default: () => {
          return {}
        },
      },
      keyCodeFlag: {
        type: Boolean,
        default: true,
      },
    },
    emits: [
      'update:currentImgNum',
      'update:selectImginfo',
      'update:keyCodeFlag',
    ],
    data() {
      return {
        contextRef: null, // 右键菜单
        menus: [
          {
            icon: 'delete-bin-line',
            code: 'delete',
            name: translate('删除'),
            action: () => this.deleteImg(),
          },
        ],
        displayImgType: '1',
        clientWidth: 0,
        clientHeight: 0,
        // -----------------------------------------------------------

        imgQueryVOCache: {},
        enableLabelTableArr: [],
        showKeyListener: true, //离开页面设置为false,否则控件影响其他页面
        rowColSet: {}, //行列设置
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
        // keyMethodFlag: true, //快捷键触发标志：true打开快捷键，false关闭快捷键。
        selectedAllPicTag: false, //全选按钮标注
        isImgBack: false, //获取img接口是否已返回结果
        imgSelectRadio: '', //1为当前页全选，2为所有页全选
        imgCacheObj: {}, //图片缓存对象（缓存六页：前两页、当前页、后三页）
        pageTotal: '', //页面总数（总共有多少页）
        isPageDown: '', //向后翻页标识
        pageStep: 1, //翻页的页距
        pageSize: 1,
        debounceTimer: null, //防抖定时器
        debounceFlag: true,
        lookBigImgVis: false, //查看图片
        lookBigImgInfo: {},
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

        labelDataList: [],
        isMultiplely: false,
        isModelTableClick: false,
        selectImgIndex: 0,
        downloadImgVis: false,
        deleteImgIndex: 0, //记录删除单张图片索引
        isRecheckNext: false, //区分数字和下一个发请求标记
        isIndeterminate: true,
        check: false,
        showImgsWidth: 0, //获取展示图片宽度
        showImgsHeight: 0, //获取展示图片高度
        solutionInfo: {}, //当前解决方案信息

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

        recorddbImgHash: '', // 记录双击图片hash值
        updateImgInfoVis: false, //更新图片信息弹窗

        isOriginalImg: false, //是否展示原图
        unmarkedVis: false, // 一键unmarked
        onlyUpdateUncheck: false,
        showDisplay: true,
      }
    },
    computed: {
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
      translate() {
        return translate
      },
      ...mapStores(recordProInfo),
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
        return this.keyCodeFlag
      },
      keyMethodFlag: {
        get() {
          return this.keyCodeFlag
        },
        set(newVal) {
          this.$emit('update:keyCodeFlag', newVal)
        },
      },
      /**
       * 查询图片条件汇总
       */
      searchImgCondition() {
        const _condition = {
          ...this.queryCondition,
          backupMode: this.backupMode,
        }
        return _condition
      },
      /**
       * 记录选中第几页第几张
       */
      recordImgNum() {
        let _index = this.imgData.findIndex((el) => el.select)
        _index = _index >= 0 ? _index : 0
        const _imgNUm = this.currentPage * this.pageSize
        return _index + _imgNUm
      },

      /**
       * 选中图片
       */
      selectCurrentImg() {
        const _imgInfo = this.imgData.find((el) => el.select)
        if (_imgInfo) {
          return _imgInfo
        } else {
          return {}
        }
      },
    },
    watch: {
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
      recordImgNum() {
        this.$emit('update:currentImgNum', this.recordImgNum)
      },
      selectCurrentImg() {
        this.$emit('update:selectImginfo', this.selectCurrentImg)
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    async created() {
      await this.getUserProjectConfig()
      await this.getById()
      this.initFilterData()
    },
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {
      this.getAqimgBody()
      window.addEventListener('resize', async () => {
        await this.$nextTick()
        this.getAqimgBody()
      })
    },
    methods: {
      getAqimgBody() {
        const _dom = this.$refs.aqimgRef
        if (!_dom) return
        this.clientWidth = _dom.clientWidth
        this.clientHeight = _dom.clientHeight
        // console.log('client:::', _dom.clientWidth, _dom.clientHeight)
      },
      /**
       * 提供方法给父组件调用
       */
      initGetImgData() {
        this.initFilterData()
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

        if (imgsAreaDom) {
          this.showImgsWidth = imgsAreaDom.clientWidth
          this.showImgsHeight = imgsAreaDom.clientHeight
        }
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
       * 删除图片
       * 有SOP图片时需要提示
       */
      async deleteImg() {
        const selectedImg = this.imgData.filter((el) => el.select)
        if (selectedImg.length === 0) {
          return this.$msg.error(translate('请选择图片'))
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
          imgIds: _imgIds,
          operator,
          condition: {
            ...this.searchImgCondition,
            pageCondition: {
              page: this.currentPage,
              pageSize: this.pageSize,
            },
          },
        }

        this.$confirm('是否删除数据', {
          type: 'warning',
        }).then(() => {
          this.deleteSourceImage(query)
        })
      },

      /**
       * 初始化数据
       */
      async initFilterData() {
        if (JSON.stringify(this.queryCondition) === '{}') return
        const _config = { ...this.dataCleanViewConfig }
        this.rowColSet = { ...this.dataCleanViewConfig }
        this.pageSize = _config.col * _config.row
        this.$nextTick(async () => {
          const _currentPage = Math.floor(this.currentImgNum / this.pageSize)
          this.currentPage = _currentPage
          this.currentPageNum = _currentPage + 1
          await this.getImgCacheList(_currentPage, true)
        })
      },

      // 行列变化后重新计算页码，请求数量
      async handlePageNum(data) {
        // console.log('hanglie:::', data);
        // const loading = ElLoading.service({
        //   lock: true,
        //   text: 'Loading',
        //   background: 'rgba(0, 0, 0, 0.7)',
        // })
        this.showDisplay = false
        if (JSON.stringify(this.queryCondition) === '{}') return
        this.rowColSet = { ...data }
        this.pageSize = data.col * data.row
        this.saveOrUpdateUserProjectConfig()
        this.$nextTick(async () => {
          this.showDisplay = true
          await this.getImgCacheList(0, false)
          // loading.close()
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
          pageCondition: {
            page: pageNum,
            pageSize: this.pageSize,
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
        if (res.data && res.data.total) {
          this.imgTotal = res.data.total
          if (!res.data.list) return
          this.pageTotal = Math.ceil(this.imgTotal / this.pageSize)
          const dataList = res.data.list
          dataList.forEach((el) => {
            el.select = false
          })

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
        } else {
          this.$msg.error(translate('无数据'))
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
          return this.$msg.error(translate('请选择图片'))
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
          imgIds: _imgIds,
          operator,
          condition: {
            ...this.searchImgCondition,
            pageCondition: {
              page: this.currentPage,
              pageSize: this.pageSize,
            },
          },
        }
        const res = await vrsService.agreeAi(query)
        if (res.code === 0) {
          //单张图片就
          if (_imgIds.length === 1) {
            this.$msg.success(res.msg)
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
        this.currentPageNum = newPage
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
       * @param {Object} _query 接受子组件传递出来的参数
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
            condition: { ...this.searchImgCondition },
            operator: _operator,
            imgIds: _imgIds,
          },
        }
        const res = await vrsService.exportZip(query, handleDownloadProgress())
        handleDownload(res)
      },

      /**
       * 删除原始数据
       */
      async deleteSourceImage(condition) {
        const res = await vrsService.deleteImg(condition)
        if (res.code === 0) {
          this.imgSelectRadio = ''
          if (condition.operator === 2) {
            this.getImgCacheList(0, true)
          } else {
            this.$msg.success(res.msg)
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
       * 导出图片
       */
      exportImg() {
        const selectedImg = this.imgData.filter((el) => el.select)
        if (selectedImg.length === 0) {
          return this.$msg.error('请选择图片')
        }
        this.downloadImgVis = true
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
       *更新人工结果 OK/NG/Check
       */
      async updateHumanResult(type) {
        let operator = 0
        let _imgIds = []
        if (this.imgSelectRadio === '2') {
          operator = 2
        } else {
          operator = 1
          _imgIds = this.imgData.filter((el) => el.select).map((el) => el.id)
          if (!_imgIds.length) return this.$msg.error(translate('请选择图片'))
        }
        const _query = {
          operator,
          imgIds: _imgIds,
          humanResult: type,
          onlyUpdateUncheck: this.onlyUpdateUncheck,
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
          this.imgSelectRadio = ''
          if (operator === 2) {
            this.getImgCacheList(0, true)
          } else {
            //
            this.imgData
              .filter((el) => el.select)
              .forEach((el) => {
                el.humanResult = type
              })
          }
        }
      },
      updateHumanResultByok() {
        if (['1', '2'].includes(this.imgSelectRadio)) {
          this.unmarkedVis = true
          return
        }
        this.updateHumanResult('OK')
      },
      updateHumanResultByng() {
        if (!['1', '2'].includes(this.imgSelectRadio)) {
          return this.updateHumanResult('NG')
        }
        this.$confirm(translate('把图片标注为NG'), '提示', {
          type: 'warning',
        })
          .then(() => {
            this.updateHumanResult('NG')
          })
          .catch(() => {})
      },
      unmarkedCancel() {
        this.onlyUpdateUncheck = false
        this.unmarkedVis = false
      },
      unmarkedSubmit() {
        this.updateHumanResult('OK')
        this.unmarkedCancel()
      },
      /**
       * 快捷键OK
       */
      humanokConfirm() {
        this.updateHumanResultByok()
      },
      /**
       * 快捷键NG
       */
      humanngConfirm() {
        this.updateHumanResultByng()
      },
      /**
       * ai效果图
       */
      showaiPic() {
        this.displayImgType = '2'
      },
      /**
       * 人工图效果
       */
      showhunmanPic() {
        this.displayImgType = '3'
      },
      /**
       * 原图效果
       */
      showoriginPic() {
        this.displayImgType = '1'
      },
      // 右键菜单
      openContextMenu(e) {
        this.$refs.contextRef.openContextDialog(e)
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .aqimg-view {
    width: 100%;
    height: 100%;
    background-color: #f6f8f9;
    header {
      padding: 5px;
      margin-bottom: 5px;
      background-color: #fff;
      .img-type-select {
        margin-left: 10px;
        width: 120px;
      }
      .more-operation {
        text-align: right;
        .clean-head-content {
          display: inline-block;
          align-items: center;
          margin-right: 16px;
          .el-divider--vertical {
            top: -3px;
            height: 18px;
          }
        }
      }
    }
    .aqimg-body {
      height: calc(100% - 39px - 47px);
      background-color: #fff;
    }
    footer {
      padding: 5px;
      margin-top: 5px;
      background-color: #fff;
      .el-pagination {
        margin: 0;
        justify-content: right;
      }
    }
  }
</style>
