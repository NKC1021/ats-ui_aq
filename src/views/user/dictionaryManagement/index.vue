<template>
  <div class="dictionary-management-container">
    <el-row :gutter="20">
      <el-col>
        <vab-card shadow="hover">
          <el-form class="form-inline" inline :model="searchInfo">
            <el-form-item :label="translate('字典名（中）')">
              <el-input
                v-model="searchInfo.name"
                :placeholder="translate('搜索条件')"
              />
            </el-form-item>
            <el-form-item :label="translate('字典名（英）')">
              <el-input
                v-model="searchInfo.type"
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
            <el-form-item :label="translate('描述')">
              <el-input
                v-model="searchInfo.desc"
                :placeholder="translate('搜索条件')"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">
                {{ translate('查询') }}
              </el-button>
              <el-button @click="onReset">{{ translate('重置') }}</el-button>
            </el-form-item>
          </el-form>
        </vab-card>
      </el-col>
      <el-col :lg="24" :md="24" :sm="24" :xl="24" :xs="24">
        <vab-card shadow="hover">
          <vab-query-form>
            <vab-query-form-top-panel :span="12">
              <el-button :icon="Plus" type="primary" @click="handleEdit()">
                {{ translate('添加') }}
              </el-button>
            </vab-query-form-top-panel>
          </vab-query-form>

          <el-table
            ref="multipleTable"
            v-loading="state.listLoading"
            :data="list"
            row-key="id"
            style="width: 100%"
            tooltip-effect="dark"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column
              align="left"
              :label="translate('日期')"
              width="180"
            >
              <template #default="scope">
                {{ formatDate(scope.row.CreatedAt) }}
              </template>
            </el-table-column>

            <el-table-column
              align="left"
              :label="translate('字典名（中）')"
              prop="name"
              width="200"
            />

            <el-table-column
              align="left"
              :label="translate('字典名（英）')"
              prop="type"
              width="200"
            />

            <el-table-column
              align="left"
              :label="translate('状态')"
              prop="status"
              width="120"
            >
              <template #default="scope">
                {{ formatBoolean(scope.row.status) }}
              </template>
            </el-table-column>

            <el-table-column
              align="left"
              :label="translate('描述')"
              prop="desc"
              width="280"
            />

            <el-table-column align="left" :label="translate('操作')">
              <template #default="scope">
                <el-button
                  icon="document"
                  link
                  size="small"
                  type="primary"
                  @click="toDetail(scope.row)"
                >
                  {{ translate('详情') }}
                </el-button>
                <el-button
                  icon="edit"
                  link
                  size="small"
                  type="primary"
                  @click="updateSysDictionaryFunc(scope.row)"
                >
                  {{ translate('变更') }}
                </el-button>
                <el-popover
                  v-model="scope.row.visible"
                  placement="top"
                  width="160"
                >
                  <p>{{ translate('确定要删除吗 ?') }}</p>
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
            <!-- <template #empty>
              <el-empty class="vab-data-empty" description="暂无数据" />
            </template> -->
          </el-table>
          <el-pagination
            :current-page="page"
            layout="total, sizes, prev, pager, next, jumper"
            :page-size="pageSize"
            :page-sizes="[5, 10, 30, 50]"
            :total="total"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </vab-card>
      </el-col>
    </el-row>
    <edit ref="editRef" :dialog-type="dialogType" @fetch-data="fetchData" />
    <DetailEdit ref="detailEditRef" />
  </div>
</template>

<script setup>
  import { translate } from '@/i18n'
  // import { getList } from '@/api/dictionaryManagement'
  import {
    pageSysDictionary,
    findSysDictionary,
    deleteSysDictionary,
  } from '@/api/dictionaryManagement'
  import { Plus } from '@element-plus/icons-vue'
  import DetailEdit from './components/dictionaryDetail'
  import Edit from './components/DictionaryManagementEdit.vue'
  import { formatDate } from '@/utils/format'
  import { ref, reactive, nextTick } from 'vue'
  // import { useRouter } from 'vue-router'

  // const $baseConfirm = inject('$baseConfirm')
  // const $baseMessage = inject('$baseMessage')
  // const router = useRouter()
  const state = reactive({
    treeRef: null,
    editRef: null,
    data: [],
    defaultProps: {
      children: 'children',
      label: 'label',
    },
    list: [],
    listLoading: true,
    isRoot: true,
    parentKey: '',
  })
  const searchInfo = ref({
    name: '',
    type: '',
    status: true,
    desc: '',
  })
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const dialogType = ref('add')
  const list = ref([])
  const editRef = ref(null)
  const handleEdit = (row) => {
    dialogType.value = 'add'
    nextTick(() => {
      editRef.value.showEdit(row)
    })
  }

  const fetchData = async (data = { key: 'root' }) => {
    data.key !== 'root' ? (state.isRoot = false) : (state.isRoot = true)
    state.parentKey = data.key

    state.listLoading = true
    const query = {
      pageInfo: {
        page: page.value,
        pageSize: pageSize.value,
      },
      sysDictionary: {
        ...searchInfo.value,
      },
    }
    const res = await pageSysDictionary(query)
    if (res.code === 0) {
      list.value = res.data.list
      total.value = res.data.total
    }
    state.listLoading = false
  }

  const filterText = ref('')
  watch(filterText, (value) => {
    state.treeRef.filter(value)
  })

  const formatBoolean = (bool) => {
    if (bool !== null) {
      return bool ? translate('是') : translate('否')
    } else {
      return ''
    }
  }
  const updateSysDictionaryFunc = async (row) => {
    const res = await findSysDictionary({ id: row.id, status: row.status })
    dialogType.value = 'update'
    if (res.code === 0) {
      const rowInfo = res.data
      nextTick(() => {
        editRef.value.showEdit(rowInfo)
      })
    }
  }
  const deleteSysDictionaryFunc = async (row) => {
    row.visible = false
    const res = await deleteSysDictionary(row.id)
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '删除成功',
      })
      if (list.value.length === 1 && page.value > 1) {
        page.value--
      }
      fetchData()
    }
  }
  const handleCurrentChange = (value) => {
    page.value = value
    fetchData()
  }
  const handleSizeChange = (value) => {
    pageSize.value = value
    fetchData()
  }
  const onSubmit = () => {
    page.value = 1
    pageSize.value = 10
    fetchData()
  }
  /**
   * 查看字典详情
   */
  const detailEditRef = ref(null)
  const toDetail = (row) => {
    detailEditRef.value.showDetail(row)
  }
  const onReset = () => {
    searchInfo.value = {
      name: '',
      type: '',
      status: true,
      desc: '',
    }
  }

  fetchData()
</script>

<style lang="scss" scoped>
  $base: '.dictionary-management';
  #{$base}-container {
    padding: 0 !important;
    background: $base-color-background !important;
    .tree-button {
      width: 100%;
      margin-bottom: $base-margin;
    }

    :deep() {
      .el-tree {
        margin-top: $base-margin;
        &-node__label {
          display: block;
          width: 100%;
        }
      }
    }
  }
  .form-inline {
    .el-form-item {
      margin-bottom: 0;
    }
  }
</style>
