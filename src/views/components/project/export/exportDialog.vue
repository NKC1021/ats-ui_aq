<!--  -->
<template>
  <div>
    <el-dialog
      v-model="dialogVis"
      :before-close="exportCance"
      :close-on-click-modal="false"
      :title="translate('选择数据集')"
      width="500px"
    >
      <el-form ref="exportRef" label-width="80px" :model="exportForm">
        <el-form-item
          v-if="currentRow.exportType !== 3"
          label="数据集"
          prop="datasetId"
          :rules="{ required: true, message: '必填', trigger: 'change' }"
        >
          <el-select
            v-model="exportForm.datasetId"
            multiple
            style="width: 100%"
            @change="dataListChange"
          >
            <el-checkbox
              v-model="dataSetCheck"
              :indeterminate="isIndeterminate"
              style="padding: 0 20px"
              @change="selectAll"
            >
              {{ translate('全选') }}
            </el-checkbox>
            <el-tooltip
              v-for="item in allDataSet"
              :key="item.id"
              :content="item.name"
              :disabled="item.name.length <= 40"
              effect="light"
              placement="right"
            >
              <el-option
                :label="`${
                  item.name.length > 40
                    ? item.name.substring(0, 40) + '...'
                    : item.name
                }`"
                :value="item.id"
              />
            </el-tooltip>
          </el-select>
        </el-form-item>
        <el-form-item label="数据量">
          <span v-if="imgTotal === '' && currentRow.exportType === 3">
            {{ translate('计算中') }}
          </span>
          <span v-else>{{ imgTotal }}</span>
        </el-form-item>
      </el-form>

      <div style="text-align: right; padding-top: 25px">
        <el-button @click="exportCance">
          {{ translate('取消') }}
        </el-button>
        <el-button type="primary" @click="exportSubmit">
          {{ translate('确定') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import solutionExport from '@/api/solutionExport'
  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },

      currentRow: {
        type: Object,
        default: () => ({}),
      },
      allDataSet: {
        type: Array,
        default: () => [],
      },
      recordDataset: {
        type: Array,
        default: () => [],
      },
    },
    emits: [
      'update:show',
      'success',
      'update:recordDataset',
      'update:currentRow',
    ],
    data() {
      return {
        // dialogVis: true,
        isIndeterminate: false,
        dataSetCheck: false,
        exportForm: { datasetId: [] },
        imgTotal: '',
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
    },
    watch: {
      currentRow: {
        immediate: true,
        handler(newVal) {
          if (newVal.exportType === 3) {
            this.handleConfirmExport(1)
          }
        },
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      /**
       *数据集变化
       */
      dataListChange() {
        const selectCount = this.exportForm.datasetId.length
        this.isIndeterminate =
          selectCount > 0 && selectCount < this.allDataSet.length
        this.imgTotal = ''
        this.dataSetCheck = selectCount === this.allDataSet.length
        selectCount && this.handleConfirmExport(1)
      },
      /**
       * 全部数据集全选
       */
      selectAll(val) {
        this.isIndeterminate = false
        if (val) {
          const _ids = this.allDataSet.map((el) => el.id)
          this.exportForm.datasetId = _ids
        } else {
          this.exportForm.datasetId = []
        }
        this.imgTotal = ''
        this.exportForm.datasetId.length && this.handleConfirmExport(1)
      },
      /**
       * 取消操作
       */
      exportCance() {
        this.dataSetCheck = false
        this.isIndeterminate = false
        this.imgTotal = ''
        this.$refs.exportRef.resetFields()
        // this.$nextTick(() => {
        //   this.$emit('update:currentRow', {})
        // })
        setTimeout(() => {
          this.$emit('update:currentRow', {})
        }, 100)
        this.dialogVis = false
      },
      exportSubmit() {
        this.$refs.exportRef.validate((val) => {
          if (!val) return
          this.handleConfirmExport(2)
        })
      },
      /**
       * 确认导出
       */
      async handleConfirmExport(val) {
        const params = {
          dataSetIds: this.exportForm.datasetId,
          pickPicExportDO: this.currentRow,
          type: val,
        }
        const res = await solutionExport.pickImgExport(params)
        // 计算数据量
        if (val === 1) {
          this.imgTotal = res.data.value
          // console.log('数据量=====', res.data)
        }
        // 触发导出事件
        if (val === 2) {
          this.$emit('update:recordDataset', params.dataSetIds)
          if (res.data === 0) {
            this.$message.warning('数据量为零，无法导出')
          } else {
            this.exportCance()
            this.$emit('success')
          }
        }
      },
    },
  }
</script>
<style scoped>
  /* @import url(); 引入css类 */
</style>
