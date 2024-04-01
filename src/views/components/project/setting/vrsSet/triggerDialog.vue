<template>
  <div>
    <el-dialog
      v-model="dialogVis"
      :before-close="beforeClose"
      :close-on-click-modal="false"
      :title="translate('触发')"
      width="27%"
    >
      <el-alert
        :closable="false"
        show-icon
        :title="translate('如果不选择条件会根据最近的任务执行记录自动生成条件')"
        type="warning"
      />
      <el-form ref="formRef" label-width="70px" :model="form">
        <el-form-item :label="translate('SN')" prop="sn">
          <el-select
            v-model="form.sn"
            allow-create
            default-first-option
            filterable
            multiple
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="translate('日期')" prop="dateTimes">
          <el-date-picker
            v-model="form.dateTimes"
            :end-placeholder="translate('结束时间')"
            :range-separator="translate('至')"
            :shortcuts="shortcutsList()"
            :start-placeholder="translate('开始时间')"
            type="datetimerange"
          />
        </el-form-item>
        <el-form-item :label="translate('批次')" prop="productUuid">
          <el-select
            v-model="form.batchName"
            allow-create
            default-first-option
            filterable
            multiple
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="translate('机台')" prop="batchUuid">
          <el-select
            v-model="form.machineName"
            allow-create
            default-first-option
            filterable
            multiple
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="handleConfirm">
          {{ translate('确定') }}
        </el-button>
        <el-button @click="handleCancel">{{ translate('取消') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import { shortcutsList } from '@/utils/timeConst'
  import pcbDataTask from '@/api/pcbDataTaskService'

  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      currentRow: {
        type: Object,
        default: () => {},
      },
    },
    emits: ['update:show'],
    data() {
      return {
        form: {
          id: 0,
          sn: [],
          dateTimes: [],
          batchName: [],
          machineName: [],
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
    },
    watch: {
      currentRow(newVal) {
        this.form.id = newVal.id
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      shortcutsList() {
        return shortcutsList
      },
      beforeClose() {
        // 重置表单
        this.$refs.formRef.resetFields()
        this.dialogVis = false
      },
      async handleConfirm() {
        const reqForm = { ...this.form }
        if (this.form.dateTimes.length) {
          reqForm.detectTimeFrom = this.form.dateTimes[0]
          reqForm.detectTimeTo = this.form.dateTimes[1]
        }
        const res = await pcbDataTask.trigger(reqForm)
        if (res.code === 0) {
          this.$message.success(res.msg)
        }
        this.beforeClose()
      },
      handleCancel() {
        this.beforeClose()
      },
    },
  }
</script>
