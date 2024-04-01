<template>
  <div class="user-management-container">
    <vab-query-form>
      <vab-query-form-left-panel :span="12">
        <el-button :icon="Plus" type="primary" @click="handleEdit()">
          {{ translate('新增用户') }}
        </el-button>
      </vab-query-form-left-panel>
    </vab-query-form>

    <el-table :data="tableData">
      <el-table-column align="left" :label="translate('头像')" min-width="50">
        <template #default="scope">
          <CustomPic :pic-src="scope.row.headerImg" style="margin-top: 8px" />
        </template>
      </el-table-column>
      <el-table-column
        align="left"
        :label="translate('用户名')"
        min-width="150"
        prop="userName"
      />
      <el-table-column
        align="left"
        :label="translate('昵称')"
        min-width="150"
        prop="nickName"
      >
        <template #default="scope">
          <p v-if="!scope.row.editFlag" class="nickName">
            {{ scope.row.nickName }}
            <el-icon
              class="pointer"
              color="#66b1ff"
              @click="openEidt(scope.row)"
            >
              <edit />
            </el-icon>
          </p>
          <p v-if="scope.row.editFlag" class="nickName">
            <el-input v-model="scope.row.nickName" />
            <el-icon
              class="pointer"
              color="#67c23a"
              @click="enterEdit(scope.row)"
            >
              <check />
            </el-icon>
            <el-icon
              class="pointer"
              color="#f23c3c"
              @click="closeEdit(scope.row)"
            >
              <close />
            </el-icon>
          </p>
        </template>
      </el-table-column>
      <el-table-column
        align="left"
        :label="translate('用户角色')"
        min-width="150"
      >
        <template #default="scope">
          <el-cascader
            v-model="scope.row.authorityIds"
            :clearable="false"
            collapse-tags
            :options="authOptions"
            :props="{
              multiple: true,
              checkStrictly: true,
              label: 'authorityName',
              value: 'authorityId',
              disabled: 'disabled',
              emitPath: false,
            }"
            :show-all-levels="false"
            @remove-tag="
              (removeAuth) => {
                changeAuthority(scope.row, false, removeAuth)
              }
            "
            @visible-change="
              (flag) => {
                changeAuthority(scope.row, flag, 0)
              }
            "
          />
        </template>
      </el-table-column>
      <el-table-column align="left" :label="translate('部门')" min-width="150">
        <template #default="scope">
          <el-cascader
            v-model="scope.row.deptIds"
            :clearable="false"
            collapse-tags
            :options="deptOptions"
            :props="{
              multiple: true,
              checkStrictly: true,
              label: 'name',
              value: 'deptId',
              children: 'children',
              disabled: 'disabled',
              emitPath: false,
            }"
            :show-all-levels="false"
            @remove-tag="
              (removeDept) => {
                changeDept(scope.row, false, removeDept)
              }
            "
            @visible-change="
              (flag) => {
                changeDept(scope.row, flag, 0)
              }
            "
          />
        </template>
      </el-table-column>
      <el-table-column align="left" :label="translate('操作')" min-width="150">
        <template #default="scope">
          <el-popover v-model="scope.row.visible" placement="top" width="160">
            <p>{{ translate('确定要删除此用户吗') }}</p>
            <div style="text-align: right; margin-top: 8px">
              <el-button
                link
                size="small"
                type="primary"
                @click="scope.row.visible = false"
              >
                {{ translate('取消') }}
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click="deleteUserFunc(scope.row)"
              >
                {{ translate('确认') }}
              </el-button>
            </div>
            <template #reference>
              <el-button icon="delete" link size="small" type="primary">
                {{ translate('删除') }}
              </el-button>
            </template>
          </el-popover>
          <el-button
            icon="edit"
            link
            size="small"
            type="primary"
            @click="openEdit(scope.row)"
          >
            {{ translate('编辑') }}
          </el-button>
          <el-button
            icon="magic-stick"
            link
            size="small"
            type="primary"
            @click="resetPasswordFunc(scope.row)"
          >
            {{ translate('重置密码') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="gva-pagination">
      <!-- <el-pagination
        :current-page="page"
        layout="total, sizes, prev, pager, next, jumper"
        :page-size="pageSize"
        :page-sizes="[10, 30, 50, 100]"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      /> -->
    </div>
    <edit
      ref="editRef"
      :auth-options="authOptions"
      :dept-options="deptOptions"
      :dialog-type="dialogType"
      @fetch-data="fetchData"
    />
  </div>
</template>

<script setup>
  import { ref, nextTick } from 'vue'
  import {
    getUserList,
    deleteUser,
    resetPassword,
    setUserInfo,
    setUserAuthorities,
    setUserDepts,
  } from '@/api/userManagement'
  import { getAuthorityList } from '@/api/roleManagement'
  import { Plus } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import edit from './components/UserManagementEdit'
  import CustomPic from '@/components/customPic/index.vue'
  import { translate } from '@/i18n'
  import { findDeptByIds } from '@/api/departmentManagement'

  // const $baseConfirm = inject('$baseConfirm')
  // const $baseMessage = inject('$baseMessage')

  const state = reactive({
    editRef: null,
    list: [],
    listLoading: false,
    layout: 'total, sizes, prev, pager, next, jumper',
    total: 0,
    selectRows: '',
    queryForm: {
      page: 1,
      pageSize: 1000,
      username: '',
    },
  })
  const roleTableData = ref([])
  const deptTableData = ref([])
  const editRef = ref(null)
  const tableData = ref([])
  const dialogType = ref('')
  const authOptions = ref([])
  const deptOptions = ref([])
  const userInfo = ref({})
  /**
   * 新增用户
   */
  const handleEdit = () => {
    dialogType.value = 'add'
    nextTick(() => {
      editRef.value.showEdit()
    })
  }

  // const handleSizeChange = (val) => {
  //   state.queryForm.pageSize = val
  //   fetchData()
  // }
  // const handleCurrentChange = (val) => {
  //   state.queryForm.pageNo = val
  //   fetchData()
  // }

  const fetchData = async () => {
    state.listLoading = true
    const query = { ...state.queryForm }
    delete query.username
    const {
      data: { list, total },
    } = await getUserList(query)
    tableData.value = list
    state.total = total
    state.listLoading = false
    setAuthorityAndDeptIds()
  }
  const openEidt = (row) => {
    if (tableData.value.some((item) => item.editFlag)) {
      ElMessage('当前存在正在编辑的用户')
      return
    }
    backNickName.value = row.nickName
    row.editFlag = true
  }
  /**
   *用户角色级联框下拉
   */
  const tempAuth = {}
  const changeAuthority = async (row, flag, removeAuth) => {
    if (flag) {
      if (!removeAuth) {
        tempAuth[row.id] = [...row.authorityIds]
      }
      return
    }
    await nextTick()
    if (row.authorityIds.length === 0) {
      const obj = authOptions.value.find((el) => el.authorityName === 'Guest')
      row.authorityIds = [obj.authorityId]
    }
    const res = await setUserAuthorities({
      id: row.id,
      authorityIds: row.authorityIds,
    })
    if (res.code === 0) {
      ElMessage({ type: 'success', message: res.msg })
    } else {
      if (!removeAuth) {
        row.authorityIds = [...tempAuth[row.id]]
        delete tempAuth[row.id]
      } else {
        row.authorityIds = [removeAuth, ...row.authorityIds]
      }
    }
  }
  const _tmpUserDept = {}
  const changeDept = async (row, flag, removeDept) => {
    if (flag) {
      if (!removeDept) {
        _tmpUserDept[row.id] = [...row.deptIds]
      }
      return
    }
    await nextTick()
    const res = await setUserDepts({
      userId: row.id,
      deptIds: row.deptIds,
    })
    if (res.code === 0) {
      ElMessage({ type: 'success', message: res.msg })
    } else {
      if (!removeDept) {
        row.deptIds = [..._tmpUserDept[row.id]]
        delete _tmpUserDept[row.id]
      } else {
        row.deptIds = [removeDept, ...row.deptIds]
      }
    }
  }
  /**
   * 构造字段 authorityIds 和 deptIds
   */
  const setAuthorityAndDeptIds = () => {
    tableData.value &&
      tableData.value.forEach((user) => {
        const authorityIds =
          user.authorities &&
          user.authorities.map((i) => {
            return i.authorityId
          })
        const deptIds =
          user.deptInfos &&
          user.deptInfos.map((i) => {
            return i.deptId
          })
        user.authorityIds = authorityIds
        user.deptIds = deptIds
      })
  }

  /**
   * 编辑用户信息
   */
  const openEdit = (rowInfo) => {
    dialogType.value = 'edit'
    nextTick(() => {
      editRef.value.showEdit(rowInfo)
    })
  }
  /**
   * 删除用户
   */
  const deleteUserFunc = async (row) => {
    const res = await deleteUser(row.id)
    if (res.code === 0) {
      ElMessage.success(res.msg)
      await fetchData()
      row.visible = false
    }
  }

  /**
   * 重置密码
   */
  const resetPasswordFunc = (row) => {
    ElMessageBox.confirm(
      translate('是否将此用户密码重置为123456'),
      translate('警告'),
      {
        confirmButtonText: translate('确认'),
        cancelButtonText: translate('取消'),
        type: 'warning',
      }
    ).then(async () => {
      const res = await resetPassword({
        id: row.id,
      })
      if (res.code === 0) {
        ElMessage({
          type: 'success',
          message: res.msg,
        })
      } else {
        ElMessage({
          type: 'error',
          message: res.msg,
        })
      }
    })
  }
  /**
   * 获取用户角色列表
   */
  const getAllRoles = async () => {
    const query = {
      page: 1,
      pageSize: 999,
    }
    const res = await getAuthorityList(query)
    if (res.code === 0) {
      roleTableData.value = res.data.list
    }
  }
  /**
   * 获取用户部门列表
   */
  const getAllDepts = async () => {
    const deptRes = await findDeptByIds({})
    if (deptRes.code === 0) {
      deptTableData.value = deptRes.data
    }
  }
  /**
   * 构造角色级联
   */
  const setAuthOptions = (authData) => {
    authOptions.value = []
    setAuthorityOptions(authData, authOptions.value)
  }
  // 初始化相关
  const setAuthorityOptions = (AuthorityData, optionsData) => {
    AuthorityData &&
      AuthorityData.forEach((item) => {
        if (item.children && item.children.length) {
          const option = {
            authorityId: item.authorityId,
            authorityName: item.authorityName,
            children: [],
          }
          setAuthorityOptions(item.children, option.children)
          optionsData.push(option)
        } else {
          const option = {
            authorityId: item.authorityId,
            authorityName: item.authorityName,
          }
          optionsData.push(option)
        }
      })
  }
  /**
   * 构造部门级联关系
   */
  const setDeptOptions = (data) => {
    deptOptions.value = []
    setDeptChildrenOptions(data, deptOptions.value)
    console.log(deptOptions.value)
  }
  // 初始化相关
  const setDeptChildrenOptions = (data, optionsData) => {
    data &&
      data.forEach((item) => {
        if (item.children && item.children.length) {
          const option = {
            deptId: item.deptId,
            name: item.name,
            children: [],
          }
          setDeptChildrenOptions(item.children, option.children)
          optionsData.push(option)
        } else {
          const option = {
            deptId: item.deptId,
            name: item.name,
          }
          optionsData.push(option)
        }
      })
  }

  /**
   * 初始化数据
   */
  const initData = async () => {
    await getAllRoles()
    await getAllDepts()
    await fetchData()
    setAuthOptions(roleTableData.value)
    setDeptOptions(deptTableData.value)
  }
  initData()
</script>
<style lang="scss" scoped>
  .user-dialog {
    .header-img-box {
      width: 200px;
      height: 200px;
      border: 1px dashed #ccc;
      border-radius: 20px;
      text-align: center;
      line-height: 200px;
      cursor: pointer;
    }
    .avatar-uploader .el-upload:hover {
      border-color: #409eff;
    }
    .avatar-uploader-icon {
      border: 1px dashed #d9d9d9 !important;
      border-radius: 6px;
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      line-height: 178px;
      text-align: center;
    }
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }
  }
  .nickName {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .pointer {
    cursor: pointer;
    font-size: 16px;
    margin-left: 2px;
  }
</style>
