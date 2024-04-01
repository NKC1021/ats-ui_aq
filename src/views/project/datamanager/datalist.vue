<!--  -->
<template>
  <div class="dataset-data-tool-container" style="position: relative">
    <el-row>
      <el-col class="head-btns" :span="12">
        <el-button icon="Plus" type="primary" @click="addDatalist">
          {{ translate('新增') }}
        </el-button>
        <!-- icon="icon-fl-merge button-icon" -->
        <el-button icon="Notebook" type="danger" @click="mergeDatalist">
          {{ translate('合并') }}
        </el-button>
      </el-col>
    </el-row>
    <div class="table-content">
      <el-table :data="tableData" height="100%">
        <el-table-column :label="translate('数据集名称')" prop="name" />
        <el-table-column :label="translate('数据量')" prop="dataSize" />
        <el-table-column :label="translate('状态')" prop="status">
          <template #default="scope">
            <el-tooltip
              :content="scope.row.errorMsg"
              :disabled="scope.row.status !== 30"
              effect="dark"
              placement="top"
            >
              <div v-if="scope.row.status === 11">
                <el-progress
                  :percentage="scope.row.progress"
                  :stroke-width="16"
                  text-inside
                />
              </div>
              <div v-else>{{ statusObj[`${scope.row.status}`] }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="translate('导入方式')" prop="importType">
          <template #default="scope">
            {{ importTypeObj[`${scope.row.importType}`] }}
          </template>
        </el-table-column>
        <el-table-column
          :formatter="timeFormatter"
          :label="translate('更新时间')"
          prop="updateTime"
        />
        <el-table-column :label="translate('备注')" prop="remark" />
        <el-table-column :label="translate('操作')" min-width="120px">
          <template #default="scope">
            <el-button
              :disabled="scope.row.status === 11"
              icon="FolderAdd"
              link
              type="primary"
              @click="addImgByFile(scope.row)"
            >
              {{ translate('添加') }}
            </el-button>
            <el-button
              icon="View"
              link
              type="primary"
              @click="checkDatalist(scope.row)"
            >
              {{ translate('查看') }}
            </el-button>
            <el-button
              icon="EditPen"
              link
              type="primary"
              @click="editDatalist(scope.row)"
            >
              {{ translate('编辑') }}
            </el-button>
            <el-popconfirm
              :hide-after="100"
              :title="translate('是否删除数据')"
              @cancel="scope.row.visible = false"
              @confirm="deleteDataSet(scope.row)"
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
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="translate('暂无数据')" />
        </template>
      </el-table>
    </div>
    <!-- 新增编辑 -->
    <crudDialog
      v-model:current-row="currentRow"
      v-model:dialog-type="dialogType"
      v-model:show="dialogVis"
      :datalist="tableData"
      @get-datalist="listDataSet"
    />
    <!-- 合并数据集 -->
    <mergeDialog
      v-model:show="mergeVis"
      :datalist="tableData"
      @get-datalist="listDataSet"
    />
    <!-- 新增图片 -->
    <!-- v-if="showImgVis" -->

    <addImg
      v-if="showImgVis"
      v-model:current-row="currentRow"
      v-model:show="showImgVis"
      :all-data-list="tableData"
      :criteria-data="criteriaData"
      @refresh-data-list="listDataSet"
    />
  </div>
</template>

<script>
  import solutionApi from '@/api/solution'
  import solutionDatalist from '@/api/solutionDataSet'
  import { translate } from '@/i18n'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
  import { getStore, setStore } from '@/utils/storage'
  import addImg from '@/views/components/project/datalist/addImg.vue'
  import crudDialog from '@/views/components/project/datalist/crudDialog.vue'
  import mergeDialog from '@/views/components/project/datalist/mergeDialog.vue'

  export default {
    components: { crudDialog, mergeDialog, addImg },
    data() {
      return {
        tableData: [],
        dialogVis: false,
        dialogType: 'add', //add edit
        currentRow: {},
        mergeVis: false,
        importTypeObj: {
          10: translate('压缩包导入'),
          11: translate('文件导入'),
          20: translate('监控任务'),
          21: translate('远端导入'),
        },
        statusObj: {
          10: translate('导入中'),
          20: translate('完成'),
          30: translate('失败'),
        },
        showImgVis: false,
        dataSetMap: {},
        criteriaData: {},
      }
    },
    computed: {
      ...mapStores(recordProInfo),
      // websocket
      socketMsg() {
        return this.projectStore.socketMsg
        // return this.$store.getters.socketMsg
      },
      translate() {
        return translate
      },
    },
    watch: {
      socketMsg(newVal) {
        const refreshKeys = ['message.date_set.upload_status_change']
        if (refreshKeys.includes(newVal.key)) {
          this.listDataSet()
        }
        // console.log('dtatatata:::', newVal)
        if (newVal.key === 'message.date_set.upload_progress_update') {
          const _map = getStore({ name: 'dataSetProgressMap' })
          _map && (this.dataSetMap = _map)
          const _dataSetInfo = JSON.parse(newVal.data)
          const _keys = _dataSetInfo.key?.split('_')
          const datasetId = _keys?.length && _keys[1]
          if (this.dataSetMap[datasetId]) {
            let _progress = Math.floor(_dataSetInfo.progress * 100)
            const _progressCurrent = this.dataSetMap[datasetId]
            _progress =
              _progress > _progressCurrent ? _progress : _progressCurrent
            this.dataSetMap[datasetId] = _progress
          } else {
            this.dataSetMap[datasetId] = Math.floor(_dataSetInfo.progress * 100)
          }

          setStore({
            name: 'dataSetProgressMap',
            content: this.dataSetMap,
            type: 'session',
          })
          this.addDataSetProgress()
        }
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {
      this.listDataSet()
      this.getCriteriaMapping()
    },
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      timeFormatter(row) {
        return new Date(row.updateTime).toLocaleString()
      },
      /**
       *
       */
      async getCriteriaMapping() {
        const res = await solutionApi.getCriteriaMapping({})
        if (res.code === 0) {
          this.criteriaData = res.data ? { ...res.data } : {}
        }
      },
      async listDataSet() {
        const res = await solutionDatalist.listDataSet()
        if (res.code === 0) {
          this.tableData = res.data
          this.tableData.forEach((el) => {
            el.progress === 0
          })
          this.addDataSetProgress()
          this.removeProgressById()
        }
      },
      /**
       * 给数据集添加进度
       */
      addDataSetProgress() {
        const _map = getStore({ name: 'dataSetProgressMap' })
        if (_map && JSON.stringify(_map) !== '{}') {
          this.tableData.forEach((el) => {
            if (_map[`${el.id}`]) {
              el['progress'] = this.dataSetMap[el.id]
            }
          })
        }
      },
      /**
       * 去掉数据完成状态的Map进度
       */
      removeProgressById() {
        this.tableData.forEach((el) => {
          if (el.status === 11) {
            this.dataSetMap[el.id] && delete this.dataSetMap[el.id]
          }
        })
      },
      /**
       * 新增数据集
       */
      addDatalist() {
        this.dialogVis = true
      },
      /**
       * 合并数据集
       */
      mergeDatalist() {
        this.mergeVis = true
      },
      /**
       * 编辑数据集
       */
      editDatalist(rowInfo) {
        this.dialogType = 'edit'
        this.currentRow = { ...rowInfo }
        this.$nextTick(() => {
          this.dialogVis = true
        })
      },
      /**
       * 查看数据集
       */
      checkDatalist(rowInfo) {
        const _query = {
          dataSetIds: rowInfo.id,
        }
        this.projectStore.datasetToClean = _query
        this.$router.push({
          name: 'clean',
        })
        // this.$router.push({
        //   path: '/project/datamanager/clean',
        //   query: _query,
        // })
      },
      /**
       * 删除数据集
       */
      async deleteDataSet(rowInfo) {
        const query = {
          ids: [],
        }
        query.ids = [rowInfo.id]
        const res = await solutionDatalist.deleteDataSet(query)
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.listDataSet()
        }
      },
      /**
       * 添加图片
       */
      addImgByFile(rowInfo) {
        this.showImgVis = true
        this.currentRow = { ...rowInfo }
      },
    },
  }
</script>
<style scoped lang="scss">
  .head-btns {
    padding-bottom: 4px;
  }
  .table-content {
    height: calc(100% - 36px);
  }
  .tip-content {
    text-align: center;
    margin: 3px 0;
  }
  .tip-button {
    text-align: center;
    margin: 0;
  }
</style>
