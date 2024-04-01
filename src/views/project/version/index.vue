<template>
  <div class="version-data-tool-container">
    <el-row class="head-nav">
      <el-col :span="8">
        <el-tag size="large">
          {{ translate('启用版本') }}:{{ usedVersionInfo.num }}
        </el-tag>
      </el-col>
      <el-col class="header-contenr" :span="16">
        <el-input
          v-model="hashVal"
          :placeholder="translate('请输入版本编码')"
        />
        <el-input
          v-model="searchVal"
          :placeholder="translate('输入数据版本或输入备注')"
        />
        <el-select v-model="version">
          <el-option :label="translate('全部')" value="2" />
          <el-option :label="translate('启用')" value="1" />
          <el-option :label="translate('未启用')" value="0" />
        </el-select>
        <el-button icon="Refresh" type="primary" @click="listAllVersion">
          {{ translate('刷新') }}
        </el-button>
        <el-tooltip
          :content="translate('请先保存版本')"
          :disabled="usedVersionInfo.num ? true : false"
          effect="dark"
          placement="top"
        >
          <el-button
            :disabled="!usedVersionInfo.num"
            el-button
            type="primary"
            @click="importVersion"
          >
            {{ translate('导入版本') }}
          </el-button>
        </el-tooltip>
        <el-button type="primary" @click="saveVersionDiaVis = true">
          {{ translate('保存版本') }}
        </el-button>
        <el-button type="warning" @click="clearVersion(usedVersionInfo)">
          {{ translate('清除修改') }}
        </el-button>
        <el-button icon="Delete" type="danger" @click="deleteVersions">
          {{ translate('删除') }}
        </el-button>
        <el-tooltip
          class="item"
          :content="translate('提示文字')"
          effect="dark"
          placement="bottom"
        >
          <template #content>
            {{ translate('1.数据集维度:') }}
            <br />
            &nbsp;&nbsp;&nbsp;{{ translate('a.新增了一个数据集') }}
            <br />
            &nbsp;&nbsp;&nbsp;{{ translate('b.删除了一个数据集') }}
            <br />
            &nbsp;&nbsp;&nbsp;{{ translate('c.更改了数据集备注') }}
            <br />
            &nbsp;&nbsp;&nbsp;{{ translate('d.合并了两个或多个数据集') }}
            <br />
            &nbsp;&nbsp;&nbsp;{{ translate('e.拆分了数据集') }}
            <br />
            {{ translate('2.单数据集维度:') }}
            <br />
            &nbsp;&nbsp;&nbsp;{{
              translate(
                'a.数据类别标注变更：工程标签数据中心标签/客户标签， 均可能变更'
              )
            }}
            <br />
            &nbsp;&nbsp;&nbsp;{{ translate('b.数据的ROI变更') }}
            <br />
            &nbsp;&nbsp;&nbsp;{{
              translate('c.数据所属集合变更：训练集/测试集/无关集')
            }}
            <br />
            &nbsp;&nbsp;&nbsp;{{
              translate('d.部分数据删除（当前没有新增功能，所以新增不用考虑')
            }}
            <br />
            {{ translate('3.标签管理页面:') }}
            <br />
            &nbsp;&nbsp;&nbsp;{{ translate('a.删除了部分标签') }}
            <br />
            &nbsp;&nbsp;&nbsp;{{ translate('b.新增部分标签') }}
            <br />
            &nbsp;&nbsp;&nbsp;{{ translate('c,标签的前后顺序调整') }}
            <br />
            &nbsp;&nbsp;&nbsp;{{ translate('d.标签的对应关系变更') }}
            <br />
            {{
              translate(
                '4.用户设置不在版本管理范围内（如启用标签设置、快建键设置、测量工具颜色等）'
              )
            }}
            <br />
            {{
              translate('5.模型训练、测试所产生的数据，不在变更考虑范围内。')
            }}
          </template>
          <el-icon><QuestionFilled /></el-icon>
        </el-tooltip>
      </el-col>
    </el-row>
    <div class="version-content">
      <el-table
        ref="versionRef"
        :data="versionData"
        height="100%"
        :row-style="versionRowStyle"
        stripe
        @selection-change="selectedVersionChange"
      >
        <el-table-column
          :selectable="checkBoxT"
          type="selection"
          width="50px"
        />
        <el-table-column
          :label="translate('数据版本')"
          prop="num"
          width="100px"
        >
          <template #default="scope">
            <el-tooltip
              :content="translate('图片数量') + '：' + scope.row.imgCount"
              placement="top"
            >
              <el-tag>{{ scope.row.num }}</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          :label="translate('父版本')"
          prop="parentNum"
          width="80px"
        >
          <template #default="scope">
            <el-tag>V{{ scope.row.parentNum }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="translate('状态')"
          prop="uploadStatus"
          width="150px"
        >
          <template #default="scope">
            <div>
              <div v-show="[0, 1].includes(scope.row.uploadStatus)">
                <el-progress
                  :percentage="scope.row.progress"
                  :stroke-width="14"
                  :text-inside="true"
                />
              </div>
              <div v-show="scope.row.uploadStatus === 2">
                {{ translate('可用') }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="translate('创建用户')" prop="createBy" />
        <el-table-column :label="translate('创建方式')" prop="createType">
          <template #default="scope">
            {{ createTypeObj[`${scope.row.createType}`] }}
          </template>
        </el-table-column>
        <el-table-column
          :formatter="timeFormatter"
          :label="translate('创建时间')"
          prop="createTime"
        />
        <el-table-column :label="translate('版本编码')" prop="hash">
          <template #default="scope">
            <el-tooltip :content="scope.row.hash" placement="top">
              <span>
                {{
                  scope.row.hash ? scope.row.hash.substring(0, 10) + '...' : ''
                }}
              </span>
            </el-tooltip>
            <el-button
              v-show="scope.row.hash"
              link
              type="primary"
              @click="copyHash(scope.row.hash)"
            >
              {{ translate('复制') }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column :label="translate('备注')" prop="remark" />
        <el-table-column :label="translate('操作')" min-width="160px">
          <template #default="scope">
            <el-button
              icon="Download"
              link
              type="primary"
              @click="downLoadVersion(scope.row)"
            >
              {{ translate('版本标识') }}
            </el-button>
            <el-button
              icon="Download"
              link
              type="primary"
              @click="exportVersion(scope.row)"
            >
              {{ translate('版本') }}
            </el-button>
            <el-button
              v-if="scope.row.enable !== 1"
              :disabled="[0, 1].includes(scope.row.uploadStatus)"
              link
              type="primary"
              @click="usedVersion(scope.row)"
            >
              {{ translate('启用版本') }}
            </el-button>
            <el-popconfirm
              :hide-after="100"
              :title="translate('是否删除数据')"
              @cancel="scope.row.visible = false"
              @confirm="deleteVersion(scope.row)"
            >
              <template #reference>
                <el-button
                  v-show="scope.row.enable !== 1"
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
    <!-- 保存版本 -->
    <el-dialog
      v-model="saveVersionDiaVis"
      :before-close="saveVersionDiaClosed"
      :close-on-click-modal="false"
      :show-close="false"
      :title="translate('版本数据保存')"
      width="600px"
    >
      <el-form ref="versionFormRef" label-width="120px" :model="versionForm">
        <el-form-item :label="translate('当前启用版本')">
          <div v-if="versionData.length === 0">
            <el-tag type="warning">{{ translate('无') }}</el-tag>
          </div>
          <div v-else>
            <el-tag>{{ usedVersionInfo.num }}</el-tag>
          </div>
        </el-form-item>
        <el-form-item :label="translate('备注')" prop="remark">
          <el-input v-model="versionForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="commitVersionFile">
          {{ translate('确定') }}
        </el-button>
        <el-button @click="saveVersionDiaClosed">
          {{ translate('取消') }}
        </el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="showImportBox"
      :close-on-click-modal="false"
      :show-close="false"
      :title="translate('导入版本')"
      width="600px"
    >
      <BigFileUpload
        v-if="showImportBox"
        :key="stamp"
        ref="child"
        :api-url="'/api/base/v2/solutionVersion/uploadVersionAll'"
        :big-file-msg="newDataSetForm"
        :component-name="'version'"
        :uploading-disaled="uploadingDisaled"
        @get-msg="getMsg"
        @send-disaled-msg="sendDisaledMsg"
        @send-file-msg="getFileMsg"
      />
      <template #footer>
        <el-button
          :disabled="uploadingDisaled"
          type="primary"
          @click="saveImport(1)"
        >
          {{ translate('确定') }}
        </el-button>
        <el-button type="" @click="saveImport(0)">
          {{ translate('取消') }}
        </el-button>
      </template>
    </el-dialog>
    <!-- 导出版本 -->
    <el-dialog
      v-model="showExportBox"
      :close-on-click-modal="false"
      :show-close="false"
      :title="translate('导出版本')"
      width="600px"
    >
      <el-form label-width="120">
        <el-form-item :label="translate('导出模式')">
          <el-radio-group v-model="exportType">
            <el-radio :label="0">{{ translate('全量导出') }}</el-radio>
            <el-radio :label="1">{{ translate('增量导出') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="exportType == 1" :label="translate('上传hash文件')">
          <el-upload
            ref="uploadRef"
            action="#"
            :auto-upload="false"
            :file-list="fileList"
            :limit="1"
            :on-change="handleHash"
          >
            <el-button type="primary">
              {{ translate('选择文件') }}
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="confirmExport">
          {{ translate('确定') }}
        </el-button>
        <el-button type="" @click="cancelExport">
          {{ translate('取消') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import useClipboard from 'vue-clipboard3'
  import versionManageController from '@/api/versionController'
  import BigFileUpload from '@/views/components/upload/BigFileUpload.vue'
  import { translate } from '@/i18n'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
  export default {
    components: { BigFileUpload },
    data() {
      return {
        stamp: '',
        exportType: 1,
        showExportBox: false,
        showImportBox: false,
        uploadingDisaled: false, //上传时
        fileInfo: {},
        isZipList: [],
        uploadAqimgpercentage: 0,
        newDataSetForm: {
          //文件上传
          id: '',
        },
        versionForm: {
          remark: '',
        },
        saveVersionDiaVis: false,
        version: '2',
        // versionData: [1, 2, 3, 4, 6, 7, 8, 9, 10],
        selectedVersionData: [], //勾选中的版本
        usedVersionInfo: {}, //记录当前启用版本信息
        versionList: [],
        searchType: 0,
        searchVal: '', //版本或数据版本模糊搜索
        hashVal: '',
        rowInfo: {},
        hashFile: {
          name: '',
        },
        fileList: [],
        progressMap: {},
        createTypeObj: {
          1: translate('保存'),
          2: translate('推送'),
          3: translate('拉取'),
          4: translate('导入'),
        },
      }
    },
    computed: {
      ...mapStores(recordProInfo),
      socketMsg() {
        return this.projectStore.socketMsg
      },
      translate() {
        return translate
      },
      versionData() {
        let arr = [...this.versionList]
        if (this.version === '1') {
          arr = arr.filter((el) => {
            return el.enable === 1
          })
        }
        if (this.version === '0') {
          arr = arr.filter((el) => {
            return el.enable === 0
          })
        }
        if (this.searchVal) {
          arr = this.$pinyinSearch.matchPinyin(arr, this.searchVal, [
            'num',
            'remark',
          ])
        }
        if (this.hashVal) {
          arr = this.$pinyinSearch.matchPinyin(arr, this.hashVal, ['hash'])
        }
        return arr
      },
    },
    watch: {
      socketMsg(newVal) {
        const updateObj = newVal
        if (updateObj.key === 'message.solution_version.progress_update') {
          const taskInfo = JSON.parse(newVal.data)
          if (this.progressMap[taskInfo.key]) {
            const _progress = this.progressMap[taskInfo.key]
            let newProgress = Math.floor(100 * taskInfo.progress)
            newProgress = newProgress > _progress ? newProgress : _progress
            this.progressMap[taskInfo.key] = newProgress
          } else {
            this.progressMap[taskInfo.key] = Math.floor(100 * taskInfo.progress)
          }
          this.addProgress()
        }
        if (updateObj.key === 'message.solution_version.upload_status_change') {
          this.listAllVersion()
        }
      },
    },
    created() {
      this.listAllVersion()
    },
    mounted() {},
    methods: {
      async copyHash(hashVal) {
        const { toClipboard } = useClipboard()
        await toClipboard(hashVal)
      },
      /**
       * 时间转换器
       */
      timeFormatter(row) {
        return new Date(row.createTime).toLocaleString()
      },
      versionRowStyle({ rowIndex }) {
        if (rowIndex === 0) {
          const obj = {}
          obj.backgroundColor = '#e8e9eb'
          return obj
        } else {
          return ''
        }
      },
      saveVersionDiaClosed() {
        this.$refs.versionFormRef.resetFields()
        this.saveVersionDiaVis = false
      },
      /**
       * 复选框多选
       * @params
       */
      selectedVersionChange(selectedVers) {
        console.log(selectedVers)
        this.selectedVersionData = selectedVers
      },
      /**
       * 启用版本
       */
      usedVersion(rowInfo) {
        this.$confirm(translate('是否启用当前版本'), translate('提示'), {
          type: 'warning',
        })
          .then(async () => {
            const loading = this.$loading({
              lock: true,
              text: translate('请稍等'),
              background: 'rgba(0, 0, 0, 0.7)',
            })
            const query = {
              id: rowInfo.id,
            }
            const res = await versionManageController.resetVersion(query)
            loading.close()
            if (res.code === 0) {
              this.$message.success(res.msg)
              await this.listAllVersion()
            }
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: translate('取消'),
            })
          })
      },

      /**
       * @desc 清除修改
       */
      async clearVersion(rowInfo) {
        let msg = ''
        if (this.versionList.length === 0) {
          return this.$message.error(translate('未保存版本,无法清除修改'))
        }
        msg = translate('清除修改')
        this.$confirm(msg, translate('提示'), {
          type: 'warning',
        })
          .then(async () => {
            const loading = this.$loading({
              lock: true,
              text: translate('请稍等'),
              background: 'rgba(0, 0, 0, 0.7)',
            })
            const query = {
              id: rowInfo.id,
            }
            const res = await versionManageController.resetVersion(query)
            loading.close()
            if (res.code === 0) {
              this.$message.success(res.msg)
              this.listAllVersion()
            }
          })
          .catch(() => {})
      },

      /**
       *@desc 删除版本
       */
      async deleteVersion(rowInfo) {
        const query = {
          ids: [],
        }
        query.ids.push(rowInfo.id)
        const res = await versionManageController.deleteVersion(query)
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.listAllVersion()
        }
      },
      /**
       * 删除多个版本
       */
      deleteVersions() {
        if (this.selectedVersionData.length === 0) {
          return this.$message.error(translate('请勾选数据'))
        }
        this.$confirm(translate('是否删除数据'), translate('提示'), {
          type: 'warning',
        })
          .then(async () => {
            const query = {
              ids: [],
            }
            this.selectedVersionData.forEach((el) => {
              query.ids.push(el.id)
            })
            const res = await versionManageController.deleteVersion(query)

            if (res.code === 0) {
              this.$message.success(res.msg)
              this.listAllVersion()
            }
          })
          .catch(() => {})
      },
      /**
       * @desc 获取所有版本
       */
      async listAllVersion() {
        const res = await versionManageController.listVersion({})
        if (res.code === 0 && res.data.length) {
          this.versionList = [...res.data]
          this.versionList.forEach((el) => {
            el.num = `V${el.num}`
            el.enable === 1 && (this.usedVersionInfo = { ...el })
            el.progress = 0
          })
          this.addProgress()
        } else {
          this.versionList = []
        }
      },
      /**
       * 增加进度字段
       */
      addProgress() {
        this.versionList.forEach((el) => {
          el.progress = this.progressMap[el?.id]
        })
      },
      // 导入版本上传文件组件
      getFileMsg(data) {
        this.fileInfo = { ...data }
      },
      getMsg(data) {
        if (data.length) {
          this.uploadAqimgpercentage = Math.floor(data[0].percent)
        }
        this.isZipList = data
      },
      sendDisaledMsg(data) {
        this.uploadingDisaled = data
      },
      // 导入版本
      importVersion() {
        this.showImportBox = true
      },
      // 第一次上传-1批次
      async handleFirstImport() {
        const fd = new FormData()
        fd.append('chunk', -1)
        const res = await versionManageController.uploadVersionAll(fd)
        if (res.code === 0) {
          this.newDataSetForm.id = res.data.value
        }
        return res
      },
      // 导入版本确定
      async saveImport(type) {
        if (type == 0) {
          // this.stamp = new Date().getTime();
          this.showImportBox = false
          return
        }
        if (this.isZipList.length == 0) {
          return this.$message.error(translate('请上传压缩包'))
        }
        const res = await this.handleFirstImport()
        if (res.code !== 0) return
        // 调用子组件文件上传
        this.$refs.child.handleUpload()
        // 上传后清空上传列表
        this.isZipList = []
        await this.listAllVersion()
        this.showImportBox = false
      },
      // 导出版本
      exportVersion(row) {
        this.cancelExport() //导出之前先清空弹框
        this.showExportBox = true
        this.rowInfo = row
      },
      // 取消导出版本
      cancelExport() {
        this.showExportBox = false
        this.fileList = []
        this.exportType = this.$options.data().exportType
        this.hashFile = this.$options.data().hashFile
      },
      //, 导出版本
      async confirmExport() {
        // const data = {
        //   id: Number(this.rowInfo.id),
        //   hashFile: this.hashFile,
        // }

        const fd = new FormData()
        fd.append('versionId', Number(this.rowInfo.id))
        if (this.exportType == 1) {
          if (!this.hashFile.name) {
            this.$message.error(translate('请上传hash文件'))
            return
          }
          fd.append('hashFile', this.hashFile.raw)
        }
        this.showExportBox = false
        const res = await versionManageController.downloadVersionAll(fd)
        this.handleFileBlob(res)
      },
      // 下载版本标识
      async downLoadVersion(row) {
        const query = {
          id: row.id,
        }
        const res = await versionManageController.downloadVersionHash(query)
        if (res) {
          this.handleFileBlob(res)
        }
      },
      // 处理下载文件
      handleFileBlob(res) {
        // console.log('resresres:::::', res)
        const _this = this
        if (res.data?.type == 'application/octet-stream') {
          const content = res.data
          const blob = new Blob([content])
          let fileName = res.headers['content-disposition'].split('=')
          fileName = fileName?.length && fileName[1]
          fileName = decodeURI(fileName)
          if ('download' in document.createElement('a')) {
            // 非IE下载
            const elink = document.createElement('a')
            elink.download = fileName
            const url = URL.createObjectURL(blob)
            elink.href = url
            // document.body.appendChild(elink)
            elink.click()
            URL.revokeObjectURL(url)
          } else {
            // IE10+下载
            // navigator.msSaveBlob(blob, fileName)
            navigator.msSaveBlob(blob, 'xx')
          }
        } else {
          // type是application/josn
          // 返回失败的时候也会以文件流的形式下载到本地，但是是一个损坏的文件
          const reader = new FileReader()
          reader.onload = function () {
            const message = JSON.parse(reader.result).message
            _this.$message.error(message) // 将错误信息显示出来
          }
          reader.readAsText(res.data)
        }
      },
      // 增量导出上传hash文件
      handleHash(file, fileList) {
        console.log('file', file)
        this.fileList = fileList
        this.hashFile = file
      },
      /**
       * @desc 校验版本号最多为100个
       */
      validateVersionNum() {
        if (this.versionList.length >= 100) {
          this.$message.warning(this.$t('i18_version_size_max'))
        } else {
          this.saveVersionDiaVis = true
        }
      },
      /**
       * @desc 版本提交
       */
      async commitVersionFile() {
        const loading = this.$loading({
          lock: true,
          text: translate('请稍等'),
          background: 'rgba(0, 0, 0, 0.7)',
        })
        const query = {
          remark: this.versionForm.remark,
        }
        const res = await versionManageController.commitVersion(query)
        loading.close()
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.saveVersionDiaClosed()
          this.listAllVersion()
        }
      },
      /**
       * @DESC 启用版本不可以勾选 0:不启用 1:启用
       */
      checkBoxT(row) {
        if (row.enable === 0) {
          return true
        } else {
          return false
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  .head-nav {
    padding-bottom: 4px;

    .header-contenr {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .el-input {
        width: 210px;
        margin-right: 5px;
      }
      .el-select {
        margin-right: 5px;
      }
      i {
        margin: 0 5px;
      }
      .el-radio-group {
        margin-right: 5px;
      }
    }
  }
  .version-content {
    width: 100%;
    height: calc(100% - 36px);
    overflow: auto;
    .el-table {
      height: 100%;
      // border: 1px solid #ebeef5;
      border-bottom: none;
    }
  }

  .btn {
    margin: 10px 0;
    text-align: right;
  }
</style>
