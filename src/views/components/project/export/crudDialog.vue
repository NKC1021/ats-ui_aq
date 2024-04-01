<!--  -->
<template>
  <div>
    <el-dialog
      v-model="dialogVis"
      :before-close="closeDialog"
      class="export-dialog"
      :close-on-click-modal="false"
      :title="dialogTitle"
      top="6vh"
    >
      <el-tabs
        v-model="currentTab"
        type="border-card"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          label="VRS复检"
          name="vrsTab"
          :disabled="this.dialogType === 'edit' && this.currentTab !== 'vrsTab'"
        >
          <VrsFormVue
            ref="vrsFormRef"
            v-model:current-row="currentRowComputed"
            v-model:dialog-type="dialogTypeComputed"
            v-model:show="dialogVis"
            @success="submitSuccess"
          />
        </el-tab-pane>
        <el-tab-pane
          label="数据清洗"
          name="pickPicTab"
          :disabled="
            this.dialogType === 'edit' && this.currentTab !== 'pickPicTab'
          "
        >
          <el-form
            ref="formRef"
            label-width="120px"
            :model="exportForm"
            :rules="exportRules"
          >
            <el-row>
              <el-col :span="12">
                <el-form-item :label="translate('导出条件名称')" prop="name">
                  <el-input v-model="exportForm.name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="translate('图片数量')" prop="picNum">
                  <el-select v-model="exportForm.picNum" style="width: 100%">
                    <el-option
                      v-for="(item, index) in picNumList"
                      :key="index"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="translate('图片类型')" prop="imgType">
                  <el-select v-model="exportForm.imgType" style="width: 100%">
                    <el-option
                      v-for="(item, index) in imgTypeList"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="translate('工厂名称')" prop="factoryName">
                  <el-input v-model="exportForm.factoryName" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="translate('线体名称')" prop="lineName">
                  <el-input v-model="exportForm.lineName" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="translate('设备名称')" prop="machineName">
                  <el-input v-model="exportForm.machineName" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="translate('工位名称')" prop="station">
                  <el-select v-model="exportForm.station" style="width: 100%">
                    <el-option
                      v-for="(item, index) in stationList"
                      :key="index"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="translate('相机编号')" prop="cameraCode">
                  <el-select
                    v-model="exportForm.cameraCode"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="(item, index) in cameraCodeList"
                      :key="index"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="translate('采图点位')" prop="point">
                  <el-input v-model="exportForm.point" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="translate('光照ID')" prop="opticsType">
                  <el-select
                    v-model="exportForm.opticsType"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="(item, index) in opticsTypeList"
                      :key="index"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item
                  :label="translate('模型名称')"
                  prop="sourceModelName"
                >
                  <el-select
                    v-model="exportForm.sourceModelName"
                    clearable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="(item, index) in sourceModelList"
                      :key="index"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-row :gutter="15" style="width: 100%">
                  <el-col :span="20">
                    <el-form-item
                      :label="translate('图片效果')"
                      prop="labelOption"
                    >
                      <el-radio-group
                        v-model="exportForm.labelOption"
                        @change="labelOptionChangeChange"
                      >
                        <el-radio :label="1">{{ translate('原图') }}</el-radio>
                        <el-radio :label="2">
                          {{ translate('标注效果图') }}
                        </el-radio>
                        <el-radio :label="3">
                          {{ translate('AI效果图') }}
                        </el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col :span="3">
                    <el-checkbox
                      v-model="exportForm.isRender"
                      :disabled="
                        exportForm.type !== 1 || exportForm.labelOption === 1
                      "
                      :false-label="0"
                      :label="translate('是否渲染')"
                      size="large"
                      :true-label="1"
                    />
                  </el-col>
                </el-row>
              </el-col>
              <el-col :span="24">
                <el-form-item :label="translate('导出类型')" prop="type">
                  <el-row :gutter="15" style="width: 100%">
                    <el-col :span="20">
                      <el-select
                        v-model="exportForm.type"
                        style="width: 100%"
                        @change="typeChange"
                      >
                        <el-option
                          v-for="(item, index) in typeList"
                          :key="index"
                          :label="item.label"
                          :value="item.value"
                        />
                      </el-select>
                    </el-col>
                    <el-col :span="3">
                      <el-checkbox
                        v-model="exportForm.keepOriginName"
                        :disabled="exportForm.type !== 1"
                        :label="translate('保留原始文件名')"
                        size="large"
                      />
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item :label="translate('导出路径')" prop="path">
                  <el-input v-model="exportForm.path" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item :label="translate('AI工程')" prop="aiEngin">
                  <el-select
                    v-model="exportForm.aiEngin"
                    filterable
                    multiple
                    style="width: 100%"
                  >
                    <el-option
                      v-for="(item, index) in aiEnginList"
                      :key="index"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item
                  :label="translate('客户缺陷')"
                  prop="customDefect"
                >
                  <el-select
                    v-model="exportForm.customDefect"
                    filterable
                    multiple
                    style="width: 100%"
                  >
                    <el-option
                      v-for="(item, index) in customDefectList"
                      :key="index"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item :label="translate('工程缺陷')" prop="enginDefect">
                  <el-select
                    v-model="exportForm.enginDefect"
                    filterable
                    multiple
                    style="width: 100%"
                  >
                    <el-option
                      v-for="(item, index) in enginDefectList"
                      :key="index"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <el-button @click="closeDialog">
                {{ translate('取消') }}
              </el-button>
              <el-button type="primary" @click="formSubmit">
                {{ translate('确定') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import solutionExport from '@/api/solutionExport'
  import vrsService from '@/api/vrsService'
  import { shortcutsList } from '@/utils/timeConst'
  import VrsFormVue from './vrsForm.vue'

  export default {
    components: { VrsFormVue },
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      dialogType: {
        type: String,
        default: 'add',
      },
      currentRow: {
        type: Object,
        default: () => ({}),
      },
      criteriaData: {
        type: Object,
        default: () => ({}),
      },
    },
    emits: ['update:show', 'update:currentRow', 'update:dialogType', 'success'],
    data() {
      const checkPoint = (rule, value, callBack) => {
        const reg = /^\d+-\d+$|^\d+$/
        if (value && !reg.test(value))
          return callBack(new Error('只能输入全数字,或者1-3形式的值'))
        callBack()
      }
      return {
        currentTab: 'vrsTab', // 初始选中的 tab
        typeList: [
          {
            label: translate('AIDI工程(首个模块)'),
            value: 2,
          },
          {
            label: translate('AIDI工程(工厂模式)'),
            value: 3,
          },
          {
            label: translate('指定目录'),
            value: 1,
          },
        ],
        imgTypeList: [
          { label: 'JPG', value: 'jpg' },
          { label: 'PNG', value: 'png' },
          { label: 'BMP', value: 'bmp' },
        ],
        picNumList: 10,
        exportRules: {
          name: [{ required: true, message: '必填', trigger: 'blur' }],
          picNum: [{ required: true, message: '必填', trigger: 'change' }],
          imgType: [{ required: true, message: '必填', trigger: 'change' }],
          type: [{ required: true, message: '必填', trigger: 'change' }],
          path: [{ required: true, message: '必填', trigger: 'blur' }],
          point: [{ validator: checkPoint, trigger: 'blur' }],
          labelOption: [{ required: true, message: '必填', trigger: 'change' }],
        },
        exportForm: {
          name: '',
          picNum: '',
          imgType: '',
          factoryName: '',
          lineName: '',
          machineName: '',
          station: '',
          cameraCode: '',
          point: '',
          opticsType: '',
          sourceModelName: '',
          type: '',
          path: '',
          aiEngin: [],
          customDefect: [],
          enginDefect: [],
          labelOption: 1,
          isRender: 0,
          exportType: 1, //数据清洗
        },

        defaultTime: [
          new Date(2000, 1, 1, 0, 0, 0),
          new Date(2000, 2, 1, 23, 59, 59),
        ],
        machineNames: [],
        batchNames: [],
      }
    },
    computed: {
      shortcuts() {
        return shortcutsList
      },
      currentRowComputed: {
        get() {
          return this.currentRow
        },
        set() {
          this.$emit('update:currentRow', {})
        },
      },
      dialogTypeComputed: {
        get() {
          return this.dialogType
        },
        set() {
          this.$emit('update:dialogType', 'add')
        },
      },
      translate() {
        return translate
      },
      dialogTitle() {
        if (this.dialogType === 'add') {
          return translate('新增')
        }
        if (this.dialogType === 'edit') {
          return translate('编辑')
        }
        return ''
      },
      dialogVis: {
        get() {
          return this.show
        },
        set(newVal) {
          this.$emit('update:show', newVal)
        },
      },
      /**
       * 工位
       */
      stationList() {
        let _arr = []
        if (this.criteriaData.stationSet) {
          const _list = this.criteriaData.stationSet
          _arr = _list.filter((el) => el)
        }
        return _arr
      },
      /**
       * 相机编号
       */
      cameraCodeList() {
        let _arr = []
        if (this.criteriaData.cameraCodeSet) {
          const _list = this.criteriaData.cameraCodeSet
          _arr = _list.filter((el) => el)
        }
        return _arr
      },
      /**
       * 光照ID
       */
      opticsTypeList() {
        let _arr = []
        if (this.criteriaData.opticsSet) {
          const _list = this.criteriaData.opticsSet
          _arr = _list.filter((el) => el)
        }
        return _arr
      },
      /**
       * 模型
       */
      sourceModelList() {
        let _arr = []
        if (this.criteriaData.sourceModelName) {
          const _list = this.criteriaData.sourceModelName
          _arr = _list.filter((el) => el)
        }
        return _arr
      },
      /**
       * 客户缺陷
       */
      customDefectList() {
        let _arr = []
        if (this.criteriaData.customDefectSet) {
          const _list = this.criteriaData.customDefectSet
          _arr = _list.filter((el) => el)
        }
        return _arr
      },
      /**
       * AI工程
       */
      aiEnginList() {
        let _arr = []
        if (this.criteriaData.aiEnginSet) {
          const _list = this.criteriaData.aiEnginSet
          _arr = _list.filter((el) => el)
        }
        return _arr
      },
      /**
       * 工程缺陷
       */
      enginDefectList() {
        let _arr = []
        if (this.criteriaData.enginDefectSet) {
          const _list = this.criteriaData.enginDefectSet
          _arr = _list.filter((el) => el)
        }
        return _arr
      },
    },
    watch: {
      currentRow(newVal) {
        // 根据导出类型，自动切换tab
        if (newVal.exportType === 3) {
          this.currentTab = 'vrsTab'
        } else {
          this.currentTab = 'pickPicTab'
        }
        // 编辑时，回显数据
        if (this.dialogType === 'edit' && JSON.stringify(newVal) !== '{}') {
          this.exportForm = { ...this.currentRow }
          this.exportForm.customDefect = newVal.customDefect
            .split(',')
            .filter((el) => el)
          this.exportForm.enginDefect = newVal.enginDefect
            .split(',')
            .filter((el) => el)
          this.exportForm.aiEngin = newVal.aiEngin.split(',').filter((el) => el)
        }
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      labelOptionChangeChange() {
        if (this.exportForm.labelOption === 1) {
          this.exportForm.isRender = 0
        }
      },

      handleTabClick(tab) {
        this.currentTab = tab.name
        this.listCondition()
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
      typeChange() {
        this.exportForm.keepOriginName = false
        if (this.exportForm.type !== 1) {
          // 导出到AIDI工程的，不可渲染
          this.exportForm.isRender = 0
        }
      },

      /**
       * 关闭弹窗
       */
      closeDialog() {
        this.dialogVis = false
        this.exportForm = {
          name: '',
          picNum: '',
          imgType: '',
          factoryName: '',
          lineName: '',
          machineName: '',
          station: '',
          cameraCode: '',
          point: '',
          opticsType: '',
          sourceModelName: '',
          type: '',
          path: '',
          aiEngin: [],
          customDefect: [],
          enginDefect: [],
          keepOriginName: false,
          labelOption: 1,
          isRender: 0,
          exportType: 1,
        }
        this.$emit('update:currentRow', {})
        this.$emit('update:dialogType', 'add')
        this.$refs.formRef.resetFields()
        this.$refs.vrsFormRef.closeDialog2()
      },

      formSubmit() {
        this.$refs.formRef.validate(async (val) => {
          if (!val) return
          const query = { ...this.exportForm }
          query.customDefect = query.customDefect.join(',')
          query.enginDefect = query.enginDefect.join(',')
          query.aiEngin = query.aiEngin.join(',')
          const res = await solutionExport.saveOrUpdatePickPicExport(query)
          if (res.code === 0) {
            this.closeDialog()
            this.$emit('success')
          }
        })
      },
      submitSuccess() {
        this.$emit('success')
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  :deep() {
    .export-dialog {
      .el-dialog__body {
        padding: 10px 10px 15px 10px;
      }
    }
  }
</style>
