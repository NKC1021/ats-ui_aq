<!--  -->
<template>
  <div class="node-data-tool-container">
    <el-row class="node-header">
      <el-col :span="12">
        <el-button icon="Plus" type="primary" @click="dialogVis = true">
          {{ translate('新增') }}
        </el-button>
        <el-button icon="Delete" type="danger" @click="deleteNodes">
          {{ translate('删除') }}
        </el-button>
      </el-col>
    </el-row>
    <div class="node-table">
      <el-table
        :data="tableData"
        height="100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column :label="translate('节点名称')" prop="name" />
        <el-table-column :label="translate('监控路径')" prop="path" />
        <el-table-column :label="translate('检测间隔')" prop="cron">
          <template #default="scope">
            <div v-show="scope.row.enable === 0">
              {{ translate('无间隔') }}
            </div>
            <div v-show="scope.row.enable === 1">
              {{
                cronObj[`${scope.row.cron}`]
                  ? cronObj[`${scope.row.cron}`]
                  : scope.row.cron
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="translate('任务进度')" prop="status">
          <template #default="scope">
            <div v-if="scope.row.progress && scope.row.taskStatus === 3">
              <el-row>
                <el-col :span="18">
                  <el-progress
                    :percentage="
                      scope.row.progress > 100 ? 100 : scope.row.progress
                    "
                    :stroke-width="15"
                    style="line-height: 23px"
                    :text-inside="true"
                  />
                </el-col>
              </el-row>
            </div>
            <span v-else>{{ monitorTaskStatusObj[scope.row.taskStatus] }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="translate('导入数据集')" prop="importType">
          <template #default="scope">
            {{ importTypeObj[`${scope.row.importType}`] }}
          </template>
        </el-table-column>
        <el-table-column
          :formatter="timeFormatter"
          :label="translate('创建时间')"
          prop="updateTime"
        />
        <el-table-column :label="translate('启用')" prop="enable" width="100px">
          <template #default="scope">
            {{ transformEnable(scope.row.enable) }}
          </template>
        </el-table-column>
        <el-table-column :label="translate('操作')" min-width="180px">
          <template #default="scope">
            <el-button
              icon="VideoPlay"
              link
              type="primary"
              @click="triggerNode(scope.row)"
            >
              {{ translate('运行') }}
            </el-button>
            <el-button
              icon="View"
              link
              type="primary"
              @click="checkedNode(scope.row)"
            >
              {{ translate('查看') }}
            </el-button>
            <el-button
              icon="EditPen"
              link
              type="primary"
              @click="editNode(scope.row)"
            >
              {{ translate('编辑') }}
            </el-button>
            <el-button
              icon="CircleClose"
              link
              type="primary"
              @click="stopNode(scope.row)"
            >
              {{ translate('停止') }}
            </el-button>
            <el-popconfirm
              :hide-after="100"
              :title="translate('是否删除数据')"
              @cancel="scope.row.visible = false"
              @confirm="deleteNode(scope.row)"
            >
              <template #reference>
                <el-button
                  icon="Delete"
                  link
                  type="primary"
                  @click="scope.row.visible = false"
                >
                  {{ translate('删除') }}
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="translate('暂无数据')" />
        </template>
      </el-table>
    </div>
    <!-- 新增编辑 -->
    <nodeDialog
      v-model:current-row="currentRow"
      v-model:dialog-type="dialogType"
      v-model:show="dialogVis"
      :all-data-set-list="allDataSetList"
      @get-list-monitor-task="listMonitorTask"
    />
    <!-- 查看详情 -->
    <nodeDetailDialog
      v-model:current-row="currentRow"
      v-model:show="detailVis"
      :table-data="nodeDetailList"
    />
    <!-- 运行 -->
    <runDialog v-model:current-row="currentRow" v-model:show="runDiaVis" />
  </div>
</template>

<script>
  // import i18n from '@/i18n'
  import { translate } from '@/i18n'
  import { getStore, setStore } from '@/utils/storage'
  import monitorTask from '@/api/monitorTask'
  import solutionDataSet from '@/api/solutionDataSet'
  import nodeDialog from '@/views/components/project/node/crudDialog.vue'
  import runDialog from '@/views/components/project/node/runDialog.vue'
  import nodeDetailDialog from '@/views/components/project/node/detailDialog.vue'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'

  export default {
    components: {
      nodeDialog,
      nodeDetailDialog,
      runDialog,
    },
    data() {
      return {
        runDiaVis: false,
        tableData: [{}],
        value: true,
        dialogVis: false,
        dialogType: 'add',
        currentRow: {}, //记录当前行数据信息
        selectedNodes: [],
        detailVis: false,
        nodeDetailList: [],
        allDataSetList: [],
        importTypeObj: {
          1: translate('选择已有数据集'),
          2: translate('任务时间维度'),
          3: translate('导入同一数据集'),
        },
        monitorTaskStatusObj: {
          1: translate('准备开始'),
          2: translate('筛选有效图片'),
          3: translate('正在导入图片'),
          4: translate('成功'),
          5: translate('失败'),
        },
        cronObj: {
          '0 0 * * * *': translate('每小时'),
          '0 0 */12 * * *': translate('每12小时'),
          '0 0 0 * * *': translate('每天'),
          '0 0 0 * * 0': translate('每周'),
          '0 0 0 1 * *': translate('每月'),
        },
        progressMap: {}, // 记录监控节点任务进度
      }
    },
    computed: {
      translate() {
        return translate
      },
      socketMsg() {
        return this.projectStore.socketMsg
      },
      ...mapStores(recordProInfo),
    },
    watch: {
      socketMsg(newVal) {
        if (newVal.key === 'message.monitor_import.status_change') {
          // 情况1：监控任务状态改变，刷新列表
          this.listMonitorTask()
        }
        if (newVal.key === 'message.monitor_import.progress_update') {
          // 情况2：监控任务进度改变，修改指定进度信息
          const _map = getStore({ name: 'nodeProgressMap' })
          _map && (this.progressMap = _map)
          const taskInfo = JSON.parse(newVal.data)
          if (this.progressMap[`${taskInfo.path}`]) {
            // 如果有存值，取最大值，保证进度条不回退
            let _progress = parseFloat((taskInfo.progress * 100).toFixed(2))
            const _progressCurrent = this.progressMap[`${taskInfo.path}`]
            _progress =
              _progress > _progressCurrent ? _progress : _progressCurrent
            this.progressMap[`${taskInfo.path}`] = _progress
          } else {
            this.progressMap[`${taskInfo.key}`] = parseFloat(
              (taskInfo.progress * 100).toFixed(2)
            )
          }
          setStore({
            name: 'nodeProgressMap',
            content: this.progressMap,
          })
          this.addDataSetProgress()
        }
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {
      this.listMonitorTask()
      this.listDataSet()
    },
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      timeFormatter(row) {
        return new Date(row.updateTime).toLocaleString()
      },
      transformEnable(enable) {
        if (enable === 0) {
          return this.translate('关闭')
        }
        if (enable === 1) {
          return this.translate('启用')
        }
      },
      /**
       * 获取所有配置
       */
      async listMonitorTask() {
        const res = await monitorTask.listMonitorTask({})
        if (res.code === 0) {
          this.tableData = res.data
          this.tableData.forEach((el) => {
            el.progress = 0
          })
          this.addDataSetProgress()
          this.removeProgressById()
        }
      },
      /**
       * 给数据集添加进度
       */
      addDataSetProgress() {
        const _map = getStore({ name: 'nodeProgressMap' })

        if (_map) {
          this.tableData.forEach((el) => {
            if (_map[el.path]) {
              el['progress'] = this.progressMap[el.path]
            }
          })
        }
      },
      /**
       * 去掉数据完成状态的Map进度
       */
      removeProgressById() {
        this.tableData.forEach((el) => {
          if (el.taskStatus === 4) {
            delete this.progressMap[el.path]
          }
        })
      },
      /**
       * 运行
       */
      async triggerNode(rowInfo) {
        this.currentRow = { ...rowInfo }
        this.runDiaVis = true
      },
      /**
       *查看
       */
      async checkedNode(rowInfo) {
        this.currentRow = { ...rowInfo }
        this.$nextTick(() => {
          this.detailVis = true
        })
      },
      /**
       * 编辑
       */
      editNode(rowInfo) {
        this.dialogType = 'edit'
        this.currentRow = { ...rowInfo }
        this.$nextTick(() => {
          this.dialogVis = true
        })
      },
      /**
       * 停止
       */
      async stopNode(rowInfo) {
        const res = await monitorTask.stopMonitorTask({
          id: rowInfo.id,
        })
        if (res.code === 0) {
          this.$message.success(translate('正在停止'))
        }
      },
      async deleteMonitorTask(delInfo) {
        const res = await monitorTask.deleteMonitorTask(delInfo)
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.listMonitorTask()
        }
      },
      /**
       * 删除
       */
      deleteNode(rowInfo) {
        const query = {
          ids: [rowInfo.id],
        }
        this.deleteMonitorTask(query)
      },
      /**
       * 删除多条数据
       */
      deleteNodes() {
        if (this.selectedNodes.length) {
          this.$confirm(this.translate('是否删除数据'), {
            type: 'warning',
          }).then(() => {
            const ids = this.selectedNodes.map((el) => el.id)
            const query = {
              ids: ids,
            }
            this.deleteMonitorTask(query)
          })
        } else {
          this.$message.error(this.translate('请勾选数据'))
        }
      },
      /**
       * 获取当前项目数据集
       */
      async listDataSet() {
        const res = await solutionDataSet.listDataSet()
        if (res.code === 0) {
          this.allDataSetList = res.data
        }
      },
      handleSelectionChange(val) {
        this.selectedNodes = val
      },
    },
  }
</script>
<style scoped lang="scss">
  .node-header {
    padding-bottom: 4px;
  }
  .node-table {
    height: calc(100% - 36px);
  }
</style>
