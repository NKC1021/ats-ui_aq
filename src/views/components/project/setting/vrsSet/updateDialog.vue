<template>
  <div>
    <el-dialog
      v-model="dialogVis"
      :before-close="taskCancel"
      :close-on-click-modal="false"
      :title="translate('编辑')"
      width="32%"
    >
      <el-form
        ref="nodeFormRef"
        label-width="100px"
        :model="taskInfo"
        :rules="nodeRules"
        size="default"
      >
        <el-form-item :label="translate('触发方式')" prop="enable">
          <el-radio-group
            v-model="taskInfo.triggerType"
            class="ml-4"
            @change="taskInfo.cron = ''"
          >
            <el-radio :label="0">{{ translate('仅手动') }}</el-radio>
            <el-radio :label="1">{{ translate('自动触发') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="taskInfo.triggerType === 1" prop="cron">
          <template #label>
            <span>{{ translate('cron表达式') }}</span>
            <el-tooltip
              :content="
                translate('可以在搜索引擎中查询任意时间间隔的cron表达式')
              "
              effect="dark"
              placement="top"
            >
              <i class="el-icon-warning"></i>
            </el-tooltip>
          </template>
          <el-input
            v-model="taskInfo.cron"
            :placeholder="translate('请自定义检测间隔(分钟)')"
          />
        </el-form-item>
        <el-form-item
          v-if="taskInfo.triggerType === 1"
          :label="translate('触发时间')"
        >
          <el-radio-group v-model="timeRadio" style="width: 100%">
            <div style="display: flex; width: 100%">
              <div
                v-for="(item, index) in cronBySeconds"
                :key="index"
                style="flex: 1"
              >
                <el-radio :label="item.value">
                  {{ item.label }}
                </el-radio>
              </div>
            </div>

            <div style="display: flex; width: 100%">
              <div
                v-for="(item, index) in cronByMin"
                :key="index"
                style="flex: 1"
              >
                <el-radio :label="item.value">
                  {{ item.label }}
                </el-radio>
              </div>
            </div>
            <div style="display: flex; width: 100%">
              <div
                v-for="(item, index) in radioList"
                :key="index"
                style="flex: 1"
              >
                <el-radio :label="item.value">
                  {{ item.label }}
                </el-radio>
              </div>
            </div>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="taskSubmit">
          {{ translate('确定') }}
        </el-button>
        <el-button @click="taskCancel">{{ translate('取消') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
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
    emits: ['update:currentRow', 'update:show', 'listTask'],
    data() {
      return {
        // 时间段选择
        radioList: [
          { label: translate('每小时'), value: '0 0 * * * *' },
          { label: translate('每12小时'), value: '0 0 */12 * * *' },
          { label: translate('每天'), value: '0 0 0 * * *' },
          { label: translate('每周'), value: '0 0 0 * * 0' },
          { label: translate('每月'), value: '0 0 0 1 * *' },
        ],
        cronBySeconds: [
          { label: '每5秒', value: '*/5 * * * * *' },
          { label: '每10秒', value: '*/10 * * * * *' },
          { label: '每20秒', value: '*/20 * * * * *' },
          { label: '每30秒', value: '*/30 * * * * *' },
          { label: '每50秒', value: '*/50 * * * * *' },
        ],
        cronByMin: [
          { label: '每5分', value: '0 0/5 * * * *' },
          { label: '每10分', value: '0 */10 * * * *' },
          { label: '每20分', value: '0 */20 * * * *' },
          { label: '每30分', value: '0 */30 * * * *' },
          { label: '每50分', value: '0 */50 * * * *' },
        ],
        taskInfo: {
          id: 0,
          triggerType: 0,
          cron: '', // 默认每天0点执行
        },
        nodeRules: {
          cron: [
            {
              required: true,
              message: translate('必填'),
              trigger: 'blur',
            },
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
      timeRadio: {
        get() {
          return this.taskInfo.cron
        },
        set(newVal) {
          this.taskInfo.cron = newVal
        },
      },
    },
    watch: {
      currentRow(newVal) {
        this.taskInfo = { ...newVal } // 深kao
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      /**
       * 表单取消
       */
      taskCancel() {
        this.taskInfo = {
          triggerType: 0,
          cron: '', // 默认没有执行时间
        }
        this.$emit('update:currentRow', {})
        this.$refs.nodeFormRef.resetFields()
        this.dialogVis = false
      },
      /**
       * 表单提交
       */
      taskSubmit() {
        this.$refs.nodeFormRef.validate(async (val) => {
          if (val) {
            if (this.taskInfo.id === 0) {
              console.log('this.taskInfo.id === 0，不可update')
              return
            }
            const res = await pcbDataTask.save(this.taskInfo)
            if (res.code === 0) {
              this.taskCancel()
              this.$emit('listTask')
            }
          }
        })
      },
    },
  }
</script>
