<template>
  <div class="pro-data-tool-container">
    <el-row>
      <el-col class="myproject-head" :span="12">
        <el-button icon="Plus" type="primary" @click="addProject">
          {{ translate('新增') }}
        </el-button>
        <el-button icon="Delete" type="danger" @click="deleteByIds">
          {{ translate('删除') }}
        </el-button>
      </el-col>
    </el-row>
    <div class="myproject-content">
      <el-table
        :data="tableData"
        height="100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column :label="translate('项目名称')" prop="name">
          <template #default="scope">
            <div class="project-name" @click="changeRoute(scope.row)">
              {{ scope.row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="translate('启用版本')">
          <template #default="scope">
            <div v-if="scope.row.enableVersion">
              <el-tag>V{{ scope.row.enableVersion.num }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="translate('项目描述')" prop="desc" />
        <el-table-column
          :formatter="openTimeFormatter"
          :label="translate('最近打开')"
          prop="openTime"
        />
        <el-table-column
          :formatter="createTimeFormatter"
          :label="translate('创建时间')"
          prop="createTime"
        />
        <el-table-column :label="translate('状态')">
          <template #default="scope">
            <div v-if="scope.row.syncTaskInfo">
              <div v-show="scope.row.syncTaskInfo.status === 1">
                <!-- <span>进度条</span> -->
                <el-progress
                  :percentage="scope.row.progress"
                  :stroke-width="18"
                  :text-inside="true"
                />
              </div>
              <div v-show="scope.row.syncTaskInfo.status !== 1">
                {{ statusObj[`${scope.row.syncTaskInfo.status}`] }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="translate('同步')" width="320">
          <template #default="scope">
            <el-button
              :disabled="clockByProStatus(scope.row, '拉取')"
              icon="Bottom"
              link
              type="primary"
              @click="handlePull(scope.row, translate('拉取'))"
            >
              {{ translate('拉取') }}
            </el-button>
            <el-button
              :disabled="clockByProStatus(scope.row, '推送')"
              icon="Top"
              link
              type="primary"
              @click="handlePush(scope.row)"
            >
              {{ translate('推送') }}
            </el-button>
            <el-button
              :disabled="clockByProStatus(scope.row, '取消')"
              icon="Close"
              link
              type="primary"
              @click="cancelSync(scope.row)"
            >
              {{ translate('取消') }}
            </el-button>
            <el-button
              :disabled="clockByProStatus(scope.row, '重试')"
              icon="Refresh"
              link
              type="primary"
              @click="retrySync(scope.row)"
            >
              {{ translate('重试') }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button
              icon="EditPen"
              link
              type="primary"
              @click="editProject(scope.row)"
            >
              {{ translate('编辑') }}
            </el-button>
            <el-popconfirm
              :hide-after="100"
              :title="translate('是否删除数据?')"
              @cancel="scope.row.visible = false"
              @confirm="deleteById(scope.row)"
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
    <!-- 编辑以及新增 -->
    <operateDialog
      v-model:current-row="currentRow"
      v-model:dialog-type="dialogType"
      v-model:show="dialogVis"
      @get-list-solution="listSolutionDetails"
    />

    <!-- 拉取 -->
    <pullSolution
      v-model:current-row="currentRow"
      v-model:dialog-vis="pullDialogVis"
      v-model:retry-sync-flag="retrySyncFlag"
      :service-node-list="serverList"
      @getservice-info-fail="getserviceInfoFail"
      @list-solution-details="listSolutionDetails"
    />
    <!-- 推送 -->
    <pushSolution
      v-model:current-row="currentRow"
      v-model:dialog-vis="pushDialogVis"
      v-model:retry-sync-flag="retrySyncFlag"
      :service-node-list="serverList"
      @getservice-info-fail="getserviceInfoFail"
      @list-solution-details="listSolutionDetails"
    />
    <!-- 更新权限 -->
    <el-dialog
      v-model="updateTokenDialog"
      :close-on-click-modal="false"
      :show-close="false"
      :title="translate('更新权限')"
      width="600px"
    >
      <el-form ref="tokenRef" label-width="100px" :model="updateTokenForm">
        <el-form-item
          :label="translate('密码')"
          prop="password"
          :rules="[{ required: true, message: translate('必填') }]"
        >
          <el-input
            v-model="updateTokenForm.password"
            autocomplete="off"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="updateTokenCancel">
          {{ translate('取消') }}
        </el-button>
        <el-button type="primary" @click="updatTokenSubmit()">
          {{ translate('确定') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
  import { useRoutesStore } from '@/store/modules/routes'
  import { getStore, setStore } from '@/utils/storage'
  import { translate } from '@/i18n'
  import solution from '@/api/solution'
  import remoteApi from '@/api/remoteApi'
  import fileApi from '@/api/solutionFile'
  import operateDialog from '@/views/components/project/home/crudDialog.vue'
  import pullSolution from '@/views/components/project/home/pullSolution.vue'
  import pushSolution from '@/views/components/project/home/pushSolution.vue'
  // import shareApi from '@/api/project/share'
  export default {
    components: { operateDialog, pullSolution, pushSolution },
    data() {
      return {
        serverList: [],
        retrySyncFlag: false, //记录重试状态标记，推送和拉取里面值不可更改
        tableData: [],
        dialogVis: false,
        selectedRows: [],
        pullDialogVis: false,
        pushDialogVis: false,
        currentRow: {}, //记录当前行数据
        updateTokenDialog: false,
        updateTokenForm: {
          password: '',
        },
        selectServeInfo: {},
        dialogType: 'add',
        statusObj: {
          1: '进行中',
          2: '异常',
          3: '完成',
          4: '停止',
        },
        timer: null, //定时任务
        progressMap: new Map(), // 用来存储进度
      }
    },
    computed: {
      translate() {
        return translate
      },
      ...mapStores(recordProInfo, useRoutesStore),
      websocket() {
        return this.projectStore.socketMsg
      },
    },
    watch: {},
    //生命周期 - 创建完成（访问当前this实例）
    async created() {
      this.projectStore.updateSolutionId('') //置空solutionId
      this.projectStore.setSolutionName('') //置空solutionId
      this.listSolutionDetails()
      this.getServerList()
    },
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    beforeUnmount() {
      // console.log('销毁了吗');
      clearInterval(this.timer)
      this.timer = null
    },
    methods: {
      openTimeFormatter(row) {
        return new Date(row.openTime).toLocaleString()
      },
      createTimeFormatter(row) {
        return new Date(row.createTime).toLocaleString()
      },
      /**
       * 推送禁用条件
       */
      pushDisabled(rowInfo) {
        if (!rowInfo.enableVersion) {
          return true
        } else {
          return false
        }
      },
      /**
       * 取消同步任务
       */
      cancelDisabled(rowInfo) {
        if (!rowInfo.syncTaskInfo) {
          return true
        } else {
          return false
        }
      },
      /**
       * 根据项目的状态给每个按钮上锁
       */
      clockByProStatus(rowInfo, btnName) {
        // status 任务状态：1.进行中、2.异常、3.完成、4.停止
        const proSyncTaskInfo = rowInfo.syncTaskInfo
        if (btnName === translate('拉取') || btnName === translate('推送')) {
          if (!proSyncTaskInfo) {
            return false
          } else {
            if ([3, 4].includes(rowInfo.syncTaskInfo.status)) {
              return false
            }
          }
        }
        if (btnName === translate('取消')) {
          if (proSyncTaskInfo) {
            if ([1, 2].includes(proSyncTaskInfo.status)) {
              return false
            }
          }
        }
        if (btnName === translate('重试')) {
          if (proSyncTaskInfo) {
            if (proSyncTaskInfo.status === 2) {
              return false
            }
          }
        }
        return true
      },
      /**
       * 获取项目
       */
      async listSolutionDetails() {
        const res = await solution.listDetails({})
        if (res.code === 0 && res.data.length) {
          this.tableData = res.data
          this.findSyncTaskInfoRunning()
          this.setSolutionProgress()
          this.removeSolutionProgress()
          if (!this.projectStore.solutionId) {
            this.projectStore.updateSolutionId(res.data[0].id)
            this.projectStore.setSolutionName(res.data[0].name)
          }
        }
      },
      /**
       * 拉取推送检查是否有任务在进行开启定时任务
       */
      findSyncTaskInfoRunning() {
        const _isRunning = this.tableData.some((el) => {
          return el.syncTaskInfo && el.syncTaskInfo.status === 1
        })
        // console.log('_isRunning', _isRunning);
        clearInterval(this.timer)
        if (_isRunning) {
          this.timer = setInterval(() => {
            this.listSolutionDetails()
          }, 5000)
        }
      },
      /**
       * 删除项目
       */
      async deleteSolution(ids = []) {
        const query = { ids: ids }
        const res = await solution.deleteSolution(query)
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.listSolutionDetails()
        }
      },
      /**
       * 单条删除
       */
      deleteById(rowInfo) {
        const id = [rowInfo.id]
        this.deleteSolution(id)
      },
      /**
       * 多条删除
       */
      deleteByIds() {
        if (this.selectedRows.length) {
          this.$confirm(translate('删除选中数据'), {
            type: 'warning',
          }).then(() => {
            const ids = this.selectedRows.map((el) => el.id)
            this.deleteSolution(ids)
          })
        } else {
          this.$message.error(translate('请勾选数据'))
        }
      },
      /**
       * 新增项目
       */
      addProject() {
        this.dialogVis = true
      },
      /**
       * 编辑项目
       */
      editProject(rowInfo) {
        this.currentRow = { ...rowInfo }
        this.dialogType = 'edit'
        this.$nextTick(() => {
          this.dialogVis = true
        })
      },
      handleSelectionChange(val) {
        this.selectedRows = val
      },
      /**
       * 点击项目
       */
      changeRoute(rowInfo) {
        this.projectStore.updateSolutionId(rowInfo.id)
        this.projectStore.setSolutionName(rowInfo.name)
        this.routesStore.filterAuthMenu(false)
        const firstTabInProject = this.routesStore.getFirstRouteInProjectTab()
        if (!firstTabInProject) {
          this.$message.error('本角色无项目访问权限！')
          return
        }
        this.$router.push({ name: firstTabInProject })
        solution.open()
        // console.log('rowInfo:::', rowInfo);
        // this.$store.commit('DEL_ALL_TAG')
        // this.$store.commit('SET_MENUINDEXTYPE', '/p')
        // this.$store.commit('SET_CUR_SOLUTION', rowInfo.name)
        // this.$store.commit('SET_CURPROJECTNAME', '')
        // this.$setStore({
        //   name: 'solutionName',
        //   content: rowInfo.name,
        //   type: 'session',
        // })
        // this.$setStore({ name: 'projectName', content: '', type: 'session' })
        // this.$setStore({ name: 'menuIndex', content: '/p', type: 'session' })
        // this.$setStore({
        //   name: 'solutionId',
        //   content: rowInfo.id,
        //   type: 'session',
        // })
        // shareApi.openSolution()
      },

      /**
       * 拉取
       */
      async handlePull(row) {
        this.$confirm(
          `<h3 style="margin:0px">${translate(
            '此操作将覆盖所选项目,是否继续?'
          )}</h3><p>${translate('建议本地先推送，再执行拉取')}</p>`,
          {
            confirmButtonText: translate('继续'),
            dangerouslyUseHTMLString: true,
            type: 'warning',
          }
        ).then(() => {
          this.pullDialogVis = true
          this.currentRow = { ...row }
        })
      },
      /**
       * 推送
       */
      handlePush(row) {
        if (!row.enableVersion) {
          return this.$message.error('请保存版本')
        }
        this.$confirm(
          `<h3 style="margin:0px">${translate(
            '此操作将覆盖所选项目，是否继续？'
          )}</h3><p>${translate('建议本地先推送，再执行拉取')}</p>`,
          {
            confirmButtonText: translate('继续'),
            dangerouslyUseHTMLString: true,
            type: 'warning',
          }
        ).then(() => {
          this.pushDialogVis = true
          this.currentRow = { ...row }
        })
      },

      /**
       * 获取服务列表
       */
      async getServerList() {
        const res = await remoteApi.listServer()
        if (res.code === 0) {
          this.serverList = []
          res.data.forEach((item) => {
            // 服务类型：1 ATS服务，2 ARS 服务
            if (item.type === 1) {
              this.serverList.push(item)
            }
          })
        }
      },
      /**
       * 接受拉取推送子组件
       */
      refreshProsList(val) {
        if (val) {
          this.listSolutionDetails()
        }
      },

      /**
       * 取消同步
       */
      async cancelSync(row) {
        const _serverId = row.syncTaskInfo.serverId
        const _serviceInfo = this.serverList.find((el) => el.id === _serverId)
        const formData = {
          solutionId: row.id,
          remoteAuth: _serviceInfo.token,
        }
        const res = await fileApi.stopSync(formData)
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.listSolutionDetails()
        }
      },
      /**
       * 重试同步
       */
      retrySync(proInfo) {
        this.currentRow = { ...proInfo }
        this.retrySyncFlag = true
        const _syncTaskInfo = proInfo.syncTaskInfo
        // 异常值是2重试
        if (_syncTaskInfo.status === 2) {
          const _syncType = _syncTaskInfo.type //1. 推送任务 2. 拉取任务 3. 解决方案推送 4. 解决方案拉取
          if (_syncType === 3) {
            this.pushDialogVis = true
          }
          if (_syncType === 4) {
            this.pullDialogVis = true
          }
        }
      },
      /**
       * 获取服务器失败
       */
      getserviceInfoFail(info) {
        this.selectServeInfo = { ...info }
        this.updateTokenDialog = true
      },
      /**
       * 更新权限取消
       */
      updateTokenCancel() {
        this.updateTokenDialog = false
        this.selectServeInfo = {}
        this.$nextTick(() => {
          this.$refs.tokenRef.resetFields()
        })
      },
      /**
       * 更新权限提交
       */
      updatTokenSubmit() {
        this.$refs.tokenRef.validate(async (val) => {
          if (val) {
            const serverType = this.selectServeInfo.type //服务器类型 1:ATS 2:Ars
            const fd = {
              ip: this.selectServeInfo.ip,
              username: this.selectServeInfo.remoteUserName,
              password: this.updateTokenForm.password,
            }
            // fd.append('ip', this.selectServeInfo.ip)
            // fd.append('username', this.selectServeInfo.remoteUserName)
            if (serverType === 1) {
              // fd.append(
              //   'password',
              //   strEncryption(this.updateTokenForm.password, website.aesKey)
              // )
              const data = await remoteApi.login(fd)
              if (data.code === 0) {
                const userToken = data.data
                this.selectServeInfo.token = `${userToken.token}`
                const res = await remoteApi.saveServer(this.selectServeInfo)
                if (res.code === 0) {
                  this.updateTokenCancel()
                  this.getServerList()
                }
              } else {
                return this.$message.error(res.message)
              }
            }
          }
        })
      },
      /**
       * 显示进度条
       */
      // showProjectProgress(info) {
      //   // code
      // },
      /**
       * 保存进度条
       */
      saveSolutionProgress(wsInfo) {
        const dataObj = wsInfo.data
        if (this.progressMap.has(dataObj.key)) {
          const newProgress = Math.floor(dataObj.progress * 100)
          let _progress = this.progressMap.get(dataObj.key)
          _progress = _progress > newProgress ? _progress : newProgress
          this.progressMap.set(dataObj.key, _progress)
        } else {
          const _progress = Math.floor(dataObj.progress * 100)
          this.progressMap.set(dataObj.key, _progress)
        }
        setStore({ name: 'syncProgress', content: this.progressMap })
      },
      /**
       * 给解决方案增加一个进度字段
       */
      setSolutionProgress() {
        const _mapObj = getStore({
          name: 'syncProgress',
          content: this.progressMap,
        })
        if (_mapObj) {
          this.progressMap = new Map(_mapObj)
        }
        this.tableData.forEach((el) => {
          el.progress = 0
          if (this.progressMap.has(el.id)) {
            el.progress = this.progressMap.get(el.id)
          }
        })
      },
      removeSolutionProgress() {
        this.tableData.forEach((el) => {
          if (el.syncTaskInfo && el.syncTaskInfo.status !== 1) {
            this.progressMap.set(el.id, 0)
          }
        })
      },
    },
  }
</script>
<style scoped lang="scss">
  .myproject-head {
    padding: 4px 0;
  }
  .myproject-content {
    height: calc(100% - 40px);
  }
  .project-name {
    cursor: pointer;
    color: var(--el-color-primary);
  }
  .tip-content {
    text-align: center;
    margin: 3px 0;
  }
  .tip-button {
    text-align: center;
    margin: 0;
  }
</style>
