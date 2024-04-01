<template>
  <div style="width: 100%">
    <uploader
      :before-upload="beforeUpload"
      :browse_button="'browse_button'"
      :chunk_size="chunkSize"
      :files-added="filesAdded"
      :filters="{
        prevent_duplicates: true,
        mime_types: [{ extensions: 'zip' }],
      }"
      :upload-complete="UploadComplete"
      :url="apiUrl"
      @input-uploader="inputUploader"
    />
    <!-- @files-added="filesAdded" -->
    <el-button id="browse_button" :disabled="uploadingDisaled" type="primary">
      {{ translate('选择文件') }}
    </el-button>
    <br />
    <!-- {{ bigFileMsg }} -->
    <el-row v-for="item in tableData" :key="item.id">
      <el-col :span="6">
        {{ translate('文件名称') }}:
        {{ item.name }}
        <el-link
          :disabled="uploadingDisaled"
          icon="el-icon-delete"
          type="danger"
          @click="deleteFile(item.id)"
        />
      </el-col>
      <el-col v-show="isShowPorgress" :span="7">
        <el-progress :percentage="chunkPercentage" style="margin-top: 12px" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import FileMd5 from '@/utils/file-md5.js'
  import Uploader from './Uploader.vue'
  export default {
    name: 'BigFileUpload',
    components: {
      uploader: Uploader,
    },
    // props: ['bigFileMsg', 'uploadingDisaled','apiUrl'],
    props: {
      bigFileMsg: {
        type: Object,
        default: () => ({}),
      },
      uploadingDisaled: Boolean,
      apiUrl: {
        type: String,
        default: '',
      },
      componentName: {
        type: String,
        default: '',
      },
    },
    emits: ['getMsg', 'sendDisaledMsg', 'sendFileMsg'],
    data() {
      return {
        server_url: 'http://192.168.1.198:18080/',
        up: {},
        files: [],
        tableData: [],
        newDataSetForm: this.bigFileMsg, //新增数据集
        currentChunk: 0, //上传片数
        chunks: 0, //上传总分片数
        chunkPercentage: 0, //分片总长度
        isShowPorgress: true, //是否展示切片进度条
      }
    },
    computed: {
      chunkSize() {
        return (1024 * 1024 * 30).toString()
      },
      translate() {
        return translate
      },
    },
    watch: {
      files: {
        handler() {
          if (this.tableData.length > 1) {
            return this.$message.error(translate('只能上传一个压缩包'))
          }
          this.files.forEach((e) => {
            this.tableData = []
            this.tableData.push({
              name: e.name,
              size: e.size,
              status: e.status,
              id: e.id,
              percent: e.percent,
            })
          })
          this.sendMsg()
        },
        deep: true,
      },
      tableData(newVal) {
        this.tableData = newVal
        this.sendMsg()
      },
    },
    methods: {
      handleUpload() {
        // console.log(this.up);
        // debugger;
        this.up.start()
      },
      sendMsg() {
        this.$emit('getMsg', this.tableData)
      },
      inputUploader(up) {
        // this.tableData = []
        // this.files = []
        this.up = up
      },
      filesAdded(up, files) {
        if (this.files.length > 1) {
          this.files.splice(0, 1)
        }

        this.files = files
        files.forEach((f) => {
          f.status = -1
          FileMd5(
            f.getNative(),
            (e, md5) => {
              f['md5'] = md5
              f.status = 1
              console.log('md5------', f['md5'])
            },
            this.chunkSize,
            (currentChunk, chunks) => {
              this.isShowPorgress = true
              this.$emit('sendDisaledMsg', true) //分片时所有按钮禁止
              // 分片上传时操作
              this.currentChunk = currentChunk
              this.chunks = chunks
              this.chunkPercentage = Math.ceil(
                (this.currentChunk / this.chunks) * 100
              )
              if (this.chunkPercentage === 100) {
                setTimeout(() => {
                  this.isShowPorgress = false
                  this.$emit('sendDisaledMsg', false)
                  this.$emit('sendFileMsg', { file: f, chunks: chunks })
                }, 1000)
              }
            }
          )
        })
      },
      deleteFile(id) {
        const file = this.up.getFile(id)
        this.up.removeFile(file)
        // this.sendMsg()
        this.tableData = this.tableData.filter((item) => {
          if (item.id !== id) {
            return item
          }
        })
      },
      beforeUpload(up, file) {
        if (this.componentName === 'version') {
          up.setOption('multipart_params', {
            size: file.size,
            md5: file.md5,
            id: this.newDataSetForm.id,
          })
        } else if (this.componentName === 'solution') {
          up.setOption('multipart_params', {
            size: file.size,
            md5: file.md5,
            ...this.newDataSetForm,
          })
        } else {
          up.setOption('multipart_params', {
            size: file.size,
            md5: file.md5,
            dataSetCode: this.newDataSetForm.dataSetCode,
            joinDataSetType: this.newDataSetForm.joinDataSetType,
            labelType: this.newDataSetForm.labelType,
            keepAllLabel: this.newDataSetForm.keepAllLabel,
            labelName: this.newDataSetForm.labelName[1],
          })
        }

        // console.log('beforeUpload', up)
      },
      UploadComplete(up, file) {
        console.log('up::', up)
        console.log('file::', file)
        this.tableData[0].percent = 100
        this.$emit('getMsg', this.tableData)
      },
    },
  }
</script>

<style scoped></style>
