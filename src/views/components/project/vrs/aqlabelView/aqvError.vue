<!--  -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :before-close="closeDialog"
    :close-on-click-modal="false"
    :title="translate('异常信息')"
    width="750px"
  >
    <el-table :data="tableDataByPage" height="450">
      <el-table-column :label="translate('图片ID')" prop="id" />
      <el-table-column :label="translate('异常信息')" prop="msg" />
      <template #empty>
        <el-empty description="空" />
      </template>
    </el-table>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      background
      layout="total, prev, pager, next, jumper"
      small
      :total="tableData.length"
    />
  </el-dialog>
</template>

<script>
  import { translate } from '@/i18n'
  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      errorMsg: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    emits: ['update:show'],
    data() {
      return {
        pageSize: 10,
        currentPage: 1,
      }
    },
    computed: {
      translate() {
        return translate
      },
      dialogVisible: {
        get() {
          return this.show
        },
        set(newVal) {
          this.$emit('update:show', newVal)
        },
      },
      /**
       * 构造表格数据
       */
      tableData() {
        if (JSON.stringify(this.errorMsg) === '{}') return []
        return Object.keys(this.errorMsg).map((el) => {
          return {
            id: el,
            msg: this.errorMsg[el],
          }
        })
      },
      tableDataByPage() {
        const str = (this.currentPage - 1) * this.pageSize
        const end = this.currentPage * this.pageSize
        const newArr = this.tableData.slice(str, end)
        return newArr
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      closeDialog() {
        this.dialogVisible = false
        this.currentPage = 1
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .el-pagination {
    margin-top: 0;
  }
</style>
