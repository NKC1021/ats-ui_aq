<template>
  <div class="task-management-container">
    <vab-query-form>
      <vab-query-form-left-panel>
        <el-button icon="Plus" type="primary" @click="handleAdd">
          {{ translate('新增') }}
        </el-button>
      </vab-query-form-left-panel>
    </vab-query-form>
    <el-table :data="dataSource">
      <el-table-column :label="translate('数据源')" prop="dataSourceId">
        <template #default="scope">
          {{ dataSourceObj[scope.row.dataSourceId] }}
        </template>
      </el-table-column>
      <el-table-column :label="translate('任务组名')" prop="name" />
      <el-table-column :label="translate('任务组描述')" prop="desc" />
      <el-table-column
        :label="translate('任务组运行参数')"
        prop="param"
        show-overflow-tooltip
      />
      <el-table-column :label="translate('触发时间')" prop="cron">
        <template #default="scope">
          {{ getCronLabel(scope.row.cron) }}
        </template>
      </el-table-column>
      <el-table-column :label="translate('进度')" prop="progress">
        <template #default="scope">
          <el-progress
            v-if="scope.row.LatestRunningInfo?.status === 1"
            :percentage="scope.row.progress"
            status="success"
            :stroke-width="16"
            :text-inside="true"
          />
          <el-progress
            v-if="scope.row.LatestRunningInfo?.status === 2"
            :percentage="100"
            status="success"
            :stroke-width="16"
            :text-inside="true"
          />
          <div v-if="scope.row.LatestRunningInfo?.status === 4">
            <el-tooltip
              :content="scope.row.LatestRunningInfo?.detail"
              effect="dark"
              placement="top"
            >
              {{ transformStatus(scope.row.LatestRunningInfo?.status) }}
            </el-tooltip>
          </div>
          <div v-if="![1, 2, 4].includes(scope.row.LatestRunningInfo?.status)">
            {{ transformStatus(scope.row.LatestRunningInfo?.status) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="translate('操作')" min-width="120px">
        <template #default="scope">
          <el-button
            icon="edit"
            link
            size="small"
            type="primary"
            @click="editTaskGroup(scope.row)"
          >
            {{ translate('编辑') }}
          </el-button>
          <el-button
            :disabled="scope.row?.LatestRunningInfo?.status === 1"
            icon="VideoPlay"
            link
            size="small"
            type="primary"
            @click="runTaskGroup(scope.row)"
          >
            {{ translate('运行') }}
          </el-button>
          <el-button
            icon="Checked"
            link
            size="small"
            type="primary"
            @click="checkedRunningInfo(scope.row)"
          >
            {{ translate('查看') }}
          </el-button>
          <el-popconfirm
            title="是否执行删除操作?"
            :width="170"
            @confirm="deleteRunning(scope.row)"
          >
            <template #reference>
              <el-button icon="Delete" link size="small" type="primary">
                {{ translate('删除') }}
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :before-close="editCancel"
      :close-on-click-modal="false"
      :title="dialogTitle"
      width="35%"
    >
      <el-form
        ref="formRef"
        label-width="130px"
        :model="taskForm"
        :rules="rules"
      >
        <el-form-item :label="translate('数据源')" prop="dataSourceId">
          <el-select v-model="taskForm.dataSourceId" style="width: 100%">
            <el-option
              v-for="item in dataSourceList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="translate('任务组名')">
          <el-input v-model="taskForm.name" disabled />
        </el-form-item>
        <el-form-item :label="translate('任务组描述')">
          <el-input v-model="taskForm.desc" />
        </el-form-item>
        <el-form-item :label="translate('任务组运行参数')">
          <template #label>
            {{ translate('任务组运行参数') }}
            <el-tooltip content="" effect="dark" placement="top">
              <template #content>
                {{ translate('示例参考') }}:
                <br />
                {
                <br />
                "timeDuration": "72h",
                <br />
                "machineNames": ["机台1"],
                <br />
                "productNames": ["料号1"],
                <br />
                "batchNames": ["批号1"]
                <br />
                }
                <br />
              </template>
              <el-icon style="margin-top: 9px"><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="taskForm.param" />
        </el-form-item>
        <el-form-item :label="translate('任务组')">
          <el-select
            v-model="taskForm.jobIds"
            collapse-tags
            multiple
            style="width: 100%"
          >
            <el-option
              v-for="item in jobDataList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              {{ `${item.name}` }}
              <el-tag>
                {{ item.desc }}
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="translate('定时任务')">
          <el-switch
            v-model="taskForm.enable"
            :active-value="true"
            :inactive-value="false"
            size="small"
            @change="switchchange"
          />
        </el-form-item>
        <el-form-item
          v-if="taskForm.enable && cronExpressionView"
          :label="translate('CRON表达式')"
        >
          <el-input v-model="taskForm.cron" :disabled="!taskForm.enable" />
        </el-form-item>
        <el-form-item v-if="taskForm.enable" :label="translate('触发时间')">
          <el-radio-group
            v-model="timeRadio"
            :disabled="!taskForm.enable"
            @change="radioChange"
          >
            <el-radio
              v-for="(item, index) in radioList"
              :key="index"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editCancel">{{ translate('取消') }}</el-button>
          <el-button
            v-show="dialogType === 'edit'"
            type="primary"
            @click="editSubmit"
          >
            {{ translate('确定') }}
          </el-button>
          <el-button
            v-show="dialogType === 'add'"
            type="primary"
            @click="addSubmit"
          >
            {{ translate('确定') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 任务详情 -->
    <el-dialog
      v-model="detailDiaVis"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="translate('任务详情')"
      width="75%"
    >
      <el-table :data="detailTableData" :height="520">
        <el-table-column
          :label="translate('数据源')"
          prop="dataSourceId"
          width="100px"
        >
          <template #default="scope">
            {{ dataSourceObj[scope.row.dataSourceId] }}
          </template>
        </el-table-column>
        <el-table-column :label="translate('开始日期')" prop="startAt" />
        <el-table-column :label="translate('结束日期')" prop="endAt" />
        <el-table-column :label="translate('详情')" prop="detail" />
        <el-table-column :label="translate('路径')" prop="dataPath" />
        <el-table-column :label="translate('状态')" prop="status" width="100px">
          <template #default="scope">
            {{ transformStatus(scope.row.status) }}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pageInfo.currentPage"
        v-model:page-size="pageInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        small="small"
        :total="pageInfo.total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </el-dialog>
  </div>
</template>
<script setup>
  import { translate } from '@/i18n'
  import { ref, computed, reactive } from 'vue'
  import { pageDataSourceNode } from '@/api/dataSource'
  import {
    listJobGroup,
    updateJobGroup,
    runJobGroup,
    getRunningJobGroup,
    pageGroupRunningInfo,
    deleteRunningJobGroup,
    createRunningJobGroup,
    listJob,
  } from '@/api/job'
  import { ElMessage } from 'element-plus'

  const tableData = ref([])
  const detailTableData = ref([])
  const dialogVisible = ref(false)
  const detailDiaVis = ref(false)
  const taskForm = ref({
    groupId: '',
    name: 'ARS_NORMAL',
    desc: '',
    param: '',
    cron: '',
    enable: false,
    dataSourceId: '',
    jobIds: [],
  })
  const rules = ref({
    dataSourceId: [
      {
        required: true,
        message: translate('必填'),
        trigger: 'change',
      },
    ],
  })
  let timer = null
  const jobDataList = ref([])
  const progressMap = ref(new Map())
  const formRef = ref(null)
  const dataSourceList = ref([])
  const pageInfo = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  })
  let checkedRow = {}
  // 时间段选择
  const radioList = ref([
    { label: translate('每小时'), value: '0 0 * * * *' },
    { label: translate('每12小时'), value: '0 0 */12 * * *' },
    { label: translate('每天'), value: '0 0 0 * * *' },
    { label: translate('每周'), value: '0 0 0 * * 0' },
    { label: translate('每月'), value: '0 0 0 1 * *' },
  ])
  const timeRadio = computed(() => {
    return taskForm.value.cron
  })
  const dialogType = ref('add')
  const dialogTitle = computed(() => {
    if (dialogType.value === 'add') {
      return translate('新增')
    }
    return translate('编辑')
  })
  /**
   * 数据来源转译
   */
  const dataSourceObj = computed(() => {
    const obj = {}
    dataSourceList.value.forEach((el) => {
      obj[el.id] = el.name
    })
    return obj
  })
  const dataSource = computed(() => {
    const arr = JSON.parse(JSON.stringify(tableData.value))
    arr.forEach((item) => {
      if (progressMap.value.has(`${item.id}`)) {
        item.progress = progressMap.value.get(`${item.id}`)
      } else {
        item.progress = 0
      }
    })
    return arr
  })
  /**
   * 获取数据源
   */
  const getDataSource = async () => {
    const res = await pageDataSourceNode({ page: 1, pageSize: 999 })
    dataSourceList.value = res.data.list
    // status 1运行中2结束3停止4异常
  }
  getDataSource()
  /**
   * 查询任务组列表
   */
  const getJobList = async () => {
    const res = await listJobGroup({})
    // console.log('res:::', res)
    if (res.code === 0) {
      tableData.value = res.data
      const flag = tableData.value.some((item) => {
        return item.LatestRunningInfo?.status === 1
      })

      if (flag) {
        getRunning()
      }
    }
  }
  getJobList()
  /**
   * 编辑任务组
   */
  const editTaskGroup = (rowInfo) => {
    dialogType.value = 'edit'
    Object.keys(taskForm.value).forEach((key) => {
      taskForm.value[key] = rowInfo[key]
    })
    taskForm.value.groupId = rowInfo.id
    let _jobIds = []
    _jobIds = rowInfo.jobs.map((el) => el.id)
    taskForm.value.jobIds = _jobIds
    dialogVisible.value = true
  }
  /**
   * 运行任务组
   */
  const runTaskGroup = async (rowInfo) => {
    const query = {
      groupId: `${rowInfo.id}`,
    }
    const res = await runJobGroup(query)
    if (res.code === 0) {
      ElMessage.success(res.msg)
      setTimeout(() => {
        getJobList()
      }, 1000)
    }
  }
  /**
   * 弹窗取消
   */
  const editCancel = () => {
    // Object.keys(taskForm.value).forEach((key) => {
    //   taskForm.value[key] = ''
    // })
    taskForm.value = {
      groupId: '',
      name: 'ARS_NORMAL',
      desc: '',
      param: '',
      cron: '',
      enable: false,
      dataSourceId: '',
      jobIds: [],
    }
    formRef.value.resetFields()
    dialogVisible.value = false
    nextTick(() => {})
  }
  /**
   *
   * 弹窗取消
   */
  const editSubmit = async () => {
    formRef.value.validate(async (val) => {
      if (val) {
        await updateJob({ ...taskForm.value })
        editCancel()
      }
    })
  }
  /**
   * 更新数据接口
   */
  const updateJob = async (query) => {
    const res = await updateJobGroup({ ...query })
    ElMessage.success(res.msg)
    getJobList()
  }
  /**
   * 查看正在运行任务组
   */
  const getRunning = async () => {
    const res = await getRunningJobGroup({})
    const _Obj = res.data
    if (res.data && JSON.stringify(res.data) === '{}') {
      timer && clearInterval(timer)
      getJobList()
    } else {
      Object.keys(_Obj).forEach((key) => {
        if (progressMap.value.has(key)) {
          progressMap.value.set(key, parseInt(_Obj[key].Progress * 100))
        } else {
          progressMap.value.set(key, 0)
        }
      })
      clearInterval(timer)
      timer = setInterval(() => {
        getRunning()
      }, 3000)
    }
  }
  /**
   * 状态值转换
   */
  const transformStatus = (status) => {
    if (status === 0) return ''
    let str = ''
    const statusObj = {
      1: '运行中',
      2: '结束',
      3: '停止',
      4: '异常',
    }
    str = statusObj[status]
    return str
  }
  const handleClose = () => {
    detailDiaVis.value = false
    detailTableData.value = []
  }
  /**
   * 查看详情
   */
  const checkedRunningInfo = async (row) => {
    checkedRow = row
    const query = {
      page: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      keyword: `${row.id}`,
    }
    const res = await pageGroupRunningInfo(query)
    detailTableData.value = res.data.list
    pageInfo.currentPage = res.data.page
    pageInfo.pageSize = res.data.pageSize
    pageInfo.total = res.data.total
    nextTick(() => {
      detailDiaVis.value = true
    })
  }
  /**
   * 页数改变
   */
  const handleCurrentChange = (page) => {
    pageInfo.currentPage = page
    checkedRunningInfo(checkedRow)
  }
  /**
   * 页码改变
   */
  const handleSizeChange = (pageSize) => {
    pageInfo.pageSize = pageSize
    checkedRunningInfo(checkedRow)
  }
  /**
   * 删除任务组配置
   */
  const deleteRunning = async (row) => {
    await deleteRunningJobGroup(row.id)
    // console.log('res:::', res)
    getJobList()
  }
  /**
   * 弹窗启用
   */
  const switchchange = (val) => {
    taskForm.value.cron = ''
    if (val) {
      taskForm.value.cron = '0 0 0 * * *'
    }
  }
  /**
   * 新增
   */
  const handleAdd = () => {
    dialogType.value = 'add'
    dialogVisible.value = true
  }
  /**
   *新增任务
   */
  const addSubmit = async () => {
    formRef.value.validate(async (val) => {
      if (val) {
        const query = JSON.parse(JSON.stringify(taskForm.value))
        delete query.groupId
        await createRunningJobGroup(query)
        getJobList()
        editCancel()
      }
    })
  }
  const cronExpressionView = ref(false)
  const checkThemeBtn = () => {
    const userBtn = localStorage.getItem('usrBtnAccess')
    userBtn &&
      JSON.parse(userBtn).forEach((btn) => {
        if (btn === 'cronExpressionView') {
          cronExpressionView.value = true
        }
      })
  }
  onMounted(() => {
    checkThemeBtn()
  })
  /**
   * 时间段触发任务
   */
  const radioChange = (val) => {
    taskForm.value.cron = val
  }
  const getCronLabel = (cron) => {
    if (cron === '') {
      return '未定义'
    }
    const matchedItem = radioList.value.find((item) => item.value === cron)
    return matchedItem ? matchedItem.label : cron
  }
  /**
   * 查看任务
   */
  const getListJob = async () => {
    const res = await listJob({})
    jobDataList.value = res.data
    console.log('res:::', res)
  }
  getListJob()
</script>
