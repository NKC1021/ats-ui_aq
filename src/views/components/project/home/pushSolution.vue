<template>
  <div>
    <el-dialog
      v-model="syncDialogShow"
      :before-close="syncCancel"
      class="sync-dia-css"
      :close-on-click-modal="false"
      :title="translate('推送')"
      width="650px"
    >
      <el-tabs v-model="prosListTabName" class="pros-Tab-css">
        <el-tab-pane :label="translate('远端项目')" name="1">
          <el-form
            ref="syncFormRef"
            label-position="right"
            label-width="80px"
            :model="syncForm"
            :rules="syncRules"
            status-icon
          >
            <el-form-item :label="translate('服务器')" prop="serverId">
              <el-select
                v-model="syncForm.serverId"
                clearable
                :disabled="retrySyncFlag"
                style="width: 100%"
                @change="myProServerChange"
              >
                <el-option
                  v-for="(item, index) in serviceNodeList"
                  :key="index"
                  :label="item.name"
                  :value="item.id"
                >
                  <div class="select-css">
                    <span>{{ `${item.name}(${item.remoteUserName})` }}</span>
                    <span>{{ item.ip }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-row>
              <el-col :span="24">
                <el-form-item
                  :label="translate('本地版本')"
                  prop="localVersionId"
                >
                  <el-tag>
                    {{
                      `V${
                        currentRow.enableVersion
                          ? currentRow.enableVersion.num
                          : ''
                      }`
                    }}
                  </el-tag>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="">
                  <el-row>
                    <el-col :span="8">
                      {{ translate('父版本') }}:
                      {{
                        enableVersionInfo.parentNum
                          ? `V${enableVersionInfo.parentNum}`
                          : ''
                      }}
                    </el-col>
                    <el-col :span="8">
                      {{ translate('创建用户：') }}:
                      {{ enableVersionInfo.createBy }}
                    </el-col>
                    <el-col :span="8">
                      {{ translate('创建方式') }}:
                      {{
                        enableVersionInfo.createType === 1
                          ? translate('保存')
                          : enableVersionInfo.createType === 2
                          ? translate('推送')
                          : translate('拉取')
                      }}
                    </el-col>
                    <el-col :span="16">
                      {{ translate('创建时间') }}:
                      {{ enableVersionInfo.createTime }}
                    </el-col>
                    <el-col :span="24">
                      {{ translate('备注') }}:
                      {{ enableVersionInfo.remark }}
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-col>
              <el-col :span="18">
                <el-form-item
                  :label="translate('云端项目')"
                  prop="remoteSolutionId"
                >
                  <el-select
                    v-model="syncForm.remoteSolutionId"
                    :disabled="retrySyncFlag"
                    :placeholder="translate('请选择云端项目')"
                    style="width: 100%"
                    @change="remoteProChange"
                  >
                    <el-option
                      v-for="(item, index) in remoteProjects"
                      :key="index"
                      :label="item.name"
                      :value="item.id"
                    >
                      <div style="padding: 0 10px">
                        {{ `${item.name}(${item.createBy})` }}
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :offset="2" :span="4">
                <el-form-item>
                  <template #label>
                    <el-checkbox
                      v-model="syncForm.newFlag"
                      :disabled="remoteProjects.length === 0 || retrySyncFlag"
                      @change="syncCheckBox"
                    >
                      {{ translate('新建項目') }}
                    </el-checkbox>
                  </template>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item
              :label="translate('备注')"
              prop="remark"
              style="margin-bottom: 30px"
            >
              <el-input
                v-model="syncForm.remark"
                :autosize="{ minRows: 3 }"
                :disabled="retrySyncFlag"
                type="textarea"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane :label="translate('共享项目')" name="2">
          <el-form
            ref="authFormRef"
            label-position="right"
            label-width="80px"
            :model="authSyncForm"
            :rules="syncRules"
            status-icon
          >
            <el-form-item :label="translate('服务器')" prop="serverId">
              <el-select
                v-model="authSyncForm.serverId"
                clearable
                :disabled="retrySyncFlag"
                style="width: 100%"
                @change="authProServerChange"
              >
                <el-option
                  v-for="(item, index) in serviceNodeList"
                  :key="index"
                  :label="item.name"
                  :value="item.id"
                >
                  <div class="select-css">
                    <span>{{ `${item.name}(${item.remoteUserName})` }}</span>
                    <span>{{ item.ip }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-row>
              <el-col :span="24">
                <el-form-item
                  :label="translate('本地版本')"
                  prop="localVersionId"
                >
                  <el-tag>
                    {{
                      `V${
                        currentRow.enableVersion
                          ? currentRow.enableVersion.num
                          : ''
                      }`
                    }}
                  </el-tag>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="">
                  <el-row>
                    <el-col :span="8">
                      {{ translate('父版本') }}:
                      {{
                        `${
                          enableVersionInfo.parentNum
                            ? `V${enableVersionInfo.parentNum}`
                            : ''
                        }`
                      }}
                    </el-col>
                    <el-col :span="8">
                      {{ translate('创建用户') }}:
                      {{ enableVersionInfo.createBy }}
                    </el-col>
                    <el-col :span="8">
                      {{ translate('创建方式') }}:
                      {{
                        enableVersionInfo.createType === 1
                          ? translate('保存')
                          : enableVersionInfo.createType === 2
                          ? translate('推送')
                          : translate('拉取')
                      }}
                    </el-col>
                    <el-col :span="16">
                      {{ translate('创建时间') }}:
                      {{ enableVersionInfo.createTime }}
                    </el-col>
                    <el-col :span="24">
                      {{ translate('备注') }}:
                      {{ enableVersionInfo.remark }}
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-col>
              <el-col :span="18">
                <el-form-item
                  :label="translate('云端项目')"
                  prop="remoteSolutionId"
                >
                  <el-select
                    v-model="authSyncForm.remoteSolutionId"
                    :disabled="retrySyncFlag"
                    :placeholder="translate('请选择云端项目')"
                    style="width: 100%"
                    @change="remoteAuthProChange"
                  >
                    <el-option
                      v-for="(item, index) in remoteAuthProjects"
                      :key="index"
                      :label="item.solutionName"
                      :value="item.solutionId"
                    >
                      <div style="padding: 0 10px">
                        {{ `${item.solutionName}(${item.authorizeUsername})` }}
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :offset="2" :span="4">
                <el-form-item>
                  <template #label>
                    <el-checkbox
                      v-model="authSyncForm.newFlag"
                      :disabled="
                        remoteAuthProjects.length === 0 || retrySyncFlag
                      "
                      @change="authSyncCheckBox"
                    >
                      {{ translate('新建项目') }}
                    </el-checkbox>
                  </template>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item
              :label="translate('备注')"
              prop="remark"
              style="margin-bottom: 30px"
            >
              <el-input
                v-model="authSyncForm.remark"
                :autosize="{ minRows: 3 }"
                :disabled="retrySyncFlag"
                type="textarea"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button type="primary" @click="syncCommit">
          {{ translate('确定') }}
        </el-button>
        <el-button @click="syncCancel">{{ translate('取消') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import remoteApi from '@/api/remoteApi'
  import fileController from '@/api/solutionFile'
  export default {
    props: {
      currentRow: {
        type: Object,
        default: () => {},
      },
      serviceNodeList: {
        type: Array,
        default: () => [],
      },
      dialogVis: {
        type: Boolean,
        default: false,
      },
      retrySyncFlag: {
        type: Boolean,
        default: false,
      },
    },
    emits: [
      'update:dialogVis',
      'update:currentRow',
      'update:retrySyncFlag',
      'getserviceInfoFail',
      'getserviceInfoFail',
      'listSolutionDetails',
    ],
    data() {
      return {
        syncRules: {
          serverId: [
            { required: true, message: translate('必填'), trigger: 'change' },
          ],
          remoteProjectVersions: [
            { required: true, message: translate('必填'), trigger: 'change' },
          ],
        },
        prosListTabName: '1',
        syncForm: {
          serverId: '',
          remoteSolutionId: '',
          remark: '',
          newFlag: false,
        },
        authSyncForm: {
          serverId: '',
          remoteSolutionId: '',
          remark: '',
          newFlag: false,
        },
        shareProjectVersionList: [],
        projectVersionList: [],
        selectServeInfo: {},
        authSelectServeInfo: {},
        remoteProjects: [],
        remoteAuthProjects: [],
      }
    },
    computed: {
      translate() {
        return translate
      },
      syncDialogShow: {
        get() {
          return this.dialogVis
        },
        set(newVal) {
          this.$emit('update:dialogVis', newVal)
        },
      },
      localSolutionId() {
        return this.$getStore({ name: 'solutionId' })
      },
      /**
       * 选中行数据 启用版本信息
       */
      enableVersionInfo() {
        const _version = this.currentRow.enableVersion
        if (_version) {
          return _version
        } else {
          return {}
        }
      },
      /**
       * 共享
       */
      selectAuthVersionInfo() {
        const parentId = this.authSyncForm.remoteProjectVersions[0]
        const sonId = this.authSyncForm.remoteProjectVersions[1]
        let _info = {}
        if (parentId) {
          const _obj = this.shareProjectVersionList.find(
            (el) => el.id === parentId
          )
          if (_obj && _obj.versionInfos) {
            _info = _obj.versionInfos.find((el) => el.id === sonId)
          }
        }
        return _info
      },
    },
    watch: {
      retrySyncFlag() {
        this.$nextTick(() => {
          this.retryPushMethod()
        })
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      /**
       *我的项目拉取推送
       */
      async myProServerChange(value) {
        const selectServer = this.serviceNodeList.find((el) => el.id === value)
        this.selectServeInfo = { ...selectServer }
        if (selectServer) {
          this.remoteToken = selectServer.token
          const fd = {
            id: selectServer.id,
          }

          await this.listSolution(fd)
          !this.retrySyncFlag && this.findSameProByRemote()
        }
      },

      /**
       * 共享
       */
      async authProServerChange(value) {
        const selectServer = this.serviceNodeList.find((el) => el.id === value)
        this.authSelectServeInfo = { ...selectServer }
        if (selectServer) {
          this.remoteToken = selectServer.token
          const fd = {
            id: selectServer.id,
          }
          await this.listAuthSolution(fd)
          !this.retrySyncFlag && this.findSameAuthProByRemote()
        }
      },
      syncCommit() {
        switch (this.prosListTabName) {
          case '1': {
            if (!this.syncForm.newFlag && !this.syncForm.remoteSolutionId) {
              return this.$message.error('请勾选新项目或选择云端项目')
            }
            this.$refs.syncFormRef.validate((val) => {
              if (val) {
                const query = {
                  localVersionId: this.currentRow.enableVersion.id,
                  localSolutionId: this.currentRow.id,
                  projectType: this.prosListTabName,
                  remark: this.syncForm.remark,
                  newFlag: this.syncForm.newFlag,
                  // remoteAuth: this.selectServeInfo.token,
                  remoteServerId: this.syncForm.serverId,
                  remoteSolutionId: this.syncForm.remoteSolutionId,
                }
                this.pushSolutionData(query)
              }
            })
            break
          }
          case '2': {
            if (
              !this.authSyncForm.newFlag &&
              !this.authSyncForm.remoteSolutionId
            ) {
              return this.$message.error('请勾选新项目或选择云端项目')
            }
            this.$refs.authFormRef.validate((val) => {
              if (val) {
                const query = {
                  localVersionId: this.currentRow.enableVersion.id,
                  localSolutionId: this.currentRow.id,
                  projectType: this.prosListTabName,
                  remark: this.authSyncForm.remark,
                  newFlag: this.authSyncForm.newFlag,
                  // remoteAuth: this.authSelectServeInfo.token,
                  remoteServerId: this.authSyncForm.serverId,
                  remoteSolutionId: this.authSyncForm.remoteSolutionId,
                }
                this.pushSolutionData(query)
              }
            })
            break
          }
        }
      },
      syncCancel() {
        this.syncForm = {
          serverId: '',
          remoteSolutionId: '',
          remark: '',
          newFlag: false,
        }
        this.authSyncForm = {
          serverId: '',
          remoteSolutionId: '',
          remark: '',
          newFlag: false,
        }
        this.$refs.syncFormRef.resetFields()
        this.$refs.authFormRef.resetFields()
        this.prosListTabName = '1'
        this.$emit('update:currentRow', {})
        this.$emit('update:retrySyncFlag', false)
        this.syncDialogShow = false
      },
      /**
       * 获取当前服务节点的信息
       */
      async listSolution(condition) {
        const res = await remoteApi.listSolution(condition)
        if (res.code === 0) {
          this.remoteProjects = [...res.data]
        } else {
          // 失败就要更新
          this.syncForm.serverId = ''
          this.$emit('getserviceInfoFail', this.selectServeInfo)
        }
      },
      async listAuthSolution(condition) {
        const res = await remoteApi.listAuthSolution(condition)
        if (res.code === 0) {
          this.remoteAuthProjects = [...res.data]
        } else {
          // 失败就要更新
          this.authSyncForm.serverId = ''
          this.$emit('getserviceInfoFail', this.authSelectServeInfo)
        }
      },
      /**
       * 项目推送
       */
      async pushSolutionData(condition) {
        const res = await fileController.pushSolutionData(condition)
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.syncCancel()
          this.$emit('listSolutionDetails')
        }
      },
      /**
       * 推送的项目同名选上，否则就新建
       */
      findSameProByRemote() {
        const selectRowName = this.currentRow.name
        const _obj = this.remoteProjects.find((el) => el.name === selectRowName)
        if (_obj) {
          this.syncForm.remoteSolutionId = _obj.id
        } else {
          this.syncForm.newFlag = true
        }
      },
      findSameAuthProByRemote() {
        const selectRowName = this.currentRow.name
        const _obj = this.remoteAuthProjects.find(
          (el) => el.name === selectRowName
        )
        if (_obj) {
          this.authSyncForm.remoteSolutionId = _obj.id
        } else {
          this.authSyncForm.newFlag = true
        }
      },
      /**
       * 远端项目更改
       */
      remoteProChange() {
        this.syncForm.newFlag = false
      },
      remoteAuthProChange() {
        this.authSyncForm.newFlag = false
      },
      /**
       * 新建项目勾选
       */
      syncCheckBox() {
        // console.log('valvalval:::', val);
        this.syncForm.remoteSolutionId = ''
      },
      authSyncCheckBox() {
        this.authSyncForm.remoteSolutionId = ''
      },
      /**
       * 推送失败重试
       */
      retryPushMethod() {
        const _syncTaskInfo = this.currentRow.syncTaskInfo
        if (_syncTaskInfo) {
          const _formInfo = JSON.parse(_syncTaskInfo.remoteVersionInfo)
          const _tabName = _syncTaskInfo.projectType //1我的项目 2共享项目
          this.prosListTabName = `${_tabName}`
          if (_tabName === 1) {
            this.syncForm.serverId = _syncTaskInfo.serverId
            this.syncForm.remoteSolutionId = _syncTaskInfo.remoteProjectId
            this.syncForm.remark = _formInfo.remark
            this.myProServerChange(_syncTaskInfo.serverId)
          }
          if (_tabName === 2) {
            this.authSyncForm.serverId = _syncTaskInfo.serverId
            this.authSyncForm.remoteSolutionId = _syncTaskInfo.remoteProjectId
            this.authSyncForm.remark = _formInfo.remark
            this.authProServerChange(_syncTaskInfo.serverId)
          }
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  .select-css {
    padding: 0 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
