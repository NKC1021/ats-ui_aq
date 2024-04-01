<template>
  <div class="share-data-tool-container">
    <el-row>
      <el-col :span="9">
        <div class="table-head">
          <div>
            <el-button icon="Plus" type="primary" @click="addAuthMethod">
              {{ translate('新增') }}
            </el-button>
            <el-button
              icon="Delete"
              type="danger"
              @click="deleteProjectAuthInfoByIds"
            >
              {{ translate('删除') }}
            </el-button>
          </div>
          <div>
            <el-input
              v-model="username"
              clearable
              :placeholder="translate('请输入用户名')"
              prefix-icon="Search"
            />
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="table-content">
      <el-table
        :data="tableData"
        height="100%"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60" />
        <el-table-column
          :label="translate('用户名')"
          prop="authorizedUsername"
        />
        <el-table-column :label="translate('权限')">
          <template #default="scoped">
            {{ permissionType[`${scoped.row.permissionType}`] }}
          </template>
        </el-table-column>
        <el-table-column
          :formatter="timeFormtter"
          :label="translate('访问期限')"
          prop="authorizedEndTime"
        />
        <el-table-column
          :formatter="updateTimeFormtter"
          :label="translate('更新时间')"
          prop="updateTime"
        />
        <el-table-column :label="translate('操作')" min-width="150">
          <template #default="scope">
            <el-button
              icon="EditPen"
              link
              type="primary"
              @click="editUserInfo(scope.row)"
            >
              {{ translate('编辑') }}
            </el-button>
            <el-popconfirm
              :hide-after="100"
              :title="translate('是否删除数据')"
              @cancel="scope.row.visible = false"
              @confirm="deleteProjectAuthInfo(scope.row.id)"
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
    <auth-dia
      v-model:show="diaVis"
      :all-user-list="allUserList"
      :edit-row-info="editRowInfo"
      :operate-type="type"
      @refresh-au-list="getAuthorizeList"
    />
  </div>
</template>
<script>
  import { translate } from '@/i18n'
  import { mapStores } from 'pinia'
  import { useUserStore } from '@/store/modules/user'
  import userController from '@/api/userController'
  import projectSetController from '@/api/solutionConfig'
  import authDia from '@/views/components/project/setting/authDialog.vue'
  export default {
    components: { authDia },
    data() {
      return {
        input2: '',
        currentPage: 1,
        selectedList: [],
        username: '',
        tempuserList: [],
        authorizeList: [], //授权列表
        checked: false,

        diaVis: false,
        type: 'add', //弹窗类型add/edit
        userList: [],
        editRowInfo: {},
        permissionType: {
          0: translate('未被授权'),
          1: translate('只读'),
          2: translate('可编辑'),
          3: translate('部分只读权限'),
        },
      }
    },
    computed: {
      ...mapStores(useUserStore),
      userInfo() {
        return this.userStore
      },
      translate() {
        return translate
      },
      tableData() {
        let arr = this.authorizeList
        if (this.username) {
          arr = this.$pinyinSearch.pinyinSearch(
            arr,
            this.username,
            'authorizedUsername'
          )
        }
        return arr
      },
      /**
       * 可以选择的用户
       */
      allUserList() {
        const userName = this.userInfo.username
        let arr = [...this.userList].filter((el) => el.userName !== userName)
        const nameList = this.authorizeList.map((el) => el.authorizedUsername)
        if (this.type === 'add') {
          arr = arr.filter((el) => {
            return !nameList.includes(el.userName)
          })
        }
        return arr
      },
    },
    async created() {
      await this.getUserList()
      this.getAuthorizeList()
    },
    methods: {
      timeFormtter(row) {
        return new Date(row.authorizedEndTime).toLocaleString()
      },
      updateTimeFormtter(row) {
        return new Date(row.updateTime).toLocaleString()
      },
      //    获取用户列表
      async getUserList() {
        const res = await userController.listAllUser({})
        if (res.code === 0 && res.data) {
          this.userList = res.data
        }
      },

      //
      async getAuthorizeList() {
        const res = await projectSetController.listProjectAuthInfo({})
        if (res.code === 0) {
          this.authorizeList = res.data
        }
      },
      // 批量删除
      deleteProjectAuthInfoByIds() {
        if (this.selectedList.length) {
          this.$confirm(translate('是否删除数据'), {
            type: 'warning',
          }).then(async () => {
            const query = {
              ids: [],
            }
            query.ids = this.selectedList.map((el) => el.id)
            const res = await projectSetController.deleteSolutionAuth(query)
            if (res.code === 0) {
              this.$message.success(res.msg)
              this.getAuthorizeList()
            }
          })
        } else {
          return this.$message.error(translate('请勾选数据'))
        }
      },
      handleSelectionChange(val) {
        this.selectedList = val
      },

      // 用户操作
      /**
       * @param {Object} userInfo 行数据信息
       */
      editUserInfo(userInfo) {
        //编辑用户信息
        // console.log('shujushuju', userInfo);
        this.editRowInfo = { ...userInfo }
        this.type = 'edit'
        this.diaVis = true
      },
      /**
       * 删除
       */
      async deleteProjectAuthInfo(id) {
        const query = {
          ids: [],
        }
        query.ids.push(id)
        const res = await projectSetController.deleteSolutionAuth(query)
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.getAuthorizeList()
        }
      },

      /**
       * 权限关闭弹窗
       */

      addAuthMethod() {
        this.diaVis = true
        this.type = 'add'
      },
    },
  }
</script>
<style scoped lang="scss">
  .table-head {
    display: flex;
    padding-bottom: 4px;
  }
  .table-head div:nth-child(1) {
    margin-right: 15px;
  }

  .table-content {
    width: 100%;
    height: calc(100% - 36px);
  }
</style>
