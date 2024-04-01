<template>
  <div>
    <el-dialog
      v-model="dialogVis"
      :before-close="formCancel"
      :close-on-click-modal="false"
      :title="translate('导入标准')"
      width="600px"
    >
      <el-form ref="importRef" label-width="90px" :model="importForm">
        <el-form-item label="项目类型">
          <el-radio-group v-model="proType" @input="proTypeChange">
            <el-radio label="1">{{ translate('我的项目') }}</el-radio>
            <el-radio label="2">{{ translate('共享项目') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          :label="translate('项目名称')"
          prop="fromSolutionId"
          :rules="[
            { required: true, message: translate('必填'), trigger: 'change' },
          ]"
        >
          <el-select v-model="importForm.fromSolutionId" style="width: 100%">
            <div v-if="proType === '1'">
              <el-option
                v-for="el in selectSolutionsList"
                :key="el.id"
                :label="el.name"
                :value="el.id"
              />
            </div>
            <div v-if="proType === '2'">
              <el-option
                v-for="el in selectSolutionsList"
                :key="el.id"
                :label="el.solutionName"
                :value="el.solutionId"
              />
            </div>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formCancel">
          {{ translate('取消') }}
        </el-button>
        <el-button type="primary" @click="formSubmit">
          {{ translate('确定') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import { getStore } from '@/utils/storage'
  import solutionApi from '@/api/solution'
  import solutionCriteria from '@/api/solutionCriteria'
  import shareApi from '@/api/solutionConfig'
  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:show', 'importSuccess'],
    data() {
      return {
        importForm: {
          fromSolutionId: '',
        },
        proType: '1',

        solutionsList: [],
        authSolutionsList: [],
      }
    },
    computed: {
      translate() {
        return translate
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
       * 当前解决方案solutionId
       */
      localSolutionId() {
        return getStore({ name: 'solutionId' })
      },
      selectSolutionsList() {
        let arr = []
        if (this.proType === '1') {
          arr = this.solutionsList.filter(
            (el) => el.id !== this.localSolutionId
          )
        }
        if (this.proType === '2') {
          arr = this.authSolutionsList
        }
        return arr
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {
      this.listSolutionDetails()
      this.getAuthorizedProjectList()
    },
    methods: {
      /**
       * 获所有解决方案
       */
      async listSolutionDetails() {
        const res = await solutionApi.listSolution({})
        if (res.code === 0) {
          res.data && (this.solutionsList = res.data)
        }
      },
      /**
       * 获取共享解决方案
       */
      async getAuthorizedProjectList() {
        const res = await shareApi.getAuthorizedProjectList({})
        if (res.code === 0) {
          res.data && (this.authSolutionsList = res.data)
        }
      },
      proTypeChange() {
        this.importForm.fromSolutionId = ''
      },
      formSubmit() {
        this.$refs.importRef.validate(async (val) => {
          if (val) {
            const query = {
              id: this.importForm.fromSolutionId,
            }
            const res = await solutionCriteria.importCriteriaBySolution(query)
            if (res.code === 0) {
              this.$message.success(res.msg)
              this.formCancel()
              this.$emit('importSuccess')
            }
          }
        })
      },
      formCancel() {
        this.dialogVis = false
        this.importForm = { fromSolutionId: '' }
        this.$refs.importRef.resetFields()
        this.proType = '1'
      },
    },
  }
</script>
<style scoped>
  /* @import url(); 引入css类 */
</style>
