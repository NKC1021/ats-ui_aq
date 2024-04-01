<!--  -->
<template>
  <div>
    <el-form
      ref="formRef2"
      label-width="120px"
      :model="exportForm2"
      :rules="exportRules"
    >
      <el-row>
        <el-col :span="24">
          <h3>产品筛选条件</h3>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="translate('SN')">
            <el-select
              v-model="queryForm.SN"
              allow-create
              filterable
              multiple
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="translate('日期')" prop="dateTimes">
            <el-date-picker
              v-model="queryForm.dateTimes"
              :default-time="defaultTime"
              :end-placeholder="translate('结束时间')"
              :range-separator="translate('至')"
              :shortcuts="shortcuts"
              :start-placeholder="translate('开始时间')"
              type="datetimerange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="translate('机台')" prop="machineName">
            <el-select
              v-model="queryForm.machineName"
              allow-create
              clearable
              collapse-tags
              collapse-tags-tooltip
              :filter-method="filterMachineMethod"
              filterable
              multiple
              style="width: 100%"
            >
              <el-option
                v-for="(el, index) in filterMachineNames"
                :key="index"
                :label="el"
                :value="el"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="translate('批号')" prop="batchName">
            <el-select
              v-model="queryForm.batchName"
              allow-create
              clearable
              collapse-tags
              collapse-tags-tooltip
              :filter-method="filterBatchMenthod"
              filterable
              multiple
              style="width: 100%"
            >
              <el-option
                v-for="(el, index) in filterBatchNames"
                :key="index"
                :label="el"
                :value="el"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item
            :label="translate('过检/漏检')"
            :title="translate('产品维度、产品的漏检过检情况')"
          >
            <el-select
              v-model="queryForm.type"
              clearable
              multiple
              style="width: 100%"
              @clear="queryForm.type = []"
            >
              <el-option :label="translate('过检')" value="isAboveInspect" />
              <el-option :label="translate('漏检')" value="isLossInspect" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item
            :label="translate('最终结果')"
            prop="productFinalResult"
            :title="translate('产品维度、最终结果情况')"
          >
            <el-select
              v-model="queryForm.productFinalResult"
              clearable
              multiple
              style="width: 100%"
              @clear="queryForm.productFinalResult = []"
            >
              <el-option :label="translate('OK')" value="OK" />
              <el-option :label="translate('NG')" value="NG" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <h3>图片筛选条件</h3>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="translate('工位')" prop="stationName">
            <el-select
              v-model="imgFilterCondition.stationName"
              allow-create
              clearable
              collapse-tags
              collapse-tags-tooltip
              filterable
              multiple
              :placeholder="placeHolder.stationName"
              style="width: 100%"
            >
              <el-option
                v-for="(el, index) in filterStationNames"
                :key="index"
                :label="el"
                :value="el"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="translate('采图点位')" prop="capturePos">
            <el-input
              v-model="imgFilterCondition.capturePos"
              clearable
              :placeholder="
                translate('点位以英文\',\'分隔，连续用\'-\'拼接 eg:5,9-13')
              "
              :title="
                translate(
                  '多个点位以英文\'，\'分隔，连续多个点位可用\'起始点位-结束点位\' 表示，eg:5,9-13'
                )
              "
              @input="
                imgFilterCondition.capturePos =
                  imgFilterCondition.capturePos.replace(/，/g, ',')
              "
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="translate('AI结果')" prop="aiResult">
            <el-select
              v-model="imgFilterCondition.aiResult"
              clearable
              multiple
              style="width: 100%"
            >
              <el-option label="OK" value="OK" />
              <el-option label="NG" value="NG" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="translate('人工结果')" prop="humanResult">
            <el-select
              v-model="imgFilterCondition.humanResult"
              clearable
              multiple
              style="width: 100%"
            >
              <el-option label="OK" value="OK" />
              <el-option label="NG" value="NG" />
              <el-option label="UnMarked" value="" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="translate('过检/漏检')" prop="resultType">
            <el-select
              v-model="imgFilterCondition.resultType"
              clearable
              collapse-tags
              multiple
              style="width: 100%"
            >
              <el-option :label="translate('过检')" :value="1" />
              <el-option :label="translate('漏检')" :value="2" />
              <el-option :label="translate('真实OK')" :value="3" />
              <el-option :label="translate('真实NG')" :value="4" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="translate('缺陷类型')" prop="aiLabel">
            <el-select
              v-model="imgFilterCondition.aiLabel"
              allow-create
              clearable
              collapse-tags
              collapse-tags-tooltip
              filterable
              multiple
              :placeholder="placeHolder.defectType"
              style="width: 100%"
              @focus="listAllDefect"
            >
              <el-option
                v-for="(el, index) in filterAilabel"
                :key="index"
                :label="el.label"
                :value="el.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <h3>导出选项</h3>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="translate('导出条件名称')" prop="name">
            <el-input v-model="exportForm2.name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="translate('图片类型')" prop="imgType">
            <el-select v-model="exportForm2.imgType" style="width: 100%">
              <el-option
                v-for="(item, index) in imgTypeList"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-row :gutter="15" style="width: 100%">
            <el-col :span="20">
              <el-form-item :label="translate('图片效果')" prop="labelOption">
                <el-radio-group
                  v-model="exportForm2.labelOption"
                  @change="labelOptionChangeChange2"
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
              <el-tooltip
                :content="translate('将缺陷轮廓渲染到图片上')"
                effect="dark"
              >
                <el-checkbox
                  v-model="exportForm2.isRender"
                  :disabled="
                    exportForm2.type !== 1 || exportForm2.labelOption === 1
                  "
                  :false-label="0"
                  :label="translate('是否渲染')"
                  size="large"
                  :true-label="1"
                />
              </el-tooltip>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="translate('导出类型')" prop="type">
            <el-row :gutter="15" style="width: 100%">
              <el-col :span="20">
                <el-select
                  v-model="exportForm2.type"
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
                  v-model="exportForm2.keepOriginName"
                  :disabled="exportForm2.type !== 1"
                  :label="translate('保留原始文件名')"
                  size="large"
                />
              </el-col>
            </el-row>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="translate('导出路径')" prop="path">
            <el-input v-model="exportForm2.path" />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item :label="translate('子目录')" prop="pathLevel">
            <el-cascader
              v-model="pathLevelStructVal"
              :options="_options"
              :props="defaultProps"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="1" />
        <el-col :span="7">
          <el-checkbox
            v-model="exportForm2.excludeDir"
            :label="translate('去除source与label目录')"
            size="large"
          />
        </el-col>
      </el-row>
      <el-form-item>
        <el-button @click="closeDialog2">{{ translate('取消') }}</el-button>
        <el-button type="primary" @click="formSubmit2">
          {{ translate('确定') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import vrsService from '@/api/vrsService'
  import solutionExport from '@/api/solutionExport'
  import { shortcutsList } from '@/utils/timeConst'

  export default {
    props: {
      currentRow: {
        type: Object,
        default: () => ({}),
      },
      dialogType: {
        type: String,
        default: 'add',
      },
      show: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:currentRow', 'update:dialogType', 'update:show', 'success'],
    data() {
      const checkPoint = (rule, value, callBack) => {
        const reg = /^\d+-\d+$|^\d+$/
        if (value && !reg.test(value))
          return callBack(new Error('只能输入全数字,或者1-3形式的值'))
        callBack()
      }
      return {
        defaultProps: {
          checkStrictly: true,
          expandTrigger: 'click',
          label: 'label',
          value: 'value',
          children: 'children',
        },
        machineNames: [],
        batchNames: [],
        searchMachineStr: '',
        searchBatchStr: '',
        stationNames: [],
        labelNames: [],
        searchStationStr: '',
        searchAilabelStr: '',
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
        pathLevelName: [
          { label: '无层级', value: 0 },
          { label: '机台', value: 1 },
          { label: '批次', value: 2 },
          { label: 'SN', value: 3 },
          { label: '点位', value: 4 },
          { label: 'AI结果', value: 5 },
          { label: '人工结果', value: 6 },
          // { label: '过漏检', value: 7 },
          { label: '缺陷类型', value: 8 },
        ],
        exportRules: {
          name: [{ required: true, message: '必填', trigger: 'blur' }],
          picNum: [{ required: true, message: '必填', trigger: 'change' }],
          imgType: [{ required: true, message: '必填', trigger: 'change' }],
          type: [{ required: true, message: '必填', trigger: 'change' }],
          path: [{ required: true, message: '必填', trigger: 'blur' }],
          point: [{ validator: checkPoint, trigger: 'blur' }],
          labelOption: [{ required: true, message: '必填', trigger: 'change' }],
        },
        // 产品维度筛选条件
        queryForm: {
          dateTimes: [],
          SN: [],
          machineName: [],
          batchName: [],
          type: [],
          productFinalResult: [],
        },
        oldDefectCondition: '',
        placeHolder: {
          defectType: '每次重新获取需等待',
          stationName: '',
        },
        options: [
          { label: '机台', value: 'machineName' },
          { label: '批次', value: 'batchName' },
          { label: 'SN', value: 'productSn' },
          { label: '点位', value: 'capturePos' },
          { label: 'AI结果', value: 'aiResult' },
          { label: '人工结果', value: 'humanResult' },
          { label: '过漏检', value: 'Inspect' },
          { label: '缺陷类型', value: 'Defect' },
        ],
        exportForm2: {
          name: '',
          imgType: 'jpg',
          factoryName: '',
          lineName: '',
          machineName: '',
          station: '',
          cameraCode: '',
          point: '',
          opticsType: '',
          sourceModelName: '',
          type: 1,
          path: '',
          pathLevel: '',
          excludeDir: false, // 是否排除source和label文件夹目录
          aiEngin: '',
          customDefect: '',
          enginDefect: '',
          labelOption: 1,
          keepOriginName: true,
          isRender: 0,
          picNum: 1,
          status: 0,
          exportType: 3, // Vrs导出
          imgQueryCondition: '',
        },
        // 图片维度筛选条件
        imgFilterCondition: {
          stationName: [],
          aiResult: [],
          capturePos: '',
          aiLabel: [],
          humanResult: [],
          resultType: [],
        },
        defaultTime: [
          new Date(2000, 1, 1, 0, 0, 0),
          new Date(2000, 2, 1, 23, 59, 59),
        ],
      }
    },
    computed: {
      /**
       * 目录结构值
       */
      pathLevelStructVal: {
        get() {
          return this.exportForm2.pathLevel
            ? JSON.parse(this.exportForm2.pathLevel)
            : []
        },
        set(newVal) {
          this.exportForm2.pathLevel = JSON.stringify(newVal)
        },
      },
      // 级联结构
      _options() {
        return this.imgStructCascader()
      },

      translate() {
        return translate
      },
      shortcuts() {
        return shortcutsList
      },
      filterMachineNames() {
        if (this.searchMachineStr) {
          return this.$pinyinSearch.matchPinyin(
            this.machineNames,
            this.searchMachineStr
          )
        }
        return this.machineNames
      },
      filterBatchNames() {
        if (this.searchBatchStr) {
          return this.$pinyinSearch.matchPinyin(
            this.batchNames,
            this.searchBatchStr,
            'label'
          )
        }
        return this.batchNames
      },
      /**
       * 工位
       */
      filterStationNames() {
        if (this.searchStationStr) {
          return this.$pinyinSearch.matchPinyin(
            this.stationNames,
            this.searchStationStr
          )
        }
        return this.stationNames
      },
      filterAilabel() {
        if (this.searchAilabelStr) {
          return this.$pinyinSearch.matchPinyin(
            this.labelNames,
            this.searchAilabelStr,
            'label'
          )
        }
        return this.labelNames
      },
      // 过漏检条件
      productTypeMap() {
        return this.queryForm.type.reduce((acc, item) => {
          acc[item] = true
          return acc
        }, {})
      },
      dialogVis: {
        get() {
          return this.show
        },
        set(newVal) {
          this.$emit('update:show', newVal)
        },
      },
    },
    watch: {
      currentRow() {
        this.renderFormByEdit()
      },
    },
    created() {
      this.renderFormByEdit()
      // console.log('vrscurrentRow::', this.currentRow)
      // console.log('vrsnewVal::', this.dialogType)
    },
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {
      this.listCondition()
    },
    methods: {
      /**
       * 构造级联数据
       * @param {Array} startVal 初始数据
       * @param {Array} arr 递归 构造的数据结构
       */
      createdLabelTreeCascader(startVal = [], arr = []) {
        startVal.forEach((el) => {
          const _obj = { ...el }
          let _tempArr = startVal.filter((item) => item.label !== el.label)
          _tempArr = _obj.children ? _obj.children.concat(_tempArr) : _tempArr
          if (_tempArr.length) {
            _obj.children = _tempArr
            if (_obj.children.length) {
              this.createdLabelTreeCascader(_tempArr, (_obj.children = []))
            }
          }
          arr.push(_obj)
        })
        return arr
      },
      /**
       * 图片结构级联数据
       */
      imgStructCascader() {
        const _arr = this.createdLabelTreeCascader(this.options, [])
        // console.log('_arr:::', _arr)
        return _arr
      },
      /**
       * 编辑的时候回显表单
       */
      renderFormByEdit() {
        if (
          this.dialogType === 'edit' &&
          JSON.stringify(this.currentRow) !== '{}'
        ) {
          console.log('this.currentRow:::', this.currentRow)
          // 1.分图导出条件：exportForm2
          Object.keys(this.exportForm2).forEach((el) => {
            this.exportForm2[el] = this.currentRow[el]
          })
          console.log('this.exportForm2:::', this.exportForm2)
          // 2.图片维度条件：imgFilterCondition
          if (this.currentRow.imgQueryCondition) {
            const _imgQueryCondition = JSON.parse(
              this.currentRow.imgQueryCondition
            )
            const _condition = _imgQueryCondition.condition
            const _listCondition = _condition.listCondition
            Object.keys(this.imgFilterCondition).forEach((el) => {
              this.imgFilterCondition[el] = _condition[el]
            })
            // 3.产品维度条件：queryForm
            Object.keys(this.queryForm).forEach((el) => {
              this.queryForm[el] = _listCondition[el]
            })
            this.queryForm.dateTimes = [
              _listCondition.detectTimeFrom,
              _listCondition.detectTimeTo,
            ]
            // 处理过检/漏检
            const _types = []
            _listCondition.isAboveInspect && _types.push('isAboveInspect')
            _listCondition.isLossInspect && _types.push('isLossInspect')
            this.queryForm.type = _types
          }
          this.pathLevelStructVal = this.exportForm2.pathLevel
            ? JSON.parse(this.exportForm2.pathLevel)
            : []
        }
      },
      typeChange() {
        this.exportForm2.keepOriginName = false
        if (this.exportForm2.type !== 1) {
          // 导出到AIDI工程的，不可渲染
          this.exportForm2.isRender = 0
        }
      },
      filterMachineMethod(str) {
        this.searchMachineStr = str
      },
      filterBatchMenthod(str) {
        this.searchBatchStr = str
      },
      /**
       * 查询所有缺陷
       */
      async listAllDefect() {
        const listCondition = {
          SN: this.queryForm.SN,
          DetectTimeFrom: this.queryForm.dateTimes[0],
          DetectTimeTo: this.queryForm.dateTimes[1],
          machineName: this.queryForm.machineName, // 机台
          batchName: this.queryForm.batchName, // 批号
          productFinalResult: this.queryForm.productFinalResult, // 最终结果
          ...this.productTypeMap, // 过检/漏检
        }
        const query = {
          ...this.imgFilterCondition,
          listCondition: { ...listCondition },
          resetImgIdCache: true,
        }
        if (this.oldDefectCondition !== JSON.stringify(query)) {
          this.placeHolder.defectType = translate('正在获取缺陷列表，请稍后')
          const res = await vrsService.listDefect(query)
          if (res.code === 0) {
            // this.stationNames = (res.data.stationNames || []).filter((el) => el)
            this.oldDefectCondition = JSON.stringify(query)
            this.labelNames = (res.data.labelNames || [])
              .filter((el) => el)
              .map((label, index) => ({ tagId: index, label }))
          }
        }
        this.placeHolder.defectType = translate('请选择')
      },
      labelOptionChangeChange2() {
        if (this.exportForm2.labelOption === 1) {
          this.exportForm2.isRender = 0
        }
      },
      /**
       * 获取项目的标签
       */
      async listCondition() {
        const res = await vrsService.listCondition({})
        if (res.code === 0 && res.data) {
          this.machineNames = res.data.machineNames ? res.data.machineNames : []
          this.batchNames = res.data.batchNames ? res.data.batchNames : []
          this.stationNames = res.data.stationNames ? res.data.stationNames : []
        }
      },
      /**
       * 关闭弹窗
       */
      closeDialog2() {
        this.dialogVis = false
        this.$emit('update:currentRow', {})
        this.$emit('update:dialogType', 'add')
        this.exportForm2 = {
          name: '',
          imgType: 'jpg',
          factoryName: '',
          lineName: '',
          machineName: '',
          station: '',
          cameraCode: '',
          point: '',
          opticsType: '',
          sourceModelName: '',
          type: 1,
          path: '',
          pathLevel: '',
          excludeDir: false, // 是否排除source和label文件夹目录
          aiEngin: '',
          customDefect: '',
          enginDefect: '',
          labelOption: 1,
          keepOriginName: true,
          isRender: 0,
          picNum: 1,
          status: 0,
          exportType: 3, // Vrs导出
          imgQueryCondition: '',
        }
        this.queryForm = {
          dateTimes: [],
          SN: [],
          machineName: [],
          batchName: [],
          type: [],
          productFinalResult: [],
        }
        this.imgFilterCondition = {
          stationName: [],
          aiResult: [],
          capturePos: '',
          aiLabel: [],
          humanResult: [],
          resultType: [],
        }
      },
      formSubmit2() {
        if (!this.queryForm.SN.length && !this.queryForm.dateTimes[0]) {
          return this.$message.error('SN与时间必填一项')
        }

        const vrsCondition = {
          listCondition: {
            SN: this.queryForm.SN, // 产品 SN
            machineName: this.queryForm.machineName, // 机台
            batchName: this.queryForm.batchName, // 批号
            productFinalResult: this.queryForm.productFinalResult, // 最终结果
            ...this.productTypeMap, // 过检/漏检
          },
          ...this.imgFilterCondition,
        }
        if (this.queryForm.dateTimes.length) {
          vrsCondition.listCondition.detectTimeFrom =
            this.queryForm.dateTimes[0]
          vrsCondition.listCondition.detectTimeTo = this.queryForm.dateTimes[1]
        }
        const req = {
          operator: 2,
          condition: vrsCondition,
        }
        const query = { ...this.exportForm2 }
        if (this.dialogType === 'edit') {
          query.id = this.currentRow.id
        }
        query.imgQueryCondition = JSON.stringify(req)
        solutionExport
          .saveOrUpdatePickPicExport(query)
          .then((res) => {
            if (res.code === 0) {
              this.closeDialog2()
              this.$emit('success')
            }
          })
          .catch((error) => {
            // 处理异常
            console.error(error)
          })
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  h3 {
    margin: 5px 0;
  }
</style>
