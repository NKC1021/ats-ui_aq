<template>
  <div class="container">
    <div style="margin-bottom: 15px; float: right">
      <el-tooltip
        class="item"
        effect="dark"
        placement="bottom"
        style="margin-right: 10px"
      >
        <template #content>
          {{ $t('i18_explain_colon') }}
          <br />
          {{ $t('i18_standard_tip_label_pass_standard') }}
          <br />
          {{ $t('i18_standard_tip_label_num_default_standard_is_10') }}
          <br />
        </template>
        <i class="el-icon-question question-icon"></i>
      </el-tooltip>
      <el-button icon="el-icon-circle-check" type="primary" @click="updateData">
        {{ $t('i18_save_b') }}
      </el-button>
    </div>
    <!-- <div style="margin-bottom: 15px">
      <p>
        <span style="color: red; font-size: 24px">*</span>
        <span style="color: #6c6969">{{ $t('i18_explain_colon') }}</span>
      </p>
      <p class="note">{{ $t('i18_standard_tip_label_pass_standard') }}</p>
      <p class="note">{{ $t('i18_standard_tip_label_num_default_standard_is_10') }}</p>
    </div> -->
    <Table class="my-table" :column="column" :table-data="tableData" />
  </div>
</template>

<script>
  // import Table from '@/components/table/table.vue'
  // import tableColumn from '@/util/table-column'
  // import api from '@/api/core/projectSetController'

  export default {
    components: {
      Table,
    },
    beforeRouteLeave(to, from, next) {
      const list = this.tableData.map((item) => item.standardPercentage)
      console.log(list)
      console.log(this.tempTableData)
      if (JSON.stringify(list) !== JSON.stringify(this.tempTableData)) {
        this.$confirm(this.$t('i18_confirm_save_cause_label_rate_change'), {
          type: 'warning',
        })
          .then(() => {
            this.updateData()
            next()
          })
          .catch(() => {
            next()
          })
      } else {
        next()
      }
      // console.log(this.arrEuqalse(list, this.tempTableData));
      // if (this.arrEuqalse(this.tableData, this.tempTableData)) {
      //   this.$confirm();
      // } else {
      //   next();
      // }
      // next();
    },
    data() {
      return {
        tableData: [],
        tempTableData: [],
      }
    },
    computed: {
      column() {
        return tableColumn.standardColumn
      },
    },
    created() {
      this.getData()
    },
    methods: {
      // 获取列表
      async getData() {
        const { data: res } = await api.listPassStandard()
        this.tableData = res.data
        this.tempTableData = res.data.map((item) => item.standardPercentage)
      },
      // 更新列表数据1
      async updateData() {
        const passStandardDOList = [...this.tableData]

        const { data: res } = await api.updatePassStandard(passStandardDOList)
        if (res.code === 0) {
          this.$message.success(res.message)
          this.getData()
        }
      },
      //
      // arrEuqalse(arr1, arr2) {
      //   const list1 = arr1.map(item => item.standardPercentage);
      //   const list2 = arr2.map(item => item.standardPercentage);
      //   if (JSON.stringify(list1) === JSON.stringify(list2)) {
      //     return true;
      //   } else {
      //     return false;
      //   }
      //   // for (var i = 0; i < arr1.length; i++) {
      //   //   if (arr1[i].standardPercentage !== arr2[i].standardPercentage) {
      //   //     return true;
      //   //   }
      //   // }
      //   // return false;
      // }
    },
  }
</script>
<style lang="scss" scoped>
  .footer {
    width: 100%;
    text-align: right;
    padding-top: 10px;
  }
  .note {
    padding: 5px;
    color: #6c6969;
  }
</style>
