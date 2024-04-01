<template>
  <div>
    <el-row class="form-content">
      <el-col :span="7">
        <el-form
          ref="formRef"
          label-width="120px"
          :model="addForm"
          :rules="rules"
        >
          <el-form-item :label="translate('加入数据集')">
            <el-select
              v-model="addForm.toDataSetId"
              disabled
              style="width: 100%"
            >
              <el-option
                v-for="(el, index) in allDataList"
                :key="index"
                :label="el.name"
                :value="el.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="translate('项目类型')">
            <el-radio-group v-model="radio" @input="radioInput">
              <el-radio label="1">{{ translate('我的项目') }}</el-radio>
              <el-radio label="2">
                {{ translate('共享项目') }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="translate('项目名称')">
            <el-select
              v-model="solutionId"
              style="width: 100%"
              @change="listDataSetBySolutionId"
            >
              <div v-if="radio === '1'">
                <el-option
                  v-for="(el, index) in projectList"
                  :key="index"
                  :label="el.name"
                  :value="el.id"
                />
              </div>
              <div v-if="radio === '2'">
                <el-option
                  v-for="(el, index) in projectList"
                  :key="index"
                  :label="el.solutionName"
                  :value="el.solutionId"
                />
              </div>
            </el-select>
          </el-form-item>
          <el-form-item :label="translate('数据集名称')" prop="fromDataSetId">
            <!-- {{ addForm.fromDataSetId }} -->
            <el-select v-model="addForm.fromDataSetId" style="width: 100%">
              <el-option
                v-for="(el, index) in dataSetList"
                :key="index"
                :label="el.name"
                :value="el.id"
              />
            </el-select>
          </el-form-item>
          <div style="text-align: center">
            <el-button @click="formCancel">
              {{ translate('重置') }}
            </el-button>
            <el-button type="primary" @click="formSubmit">
              {{ translate('确定') }}
            </el-button>
          </div>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import solutionApi from '@/api/solution'
  import solutionConfig from '@/api/solutionConfig'
  import solutionDataSet from '@/api/solutionDataSet'
  import solutionFile from '@/api/solutionFile'
  export default {
    props: {
      currntRow: {
        type: Object,
        default: () => {},
      },
      allDataList: {
        type: Array,
        default: () => [],
      },
    },
    emits: ['uploadFileSuccess'],
    data() {
      return {
        rules: {
          fromDataSetId: [
            {
              required: true,
              message: translate('必填'),
              trigger: 'change',
            },
          ],
        },
        radio: '1',
        addForm: {
          toDataSetId: '',
          fromDataSetId: '',
        },
        solutionId: '',
        solutionList: [],
        shareSolutionList: [],
        dataSetList: [],
      }
    },
    computed: {
      translate() {
        return translate
      },
      projectList() {
        if (this.radio === '1') {
          return this.solutionList
        }
        if (this.radio === '2') {
          return this.shareSolutionList
        }
        return []
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {
      this.addForm.toDataSetId = this.currntRow.id
      this.listSolution()
      this.getAuthorizedProjectList()
    },
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      radioInput() {
        this.solutionId = ''
        this.addForm.fromDataSetId = ''
      },
      async listSolution() {
        const res = await solutionApi.listSolution({})
        if (res.code === 0) {
          this.solutionList = res.data
        }
      },
      async getAuthorizedProjectList() {
        const res = await solutionConfig.getAuthorizedProjectList({})
        if (res.code === 0) {
          this.shareSolutionList = res.data
        }
      },
      async listDataSetBySolutionId() {
        const query = {
          solutionId: this.solutionId,
        }
        const res = await solutionDataSet.listBySolutionId(query)
        if (res.code === 0) {
          this.addForm.fromDataSetId = ''
          this.dataSetList = res.data
        }
      },
      formSubmit() {
        // console.log('this.addForm:::', this.addForm.toDataSetId)
        this.$refs.formRef.validate(async (val) => {
          if (val) {
            const query = { ...this.addForm }
            const res = await solutionFile.importImgByProject(query)
            if (res.code === 0) {
              //
              this.$emit('uploadFileSuccess')
            }
          }
        })
      },
      formCancel() {
        this.addForm.fromDataSetId = ''
        this.solutionId = ''
        this.$nextTick(() => {
          this.$refs.formRef.clearValidate()
        })
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .form-content {
    padding-top: 15px;
  }
</style>
