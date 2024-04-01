<template>
  <div class="role-management-container">
    <vab-query-form>
      <vab-query-form-left-panel :span="12">
        <el-button :icon="Plus" type="primary" @click="handleEdit($event)">
          {{ translate('新增角色') }}
        </el-button>
      </vab-query-form-left-panel>
    </vab-query-form>
    <el-table
      :data="tableData"
      row-key="authorityId"
      style="width: 100%"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column
        :label="translate('角色ID')"
        min-width="180"
        prop="authorityId"
      />
      <el-table-column
        align="left"
        :label="translate('角色名称')"
        min-width="180"
        prop="authorityName"
      />
      <el-table-column align="left" lable="操作" width="460">
        <template #default="scope">
          <el-button
            icon="setting"
            link
            size="small"
            type="primary"
            @click="opdendrawer(scope.row)"
          >
            {{ translate('设置权限') }}
          </el-button>
          <el-button
            icon="plus"
            link
            size="small"
            type="primary"
            @click="addAuthority(scope.row)"
          >
            {{ translate('新增') }}
          </el-button>
          <el-button
            icon="copy-document"
            link
            size="small"
            type="primary"
            @click="copyAuthorityFunc(scope.row)"
          >
            {{ translate('拷贝') }}
          </el-button>
          <el-button
            icon="edit"
            link
            size="small"
            type="primary"
            @click="editAuthority(scope.row)"
          >
            {{ translate('编辑') }}
          </el-button>
          <el-button
            icon="delete"
            link
            size="small"
            type="primary"
            @click="deleteAuth(scope.row)"
          >
            {{ translate('删除') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 弹窗 -->
    <edit ref="editRef" :dialog-type="dialogType" @fetch-data="fetchData" />
    <!-- 设置 -->
    <el-drawer
      v-if="drawer"
      v-model="drawer"
      class="auth-drawer"
      size="40%"
      title="角色配置"
      :with-header="false"
    >
      <el-tabs style="height: 100%" type="border-card">
        <el-tab-pane :label="translate('角色菜单')">
          <Menus ref="menus" :row="activeRow" @change-row="changeRow" />
        </el-tab-pane>

        <el-tab-pane :label="translate('资源权限')">
          <Datas
            ref="datas"
            :authority="tableData"
            :row="activeRow"
            @change-row="changeRow"
          />
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script setup>
  import { translate } from '@/i18n'
  import { getAuthorityList, deleteAuthority } from '@/api/roleManagement'
  import { ref, nextTick } from 'vue'
  import Edit from './components/RoleManagementEdit.vue'
  import Datas from './components/datas.vue'
  import Menus from './components/menus.vue'
  import { Plus } from '@element-plus/icons-vue'

  const $baseConfirm = inject('$baseConfirm')
  const $baseMessage = inject('$baseMessage')

  const dialogType = ref('')

  const drawer = ref(false)
  const editRef = ref(null)
  const tableData = ref([])
  const activeRow = ref({})

  const menus = ref(null)
  const datas = ref(null)
  // const autoEnter = (activeName, oldActiveName) => {
  //   const paneArr = [menus, apis, datas]
  //   console.log('oldActiveName', oldActiveName)
  //   if (oldActiveName) {
  //     if (paneArr[oldActiveName].value.needConfirm) {
  //       paneArr[oldActiveName].value.enterAndNext()
  //       paneArr[oldActiveName].value.needConfirm = false
  //     }
  //   }
  // }
  /**
   * 新增角色
   */
  const handleEdit = () => {
    dialogType.value = 'add'
    nextTick(() => {
      editRef.value.showEdit()
    })
  }
  /**
   * 删除
   */
  const deleteAuth = (row) => {
    if (row) {
      $baseConfirm(translate('你确定要删除当前项吗'), null, async () => {
        const { msg } = await deleteAuthority({
          authorityId: String(row.authorityId),
        })
        $baseMessage(msg, 'success', 'vab-hey-message-success')
        await fetchData()
      })
    }
  }
  /**
   * 新增子节点
   */
  const addAuthority = (rowInfo) => {
    dialogType.value = 'add'
    nextTick(() => {
      editRef.value.showEdit(rowInfo)
    })
  }
  /**
   * 拷贝角色
   */
  const copyAuthorityFunc = (rowInfo) => {
    //
    dialogType.value = 'copy'
    nextTick(() => {
      editRef.value.showEdit(rowInfo)
    })
  }
  /**
   * 编辑
   */
  const editAuthority = (rowInfo) => {
    dialogType.value = 'edit'
    nextTick(() => {
      editRef.value.showEdit(rowInfo)
    })
  }
  /**
   *设置权限
   */
  const opdendrawer = (rowInfo) => {
    activeRow.value = rowInfo
    drawer.value = true
  }

  /**
   * 初始化数据
   */
  const fetchData = async () => {
    const query = {
      page: 1,
      pageSize: 999,
    }
    const res = await getAuthorityList(query)
    tableData.value = res.data.list
    nextTick(() => {
      editRef.value.setOptions(tableData.value)
    })
  }
  const changeRow = (key, value) => {
    activeRow.value[key] = value
  }
  fetchData()
</script>
<style lang="scss" scoped>
  .auth-drawer :deep(.el-drawer__body) {
    overflow: hidden;
    padding: 0;
  }

  .tree-content {
    overflow: auto;
    height: calc(100vh - 100px);
    margin-top: 10px;
  }
</style>
