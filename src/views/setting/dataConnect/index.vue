<template>
  <div class="data-management-container">
    <vab-query-form>
      <vab-query-form-left-panel>
        <el-button :icon="Plus" type="primary" @click="handleAdd">
          {{ translate('新增') }}
        </el-button>
        <el-button :icon="Delete" type="danger" @click="deleteDataBases">
          {{ translate('删除') }}
        </el-button>
      </vab-query-form-left-panel>
    </vab-query-form>
    <el-table :data="tableData" @selection-change="handleSelect">
      <el-table-column type="selection" />
      <el-table-column :label="translate('数据源名称')" prop="name" />
      <el-table-column :label="translate('服务器')" prop="host" />
      <el-table-column :label="translate('端口')" prop="port" />
      <el-table-column :label="translate('数据库')" prop="database" />
      <el-table-column :label="translate('用户名')" prop="username" />
      <el-table-column :label="translate('启用')" prop="enable">
        <template #default="scope">
          <el-switch
            v-model="scope.row.enable"
            :active-value="1"
            :inactive-value="0"
            size="small"
            @change="switchChange"
          />
        </template>
      </el-table-column>
      <el-table-column :label="translate('操作')" min-width="100px">
        <template #default="scope">
          <el-button
            icon="edit"
            link
            size="small"
            type="primary"
            @click="editDataBase(scope.row)"
          >
            {{ translate('编辑') }}
          </el-button>
          <el-button
            icon="delete"
            link
            size="small"
            type="primary"
            @click="deleteDataBase(scope.row)"
          >
            {{ translate('删除') }}
          </el-button>
          <el-button
            icon="VideoPlay"
            link
            size="small"
            type="primary"
            @click="testDataBase(scope.row)"
          >
            {{ translate('测试') }}
          </el-button>
          <el-popconfirm
            :title="translate('是否清除数据源?')"
            :width="170"
            @confirm="clearDataBase(scope.row)"
          >
            <template #reference>
              <el-button icon="Delete" link size="small" type="primary">
                {{ translate('清除') }}
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <edit ref="editRef" :dialog-type="dialogType" @fetch-data="fetchData" />
  </div>
</template>

<script setup>
  import {
    pageDataSourceNode,
    deleteDataSourceNode,
    pingDataSourceNode,
    clearDataSourceReport,
  } from '@/api/dataSource'

  import { Delete, Plus } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ref, nextTick } from 'vue'
  import Edit from './component/dataConnectEdit'
  import { recordUserParma } from '@/store/modules/record'
  import { translate } from '@/i18n'
  const store = recordUserParma()
  const dialogType = ref('create')
  const tableData = ref([])
  const selectedList = ref([])
  const editRef = ref(null)
  const handleAdd = () => {
    dialogType.value = 'create'
    nextTick(() => {
      editRef.value.showEdit()
    })
  }
  /**
   * 获取数据源
   */
  const fetchData = async () => {
    const query = {
      page: 1,
      pageSize: 999,
    }
    const res = await pageDataSourceNode(query)
    if (res.code === 0) {
      tableData.value = res.data.list
      tableData.value.forEach((el) => (el.enable = 0))
      const _obj = window.localStorage.getItem('enableDataSource')
      if (_obj) {
        const arr = JSON.parse(_obj)
        tableData.value.forEach((el) => {
          if (arr.includes(el.id)) {
            el.enable = 1
          } else {
            el.enable = 0
          }
        })
      }
    }
  }
  /**
   * 编辑
   */
  const editDataBase = (row) => {
    dialogType.value = 'update'
    nextTick(() => {
      editRef.value.showEdit(row)
    })
  }
  /**
   * 删除
   */
  const deleteDataBase = async (row) => {
    ElMessageBox.confirm(translate('是否删除选中数据'), {
      type: 'warning',
    }).then(async () => {
      const query = {
        ids: [],
      }
      query.ids.push(row.id)
      const res = await deleteDataSourceNode(query)
      if (res.code === 0) {
        ElMessage({ type: 'success', message: res.msg })
        fetchData()
      }
    })
  }
  /**
   * 测试
   */
  const testDataBase = async (row) => {
    const res = await pingDataSourceNode({ id: row.id })
    if (res.code === 0) {
      ElMessage({ type: 'success', message: res.msg })
    }
  }
  /**
   * 多选
   */
  const handleSelect = (val) => {
    selectedList.value = val
  }
  /**
   * 删除多条数据
   */
  const deleteDataBases = async () => {
    if (selectedList.value.length === 0) {
      return false
    }
    ElMessageBox.confirm(translate('是否删除选中数据'), {
      type: 'warning',
    }).then(async () => {
      const query = {
        ids: [],
      }
      selectedList.value.forEach((el) => {
        query.ids.push(el.id)
      })
      const res = await deleteDataSourceNode(query)
      if (res.code === 0) {
        ElMessage({ type: 'success', message: res.msg })
        fetchData()
      }
    })
  }
  /**
   * 启用按钮change
   */
  const switchChange = () => {
    const arr = tableData.value
      .filter((el) => el.enable === 1)
      .map((el) => el.id)
    store.dataSourceId = arr
    window.localStorage.setItem('enableDataSource', JSON.stringify(arr))
  }
  /**
   * 清除数据源
   */
  const clearDataBase = async (rowInfo) => {
    const res = await clearDataSourceReport({ id: rowInfo.id })
    ElMessage.success(res.msg)
  }
  fetchData()
</script>
