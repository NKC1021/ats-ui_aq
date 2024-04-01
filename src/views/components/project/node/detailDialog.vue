<!--  -->
<template>
  <div>
    <el-dialog
      v-model="dialogVis"
      :before-close="beforeClose"
      :title="translate('监控节点详情')"
      top="12vh"
      width="60%"
    >
      <el-table :data="tableData" height="600">
        <el-table-column
          :label="translate('实际导入图片数')"
          prop="statusCurrentStep"
        />
        <el-table-column
          :label="translate('导入图片总数')"
          prop="statusTotalStep"
        />
        <el-table-column :label="translate('状态')" prop="step">
          <template #default="scoped">
            <!-- {{ getStep(scoped.row.step) }} -->
            {{ monitorTaskStatusObj[`${scoped.row.step}`] }}
          </template>
        </el-table-column>
        <el-table-column :label="translate('任务详情')" prop="taskDetail" />
        <el-table-column
          :formatter="timeFormatter"
          :label="translate('开始时间')"
          prop="startTime"
        />
        <el-table-column
          :formatter="endTimeFormatter"
          :label="translate('结束时间')"
          prop="endTime"
        />
        <template #empty>
          <el-empty :description="translate('暂无数据')" />
        </template>
      </el-table>
      <div style="text-align: right">
        <el-pagination
          background
          :current-page="currentPage"
          layout="total,  prev, pager, next, jumper"
          :page-size="pageSize"
          :total="dataTotal"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import monitorTask from '@/api/monitorTask'
  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      currentRow: {
        type: Object,
        default: () => {},
      },
    },
    emits: ['update:show', 'update:currentRow'],
    data() {
      return {
        currentPage: 1,
        pageSize: 15,
        dataTotal: 0,
        tableData: [],
        monitorTaskStatusObj: {
          1: translate('准备开始'),
          2: translate('筛选有效图片'),
          3: translate('正在导入图片'),
          4: translate('成功'),
          5: translate('失败'),
        },
      }
    },
    computed: {
      translate() {
        return translate
      },
      dialogVis: {
        get() {
          return this.show
        },
        set(newVal) {
          this.$emit('update:show', newVal)
        },
      },
    },
    watch: {
      show(newVal) {
        if (newVal) {
          const query = {
            keyword: `${this.currentRow.id}`,
            pageSize: this.pageSize,
            page: this.currentPage - 1,
          }
          this.pageMonitorTaskRecord(query)
        }
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      timeFormatter(row) {
        return new Date(row.startTime).toLocaleString()
      },
      endTimeFormatter(row) {
        return new Date(row.endTime).toLocaleString()
      },
      /**
       *查看
       */
      async pageMonitorTaskRecord(condition) {
        const res = await monitorTask.pageMonitorTaskRecord(condition)
        if (res.code === 0) {
          this.tableData = res.data.list
          this.dataTotal = res.data.total
        }
      },
      handleSizeChange(pageSize) {
        const query = {
          keyword: `${this.currentRow.id}`,
          pageSize: pageSize,
          page: this.currentPage,
        }
        this.pageMonitorTaskRecord(query)
      },
      handleCurrentChange(currentNum) {
        this.currentPage = currentNum
        const query = {
          keyword: `${this.currentRow.id}`,
          pageSize: this.pageSize,
          page: currentNum - 1,
        }
        this.pageMonitorTaskRecord(query)
      },
      beforeClose() {
        this.$emit('update:currentRow', {})
        this.dialogVis = false
        this.tableData = []
        this.currentPage = 1
      },
    },
  }
</script>
<style scoped lang="scss"></style>
