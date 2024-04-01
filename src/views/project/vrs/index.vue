<!--  -->
<template>
  <div
    :class="{ 'vrs-body': true, fullScreen: isFullScreen }"
    @contextmenu="openContextmenu"
  >
    <div id="vrsBodyId" :class="['left-content']">
      <!-- 标注 -->
      <aqlabelView
        v-if="vrsType === 'aqlabel'"
        ref="aqlabelRef"
        v-model:current-img-num="recordPageNum"
        v-model:keycode-flag="keycodeFlag"
        v-model:label-names="labelNames"
        v-model:select-imginfo="selectImginfo"
        :query-condition="mergeQueryByProAndImg"
        @add-label="listCondition"
      >
        <el-select v-model="selectVrsType" style="width: 110px">
          <el-option :label="translate('复检页面1')" value="aqimg" />
          <el-option :label="translate('标注页面')" value="aqlabel" />
          <el-option :label="translate('复检页面2')" value="aiRender" />
        </el-select>
        <template #archiveData>
          <el-checkbox
            v-model="backupMode"
            :label="translate('查看归档数据')"
            style="margin-right: 10px"
            @change="backupModeChange"
          />
        </template>
        <template #imgDimensions>
          <imgForm
            v-model="imgQuery"
            v-model:bankeycode="keycodeFlag"
            :label-names="labelNames"
            :station-names="stationNames"
            @submit-form="imgDimensionsSubmitForm"
          />
        </template>
      </aqlabelView>
      <!-- 查看图片 -->
      <aqimgView
        v-if="vrsType === 'aqimg'"
        ref="aqimgRef"
        v-model:current-img-num="recordPageNum"
        v-model:key-code-flag="keycodeFlag"
        v-model:select-imginfo="selectImginfo"
        :query-condition="mergeQueryByProAndImg"
      >
        <el-select v-model="selectVrsType" style="width: 110px">
          <el-option :label="translate('复检页面1')" value="aqimg" />
          <el-option :label="translate('标注页面')" value="aqlabel" />
          <el-option :label="translate('复检页面2')" value="aiRender" />
        </el-select>
        <template #imgDimensions>
          <imgForm
            v-model="imgQuery"
            v-model:bankeycode="keycodeFlag"
            :label-names="labelNames"
            :station-names="stationNames"
            @submit-form="imgDimensionsSubmitForm"
          />
        </template>
        <template #controlBtns>
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
        </template>
        <template #archiveData>
          <el-checkbox
            v-model="backupMode"
            :label="translate('查看归档数据')"
            style="margin-right: 10px"
            @change="backupModeChange"
          />
        </template>
      </aqimgView>
      <aiRenderings
        v-if="vrsType === 'aiRender'"
        ref="aqRenderRef"
        v-model:current-img-num="recordPageNum"
        v-model:key-code-flag="keycodeFlag"
        v-model:select-imginfo="selectImginfo"
        :ai-ng-capture-pos="aiNgCapturePos"
        :query-condition="mergeQueryByProAndImg"
        @first-finish="firstFinish"
        @open-fullscreen="openFullscreen"
      >
        <el-select v-model="selectVrsType" style="width: 110px">
          <el-option :label="translate('复检页面1')" value="aqimg" />
          <el-option :label="translate('标注页面')" value="aqlabel" />
          <el-option :label="translate('复检页面2')" value="aiRender" />
        </el-select>
        <template #imgDimensions>
          <imgForm
            v-model="imgQuery"
            v-model:bankeycode="keycodeFlag"
            :label-names="labelNames"
            :station-names="stationNames"
            @submit-form="imgDimensionsSubmitForm"
          />
        </template>
        <template #controlBtns>
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
        </template>
        <template #archiveData>
          <el-checkbox
            v-model="backupMode"
            :label="translate('查看归档数据')"
            style="margin-right: 10px"
            @change="backupModeChange"
          />
        </template>
      </aiRenderings>
    </div>
    <div v-show="!isSideClose" style="width: 5px"></div>
    <div v-show="!isSideClose" class="right-content">
      <el-tabs class="tabs-height" type="border-card">
        <el-tab-pane :label="translate('查询')">
          <queryCom
            ref="queryFormRef"
            v-model="queryCondition"
            v-model:bankeycode="keycodeFlag"
            :backup-mode="backupMode"
            :batch-names="batchNames"
            :machine-names="machineNames"
            :show-defect-by-airender="isAirenderPage"
            @query-condition-click="queryConditionClick"
          >
            <template #defectList>
              <defectListTable
                ref="defectListRef"
                :query-condition="mergeQueryByProAndImg"
                @defect-row-click="defectRowClick"
              />
            </template>
          </queryCom>
        </el-tab-pane>
        <el-tab-pane :label="translate('详情')">
          <div
            style="
              width: 100%;
              height: 100%;
              padding-right: 4px;
              overflow: auto;
            "
          >
            <imgDetails
              :is-multiple-selected-img="isSelectImginfo"
              :selected-img-info="selectImginfo"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <keyBoardListener
      :id-name="'VrsIndex'"
      :key-code-form="keyCodeForm"
      :key-method-flag="keyMethodFlag_"
      @fullscreen="fullScreenMethod"
      @handle-letter="focusSN"
      @handle-number="focusSN"
      @switch-ai-render="switchAiRender"
      @switch-img="switchImg"
      @switch-label="switchLabel"
      @switch-tab="isWideScreenMethod"
    />
  </div>
</template>
<script>
  import { translate } from '@/i18n'
  import vrsService from '@/api/vrsService'
  import queryCom from '@/views/components/project/vrs/query/index.vue'
  import aqimgView from '@/views/components/project/vrs/aqimgView/index.vue'
  import aqlabelView from '@/views/components/project/vrs/aqlabelView/index.vue'
  import imgDetails from '@/views/components/project/clean/detailsImg/index.vue'
  import aiRenderings from '@/views/components/project/vrs/aiRenderings/index.vue'
  import imgForm from '@/views/components/project/vrs/imgDimensions/index.vue'
  import defectListTable from '@/views/components/project/vrs/defectListTable/index.vue'

  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
  import keyBoardListener from '@/views/components/project/keyboard/index.vue'
  export default {
    components: {
      queryCom,
      aqlabelView,
      aqimgView,
      imgDetails,
      keyBoardListener,
      aiRenderings,
      imgForm,
      defectListTable,
    },
    provide() {
      return {
        labelNames: computed(() => this.labelNames),
      }
    },
    async beforeRouteLeave(to, form, next) {
      if (this.vrsType === 'aqlabel') {
        const res = await this.$refs.aqlabelRef.callBackInAQV()
        if (res) next(false)
      }
      next()
    },
    data() {
      return {
        vrsType: 'aiRender',
        selectVrsType: 'aiRender',
        isFullScreen: false,
        isSideClose: false,
        queryCondition: {},
        currentImgNum: 0, // 标注和看图切换需要的参数
        recordPageNum: 0, // 记录当前几张图片
        stationNames: [], //工位
        labelNames: [],
        machineNames: [], //机台
        batchNames: [], //批次
        selectImginfo: {},
        aiNgCapturePos: [], // aing的点位
        backupMode: false, // 查看归档数据
        keycodeFlag: true, // 开启快捷键功能
        imgDimensionsForm: {
          stationName: [],
          capturePos: '',
          aiResult: ['NG'],
          aiLabel: [],
          humanResult: [],
          resultType: [],
        },
        imgQuery: {
          stationName: [],
          capturePos: '',
          aiResult: ['NG'],
          aiLabel: [],
          humanResult: [],
          resultType: [],
        },
      }
    },

    computed: {
      translate() {
        return translate
      },
      ...mapStores(recordProInfo),
      keyCodeForm() {
        const keysForm = this.projectStore.keyCodeForm
        const keys = {
          ...keysForm.common,
          ...keysForm.vrs,
        }
        return keys
      },
      keyMethodFlag_() {
        return this.keycodeFlag
      },

      isSelectImginfo() {
        if (this.selectImginfo && JSON.stringify(this.selectImginfo) !== '{}') {
          return true
        } else {
          return false
        }
      },
      /**
       * 合并图片维度和产品维度
       */
      mergeQueryByProAndImg() {
        const _mergeObj = Object.assign(
          { ...this.queryCondition },
          { ...this.imgDimensionsForm }
        )
        return _mergeObj
      },
      isAirenderPage() {
        if (this.vrsType === 'aiRender') {
          return true
        }
        return false
      },
    },
    watch: {
      async selectVrsType(newVal, oldVal) {
        if (oldVal === 'aqlabel') {
          const res = await this.$refs.aqlabelRef.callBackInAQV()
          if (res) return false
        }
        this.vrsType = newVal
      },
    },
    created() {
      this.listCondition()
    },
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      /**
       * 当前页面阻止右键默认事件
       */
      openContextmenu(e) {
        e.button === 2 && e.preventDefault()
      },
      /**
       * 全屏
       */
      async fullScreenMethod() {
        if (this.vrsType === 'aqlabel') return
        this.isFullScreen = !this.isFullScreen
        await this.$nextTick()
        this.resetAqimgBody()
      },
      /**
       * 侧边栏
       */
      async isWideScreenMethod() {
        if (this.vrsType === 'aqlabel') return
        this.isSideClose = !this.isSideClose
        await this.$nextTick()
        this.resetAqimgBody()
      },
      /**
       * 重置页面图片宽高
       */
      resetAqimgBody() {
        this.vrsType === 'aqimg' && this.$refs.aqimgRef.getAqimgBody()
        this.vrsType === 'aiRender' && this.$refs.aqRenderRef.getAqimgBody()
      },
      /**
       * 查询条件触发
       */
      async queryConditionClick() {
        // this.imgQuery = {
        //   stationName: [],
        //   capturePos: '',
        //   aiResult: [],
        //   aiLabel: [],
        //   humanResult: [],
        //   resultType: [],
        // }
        // this.imgDimensionsForm = {}
        // console.log('查询条件对象::::', this.queryCondition)
        await this.listProductCondition()
        this.recordPageNum = 0
        this.$nextTick(() => {
          this.vrsType === 'aqimg' && this.$refs.aqimgRef.initGetImgData()
          this.vrsType === 'aqlabel' && this.$refs.aqlabelRef.initGetImgData()
          this.vrsType === 'aiRender' && this.$refs.aqRenderRef.initGetImgData()
          this.focusAqimgBody()
        })
      },
      /**
       * 获取项目的标签
       */
      async listCondition() {
        const res = await vrsService.listCondition({})
        if (res.code === 0 && res.data) {
          this.machineNames = res.data.machineNames ? res.data.machineNames : []
          this.batchNames = res.data.batchNames ? res.data.batchNames : []
        }
      },
      /**
       * 查询图片维度
       */
      async listProductCondition() {
        const query = {
          SN: this.queryCondition.SN,
          detectTimeAt: this.queryCondition.detectTimeAt,
        }
        const res = await vrsService.listProductCondition(query)
        if (res.code === 0) {
          this.aiNgCapturePos = res.data.aiNgCapturePos
          // console.log('res:::', res)
          if (Array.isArray(res.data.stationNames)) {
            this.stationNames = res.data.stationNames.filter((el) => el)
          } else {
            this.stationNames = []
          }
          if (Array.isArray(res.data.labelNames)) {
            this.labelNames = res.data.labelNames
              .filter((el) => el)
              .map((el, index) => ({
                tagId: index,
                label: el,
              }))
          } else {
            this.labelNames = []
          }
        }
      },
      /**
       * 查看归档数据值改变
       */
      backupModeChange() {
        if (JSON.stringify(this.queryCondition) === '{}') return
        this.queryCondition.listCondition['backupMode'] = this.backupMode
        this.queryConditionClick()
      },
      /**
       * 图片维度提交表单
       */
      imgDimensionsSubmitForm(form) {
        this.imgDimensionsForm = { ...form }
        if (JSON.stringify(this.queryCondition) === '{}') return
        this.$nextTick(() => {
          this.recordPageNum = 0
          this.vrsType === 'aqimg' && this.$refs.aqimgRef.initGetImgData()
          this.vrsType === 'aqlabel' && this.$refs.aqlabelRef.initGetImgData()
          this.vrsType === 'aiRender' && this.$refs.aqRenderRef.initGetImgData()
        })
      },

      switchImg() {
        this.selectVrsType = 'aqimg'
      },
      switchAiRender() {
        this.selectVrsType = 'aiRender'
      },
      switchLabel() {
        this.selectVrsType = 'aqlabel'
      },
      /**
       * 聚焦SN
       */
      focusSN(e) {
        this.$refs.queryFormRef.focusSn(e)
      },
      /**
       * 聚焦到主页面
       */
      focusAqimgBody() {
        document.getElementById('vrsBodyId').setAttribute('tabIndex', '-1')
        document.getElementById('vrsBodyId').focus()
      },
      /**
       * 接受复检页面2 第一次
       * @param {Object} navPicInfo 点击导航栏信息
       */
      firstFinish(navPicInfo) {
        this.vrsType === 'aiRender' &&
          this.$refs.defectListRef.initDefectListByPage(navPicInfo)
      },
      /**
       * defectRowClick 小缺项点击触发
       */
      defectRowClick(rowInfo) {
        this.vrsType === 'aiRender' &&
          this.$refs.aqRenderRef.setMainTableRowByDefect(rowInfo)
      },
      /**
       * 根据用户配置全屏
       */
      openFullscreen(isOpen) {
        if ((!isOpen && this.isFullScreen) || (isOpen && !this.isFullScreen)) {
          this.fullScreenMethod()
        } else {
          return
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  @import './index.scss';
</style>
