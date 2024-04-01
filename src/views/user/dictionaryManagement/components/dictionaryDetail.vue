<template>
  <el-dialog
    v-model="dialogVisible"
    :before-close="handleClose"
    :title="translate('字典详情')"
    width="62%"
  >
    <el-row>
      <el-col class="head-nav">
        <el-form class="form-inline" inline :model="searchInfo">
          <el-form-item :label="translate('展示值')">
            <el-input
              v-model="searchInfo.label"
              :placeholder="translate('搜索条件')"
            />
          </el-form-item>
          <el-form-item :label="translate('字典值')">
            <el-input
              v-model="searchInfo.value"
              :placeholder="translate('搜索条件')"
            />
          </el-form-item>
          <el-form-item :label="translate('状态')">
            <el-select
              v-model="searchInfo.status"
              :placeholder="translate('搜索条件')"
            >
              <el-option :label="translate('是')" :value="true" />
              <el-option :label="translate('否')" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">
              {{ translate('查询') }}
            </el-button>
            <el-button @click="onReset">{{ translate('重置') }}</el-button>
            <el-button :icon="Plus" type="primary" @click="handleEdit()">
              {{ translate('新增字典项') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-table :data="tableData" height="500">
      <el-table-column :label="translate('日期')">
        <template #default="scope">
          {{ formatDate(scope.row.CreatedAt) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="translate('展示值')"
        prop="label"
        show-overflow-tooltip
      />
      <el-table-column
        :label="translate('字典值')"
        prop="value"
        show-overflow-tooltip
      />
      <el-table-column :label="translate('启用状态')" width="100px">
        <template #default="scope">
          {{ formatBoolean(scope.row.status) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="translate('排序标记')"
        prop="sort"
        width="100px"
      />
      <el-table-column :label="translate('操作')">
        <template #default="scope">
          <el-button
            icon="edit"
            link
            size="small"
            type="primary"
            @click="updateSysDictionaryFunc(scope.row)"
          >
            {{ translate('变更') }}
          </el-button>
          <el-popover v-model="scope.row.visible" placement="top" width="160">
            <p>{{ translate('确定要删除吗?') }}</p>
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
                @click="deleteSysDictionaryFunc(scope.row)"
              >
                {{ translate('确定') }}
              </el-button>
            </div>
            <template #reference>
              <el-button
                icon="delete"
                link
                size="small"
                style="margin-left: 10px"
                type="primary"
                @click="scope.row.visible = true"
              >
                {{ translate('删除') }}
              </el-button>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty :description="translate('暂无数据')" />
      </template>
    </el-table>
    <el-pagination
      v-model:current-page="pageInfo.page"
      v-model:page-size="pageInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="[10, 20, 50, 100]"
      :small="true"
      :total="pageInfo.total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </el-dialog>
  <edit
    ref="editRef"
    :active-row="activeRow"
    :dialog-type="dialogType"
    @fetch-data="fetchData"
  />
</template>

<script setup>
  import { Plus } from '@element-plus/icons-vue'
  import { formatDate } from '@/utils/format'
  import Edit from './dictionaryDetailEdit.vue'
  import { ref, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    pageSysDictionaryDetail,
    deleteSysDictionaryDetail,
  } from '@/api/dictionaryManagement'
  import { translate } from '@/i18n'
  const dialogType = ref('add')
  const dialogVisible = ref(false)
  const tableData = ref([])
  const searchInfo = ref({
    label: '',
    value: '',
    status: true,
    sysDictionaryId: '',
  })
  const pageInfo = reactive({
    page: 1,
    pageSize: 10,
    total: 0,
  })
  const activeRow = ref({})
  const handleClose = () => {
    dialogVisible.value = false
    tableData.value = []
    pageInfo.page = 1
    pageInfo.pageSize = 10
    pageInfo.total = 0
  }
  /**
   * 向父组件抛出方法
   */
  const showDetail = (rowInfo) => {
    activeRow.value = JSON.parse(JSON.stringify(rowInfo))
    searchInfo.value.sysDictionaryId = String(rowInfo.id)
    fetchData()
    dialogVisible.value = true
  }
  const formatBoolean = (bool) => {
    if (bool !== null) {
      return bool ? translate('是') : translate('否')
    } else {
      return ''
    }
  }
  /**
   * 删除详情数据
   */
  const deleteSysDictionaryFunc = async (row) => {
    row.visible = false
    const res = await deleteSysDictionaryDetail(row.id)
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '删除成功',
      })
      fetchData()
    }
  }
  /**
   * 分页获取详情
   */
  const fetchData = async () => {
    const query = {
      pageInfo: {
        page: pageInfo.page,
        pageSize: pageInfo.pageSize,
      },
      sysDictionaryDetail: { ...searchInfo.value },
    }
    const res = await pageSysDictionaryDetail(query)
    if (res.code === 0) {
      //
      tableData.value = res.data.list
      pageInfo.total = res.data.total
    }
  }
  /**
   * 重置
   */
  const onReset = () => {
    //
    searchInfo.value.label = ''
    searchInfo.value.value = ''
    searchInfo.value.status = true
  }
  /**
   * 查询
   */
  const onSubmit = () => {
    fetchData()
  }
  /**
   * 新增字典
   */
  const editRef = ref(null)
  const handleEdit = () => {
    dialogType.value = 'add'
    nextTick(() => {
      editRef.value.showEdit()
    })
  }
  /**
   * 变更
   */
  const updateSysDictionaryFunc = (row) => {
    dialogType.value = 'update'
    nextTick(() => {
      editRef.value.showEdit(row)
    })
  }
  /**
   * 页数改变
   */
  const handleCurrentChange = (page) => {
    pageInfo.page = page
    fetchData()
  }
  /**
   * 页数改变
   */
  const handleSizeChange = (pageSize) => {
    pageInfo.pageSize = pageSize
    fetchData()
  }
  defineExpose({
    showDetail,
  })
</script>
<style scoped lang="scss">
  .head-nav {
    margin-bottom: 5px;
    padding: 5px 0;
    .form-inline {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }
</style>
