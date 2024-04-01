<!--  -->
<template>
  <div class="aqimg-view">
    <header>
      <el-row>
        <el-col :span="12">
          <slot></slot>
          <span style="display: inline-block; width: 10px"></span>
          <el-button type="success" @click="updateHumanResultByType('OK')">
            {{ translate('人工OK') }}
          </el-button>
          <el-button type="danger" @click="updateHumanResultByType('NG')">
            {{ translate('人工NG') }}
          </el-button>

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
    <div
      id="vrsContentId"
      ref="aqimgRef"
      class="aqimg-body"
      @mouseleave="updownLeave"
      @mousemove="mouseMoveInBody"
      @mouseup="mouseUpInBody"
    >
      <div class="show-img-body">
        <div class="left-img-body">
          <div class="left-img-top">
            <navPic
              ref="navPicRef"
              :show-nav-obj="showNavObj"
              @click-node="clickNode"
              @nav-node-info="navNodeInfo"
            />
          </div>
          <defectConfigCom
            v-model="vrsCutSet"
            v-model:keyCodeFlag="keyMethodFlag_"
            :start-vrsset="recordStartVrsSet"
            @set-confirm="setConfirm"
          />
        </div>
        <div
          v-show="isShowMainView"
          class="left-right-bymain"
          @mousedown="leftRightByMainDown"
        ></div>
        <div
          v-show="isShowMainView"
          ref="mainImgRef"
          :class="{
            'main-img-body': true,
            'main-img-body-flex': !mainViewContent.width,
          }"
          :style="`width:${mainViewContent.width}px`"
        >
          <!-- 展示图片区域 -->
          <mainView
            ref="mainViewRefs"
            :img-data="imgData"
            :select-defect-item="selectDefectItem"
            @click="mainViewClick"
          />
        </div>
        <div
          class="left-right-bydefect"
          @mousedown="leftRightByDefectDown"
        ></div>
        <div
          ref="rightImgRef"
          :class="{
            'right-img-body': true,
            'right-img-body-flex': !defectViewContent.width,
          }"
          :style="`width:${defectViewContent.width}px`"
        >
          <!-- 展示右边图片 -->
          <showDefect
            v-if="defecLoading"
            ref="showDefectRef"
            v-model="selectDefectItem"
            v-model:accept-productdefect="recordDefectInfo"
            :img-data="imgData"
            :vrs-set-config="vrsCutSet"
          />
        </div>
      </div>

      <!-- 缝隙 -->
      <div
        v-show="isShowImgInfoList"
        class="up-down-move"
        @mousedown="updownDown"
      ></div>
      <!-- ------------------------- -->
      <div
        v-show="isShowImgInfoList"
        ref="mianTableBoxRef"
        :class="{
          'show-table-body': true,
          'show-table-body-flex': !mainTableContent.height,
        }"
        :style="`height:${mainTableContent.height}px`"
      >
        <div class="left-table-body">
          <mainTable
            ref="mainTableRef"
            :imgcache-obj="imgCacheObj"
            :product-area="productAreaObj"
            :query-condition="searchImgCondition"
            @init-img-data="getInitImageData"
            @row-click="tableRowClick"
          />
        </div>
        <div
          class="left-right-bytable"
          @mousedown="leftRightByDetailTableDown"
        ></div>
        <div
          ref="detailTabelRef"
          :class="{
            'right-table-body': true,
            'right-table-body-flex': !detailTableContent.width,
          }"
          :style="`width:${detailTableContent.width}px`"
        >
          <detailTable
            ref="detailTableRef"
            v-model="selectDefectItem"
            :img-data="imgData"
          />
        </div>
      </div>
    </div>

    <!-- 键盘监听 -->

    <keyBoardListener
      :id-name="'AiRenderIndex'"
      :key-code-form="keyCodeForm"
      :key-method-flag="keyMethodFlag_"
      @choose-all-page="imgSelectClick('2')"
      @choose-cur-page="imgSelectClick('1')"
      @delete-img="deleteImg"
      @down-arrow="handleArrow($event, 'down')"
      @down-page="handlePage($event, 'down')"
      @handle-agree-ai="agreeAiResult"
      @humanng-confirm="humanngConfirm"
      @humanok-confirm="humanokConfirm"
      @left-arrow="handleArrow($event, 'left')"
      @right-arrow="handleArrow($event, 'right')"
      @up-arrow="handleArrow($event, 'up')"
      @up-page="handlePage($event, 'up')"
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
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'

  import vrsService from '@/api/vrsService'
  import solutionController from '@/api/solution'
  import solutionConfig from '@/api/solutionConfig'

  import navPic from './navPic.vue'
  import mainView from './mainView.vue'
  import mainTable from './mainTable.vue'
  import showDefect from './showDefect.vue'

  import detailTable from './detailTable.vue'
  import defectConfigCom from './defectConfig.vue'
  import keyBoardListener from '@/views/components/project/keyboard/index.vue'
  import downloadImgCom from '@/views/components/project/clean/downloadImg/index.vue'
  import { handleDownload, handleDownloadProgress } from '@/utils/request'
  export default {
    components: {
      keyBoardListener,
      downloadImgCom,
      mainView,
      navPic,
      showDefect,
      defectConfigCom,
      mainTable,
      detailTable,
    },
    provide() {
      return {
        enableType: computed(() => this.solutionInfo.enableType),
      }
    },
    props: {
      aiNgCapturePos: {
        type: Array,
        default: () => [],
      },
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
      'firstFinish',
      'openFullscreen',
    ],
    data() {
      return {
        showNavObj: { aiNgCapturePos: [], selectPoint: '' }, //传入到导航子组件的对象
        imgQueryVOCache: {},
        imgData: [], // 图片数据
        currentPage: 0, //发送后台请求时候的页码
        currentPageNum: 1, //当前页面的页码
        currentPageNumOld: 1, //翻页之前的页码
        imgTotal: 0,
        imgSelectRadio: '', //1为当前页全选，2为所有页全选
        imgCacheObj: {}, //图片缓存对象（缓存六页：前两页、当前页、后三页）
        pageTotal: '', //页面总数（总共有多少页）
        isPageDown: '', //向后翻页标识
        pageStep: 1, //翻页的页距
        pageSize: 1,
        debounceTimer: null, //防抖定时器
        debounceTimerNum: 100,
        downloadImgVis: false,
        isRecheckNext: false, //区分数字和下一个发请求标记
        solutionInfo: {}, //当前解决方案信息
        userProConfig: {}, //获取用户项目配置
        unmarkedVis: false, // 一键unmarked
        onlyUpdateUncheck: false,
        vrsCutSet: {
          cutDefectMinSize: 128,
          isShowImg: false,
          isFullScreen: false,
          rowSet: 2,
          colSet: 2,
          isShowImgInfoList: true,
        },
        selectDefectItem: {}, // 选中缺陷
        recordDefectInfo: {}, // 记录产品缺陷列表选中的数据
        navPicObj: {}, //接受导航栏抛出的对象
        productAreaObj: {}, //产品区域对象
        defecLoading: false, //切换行列重新渲染否则页面错乱
        isShowMainView: true, //是否展示缺陷主视图
        isShowImgInfoList: true,
        recordStartVrsSet: {}, // 记录最原始页面的配置
        mainTableStartHeight: 0,
        mainTableContent: {
          width: 0,
          height: 0,
        }, //主表格高度
        isUpdownMove: false, //上下移动
        recordMousedownPoint: {
          x: 0,
          y: 0,
        },
        isLeftRightByMain: false, // 导航图和主视图
        isLeftRightByDefect: false, // 主视图和缺陷小图
        isLeftRightByTable: false,
        mainViewStartWidth: 0, // 开始主视图宽度
        defectViewStartWidth: 0, //开始缺陷宽度
        detailTableStartWidth: 0, //记录缺陷图表宽度
        mainViewContent: {
          width: 0,
          height: 0,
        }, //主视图
        defectViewContent: {
          width: 0,
          height: 0,
        }, //缺陷视图
        detailTableContent: {
          width: 0,
          height: 0,
        },
      }
    },
    computed: {
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
      keyMethodFlag_: {
        get() {
          return this.keyCodeFlag
        },
        set(newVal) {
          this.$emit('update:keyCodeFlag', newVal)
        },
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
          ...this.navPicObj,
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
      aiNgCapturePos: {
        handler(newVal) {
          this.showNavObj.aiNgCapturePos = newVal
        },
        deep: true,
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
    },
    //生命周期 - 挂载完成（访问DOM元素）
    async mounted() {
      await this.$nextTick()
      this.getAqimgBody()
      window.addEventListener('resize', async () => {
        await this.$nextTick()
        this.getAqimgBody()
      })
    },
    methods: {
      // 导航子组件的点击事件返回
      clickNode(data) {
        // console.log('父组件日志：点击了导航栏的节点=', data)
        this.navPicObj = { capturePos: data.point }
        this.$nextTick(() => {
          // 选了产品点击导航图才会触发查询
          if (this.queryCondition.SN) {
            this.$refs.mainTableRef.initGetTableData()
          }
        })
      },
      navNodeInfo(data) {
        // console.log('导航图的子组件名称信息<点位,名称>', data)
        this.productAreaObj = { ...data }
      },
      getAqimgBody() {
        this.defecLoading = false
        setTimeout(() => {
          this.defecLoading = true
        }, 300)
        // 主视图重绘
        this.$refs.mainViewRefs.resetCanvasByResize()
        // 切换区域时调用导航栏内置方法
        this.$refs.navPicRef.renderBoxsWH()
        //表格高度
        this.$refs.mainTableRef.getTableHeight()
        this.$refs.detailTableRef.getTableHeight()
      },

      /**
       * 提供方法给父组件调用  页面初始化时候调用
       */
      initGetImgData() {
        // console.log('diaoyong')
        this.navPicObj = {}
        this.$nextTick(() => {
          this.$refs.mainTableRef.initGetTableData()
        })
      },
      /**
       * 接受子组件方法 缺项表格
       */
      tableRowClick(rowInfo, index) {
        this.handleCurrentChange(index + 1)
        this.showNavObj.selectPoint = rowInfo.capturePos
        this.focusAqimgBody()
      },
      /**
       * 表格第一次触发
       */
      async getInitImageData(rowInfo, index) {
        this.showNavObj.selectPoint = rowInfo.capturePos
        this.currentPageNumOld = index
        await this.getImgCacheList(index, true)
        this.$emit('firstFinish', this.navPicObj) //告诉父组件调用缺陷
      },
      /**
       * 所有页全选或当前页全选
       */
      imgSelectClick(index) {
        if (this.imgSelectRadio === index) {
          this.imgSelectRadio = ''
          this.imgData.forEach((item) => (item.select = false))
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
        this.imgData.forEach((el) => (el.select = true))
      },
      /**
       * 主视图点击
       */
      mainViewClick() {
        this.imgData.forEach((el) => (el.select = true))
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
       * 删除图片
       *
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
        // 删除全部要提示

        this.$confirm('是否删除数据', {
          type: 'warning',
        }).then(() => {
          this.deleteSourceImage(query)
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

        const queryInfo = {
          pageCondition: {
            page: pageNum,
            pageSize: this.pageSize,
          },
          cutDefectMinSize: this.vrsCutSet.cutDefectMinSize,
          resetImgIdCache: true,
          imgType: 0,
          cutDefectImageMultiple: 1,
          ...this.searchImgCondition,
        }
        this.vrsCutSet.isShowImg && (queryInfo.imgType = 1)
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
          dataList.forEach((el) => {
            el.select = true
          })

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
        } else if (res.data === null) {
          this.$msg.error(translate('无数据'))
          this.imgData = []
          this.imgTotal = 0
          this.pageTotal = 0
        }
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

      // 上一张下一张左一张右一张
      handleArrow(e, type) {
        switch (type) {
          case 'up':
            this.debounceTimer && clearTimeout(this.debounceTimer)
            this.debounceTimer = setTimeout(() => {
              this.$refs.mainTableRef.selectUpRow()
            }, this.debounceTimerNum)
            break
          case 'down':
            this.debounceTimer && clearTimeout(this.debounceTimer)
            this.debounceTimer = setTimeout(() => {
              this.$refs.mainTableRef.selectNextRow()
            }, this.debounceTimerNum)
            break
          case 'left':
            this.debounceTimer && clearTimeout(this.debounceTimer)
            this.debounceTimer = setTimeout(() => {
              this.$refs.showDefectRef.selectUp()
            }, this.debounceTimerNum)
            break
          case 'right':
            this.debounceTimer && clearTimeout(this.debounceTimer)
            this.debounceTimer = setTimeout(() => {
              this.$refs.showDefectRef.selectNext()
            }, this.debounceTimerNum)
            break
        }
      },
      /**
       * 上一页 、下一页
       */

      handlePage(e, type) {
        switch (type) {
          case 'up':
            this.debounceTimer && clearTimeout(this.debounceTimer)
            this.debounceTimer = setTimeout(() => {
              this.$refs.showDefectRef.selectUpPage()
            }, this.debounceTimerNum)
            break
          case 'down':
            this.debounceTimer && clearTimeout(this.debounceTimer)
            this.debounceTimer = setTimeout(() => {
              this.$refs.showDefectRef.selectNextPage()
            }, this.debounceTimerNum)
            break
        }
      },

      /**
       * 选中当前页面第一张图片
       */
      selectFirstImg() {
        this.$nextTick(() => {
          this.imgData.forEach((item) => {
            item.select = true
          })
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
          // if (_imgIds.length === 1) {
          //   this.$msg.success(res.msg)
          //   this.listImgLabel(_imgIds[0])
          // } else {
          //   // 当前页面刷新
          // }
          this.getImgCacheList(this.currentPageNum - 1, false)
        }
      },

      /**
       * 翻页事件
       * @param {Integer} newPage 即将跳转的新页面页码
       */
      async handleCurrentChange(newPage) {
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
          text: '数据加载中',
          background: 'rgba(0, 0, 0, 0.7)',
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
          // console.log('_num::::', _num)
          this.imgSelectRadio = ''
          this.$msg.success(res.msg)
          let _num = 0
          if (condition.operator === 2) {
            _num = await this.$refs.mainTableRef.refreshTableByDelete(true)
          } else {
            _num = await this.$refs.mainTableRef.refreshTableByDelete()
          }
          this.getImgCacheList(_num, true)
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
          const _vrsCutConfig = res.data?.vrsCutConfig
          _vrsCutConfig && (this.vrsCutSet = JSON.parse(_vrsCutConfig))
          this.recordStartVrsSet = { ...this.vrsCutSet }
          this.isShowMainView = this.vrsCutSet.isShowImg
          this.isShowImgInfoList = this.vrsCutSet.isShowImgInfoList
          this.$emit('openFullscreen', this.vrsCutSet.isFullScreen)
        }
      },
      /**
       * 保存用户配置
       */
      async saveOrUpdateUserProjectConfig() {
        const query = { ...this.userProConfig }
        query.vrsCutConfig = JSON.stringify(this.vrsCutSet)
        await solutionConfig.saveOrUpdateUserProjectConfig(query)
        // 判断 主视图是否显示 重置变量
        this.resetParamByShowMainView()
        await this.getUserProjectConfig()
      },

      /**
       *更新人工结果 OK/NG/Check
       */
      async updateHumanResult(type) {
        let _imgId = 0
        _imgId = this.imgData.find((el) => el.select)?.id
        const _query = {
          imgId: _imgId,
          humanResult: type,
        }
        const _labelIds = []
        this.selectDefectItem?.id && _labelIds.push(this.selectDefectItem.id)
        _labelIds.length && (_query.labelIds = _labelIds)
        const res = await vrsService.updateLabelHumanResult(_query)
        if (res.code === 0) {
          this.$msg.success(res.msg)
          this.imgSelectRadio = ''
          this.$nextTick(() => {
            this.imgData.forEach((el) => {
              if (el.select) {
                if (this.selectDefectItem?.id) {
                  el.labels.forEach((it) => {
                    if (it.id === this.selectDefectItem.id) {
                      it.humanResult = type
                    }
                  })
                }
                el.humanResult = res.data
                this.$refs.mainTableRef.updateHumanResult(res.data)
              }
            })
          })
        }
      },
      /**
       * 更新人工结果OK/NG
       * @param {String} resultType 人工结果 OK NG
       */

      updateHumanResultByType(resultType) {
        if (this.imgSelectRadio === '2') {
          return this.$msg.error(translate('不支持批量更新人工结果'))
        }
        this.updateHumanResult(resultType)
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
        this.updateHumanResultByType('OK')
      },
      /**
       * 快捷键NG
       */
      humanngConfirm() {
        this.updateHumanResultByType('NG')
      },

      /**
       *裁剪设置
       @param {Boolean} isRequest 裁剪尺寸变化或主视图显示隐藏
       */
      setConfirm(isRequest = true) {
        this.$nextTick(async () => {
          await this.saveOrUpdateUserProjectConfig()
          this.getAqimgBody()
          if (!isRequest) return
          // console.log('this.queryCondition::', this.queryCondition)
          if (!this.imgData.length) return
          this.getImgCacheList(this.currentPageNum - 1, false)
        })
      },
      /**
       * 聚焦到主页面
       */
      focusAqimgBody() {
        document.getElementById('vrsContentId').setAttribute('tabIndex', '-1')
        document.getElementById('vrsContentId').focus()
      },
      /**
       * 提供一个方法给父组件调用 小缺陷选中
       * @param {Object} defectInfo //
       */
      async setMainTableRowByDefect(defectInfo) {
        await this.$refs.mainTableRef.setSelectRowBycacheIndex(
          defectInfo.cacheIndex
        )
        this.recordDefectInfo = { ...defectInfo } //翻页跨级太大需要
        this.selectDefectItem = { ...defectInfo }
      },
      /**
       * 根据是否显示主视图重置变量
       */
      resetParamByShowMainView() {
        if (
          (this.vrsCutSet.isShowImg && !this.isShowMainView) ||
          (!this.vrsCutSet.isShowImg && this.isShowMainView)
        ) {
          this.mainViewContent = {
            width: 0,
            height: 0,
          }
        }
      },

      /**
       * 上下移动
       */
      updownDown(e) {
        this.isUpdownMove = true
        const { x, y } = e
        this.recordMousedownPoint.x = x
        this.recordMousedownPoint.y = y
        this.getMainTableContent()
      },
      mouseUpInBody() {
        if (
          this.isUpdownMove ||
          this.isLeftRightByMain ||
          this.isLeftRightByDefect
        ) {
          this.getAqimgBody()
        }
        this.isUpdownMove = false
        this.isLeftRightByMain = false
        this.isLeftRightByDefect = false
        this.isLeftRightByTable = false
      },
      updownLeave() {
        this.isUpdownMove = false
        this.isLeftRightByMain = false
        this.isLeftRightByDefect = false
      },
      mouseMoveInBody(e) {
        if (this.isUpdownMove) {
          // 上下区域
          const { y } = e
          const _newVal = this.recordMousedownPoint.y - y
          this.mainTableContent.height = this.mainTableStartHeight + _newVal
        } else if (this.isLeftRightByMain) {
          const { x } = e
          const _newVal = this.recordMousedownPoint.x - x
          this.mainViewContent.width = this.mainViewStartWidth + _newVal
        } else if (this.isLeftRightByDefect) {
          const { x } = e
          const _newVal = this.recordMousedownPoint.x - x
          this.defectViewContent.width = this.defectViewStartWidth + _newVal
          this.mainViewContent.width = this.mainViewStartWidth - _newVal
        } else if (this.isLeftRightByTable) {
          // 缺陷详情表格
          const { x } = e
          const _newVal = this.recordMousedownPoint.x - x
          this.detailTableContent.width = this.detailTableStartWidth + _newVal
        }
      },
      /**
       * 获取表格区域高度
       */
      getMainTableContent() {
        const _dom = this.$refs.mianTableBoxRef
        if (_dom) {
          // console.log('getMainTableContent::', _dom.clientHeight)
          this.mainTableContent.height = _dom.clientHeight
          this.mainTableStartHeight = _dom.clientHeight
        }
      },
      /**
       * 主视图和导航图之间的拉伸
       */
      leftRightByMainDown(e) {
        this.isLeftRightByMain = true
        const { x, y } = e
        this.recordMousedownPoint.x = x
        this.recordMousedownPoint.y = y
        this.getMainViewContent()
        this.getDefectViewContent()
      },
      /**
       * 获取主视图宽度
       */
      getMainViewContent() {
        const _dom = this.$refs.mainImgRef
        if (_dom) {
          // console.log('getMainTableContent::', _dom.clientWidth)
          this.mainViewContent.width = _dom.clientWidth
          this.mainViewStartWidth = _dom.clientWidth
        }
      },
      /**
       * 主视图和缺陷小图
       */
      leftRightByDefectDown(e) {
        this.isLeftRightByDefect = true
        const { x, y } = e
        this.recordMousedownPoint.x = x
        this.recordMousedownPoint.y = y
        this.getMainViewContent()
        this.getDefectViewContent()
      },
      getDefectViewContent() {
        const _dom = this.$refs.rightImgRef
        if (_dom) {
          // console.log('getMainTableContent::', _dom.clientHeight)
          this.defectViewContent.width = _dom.clientWidth
          this.defectViewStartWidth = _dom.clientWidth
        }
      },
      leftRightByDetailTableDown(e) {
        this.isLeftRightByTable = true
        const { x, y } = e
        this.recordMousedownPoint.x = x
        this.recordMousedownPoint.y = y
        this.getDetailTableContent()
      },
      /**
       * 获取缺陷详情表格宽度
       */
      getDetailTableContent() {
        const _dom = this.$refs.detailTabelRef
        if (_dom) {
          // console.log('getMainTableContent::', _dom.clientHeight)
          this.detailTableContent.width = _dom.clientWidth
          this.detailTableStartWidth = _dom.clientWidth
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  @import './index';
</style>
