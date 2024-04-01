<template>
  <div class="department-management-container">
    <vab-query-form>
      <vab-query-form-left-panel :span="12">
        <el-button :icon="Plus" type="primary" @click="handleEdit($event)">
          {{ translate('添加') }}
        </el-button>
        <el-button :icon="Delete" type="danger" @click="handleDelete($event)">
          {{ translate('批量删除') }}
        </el-button>
      </vab-query-form-left-panel>
    </vab-query-form>
    <el-table
      v-loading="state.listLoading"
      :data="deptList"
      default-expand-all
      max-height="650px"
      row-key="deptId"
      :tree-props="{ children: 'children' }"
      @selection-change="setSelectRows"
    >
      <el-table-column show-overflow-tooltip="true" type="selection" />
      <el-table-column
        :label="translate('部门名称')"
        prop="name"
        show-overflow-tooltip="true"
      />
      <el-table-column
        :label="translate('描述')"
        prop="description"
        show-overflow-tooltip="true"
      />
      <el-table-column
        :label="translate('排序')"
        prop="sort"
        show-overflow-tooltip="true"
        sortable
      />
      <el-table-column
        :formatter="
          (row) =>
            new Date(row.CreatedAt).toLocaleString('zh-CN', {
              dateStyle: 'medium',
              timeStyle: 'medium',
            })
        "
        :label="translate('创建时间')"
        prop="CreatedAt"
        show-overflow-tooltip="true"
      />
      <el-table-column :label="translate('操作')">
        <template #default="scope">
          <el-button text type="primary" @click="handleEdit(scope.row)">
            <el-icon><EditPen /></el-icon>
            {{ translate('编辑') }}
          </el-button>
          <el-button text type="primary" @click="handleDelete(scope.row)">
            <el-icon><Delete /></el-icon>
            {{ translate('删除') }}
          </el-button>
        </template>
      </el-table-column>
      <template #empty>
        <!--  <el-image
          class="vab-data-empty"
          :src="require('@/assets/empty_images/data_empty.png')"
        /> -->
        <el-empty class="vab-data-empty" :description="translate('暂无数据')" />
      </template>
    </el-table>

    <Edit ref="editRef" :tree-data="deptList" @fetch-data="fetchData" />
  </div>
</template>
<script setup>
  import { deleteDeptByIds, findDeptByIds } from '@/api/departmentManagement'
  import { inject, reactive, ref } from 'vue'
  import { Delete, Plus } from '@element-plus/icons-vue'
  import Edit from './components/DepartmentManagementEdit'
  import { translate } from '@/i18n'

  const $baseConfirm = inject('$baseConfirm')
  const $baseMessage = inject('$baseMessage')
  const editRef = ref(null)
  const deptList = ref([])
  const state = reactive({
    listLoading: true,
    selectRows: [],
  })

  const setSelectRows = (val) => {
    state.selectRows = val
  }
  const handleEdit = (row) => {
    if (row.deptId) {
      editRef.value.showEdit(row)
    } else {
      editRef.value.showEdit()
    }
  }
  const handleDelete = (row) => {
    const query = {
      ids: [],
    }
    if (row.deptId) {
      query.ids.push(row.deptId)
      $baseConfirm(`确定要删除部门：${row.name} 吗`, null, async () => {
        const { msg } = await deleteDeptByIds(query)
        $baseMessage(msg, 'success', 'vab-hey-message-success')
        await fetchData()
      })
      //  多选
    } else {
      if (state.selectRows.length > 0) {
        state.selectRows.map((item) => query.ids.push(item.deptId))
        $baseConfirm('你确定要删除选中项吗', null, async () => {
          const { msg } = await deleteDeptByIds(query)
          $baseMessage(msg, 'success', 'vab-hey-message-success')
          await fetchData()
        })
      } else {
        $baseMessage('未选中任何行', 'error', 'vab-hey-message-error')
      }
    }
  }

  const fetchData = async () => {
    state.listLoading = true
    const res = await findDeptByIds({})
    deptList.value = res.data.sort((a, b) => a.sort - b.sort)
    state.listLoading = false
  }
  onMounted(() => {
    fetchData()
  })
</script>
