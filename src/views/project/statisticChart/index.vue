<!--  -->
<template>
  <div class="statistic-data-tool-container statistic-box">
    <header>
      <el-form inline :model="exportForm">
        <el-form-item :label="translate('日期')" prop="dateTimes">
          <el-date-picker
            v-model="exportForm.dateTimes"
            :default-time="defaultTime"
            :end-placeholder="translate('结束时间')"
            :range-separator="translate('至')"
            :shortcuts="shortcuts"
            :start-placeholder="translate('开始时间')"
            type="datetimerange"
          />
        </el-form-item>
        <el-form-item :label="translate('批号')" prop="batchName">
          <el-select
            v-model="exportForm.batchName"
            allow-create
            clearable
            collapse-tags
            collapse-tags-tooltip
            :filter-method="filterBatchMenthod"
            filterable
            multiple
            style="width: 400px"
          >
            <el-option
              v-for="(el, index) in filterBatchNames"
              :key="index"
              :label="el"
              :value="el"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            :disabled="exportLoading"
            :icon="exportLoading ? 'Loading' : 'Download'"
            type="primary"
            @click="exportPKExcel"
          >
            {{ exportLoading ? translate('导出中') : translate('导出') }}
          </el-button>
        </el-form-item>
      </el-form>
    </header>
    <div v-show="false" class="table-box">
      <el-table height="100%">
        <el-table-column label="S/N" />
        <el-table-column label="颜色" />
        <el-table-column label="SKU" />
        <el-table-column label="检测结果" />
        <el-table-column label="检测时间" />
      </el-table>
    </div>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import vrsService from '@/api/vrsService'
  import exportApi from '@/api/solutionExport'
  import solutionConfig from '@/api/solutionConfig'
  import { shortcutsList } from '@/utils/timeConst'
  export default {
    data() {
      return {
        defaultTime: [
          new Date(2000, 1, 1, 0, 0, 0),
          new Date(2000, 2, 1, 23, 59, 59),
        ],
        exportForm: {
          batchName: [],
          dateTimes: [],
        },
        searchBatchStr: '',
        batchNames: [],
        vrsCutSet: {},
        debounceTimer: null,
        exportLoading: false,
      }
    },
    computed: {
      translate() {
        return translate
      },
      shortcuts() {
        return shortcutsList
      },
      filterBatchNames() {
        if (this.searchBatchStr) {
          return this.$pinyinSearch.matchPinyin(
            this.batchNames,
            this.searchBatchStr,
            'label'
          )
        }
        return this.batchNames
      },
    },
    created() {
      this.getUserProjectConfig()
      this.listCondition()
    },
    mounted() {
      const _week = shortcutsList[1]
      this.exportForm.dateTimes = _week.value()
    },
    methods: {
      filterBatchMenthod(str) {
        this.searchBatchStr = str
      },
      /**
       * 获取配置
       */
      async getUserProjectConfig() {
        const res = await solutionConfig.getUserProjectConfig({})
        if (res.code === 0) {
          //
          const _vrsCutConfig = res.data?.vrsCutConfig
          _vrsCutConfig && (this.vrsCutSet = JSON.parse(_vrsCutConfig))
        }
      },
      /**
       * 获取项目的标签
       */
      async listCondition() {
        const res = await vrsService.listCondition({})
        if (res.code === 0 && res.data) {
          this.batchNames = res.data.batchNames ? res.data.batchNames : []
        }
      },
      /**
       * 导出逻辑
       */
      async exportPKExcel() {
        this.debounceTimer && clearTimeout(this.debounceTimer)
        this.debounceTimer = setTimeout(async () => {
          if (!this.exportForm.batchName.length && !this.exportForm.dateTimes) {
            return this.$msg.error('批号和时间不可以两者为空')
          }
          this.exportLoading = true
          const { cutDefectMinSize, cutDefectImageMultiple } = this.vrsCutSet
          const _query = {
            listCondition: {
              batchName: this.exportForm.batchName,
            },
            cutDefectMinSize: cutDefectMinSize ? cutDefectMinSize : 128,
            cutDefectImageMultiple: cutDefectImageMultiple
              ? cutDefectImageMultiple
              : 1,
          }
          if (this.exportForm.dateTimes?.length) {
            _query.listCondition.detectTimeFrom = this.exportForm.dateTimes[0]
            _query.listCondition.detectTimeTo = this.exportForm.dateTimes[1]
          }
          const res = await exportApi.exportPKExcel(_query)
          this.exportLoading = false
          // console.log('res:::', res)
          if (res.type == 'application/json') return
          const blob = new Blob([res.data], { type: 'application/zip' })
          if ('download' in document.createElement('a')) {
            // 非IE下载
            let fileName = res.headers['content-disposition'].split('=')
            fileName = fileName?.length && fileName[1]
            fileName = decodeURI(fileName)
            const elink = document.createElement('a')
            elink.download = fileName
            elink.href = URL.createObjectURL(blob)
            document.body.appendChild(elink)
            elink.click()
            document.body.removeChild(elink)
          }
        }, 500)
      },
    },
  }
</script>
<style scoped lang="scss">
  .statistic-box {
    display: flex;
    flex-direction: column;
    overflow: auto;

    .table-box {
      flex: 1;
      // background: rgb(252, 226, 231);
      overflow: auto;
    }
    :deep() {
      .el-form-item {
        margin: 0 5px 5px 0;
      }
    }
  }
</style>
