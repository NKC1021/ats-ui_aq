<template>
  <div class="menu1-management-container">
    <vab-query-form>
      <vab-query-form-top-panel :span="12">
        <el-button :icon="Plus" type="primary" @click="addMenu">
          {{ translate('新增根菜单') }}
        </el-button>
        <el-button :icon="Setting" type="primary" @click="setLogo">
          {{ translate('设置Logo') }}
        </el-button>
      </vab-query-form-top-panel>
    </vab-query-form>
    <el-table :data="state.list" row-key="id">
      <!-- <el-table-column
              align="left"
              label="ID"
              min-width="100"
              prop="id"
            /> -->
      <el-table-column
        align="left"
        :label="translate('展示名称')"
        min-width="120"
        prop="authorityName"
      >
        <template #default="scope">
          <span>{{ scope.row.meta.title }}</span>
        </template>
      </el-table-column>
      <el-table-column
        align="left"
        :label="translate('图标')"
        min-width="140"
        prop="authorityName"
      >
        <template #default="scope">
          <div class="icon-column">
            <vab-icon :icon="scope.row.meta.icon" />
            <!-- <el-icon>
                    <component
                      :is="scope.row.meta.icon"
                      v-if="scope.row.meta.icon"
                    />
                  </el-icon>
                  <span>{{ scope.row.meta.icon }}</span> -->
          </div>
        </template>
      </el-table-column>
      <el-table-column
        align="left"
        :label="translate('路由Name')"
        min-width="160"
        prop="name"
        show-overflow-tooltip
      />
      <el-table-column
        align="left"
        :label="translate('路由Path')"
        min-width="160"
        prop="path"
        show-overflow-tooltip
      />
      <el-table-column
        align="left"
        :label="translate('是否隐藏')"
        min-width="100"
        prop="hidden"
      >
        <template #default="scope">
          <span>
            {{ scope.row.hidden ? translate('隐藏') : translate('显示') }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        align="left"
        :label="translate('父节点')"
        prop="parentId"
        width="90"
      />
      <el-table-column
        align="left"
        :label="translate('排序')"
        prop="sort"
        width="70"
      />
      <el-table-column
        align="left"
        :label="translate('文件路径')"
        min-width="360"
        prop="component"
      />
      <el-table-column
        align="left"
        fixed="right"
        :label="translate('操作')"
        width="300"
      >
        <template #default="scope">
          <el-button
            icon="plus"
            link
            size="small"
            type="primary"
            @click="addMenu(scope.row)"
          >
            {{ translate('添加子菜单') }}
          </el-button>
          <el-button
            icon="edit"
            link
            size="small"
            type="primary"
            @click="editMenu(scope.row)"
          >
            {{ translate('编辑') }}
          </el-button>
          <el-button
            icon="delete"
            link
            size="small"
            type="primary"
            @click="deleteMenu(scope.row)"
          >
            {{ translate('删除') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <edit
      ref="editRef"
      :menu-table="state.list"
      :title="state.dialogTitle"
      @fetch-data="fetchData"
    />
    <setLogoCom v-model:show="setLogoVis" />
  </div>
</template>

<script setup>
  import { translate } from '@/i18n'
  import { getMenuList, deleteBaseMenu } from '@/api/menuManagement'
  import { Plus, Setting } from '@element-plus/icons-vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import Edit from './components/MenuManagementEdit'
  import setLogoCom from './components/setLogo.vue'
  import { reactive, ref } from 'vue'

  const state = reactive({
    dialogTitle: '',
    data: [],
    list: [],
    listLoading: false,
  })
  const editRef = ref(null)
  const setLogoVis = ref(false)
  /**
   * 新增菜单
   */
  const addMenu = (row = '') => {
    state.dialogTitle = '新增菜单'
    if (row === '') {
      editRef.value.showEdit(row, 'add')
    } else {
      editRef.value.showEdit(row, 'add')
    }
    //构造父节点ID
    editRef.value.setOptions()
  }
  const editMenu = (row) => {
    state.dialogTitle = '编辑菜单'
    if (row && row.path) {
      editRef.value.showEdit(row, 'edit')
      editRef.value.setOptions()
    }
  }

  const fetchData = async () => {
    state.listLoading = true
    initData()
    state.listLoading = false
  }

  /**
   * 初始化数据
   */
  const initData = async () => {
    state.listLoading = true
    const query = {
      page: 1,
      pageSize: 9999,
    }
    const res = await getMenuList(query)
    state.list = res.data.list
    state.listLoading = false
  }

  /**
   * 删除菜单
   */
  const deleteMenu = (rowInfo) => {
    //
    ElMessageBox.confirm('是否删除当前路由?', { type: 'warning' }).then(
      async () => {
        const res = await deleteBaseMenu({ id: rowInfo.id })
        ElMessage({ type: 'success', message: res.msg })
        initData()
      }
    )
  }
  /**
   * 设置logo
   */
  const setLogo = () => {
    setLogoVis.value = true
  }
  onMounted(() => {
    initData()
  })
</script>

<style lang="scss" scoped>
  $base: '.menu-management';
  #{$base}-container {
    padding: 0 !important;
    background: $base-color-background !important;
  }
</style>
