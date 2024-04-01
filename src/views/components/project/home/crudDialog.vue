<template>
  <div>
    <el-dialog
      v-model="dialogVis"
      :before-close="projectCancel"
      :close-on-click-modal="false"
      :title="dialogTitle"
      top="20vh"
      width="35%"
    >
      <el-form ref="projectFormRef" label-width="100px" :model="projectForm">
        <el-form-item
          :label="translate('项目名称')"
          prop="name"
          :rules="{
            required: true,
            trigger: 'blur',
            message: translate('必填'),
          }"
        >
          <el-input v-model="projectForm.name" />
        </el-form-item>
        <el-form-item
          :label="translate('标签类型')"
          prop="enableType"
          :rules="{
            required: true,
            trigger: 'blur',
            message: translate('必填'),
          }"
        >
          <el-select v-model="projectForm.enableType" style="width: 100%">
            <el-option :label="translate('客户缺陷')" :value="1" />
            <el-option :label="translate('工程标签')" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item :label="translate('项目描述')" prop="desc">
          <el-input v-model="projectForm.desc" type="textarea" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="projectSubmit">
          {{ translate('确定') }}
        </el-button>
        <el-button @click="projectCancel">
          {{ translate('取消') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import solution from '@/api/solution'
  export default {
    // name: '新增/编辑项目',
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
    },
    emits: [
      'update:show',
      'update:dialogType',
      'update:currentRow',
      'getListSolution',
    ],
    data() {
      return {
        projectForm: {
          name: '',
          desc: '',
          enableType: 2,
        },
      }
    },
    computed: {
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
    },
    watch: {
      show(newVal) {
        if (newVal && JSON.stringify(this.currentRow) !== '{}') {
          Object.keys(this.projectForm).forEach((el) => {
            this.projectForm[el] = this.currentRow[el]
          })
        }
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      projectCancel() {
        this.projectForm = { name: '', desc: '', enableType: 2 }
        this.$refs.projectFormRef.resetFields()
        this.$emit('update:dialogType', 'add')
        this.$emit('update:currentRow', {})
        this.dialogVis = false
      },
      projectSubmit() {
        this.$refs.projectFormRef.validate(async (val) => {
          if (val) {
            //
            let res
            switch (this.dialogType) {
              case 'add': {
                res = await solution.createSolution(this.projectForm)
                break
              }
              case 'edit': {
                const query = Object.assign(this.currentRow, {
                  ...this.projectForm,
                })
                delete query.visible
                res = await solution.updateSolution(query)
                break
              }
            }
            console.log('res::::', res)
            if (res.code === 0) {
              this.projectCancel()
              this.$emit('getListSolution')
            }
          }
        })
      },
    },
  }
</script>
<style scoped></style>
