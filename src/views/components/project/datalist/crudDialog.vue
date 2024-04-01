<template>
  <div>
    <el-dialog
      v-model="dialogVis"
      :before-close="datalistCancel"
      :close-on-click-modal="false"
      :title="dialogTitle"
      width="35%"
    >
      <el-form
        ref="datalistFormRef"
        label-width="120px"
        :model="datalistForm"
        :rules="formRules"
      >
        <el-form-item :label="translate('数据集名称')" prop="name">
          <el-input
            v-model="datalistForm.name"
            :placeholder="translate('数据集名称不可重复')"
          />
        </el-form-item>
        <el-form-item :label="translate('工厂名称')" prop="factoryName">
          <el-input
            v-model="datalistForm.factoryName"
            :placeholder="translate('请输入工厂名称')"
          />
        </el-form-item>
        <el-form-item :label="translate('线体名称')" prop="lineName">
          <el-input
            v-model="datalistForm.lineName"
            :placeholder="translate('请输入线体名称')"
          />
        </el-form-item>
        <el-form-item :label="translate('机台名称')" prop="machineName">
          <el-input
            v-model="datalistForm.machineName"
            :placeholder="translate('请输入机台名称')"
          />
        </el-form-item>
        <el-form-item :label="translate('备注')" prop="remark">
          <el-input
            v-model="datalistForm.remark"
            :placeholder="translate('数据集描述说明')"
            type="textarea"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="datalistSubmit">
          {{ translate('确定') }}
        </el-button>
        <el-button @click="datalistCancel">{{ translate('取消') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import solutionDatalist from '@/api/solutionDataSet'
  export default {
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
        default: () => {},
      },
      datalist: {
        type: Array,
        default: () => [],
      },
    },
    emits: [
      'update:show',
      'update:dialogType',
      'update:currentRow',
      'getDatalist',
    ],
    data() {
      const checkDatalistName = (rule, value, callback) => {
        const _arr = this.datalist.filter((el) => el.id !== this.currentRow.id)
        const flag = _arr.some((el) => el.name === value)
        if (flag) {
          callback(new Error(translate('名称不可重复')))
        } else {
          callback()
        }
      }
      return {
        switchVal: false,
        datalistForm: {
          factoryName: '',
          lineName: '',
          machineName: '',
          name: '',
          remark: '',
        },
        formRules: {
          name: [
            { required: true, message: translate('必填'), trigger: 'blur' },
            { validator: checkDatalistName, trigger: 'blur' },
          ],
        },
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
      dialogTitle() {
        if (this.dialogType === 'add') {
          return translate('新增')
        }
        if (this.dialogType === 'edit') {
          return translate('编辑')
        }
        return ''
      },
    },
    watch: {
      currentRow(newVal) {
        if (this.dialogType === 'edit' && JSON.stringify(newVal) !== '{}') {
          Object.keys(this.datalistForm).forEach((el) => {
            this.datalistForm[el] = this.currentRow[el]
          })
        }
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      datalistCancel() {
        this.datalistForm = {
          factoryName: '',
          lineName: '',
          machineName: '',
          name: '',
          remark: '',
        }
        this.$refs.datalistFormRef.resetFields()
        this.$emit('update:dialogType', 'add')
        this.$emit('update:currentRow', {})
        this.dialogVis = false
      },
      datalistSubmit() {
        this.$refs.datalistFormRef.validate(async (val) => {
          if (val) {
            let query = {}
            switch (this.dialogType) {
              case 'add': {
                query = { ...this.datalistForm }
                break
              }
              case 'edit': {
                query = Object.assign(this.currentRow, { ...this.datalistForm })
                break
              }
            }
            const res = await solutionDatalist.saveDataSet(query)
            if (res.code === 0) {
              this.$message.success(res.msg)
              this.$emit('getDatalist')
              this.datalistCancel()
            }
          }
        })
      },
    },
  }
</script>
<style scoped>
  /* @import url(); 引入css类 */
</style>
