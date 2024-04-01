<!--  -->
<template>
  <div>
    <el-dialog
      v-model="dialogVis"
      :before-close="runFormCancel"
      :close-on-click-modal="false"
      :title="translate('运行')"
      width="600px"
    >
      <el-form ref="runFormRef" label-width="80px" :model="runForm">
        <el-form-item label="日期" prop="dateTime">
          <el-date-picker
            v-model="runForm.dateTime"
            :default-time="defaultTime"
            end-placeholder="结束日期"
            range-separator="To"
            :shortcuts="shortcuts"
            start-placeholder="开始日期"
            type="datetimerange"
          />
        </el-form-item>
        <el-form-item
          v-for="(item, index) in runForm.SNList"
          :key="index"
          :label="'SN' + (index + 1)"
        >
          <el-row style="width: 100%">
            <el-col :span="20">
              <el-input v-model="item.value" />
            </el-col>
            <el-col :span="3" style="margin-left: 10px">
              <el-button
                v-if="index === 0"
                circle
                icon="el-icon-plus"
                size="small"
                type="primary"
                @click.prevent="addDomain()"
              />
              <el-button
                v-if="index !== 0"
                circle
                icon="el-icon-minus"
                size="small"
                type="danger"
                @click.prevent="removeDomain(domain, index)"
              />
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="runFormSubmit">
          {{ translate('确定') }}
        </el-button>
        <el-button @click="runFormCancel">
          {{ translate('取消') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import monitorTask from '@/api/monitorTask'
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
    },
    emits: ['update:show', 'update:currentRow'],
    data() {
      return {
        runForm: {
          dateTime: [],
          SNList: [{ value: '' }],
        },
        defaultTime: [
          new Date(2000, 1, 1, 0, 0, 0),
          new Date(2000, 2, 1, 23, 59, 59),
        ],
        shortcuts: [
          {
            text: '最近一周',
            value: () => {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              return [start, end]
            },
          },
          {
            text: '最近一个月',
            value: () => {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              return [start, end]
            },
          },
          {
            text: '最近三个月',
            value: () => {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              return [start, end]
            },
          },
        ],
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
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      removeDomain(item, index) {
        this.runForm.SNList.splice(index, 1)
      },
      addDomain() {
        const nullValList = this.runForm.SNList.filter((el) => el.value === '')
        if (nullValList.length) return this.$message.error('请输入SN')
        this.runForm.SNList.push({ value: '', key: Date.now() })
      },
      /**
       * 运行弹窗取消
       */
      runFormCancel() {
        this.runForm = { dateTime: [], SNList: [{ value: '' }] }
        this.$refs.runFormRef.resetFields()
        this.$emit('update:currentRow', {})
        this.dialogVis = false
      },
      runFormSubmit() {
        this.$refs.runFormRef.validate(async (val) => {
          if (!val) return
          // console.log('this.runForm::', this.runForm);
          const query = {
            monitorId: this.currentRow.id,
          }
          if (this.runForm.dateTime.length) {
            query.startTime = this.runForm.dateTime[0]
            query.endTime = this.runForm.dateTime[1]
          }
          query.snList = this.runForm.SNList.filter((el) => el.value).map(
            (el) => el.value
          )
          const res = await monitorTask.triggerMonitorTask(query)
          if (res.code === 0) {
            this.$message.success(translate('正在同步'))
            this.runFormCancel()
          }
        })
      },
    },
  }
</script>
<style scoped>
  /* @import url(); 引入css类 */
</style>
