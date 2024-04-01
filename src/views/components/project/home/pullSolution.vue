<template>
  <div>
    <el-dialog
      v-model="syncDialogShow"
      :before-close="syncCancel"
      class="sync-dia-css"
      :close-on-click-modal="false"
      :title="translate('拉取')"
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

            <!-- 云端拉取显示 -->
            <el-row>
              <el-col :span="24">
                <el-form-item
                  :label="translate('云端项目')"
                  prop="remoteProjectVersions"
                >
                  <el-cascader
                    v-model="syncForm.remoteProjectVersions"
                    :disabled="retrySyncFlag"
                    filterable
                    :options="remoteProCascader"
                    :placeholder="translate('请输入内容')"
                    :props="cascaderProps"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item>
                  <el-row style="width: 100%">
                    <el-col :span="8">
                      {{ translate('父版本') }}:
                      {{
                        selectVersionInfo.parentNum
                          ? `V${selectVersionInfo.parentNum}`
                          : ''
                      }}
                    </el-col>
                    <el-col :span="8">
                      {{ translate('创建用户') }}:
                      {{ selectVersionInfo.createBy }}
                    </el-col>
                    <el-col :span="8">
                      {{ translate('创建方式') }}:
                      {{
                        selectVersionInfo.createType === 1
                          ? translate('保存')
                          : selectVersionInfo.createType === 2
                          ? translate('推送')
                          : translate('拉取')
                      }}
                    </el-col>
                    <el-col :span="16">
                      {{ translate('创建时间') }}:
                      {{ selectVersionInfo.createTime }}
                    </el-col>
                    <el-col :span="24">
                      {{ translate('备注') }}:
                      {{ selectVersionInfo.remark }}
                    </el-col>
                  </el-row>
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
            <!-- 共享拉取显示 -->
            <el-row>
              <el-col :span="24">
                <el-form-item
                  :label="translate('共享项目')"
                  prop="remoteProjectVersions"
                >
                  <el-cascader
                    v-model="authSyncForm.remoteProjectVersions"
                    :disabled="retrySyncFlag"
                    filterable
                    :options="remoteAuthProCascader"
                    :placeholder="translate('请输入内容')"
                    :props="cascaderProps"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item>
                  <el-row style="width: 100%">
                    <el-col :span="8">
                      {{ translate('父版本') }}:
                      {{
                        selectAuthVersionInfo.parentNum
                          ? `V${selectAuthVersionInfo.parentNum}`
                          : ''
                      }}
                    </el-col>
                    <el-col :span="8">
                      {{ translate('创建用户') }}:{{
                        selectAuthVersionInfo.createBy
                      }}
                    </el-col>
                    <el-col :span="8">
                      {{ translate('创建方式') }}
                      {{
                        selectAuthVersionInfo.createType === 1
                          ? translate('保存')
                          : selectAuthVersionInfo.createType === 2
                          ? translate('推送')
                          : translate('拉取')
                      }}
                    </el-col>
                    <el-col :span="16">
                      {{ translate('创建时间') }}:
                      {{ selectAuthVersionInfo.createTime }}
                    </el-col>
                    <el-col :span="24">
                      {{ translate('备注') }}:
                      {{ selectAuthVersionInfo.remark }}
                    </el-col>
                  </el-row>
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
  import remoteApi from '@/api/remoteApi'
  import fileController from '@/api/solutionFile'
  import { translate } from '@/i18n'
  import { getStore } from '@/utils/storage'
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
        cascaderProps: {
          expandTrigger: 'hover',
          label: 'label',
          value: 'value',
        }, //级联
        syncRules: {
          serverId: [{ required: true, message: '必填', trigger: 'change' }],
          remoteProjectVersions: [
            { required: true, message: '必填', trigger: 'change' },
          ],
        },

        prosListTabName: '1',
        syncForm: {
          serverId: '',
          remoteProjectVersions: [],
          remark: '',
        },
        authSyncForm: {
          serverId: '',
          remoteProjectVersions: [],
          remark: '',
        },
        projectVersionList: [],
        shareProjectVersionList: [],
        selectServeInfo: {},
        authSelectServeInfo: {},
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
        return getStore({ name: 'solutionId' })
      },
      /**
       * 远端项目级联选择
       */
      remoteProCascader() {
        let _arr = []
        _arr = this.projectVersionList
          .filter((el) => el.versionInfos)
          .map((el) => {
            const _childArr = el.versionInfos.map((item) => {
              return {
                value: item.id,
                label: `V${item.num}${item.enable ? `(启用)` : ''}`,
              }
            })
            return {
              label: `${el.name}(${el.createBy})`,
              value: el.id,
              children: _childArr,
            }
          })
        return _arr
      },
      /**
       * 远端共享项目级联选择
       */
      remoteAuthProCascader() {
        let _arr = []
        _arr = this.shareProjectVersionList
          .filter((el) => el.solutionDetail)
          .map((el) => {
            const _childArr = el.solutionDetail.versionInfos.map((item) => {
              return {
                value: item.id,
                label: `V${item.num}${item.enable ? `(启用)` : ''}`,
              }
            })
            return {
              label: `${el.solutionDetail.name}(${el.solutionDetail.createBy})`,
              value: el.solutionDetail.id,
              children: _childArr,
            }
          })
        return _arr
      },
      /**
       * 我的项目选中版本信息
       */
      selectVersionInfo() {
        const parentId = this.syncForm.remoteProjectVersions[0]
        const sonId = this.syncForm.remoteProjectVersions[1]
        let _info = {}
        if (parentId) {
          const _obj = this.projectVersionList.find((el) => el.id === parentId)
          if (_obj && _obj.versionInfos) {
            _info = _obj.versionInfos.find((el) => el.id === sonId)
          }
        }
        return _info
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
            (el) => el.solutionId === parentId
          )
          if (_obj && _obj.solutionDetail) {
            _info = _obj.solutionDetail.versionInfos.find(
              (el) => el.id === sonId
            )
          }
        }
        return _info
      },
    },
    watch: {
      retrySyncFlag(newVal) {
        if (newVal) {
          this.$nextTick(() => {
            this.retryPullMethod()
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
          this.listSolutionDetails(fd)
        }
      },

      /**
       * 共享
       */
      authProServerChange(value) {
        const selectServer = this.serviceNodeList.find((el) => el.id === value)
        this.authSelectServeInfo = { ...selectServer }
        if (selectServer) {
          this.remoteToken = selectServer.token
          const fd = {
            id: selectServer.id,
          }
          this.listAuthSolutionDetails(fd)
        }
      },
      syncCommit() {
        switch (this.prosListTabName) {
          case '1': {
            this.$refs.syncFormRef.validate((val) => {
              if (val) {
                const query = {
                  localSolutionId: this.currentRow.id,
                  projectType: this.prosListTabName,
                  remark: this.syncForm.remark,
                  // remoteAuth: this.selectServeInfo.token,
                  remoteServerId: this.syncForm.serverId,
                  remoteSolutionId: this.syncForm.remoteProjectVersions[0],
                  remoteVersionId: this.syncForm.remoteProjectVersions[1],
                }
                this.pullSolutionData(query)
              }
            })
            break
          }
          case '2': {
            this.$refs.authFormRef.validate((val) => {
              if (val) {
                const query = {
                  localSolutionId: this.currentRow.id,
                  projectType: this.prosListTabName,
                  remark: this.authSyncForm.remark,
                  // remoteAuth: this.authSelectServeInfo.token,
                  remoteServerId: this.authSyncForm.serverId,
                  remoteSolutionId: this.authSyncForm.remoteProjectVersions[0],
                  remoteVersionId: this.authSyncForm.remoteProjectVersions[1],
                }
                this.pullSolutionData(query)
              }
            })
            break
          }
        }
      },
      syncCancel() {
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
      async listSolutionDetails(condition) {
        const res = await remoteApi.listSolutionDetails(condition)
        if (res.code === 0) {
          this.projectVersionList = [...res.data]
        } else {
          // 失败就要更新
          this.syncForm.serverId = ''
          this.$emit('getserviceInfoFail', this.selectServeInfo)
        }
      },
      async listAuthSolutionDetails(condition) {
        const res = await remoteApi.listAuthSolutionDetails(condition)
        if (res.code === 0) {
          this.shareProjectVersionList = [...res.data]
        } else {
          // 失败就要更新
          this.authSyncForm.serverId = ''
          this.$emit('getserviceInfoFail', this.authSelectServeInfo)
        }
      },
      /**
       * 项目拉取
       */
      async pullSolutionData(condition) {
        const res = await fileController.pullSolutionData(condition)
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.syncCancel()
          this.$emit('listSolutionDetails')
        }
      },
      /**
       * 拉取失败 重试逻辑
       */
      retryPullMethod() {
        //
        const _syncTaskInfo = this.currentRow.syncTaskInfo
        if (_syncTaskInfo) {
          const _formInfo = JSON.parse(_syncTaskInfo.remoteVersionInfo)
          const _tabName = _syncTaskInfo.projectType //1我的项目 2共享项目
          const cascaderVal = []
          cascaderVal.push(_syncTaskInfo.remoteProjectId)
          cascaderVal.push(_syncTaskInfo.remoteVersionId)
          this.prosListTabName = `${_tabName}`
          if (_tabName === 1) {
            this.syncForm.serverId = _syncTaskInfo.serverId
            this.syncForm.remark = _formInfo.remark
            this.syncForm.remoteProjectVersions = cascaderVal
            this.myProServerChange(_syncTaskInfo.serverId)
          }
          if (_tabName === 2) {
            this.authSyncForm.serverId = _syncTaskInfo.serverId
            this.authSyncForm.remark = _formInfo.remark
            this.authSyncForm.remoteProjectVersions = cascaderVal
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
