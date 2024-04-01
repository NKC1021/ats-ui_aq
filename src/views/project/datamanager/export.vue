<template>
  <div class="export-data-tool-container">
    <header>
      <el-row>
        <el-col :span="12">
          <el-button icon="Plus" type="primary" @click="diallogVis = true">
            {{ translate('新增') }}
          </el-button>
          <el-button icon="Delete" type="danger" @click="delMore">
            {{ translate('删除') }}
          </el-button>
        </el-col>
      </el-row>
    </header>
    <main>
      <el-table
        :data="tableData"
        height="100%"
        @selection-change="selectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column :label="translate('导出条件名称')" prop="name" />
        <el-table-column label="状态" prop="status">
          <template #default="scope">
            <!-- 运行中 -->
            <div v-if="scope.row.status === 1">
              <el-row>
                <el-col :span="18">
                  <el-progress
                    :percentage="scope.row.progress"
                    :stroke-width="20"
                    style="line-height: 23px"
                    :text-inside="true"
                  />
                </el-col>
              </el-row>
            </div>
            <span v-else>{{ imgExportEnum[`${scope.row.status}`] }}</span>
            <el-tooltip
              :content="scope.row.errorMsg"
              :disabled="scope.row.errorMsg"
              effect="dark"
              placement="top"
            >
              <span v-show="scope.row.errorMsg">
                <el-icon style="font-size: 16px"><WarningFilled /></el-icon>
                <!-- <i class="el-icon-warning" style="font-size: 16px"></i> -->
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="translate('图片数量')" prop="picNum" />
        <el-table-column :label="translate('图片类型')" prop="imgType" />
        <!--        <el-table-column :label="translate('工厂名称')" prop="factoryName" />-->
        <!--        <el-table-column :label="translate('线体名称')" prop="lineName" />-->
        <!--        <el-table-column :label="translate('设备名称')" prop="machineName" />-->
        <!--        <el-table-column :label="translate('工位名称')" prop="station" />-->
        <!--        <el-table-column :label="translate('相机编号')" prop="cameraCode" />-->
        <!--        <el-table-column :label="translate('采图点位')" prop="point" />-->
        <!--        <el-table-column :label="translate('光照ID')" prop="opticsType" />-->
        <!--        <el-table-column-->
        <!--          :label="translate('模型名称')"-->
        <!--          prop="sourceModelName"-->
        <!--        />-->
        <el-table-column :label="translate('图片效果')" prop="labelOption">
          <template #default="scope">
            <span>{{ labelOptionName[`${scope.row.labelOption}`] }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="translate('是否渲染')" prop="isRender">
          <template #default="scope">
            <span>
              {{ scope.row.isRender ? translate('是') : translate('否') }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="translate('导出类型')" prop="type">
          <template #default="scope">
            <span>{{ typeName[`${scope.row.type}`] }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="translate('导出路径')" prop="path" />
        <!--        <el-table-column :label="translate('AI工程名')" prop="aiEngin" />-->
        <!--        <el-table-column :label="translate('客户缺陷名')" prop="customDefect" />-->
        <!--        <el-table-column :label="translate('工程缺陷名')" prop="enginDefect" />-->
        <el-table-column
          :label="translate('保留原始文件名')"
          prop="keepOriginName"
        >
          <template #default="scope">
            <span>{{ scope.row.keepOriginName ? '是' : '否' }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="300px">
          <template #default="scope">
            <el-button
              icon="EditPen"
              link
              type="primary"
              @click="editRow(scope.row)"
            >
              {{ translate('编辑') }}
            </el-button>
            <el-popconfirm
              :hide-after="100"
              :title="translate('是否删除数据')"
              @cancel="scope.row.visible = false"
              @confirm="deleteNode(scope.row)"
            >
              <template #reference>
                <el-button
                  icon="Delete"
                  link
                  type="primary"
                  @click="scope.row.visible = false"
                >
                  {{ translate('删除') }}
                </el-button>
              </template>
            </el-popconfirm>
            <el-button
              icon="Download"
              link
              type="primary"
              @click="handleExport(scope.row)"
            >
              {{ translate('导出') }}
            </el-button>
            <el-button
              :disabled="scope.row.status !== 1"
              icon="Close"
              link
              type="primary"
              @click="stopPickImgExport(scope.row)"
            >
              {{ translate('停止') }}
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="translate('暂无数据')" />
        </template>
      </el-table>
    </main>
    <CrudDialog
      v-model:current-row="currentRow"
      v-model:dialogType="dialogType"
      v-model:show="diallogVis"
      :criteria-data="criteriaData"
      @success="getPickPicExport"
    />
    <ExportDialog
      v-if="exportDiaVis"
      v-model:current-row="currentRow"
      v-model:record-dataset="recordSelectDataSet"
      v-model:show="exportDiaVis"
      :all-data-set="allDataSet"
      @success="getPickPicExport"
    />
  </div>
</template>
<script>
  import { translate } from '@/i18n'
  import solutionExport from '@/api/solutionExport'
  import solutionDataSet from '@/api/solutionDataSet'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
  import ExportDialog from '@/views/components/project/export/exportDialog.vue'
  import CrudDialog from '@/views/components/project/export/crudDialog.vue'
  export default {
    components: { CrudDialog, ExportDialog },
    data() {
      return {
        tableData: [],
        criteriaData: {},
        allDataSet: [],
        diallogVis: false,
        exportDiaVis: false,
        dialogType: 'add',
        imgExportEnum: {
          1: '运行中',
          2: '失败',
          3: '完成',
          4: '停止',
        },
        currentRow: {},
        recordSelectDataSet: [],
        selectionList: [],
        progressMap: {},
        typeName: {
          1: translate('导出到指定路径'),
          2: translate('导出到AIDI工程(首个模块)'),
          3: translate('导出到AIDI工程(工厂模式)'),
        },
        labelOptionName: {
          1: translate('原图'),
          2: translate('标注效果图'),
          3: translate('AI效果图'),
        },
      }
    },

    computed: {
      translate() {
        return translate
      },
      ...mapStores(recordProInfo),
      socketMsg() {
        return this.projectStore.getSocketMsg
      },
    },
    watch: {
      socketMsg(newVal) {
        const wCode = newVal.key
        const wData = JSON.parse(newVal.data)
        wCode === 'message.pick_pic_export.status_change' &&
          this.getPickPicExport()

        if (wCode === 'message.pick_pic_export.progress_update') {
          if (this.progressMap[wData.key]) {
            const _progress = this.progressMap[wData.key]
            let newProgress = Math.floor(wData.progress * 100)
            newProgress = newProgress > _progress ? newProgress : _progress
            this.progressMap[wData.key] = newProgress
          } else {
            this.progressMap[wData.key] = Math.floor(wData.progress * 100)
          }
          this.addProgress()
        }
      },
    },
    created() {
      this.getPickPicExport()
      this.getCriteriaData()
      this.listDataSet()
    },
    methods: {
      /**
       * 获取数据集
       */
      async listDataSet() {
        const res = await solutionDataSet.listDataSet()
        if (res.code === 0) {
          this.allDataSet = res.data
        }
      },
      /**
       * 获取选项数据
       */
      async getCriteriaData() {
        const res = await solutionExport.getCriteriaData({})
        if (res.code === 0) {
          this.criteriaData = { ...res.data }
        }
      },
      /**
       * 获取表格数据
       */
      async getPickPicExport() {
        const data = await solutionExport.getPickPicExport({})
        this.tableData = data.data || []
        this.addProgress()
      },
      addProgress() {
        this.tableData.forEach((el) => {
          el.progress = 0
          el.progress = this.progressMap[el.id] ? this.progressMap[el.id] : 0
          if (el.status === 3) {
            delete this.progressMap[el.id]
          }
        })
      },
      /**
       * 删除导出
       */
      async deleteNode(row) {
        const fd = {
          ids: [],
        }
        fd.ids.push(row.id)
        await solutionExport.deletePickPicExport(fd)
        this.getPickPicExport()
      },
      /**
       * editRow
       * 编辑
       */
      editRow(row) {
        if (row.status && row.status === 1) {
          return this.$message.error(translate('请先停止导出'))
        }
        this.dialogType = 'edit'
        this.currentRow = { ...row }
        this.diallogVis = true
      },
      /**
       * 停止
       */
      async stopPickImgExport(row) {
        const params = {
          dataSetIds: this.recordSelectDataSet,
          pickPicExportDO: row,
          type: 2,
        }
        const res = await solutionExport.stopPickImgExport(params)
        if (res.code === 0) {
          this.$message.success('触发停止成功，请稍候')
        }
      },
      /**
       * 导出
       *  */
      handleExport(row) {
        this.exportDiaVis = true
        this.currentRow = row
      },
      /**
       * 获取选择行
       */
      selectionChange(row) {
        this.selectionList = row
      },
      delMore() {
        const query = {
          ids: [],
        }
        query.ids = this.selectionList.map((item) => item.id)
        if (!query.ids.length)
          return this.$message.error(translate('请选择数据'))
        this.$confirm(translate('是否删除数据'), translate('提示'), {
          type: 'warning',
          confirmButtonText: translate('确定'),
          cancelButtonText: translate('取消'),
        }).then(() => {
          solutionExport.deletePickPicExport(query)
          this.selectionList = []
          this.getPickPicExport()
        })
      },
    },
  }
</script>
<style scoped lang="scss">
  header {
    padding-bottom: 5px;
  }
  main {
    height: calc(100% - 37px);
  }
</style>
