<!--  -->
<template>
  <div class="vrs-set-box">
    <div class="table-box">
      <el-table :data="tableData" height="100%">
        <el-table-column :label="translate('序号')" prop="id" />
        <el-table-column :label="translate('触发方式')" prop="triggerType">
          <template #default="scope">
            {{ importTypeName[`${scope.row.triggerType}`] }}
          </template>
        </el-table-column>
        <el-table-column :label="translate('触发间隔')" prop="cron" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button
              icon="VideoPlay"
              link
              type="primary"
              @click="openTriggerDialog(scope.row)"
            >
              {{ translate('运行') }}
            </el-button>
            <el-button
              icon="CircleClose"
              link
              type="primary"
              @click="stopPCBDataTask(scope.row)"
            >
              {{ translate('停止') }}
            </el-button>
            <el-button
              icon="Edit"
              link
              type="primary"
              @click="openUpdateDialog(scope.row)"
            >
              {{ translate('编辑') }}
            </el-button>
            <el-button
              icon="View"
              link
              type="primary"
              @click="openRecordDialog(scope.row)"
            >
              {{ translate('查看') }}
            </el-button>
            <el-popconfirm
              :hide-after="100"
              :title="translate('是否删除数据')"
              @confirm="deletePCBDataTask(scope.row)"
            >
              <template #reference>
                <el-button icon="Delete" link type="primary">
                  {{ translate('删除') }}
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- Dialog 触发任务 -->
    <trigger-dialog
      v-model:current-row="currentRow"
      v-model:show="triggerDialogView"
    />
    <!-- Dialog 新增 -->
    <updateDialog
      v-model:current-row="currentRow"
      v-model:show="updateDialogView"
      @list-task="getTaskData"
    />
    <!-- Dialog 查看详情 -->
    <recordDialog
      v-model:current-row="currentRow"
      v-model:show="recordDialogView"
      :table-data="nodeDetailList"
    />
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import pcbDataTask from '@/api/pcbDataTaskService'
  import triggerDialog from '@/views/components/project/setting/vrsSet/triggerDialog.vue'
  import recordDialog from '@/views/components/project/setting/vrsSet/recordView.vue'
  import createDialog from '@/views/components/project/setting/vrsSet/updateDialog.vue'
  export default {
    components: {
      triggerDialog: triggerDialog,
      recordDialog: recordDialog,
      updateDialog: createDialog,
    },
    data() {
      return {
        tableData: [],
        currentRow: {}, //记录当前行数据信息
        triggerDialogView: false, // 触发任务弹窗显示
        recordDialogView: false, // 控制记录弹窗显示
        updateDialogView: false, // 控制新增弹窗显示
        nodeDetailList: [], // 记录列表
        importTypeName: {
          0: translate('仅手动'), // 仅手动
          1: translate('自动触发'), // CRON 定时任务
        },
      }
    },
    computed: {
      translate() {
        return translate
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {
      this.getTaskData()
    },
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      /**
       * 获取pcb数据任务
       */
      async getTaskData() {
        const res = await pcbDataTask.getTask({})
        if (res.code === 0) {
          // console.log(res.data)
          // console.log(res.data)
          // console.log(res.data)
          this.tableData = [res.data]
        }
      },
      /*
       * 新增Vrs捞数据任务
       * */
      async openUpdateDialog(rowInfo) {
        this.currentRow = { ...rowInfo }
        this.$nextTick(() => {
          this.updateDialogView = true
        })
      },
      /**
       * 触发任务
       */
      openTriggerDialog(rowInfo) {
        this.currentRow = { ...rowInfo }
        this.$nextTick(() => {
          this.triggerDialogView = true
        })
      },
      /*
       * 停止Vrs捞数据任务
       * */
      async stopPCBDataTask(rowInfo) {
        const _query = {
          id: rowInfo.id,
        }
        const res = await pcbDataTask.stop(_query)
        if (res.code === 0) {
          this.$message.success(res.msg)
        }
      },
      /*
       * 查看Vrs捞数据任务记录
       * */
      async openRecordDialog(rowInfo) {
        this.currentRow = { ...rowInfo }
        this.$nextTick(() => {
          this.recordDialogView = true
        })
      },
      /*
       * 删除Vrs捞数据任务
       * */
      deletePCBDataTask(rowInfo) {
        const query = {
          ids: [rowInfo.id],
        }
        pcbDataTask
          .deleteTask(query)
          .then((res) => {
            if (res.code === 0) {
              this.$message.success(res.msg)
              this.getTaskData()
            }
          })
          .catch((err) => {
            console.log(err)
          })
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .vrs-set-box {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    .head-nav {
      margin-bottom: 5px;
    }
    .table-box {
      height: calc(100% - 37px);
    }
  }
</style>
