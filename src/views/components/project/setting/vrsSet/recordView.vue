<!--  -->
<template>
  <div>
    <el-dialog
      v-model="dialogVis"
      :before-close="beforeClose"
      :title="translate('任务记录')"
      top="12vh"
      width="60%"
    >
      <el-table :data="tableData" height="580">
        <el-table-column :label="translate('状态')" min-width="5" prop="status">
          <template #default="scoped">
            {{ taskStatusName[`${scoped.row.status}`] }}
          </template>
        </el-table-column>
        <el-table-column
          :label="translate('详情')"
          min-width="20"
          prop="detail"
          show-overflow-tooltip="true"
        />
        <el-table-column
          :formatter="timeFormatter"
          :label="translate('创建时间')"
          min-width="5"
          prop="createTime"
        />
        <el-table-column
          :formatter="timeFormatter"
          :label="translate('更新时间')"
          min-width="5"
          prop="updateTime"
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
  import pcbDataTask from '@/api/pcbDataTaskService'

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
        pageSize: 11,
        dataTotal: 0,
        tableData: [],
        taskStatusName: {
          1: translate('运行中'),
          2: translate('异常'),
          3: translate('完成'),
          4: translate('停止'),
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
          console.log(this.currentRow)
          this.pagePcbTaskRecord(query)
        }
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      timeFormatter(row, column, cellValue) {
        return new Date(cellValue).toLocaleString()
      },
      /**
       *查看
       */
      async pagePcbTaskRecord(pageInfoReq) {
        const res = await pcbDataTask.pageRecord(pageInfoReq)
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
        this.pagePcbTaskRecord(query)
      },
      handleCurrentChange(currentNum) {
        this.currentPage = currentNum
        const query = {
          keyword: `${this.currentRow.id}`,
          pageSize: this.pageSize,
          page: currentNum - 1,
        }
        this.pagePcbTaskRecord(query)
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
<style lang="scss" scoped></style>
