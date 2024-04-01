<!--  -->
<template>
  <div class="vrs-nav-set-box">
    <div v-show="!isEditConfig" class="table-box">
      <el-row style="margin-bottom: 10px">
        <el-col class="head-btns" :span="12">
          <el-button icon="Plus" type="primary" @click="editRow()">
            {{ translate('新增') }}
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="tableData" height="100%">
        <el-table-column :label="translate('序号')" prop="id" />
        <el-table-column :label="translate('名称')" prop="name" />

        <el-table-column :label="translate('状态')" prop="enable">
          <template #default="scope">
            <!-- <el-tag>Tag 1</el-tag> -->
            <el-tag :type="scope.row.enable ? 'primary' : 'info'">
              {{ scope.row.enable ? '启用' : '停用' }}
            </el-tag>
            <!-- <span>{{ scope.row.enable ? '启用' : '停用' }}</span> -->
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template #default="scope">
            <el-button
              icon="EditPen"
              link
              type="primary"
              @click="editRow(true, scope.row)"
            >
              {{ translate('名称') }}
            </el-button>
            <el-button
              icon="EditPen"
              link
              type="primary"
              @click="handleEditConfig(scope.row)"
            >
              {{ translate('导航图') }}
            </el-button>
            <el-button
              :disabled="scope.row.enable"
              icon="CircleCheck"
              link
              type="primary"
              @click="enableNavConfig(scope.row)"
            >
              {{ translate('启用') }}
            </el-button>
            <el-popconfirm
              :hide-after="100"
              :title="translate('是否删除数据')"
              @confirm="deleteNavConfig(scope.row)"
            >
              <template #reference>
                <el-button icon="Delete" link type="primary">
                  {{ translate('删除') }}
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="translate('暂无数据')" />
        </template>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVis"
      :close-on-click-modal="false"
      :title="dialogTitle"
      width="22%"
    >
      <el-form
        ref="navEdit"
        label-width="50px"
        :model="vrsNavForm"
        :rules="nodeRules"
        size="default"
      >
        <el-form-item :label="translate('名称')" prop="name">
          <el-input v-model="vrsNavForm.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="vrsNavFormSubmit">
          {{ translate('确定') }}
        </el-button>
        <el-button @click="dialogVis = false">
          {{ translate('取消') }}
        </el-button>
      </template>
    </el-dialog>

    <navSetCom
      v-show="isEditConfig"
      :edit-detail-obj="editDetailObj"
      @return-table="returnTable"
    />
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import vrsNavApi from '@/api/vrsNav'
  import navSetCom from '@/views/components/project/setting/vrsNavSet/index.vue'
  export default {
    components: { navSetCom },
    data() {
      return {
        editDetailObj: {},
        dialogTitle: translate('新增'),
        dialogVis: false,
        vrsNavForm: {
          id: '',
          name: '',
          enable: '',
          detail: '',
        },
        tableData: [],
        isEditConfig: false,
        enableSelectOption: [
          {
            value: '1',
            label: '启用',
          },
          {
            value: '2',
            label: '停用',
          },
        ],
      }
    },
    computed: {
      translate() {
        return translate
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {
      this.listVrsNavConfig()
    },
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      editRow(isEdit, row) {
        if (isEdit) {
          this.dialogTitle = translate('编辑')
        } else {
          this.dialogTitle = translate('新增')
        }
        if (row) {
          this.vrsNavForm.id = row.id
          this.vrsNavForm.name = row.name
          this.vrsNavForm.detail = row.detail
        } else {
          this.vrsNavForm.id = ''
          this.vrsNavForm.name = ''
          this.vrsNavForm.detail = ''
        }
        this.dialogVis = !this.dialogVis
      },
      /**
       * 获取配置列表
       */
      async listVrsNavConfig() {
        const res = await vrsNavApi.listVrsNavConfig({})
        if (res.code === 0) {
          this.tableData = res.data
          // console.log('res::', res)
        }
      },

      /**编辑和新增的提交  */
      vrsNavFormSubmit() {
        const param = {
          id: this.vrsNavForm.id,
          name: this.vrsNavForm.name,
          detail: this.vrsNavForm.detail,
        }
        if (!param.id) {
          delete param.id
        }
        vrsNavApi.saveNavConfig(param).then(() => {
          this.listVrsNavConfig()
          this.dialogVis = false
        })
      },

      handleEditConfig(row) {
        this.editDetailObj = {
          id: row.id,
          name: row.name,
          detail: row.detail ? row.detail : [],
        }
        this.isEditConfig = true
      },

      returnTable() {
        this.listVrsNavConfig()
        this.isEditConfig = false
      },

      enableNavConfig(row) {
        const param = {
          id: row.id,
        }
        vrsNavApi.enableNavConfig(param).then(() => {
          this.listVrsNavConfig()
        })
      },

      deleteNavConfig(row) {
        const param = {
          ids: [row.id],
        }
        vrsNavApi.deleteNavConfig(param).then(() => {
          this.listVrsNavConfig()
        })
      },
    },
  }
</script>
<style scoped lang="scss">
  .vrs-nav-set-box {
    position: relative;
    width: 100%;
    height: 100%;
    .table-box {
      width: 100%;
      height: 100%;
    }
  }
  /* @import url(); 引入css类 */
</style>
