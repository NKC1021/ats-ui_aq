<template>
  <div>
    <el-dialog
      v-model="dialogVis"
      :before-close="nodeCancel"
      :close-on-click-modal="false"
      :title="dialogTitle"
      width="32%"
    >
      <el-form
        ref="nodeFormRef"
        label-width="100px"
        :model="nodeForm"
        :rules="nodeRules"
        size="default"
      >
        <el-form-item :label="translate('节点名称')" prop="name">
          <el-input
            v-model="nodeForm.name"
            :placeholder="translate('请输入节点名称')"
          />
        </el-form-item>
        <el-form-item :label="translate('监控路径')" prop="path">
          <el-input
            v-model="nodeForm.path"
            :placeholder="translate('请输入相对路径(多个地址以英文逗号隔开)')"
          />
        </el-form-item>

        <el-row>
          <el-col :span="14" style="padding-right: 10px">
            <el-form-item :label="translate('导入数据集')" prop="importType">
              <el-select
                v-model="nodeForm.importType"
                style="width: 100%"
                @change="importTypeChange"
              >
                <el-option
                  :label="translate('选择已有数据集')"
                  :title="translate('导入用户指定的数据集')"
                  :value="1"
                />
                <el-option
                  :label="translate('任务时间维度')"
                  :title="
                    translate(
                      '若检测监控文件有新图片，根据监控文件名称以及监控时间创建数据集'
                    )
                  "
                  :value="2"
                />
                <el-option
                  :label="translate('导入同一数据集')"
                  :title="
                    translate(
                      '以监控文件名称创建数据集，将图片导入同一监控文件数据集'
                    )
                  "
                  :value="3"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-show="nodeForm.importType === 1" :span="10">
            <el-select v-model="nodeForm.dataSetName" style="width: 100%">
              <el-option
                v-for="item in allDataSetList"
                :key="item.id"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-col>
        </el-row>
        <el-form-item :label="translate('定时任务')" prop="enable">
          <el-switch
            v-model="nodeForm.enable"
            :active-value="1"
            :inactive-value="0"
            size="small"
            @change="enableChange"
          />
        </el-form-item>
        <el-form-item v-if="nodeForm.enable" prop="cron">
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
            v-model="nodeForm.cron"
            :placeholder="translate('请自定义检测间隔(分钟)')"
          />
        </el-form-item>
        <el-form-item v-if="nodeForm.enable" :label="translate('触发时间')">
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
        <el-button type="primary" @click="nodeSubmit">
          {{ translate('确定') }}
        </el-button>
        <el-button @click="nodeCancel">{{ translate('取消') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import monitorTask from '@/api/monitorTask'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
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
      dataList: {
        type: Array,
        default: () => [],
      },
      dialogType: {
        type: String,
        default: 'add',
      },
      allDataSetList: {
        type: Array,
        default: () => [],
      },
    },
    emits: [
      'update:show',
      'getListMonitorTask',
      'update:currentRow',
      'update:dialogType',
    ],
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
        nodeForm: {
          name: '',
          path: '',
          enable: 0,
          importType: null,
          cron: '0 0 0 * * *',
          dataSetName: '',
        },
        nodeRules: {
          name: [
            {
              required: true,
              message: translate('必填'),
              trigger: 'blur',
            },
          ],
          importType: [
            {
              required: true,
              message: translate('必填'),
              trigger: 'change',
            },
          ],
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
      ...mapStores(recordProInfo),
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
      solutionId() {
        return this.projectStore.getSolutionId
      },
      timeRadio: {
        get() {
          return this.nodeForm.cron
        },
        set(newVal) {
          this.nodeForm.cron = newVal
        },
      },
    },
    watch: {
      currentRow(newVal) {
        //   console.log('newVal::::', newVal);
        const _obj = { ...newVal }
        if (JSON.stringify(_obj) !== '{}') {
          Object.keys(this.nodeForm).forEach((key) => {
            this.nodeForm[key] = _obj[key]
          })
        }
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      /**
       * 启用按钮
       */
      enableChange() {
        this.nodeForm.cron = '0 0 0 * * *'
      },
      /**
       * 导入数据集
       */
      importTypeChange() {
        this.nodeForm.dataSetId = ''
      },
      /**
       * 表单取消
       */
      nodeCancel() {
        this.nodeForm = {
          name: '',
          path: '',
          enable: 0,
          importType: null,
          cron: '0 0 0 * * *',
          dataSetName: '',
        }
        this.$emit('update:currentRow', {})
        this.$emit('update:dialogType', 'add')
        this.$refs.nodeFormRef.resetFields()
        this.dialogVis = false
      },
      /**
       * 表单提交
       */
      nodeSubmit() {
        this.$refs.nodeFormRef.validate(async (val) => {
          if (val) {
            let query = {}
            switch (this.dialogType) {
              case 'add': {
                query = { ...this.nodeForm }
                query.solutionId = this.solutionId
                break
              }
              case 'edit': {
                query = Object.assign(this.currentRow, this.nodeForm)
                break
              }
            }
            const res = await monitorTask.saveMonitorTask(query)
            if (res.code === 0) {
              this.nodeCancel()
              this.$emit('getListMonitorTask')
            }
          }
        })
      },
    },
  }
</script>
