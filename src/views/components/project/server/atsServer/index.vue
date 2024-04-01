<!--  -->
<template>
  <div style="height: 100%">
    <el-row class="header-nav">
      <el-col :span="8">
        <el-button
          class="filter-item"
          icon="el-icon-plus"
          type="primary"
          @click="dialogVis = true"
        >
          {{ translate('新增') }}
        </el-button>
        <el-button
          class="filter-item"
          icon="el-icon-delete"
          type="danger"
          @click="deleteServerByIds"
        >
          {{ translate('删除') }}
        </el-button>
      </el-col>
    </el-row>
    <div class="body-content">
      <el-table
        :data="tableData"
        height="100%"
        @selection-change="serverSelectionChange"
      >
        <el-table-column type="selection" width="55px" />
        <el-table-column :label="translate('序号')" type="index" width="80px" />
        <el-table-column :label="translate('节点名称')" prop="name" />
        <el-table-column label="ATS地址" prop="ip" />
        <el-table-column :label="translate('用户名')" prop="remoteUserName" />
        <!-- <el-table-column :label="translate('密码')" prop="token" /> -->
        <el-table-column :label="translate('操作')" min-width="120">
          <template #default="scope">
            <el-button
              icon="el-icon-video-play"
              link
              type="primary"
              @click="testServer(scope.row)"
            >
              {{ translate('测试') }}
            </el-button>
            <el-button
              icon="el-icon-refresh"
              link
              type="primary"
              @click="updatToken(scope.row)"
            >
              {{ translate('更新权限') }}
            </el-button>
            <el-button
              icon="el-icon-edit"
              link
              type="primary"
              @click="editService(scope.row, scope.index)"
            >
              {{ translate('编辑') }}
            </el-button>
            <el-popconfirm
              :hide-after="100"
              :title="translate('是否删除数据')"
              @cancel="scope.row.visible = false"
              @confirm="delServer(scope.row)"
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
    <!-- 新增节点 -->
    <el-dialog
      v-model="dialogVis"
      :before-close="cancelForm"
      :close-on-click-modal="false"
      :title="dialogTitle"
      width="40%"
    >
      <el-form
        ref="formRef"
        label-width="100px"
        :model="serviceForm"
        :rules="serviceRules"
      >
        <el-form-item :label="translate('节点名称')" prop="name">
          <el-input v-model="serviceForm.name" placeholder="请输入节点名称" />
        </el-form-item>
        <el-form-item label="ATS地址" prop="ip">
          <el-input
            v-model="serviceForm.ip"
            placeholder="请输入在线ATS地址 参考格式为：http://xxx.xxx.xxx.xxx:xxxxx/，xxx取值[0,255]，xxxxx取值[1,65535]"
            @blur="IpInput"
          />
        </el-form-item>
        <el-form-item :label="translate('用户名')" prop="remoteUserName">
          <el-input
            v-model="serviceForm.remoteUserName"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item
          v-if="dialogType === 'add'"
          :label="translate('密码')"
          prop="password"
        >
          <el-input
            v-model="serviceForm.password"
            placeholder="请输入密码"
            type="password"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelForm">
          {{ translate('取消') }}
        </el-button>
        <el-button
          v-show="dialogType === 'add'"
          type="primary"
          @click="submitForm"
        >
          {{ translate('确定') }}
        </el-button>
        <el-button
          v-show="dialogType === 'edit'"
          type="primary"
          @click="submitEditForm"
        >
          {{ translate('确定') }}
        </el-button>
      </template>
    </el-dialog>
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
        <el-button @click="updateTokenCancel()">
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
  import { translate } from '@/i18n'
  import remoteApi from '@/api/remoteApi'
  import { mapStores } from 'pinia'
  import { useUserStore } from '@/store/modules/user'
  export default {
    props: {
      serverList: {
        type: Array,
        default: () => [],
      },
    },
    emits: ['getServerList'],
    data() {
      return {
        updateTokenForm: {
          password: '',
        },
        dialogVis: false,
        dialogType: 'add',
        serviceForm: {
          name: '',
          ip: '',
          password: '',
          remoteUserName: '',
        },
        updateTokenDialog: false,
        currentRow: {},
        selectionsList: [],
      }
    },
    computed: {
      ...mapStores(useUserStore),
      translate() {
        return translate
      },
      tableData() {
        return this.serverList
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
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      serverSelectionChange(list) {
        this.selectionsList = list
      },
      /**
       * 编辑操作
       */
      editService(row) {
        this.dialogType = 'edit'
        this.dialogVis = true
        this.serviceForm = { ...row }
      },
      /**
       * 更新权限
       */
      updatToken(rowInfo) {
        this.currentRow = rowInfo
        this.updateTokenDialog = true
      },
      /**
       * 测试服务
       */
      async testServer(row) {
        // console.log(row)
        // const query = {
        //   ip: row.ip,
        //   username: row.remoteUserName,
        //   password: row.token,
        // }
        // const data = await remoteApi.login(query)

        const fd = {
          serverId: row.id,
          remoteAuth: row.token,
        }

        const res = await remoteApi.test(fd)
        if (res.code === 0) {
          this.$message.success(`连接正常`)
        }
      },
      /**
       * 取消表单
       */
      cancelForm() {
        this.dialogVis = false
        this.dialogType = 'add'
        this.$nextTick(() => {
          this.serviceForm = {
            name: '',
            ip: '',
            password: '',
            remoteUserName: '',
          }
          this.$refs.formRef.clearValidate()
        })
      },
      /**
       * 新增共享服务
       */
      submitForm() {
        this.$refs.formRef.validate(async (val) => {
          if (!val) return
          const query = {
            ip: this.serviceForm.ip,
            username: this.serviceForm.remoteUserName,
            password: this.serviceForm.password,
          }
          const res = await remoteApi.login(query)
          if (res.code === 0 && res.data) {
            const _query = { ...this.serviceForm }
            _query.type = 1
            _query.localUserId = this.userStore.getUserid
            _query.token = res.data.token
            const result = await remoteApi.saveServer(_query)
            if (result.code === 0) {
              this.$message.success(result.msg)
              this.$emit('getServerList')
              this.cancelForm()
            }
          }
        })
      },
      /**
       * 编辑提交
       */
      submitEditForm() {
        this.$refs.formRef.validate(async (val) => {
          if (!val) return
          const res = await remoteApi.saveServer(this.serviceForm)
          if (res.code === 0) {
            this.$message.success(res.msg)
            this.cancelForm()
            this.$emit('getServerList')
          }
        })
      },
      /**
       * 更新权限
       */
      updatTokenSubmit() {
        //
        this.$refs.tokenRef.validate(async (val) => {
          if (val) {
            const serverType = this.currentRow.type //服务器类型
            const fd = {
              ip: this.currentRow.ip,
              username: this.currentRow.remoteUserName,
              password: this.updateTokenForm.password,
            }
            if (serverType === 1) {
              const data = await remoteApi.login(fd)
              if (data.code === 0) {
                const _userToken = data.data.token
                this.currentRow.token = _userToken
                const res = await remoteApi.saveServer(this.currentRow)
                if (res.code === 0) {
                  this.$message.success(res.msg)
                }
                this.updateTokenCancel()
              }
            }
          }
        })
      },
      updateTokenCancel() {
        this.updateTokenForm = this.$options.data().updateTokenForm
        this.$refs.tokenRef.clearValidate()
        this.updateTokenDialog = false
        this.currentRow = {}
      },
      /**
       * 批量删除
       */
      deleteServerByIds() {
        if (!this.selectionsList.length) {
          return this.$message.error('请选择删除的服务')
        }
        this.$confirm('是否确认批量删除服务信息', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(async () => {
          const loading = this.$loading({
            lock: true,
            text: '请稍候',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)',
          })
          const query = {
            ids: [],
          }
          this.selectionsList.forEach((item) => {
            query.ids.push(item.id)
          })
          const res = await remoteApi.deleteServer(query)
          loading.close()
          if (res.code === 0) {
            this.$message.success(res.message)
          }
        })
      },
      /**
       * 删除单个
       */
      async delServer(row) {
        const params = {
          ids: [],
        }
        params.ids.push(row.id)
        const res = await remoteApi.deleteServer(params)
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.$emit('getServerList')
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .header-nav {
    padding-bottom: 5px;
  }
  .body-content {
    height: calc(100% - 37px);
  }
</style>
