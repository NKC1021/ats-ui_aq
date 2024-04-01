<!--  -->
<template>
  <div>
    <el-dialog
      v-model="dialogVis"
      :before-close="mergeCancel"
      :close-on-click-modal="false"
      title="合并数据集"
      width="35%"
    >
      <el-form
        ref="mergeFormRef"
        label-width="120px"
        :model="mergeForm"
        :rules="formRules"
      >
        <el-form-item label="合并前数据集" prop="fromDataSetIds">
          <el-select
            v-model="mergeForm.fromDataSetIds"
            multiple
            style="width: 100%"
            @change="fromDataSetChange"
          >
            <el-checkbox
              v-model="allCheck"
              :indeterminate="indeterminate"
              style="padding: 0 20px"
              @change="selectAllChange"
            >
              全选
            </el-checkbox>
            <el-option
              v-for="(item, index) in datalist"
              :key="index"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数据集名称(新)" prop="name">
          <el-input v-model="mergeForm.name" />
        </el-form-item>
        <el-form-item label="工厂名称" prop="factoryName">
          <el-input v-model="mergeForm.factoryName" />
        </el-form-item>
        <el-form-item label="线体名称" prop="lineName">
          <el-input v-model="mergeForm.lineName" />
        </el-form-item>
        <el-form-item label="设备名称" prop="machineName">
          <el-input v-model="mergeForm.machineName" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="mergeForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="mergeSubmit">确定</el-button>
        <el-button @click="mergeCancel">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import solutionDatalist from '@/api/solutionDataSet'
  export default {
    // name: '合并数据集',
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      datalist: {
        type: Array,
        default: () => [],
      },
    },
    emits: ['update:show', 'getDatalist'],
    data() {
      /**
       * 校验新增数据集名称重复
       */
      const checkMergedName = (rule, value, callback) => {
        const _ids = [...this.mergeForm.fromDataSetIds]
        const _arr = this.datalist.filter((el) => {
          return !_ids.includes(el.id)
        })
        const flag = _arr.some((el) => el.name === value)
        if (flag) {
          callback('名称不可重复')
        } else {
          callback()
        }
      }
      return {
        checked: false,
        formRules: {
          fromDataSetIds: [
            { required: true, message: '必填', trigger: 'change' },
          ],
          name: [
            { required: true, message: '必填', trigger: 'blur' },
            { validator: checkMergedName, trigger: 'blur' },
          ],
        },
        mergeForm: {
          fromDataSetIds: [],
          name: '',
          factoryName: '',
          lineName: '',
          machineName: '',
          remark: '',
        },
      }
    },
    computed: {
      dialogVis: {
        get() {
          return this.show
        },
        set(newVal) {
          this.$emit('update:show', newVal)
        },
      },
      allCheck: {
        get() {
          const _length = this.datalist.length
          const _length1 = this.mergeForm.fromDataSetIds.length
          if (_length && _length1 && _length === _length1) {
            return true
          } else {
            return false
          }
        },
        set() {
          // console.log('newVal:::', newVal);
        },
      },
      indeterminate() {
        const _length = this.datalist.length
        const _length1 = this.mergeForm.fromDataSetIds.length
        if (this.mergeForm.fromDataSetIds.length === 0) return null
        return _length !== _length1
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      selectAllChange() {
        if (this.allCheck) {
          this.mergeForm.fromDataSetIds = []
        } else {
          let _ids = []
          _ids = this.datalist.map((el) => el.id)
          this.mergeForm.fromDataSetIds = _ids
        }
        this.defaultNameByFirst()
      },
      fromDataSetChange() {
        this.defaultNameByFirst()
      },
      mergeSubmit() {
        this.$refs.mergeFormRef.validate(async (val) => {
          if (!val) return
          const res = await solutionDatalist.mergeDataSet(this.mergeForm)
          if (res.code === 0) {
            this.$message.success(res.message)
            this.$emit('getDatalist')
            this.mergeCancel()
          }
        })
      },
      /**
       * 取消
       */
      mergeCancel() {
        this.mergeForm = {
          fromDataSetIds: [],
          name: '',
          factoryName: 0,
          lineName: 0,
          machineName: 0,
        }
        this.$nextTick(() => {
          this.$refs.mergeFormRef.resetFields()
          this.dialogVis = false
        })
      },
      /**
       * 默认填充第一个新数据名称
       */
      defaultNameByFirst() {
        const _firstDataSetId = this.mergeForm.fromDataSetIds[0]
        const _obj = this.datalist.find((el) => el.id === _firstDataSetId)
        this.mergeForm.name = _obj ? _obj.name : ''
      },
    },
  }
</script>
<style scoped>
  /* @import url(); 引入css类 */
</style>
