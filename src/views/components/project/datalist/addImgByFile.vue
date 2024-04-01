<template>
  <div class="container">
    <el-form
      ref="newDataSetFormRef"
      label-width="120px"
      :model="addForm"
      :rules="newDataSetFormRules"
    >
      <el-row :gutter="20">
        <el-col :span="7">
          <el-form-item :label="translate('数据集名称')">
            <el-select v-model="addForm.dataSetId" disabled style="width: 100%">
              <el-option
                v-for="(el, idx) in allDataList"
                :key="idx"
                :label="el.name"
                :value="el.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item :label="translate('工位')">
            <el-select
              v-model="addForm.stationName"
              allow-create
              clearable
              :disabled="uploadingDisaled"
              filterable
              style="width: 100%"
              @change="stationChange"
            >
              <el-option
                v-for="(item, idx) in stationList"
                :key="idx"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-form-item :label="translate('工厂')">
            <el-input
              v-model="addForm.factoryName"
              :disabled="uploadingDisaled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item :label="translate('相机名')">
            <el-select
              v-model="addForm.cameraName"
              allow-create
              clearable
              :disabled="uploadingDisaled"
              filterable
              style="width: 100%"
              @change="cameraChange"
            >
              <el-option
                v-for="(item, idx) in cameraList"
                :key="idx"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-form-item :label="translate('机台')">
            <el-input
              v-model="addForm.machineName"
              :disabled="uploadingDisaled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item :label="translate('采图点位')">
            <el-select
              v-model="addForm.capturePos"
              allow-create
              clearable
              :disabled="uploadingDisaled"
              filterable
              style="width: 100%"
              @change="captureChange"
            >
              <el-option
                v-for="(item, idx) in captureList"
                :key="idx"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-form-item :label="translate('线体')">
            <el-input v-model="addForm.lineName" :disabled="uploadingDisaled" />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item :label="translate('光照ID')">
            <el-select
              v-model="addForm.opticalMode"
              allow-create
              clearable
              :disabled="uploadingDisaled"
              filterable
              style="width: 100%"
              @change="opticalChange"
            >
              <el-option
                v-for="(item, idx) in opticalList"
                :key="idx"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-form-item :label="translate('X方向像素当量')">
            <el-input-number
              v-model="addForm.resolutionX"
              controls-position="right"
              :disabled="uploadingDisaled"
              :min="0"
              :precision="5"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item :label="translate('客户标签')">
            <el-select
              v-model="addForm.customerLabel"
              allow-create
              clearable
              :disabled="uploadingDisaled"
              filterable
              style="width: 100%"
              @change="customerChange"
            >
              <el-option
                v-for="(item, idx) in customerLabelList"
                :key="idx"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-form-item :label="translate('Y方向像素当量')">
            <el-input-number
              v-model="addForm.resolutionY"
              controls-position="right"
              :disabled="uploadingDisaled"
              :min="0"
              :precision="5"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item :label="translate('AI工程名')">
            <el-select
              v-model="addForm.enginName"
              allow-create
              clearable
              :disabled="uploadingDisaled"
              filterable
              style="width: 100%"
              @change="enginNameChange"
            >
              <el-option
                v-for="(item, idx) in enginNameList"
                :key="idx"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-form-item :label="translate('产品SN(二维码)')">
            <el-input
              v-model="addForm.productSn"
              :disabled="uploadingDisaled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item :label="translate('工程标签')">
            <el-select
              v-model="addForm.enginLabel"
              allow-create
              clearable
              :disabled="uploadingDisaled"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="(item, idx) in enginLabelList"
                :key="idx"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="7">
          <el-form-item>
            <template #label>
              <el-tooltip class="item" effect="dark" placement="top">
                <template #content>
                  {{ translate('1.支持导入ZIP格式文件') }}
                  <br />
                  {{
                    translate(
                      '2.支持导入 *.jpg ; *.png ; *.bmp ; *.aqlabel ; *.aqimg'
                    )
                  }}
                </template>
                <span>
                  <el-icon><InfoFilled /></el-icon>
                  {{ translate('导入方式') }}
                </span>
              </el-tooltip>
            </template>
            <el-radio
              v-model="importWay"
              :disabled="uploadingDisaled"
              label="importImg"
            >
              {{ translate('图片导入') }}
            </el-radio>
            <el-radio
              v-model="importWay"
              :disabled="uploadingDisaled"
              label="importZip"
            >
              {{ translate('压缩包导入') }}
            </el-radio>
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item>
            <el-icon><InfoFilled /></el-icon>
            <span>{{ translate('右侧选项数据均来源于标准管理') }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 图片导入 -->
      <el-row v-if="importWay === 'importImg'" :gutter="20">
        <el-col :span="7">
          <el-form-item :label="translate('添加图片')">
            <el-upload
              ref="uploadAqimgRef"
              accept=".aqimg,.jpg,.png,.bmp"
              action="#"
              :auto-upload="false"
              multiple
              :on-change="uploadAqimg"
              :show-file-list="false"
            >
              <el-button :disabled="uploadingDisaled" type="primary">
                {{ translate('图片') }}
              </el-button>
              <span v-show="aqimgTotal">
                {{ translate('总数') }}:{{ aqimgTotal }}
              </span>
            </el-upload>
            <span v-show="aqimgTotal" style="margin-left: 10px">
              <el-button link type="primary" @click="clearImg()">
                {{ translate('清空') }}
              </el-button>
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 压缩包导入 -->
      <el-row v-show="importWay === 'importZip'" :gutter="20">
        <el-col>
          <el-form-item :label="translate('添加压缩包')">
            <BigFileUpload
              ref="child"
              :api-url="'/api/base/v2/solutionFile/addImgInfoByZip'"
              :big-file-msg="addForm"
              :component-name="'solution'"
              :uploading-disaled="uploadingDisaled"
              @get-msg="getMsg"
              @send-disaled-msg="sendDisaledMsg"
              @send-file-msg="getFileMsg"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" />
    </el-form>
    <el-row>
      <el-col :span="12">
        <div style="text-align: center">
          <el-button @click="cancelUplaodAqFile">
            {{ translate('取消') }}
          </el-button>
          <el-button
            v-if="!parsing"
            :disabled="uploadingDisaled"
            type="primary"
            @click="newDataSetFormSubmit"
          >
            {{ translate('上传') }}
          </el-button>
          <el-button
            v-if="parsing"
            disabled
            type="primary"
            @click="newDataSetFormSubmit"
          >
            {{ translate('解析中') }}...
          </el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import solutionFile from '@/api/solutionFile'
  import BigFileUpload from '@/views/components/upload/BigFileUpload.vue'
  // import SparkMD5 from 'spark-md5'
  import CryptoJS from 'crypto-js'
  // import cache from '@/util/core/cacheKey'
  import { translate } from '@/i18n'
  import { getStore } from '@/utils/storage'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
  export default {
    components: { BigFileUpload },
    props: {
      currntRow: {
        type: Object,
        default: () => {},
      },
      allDataList: {
        type: Array,
        default: () => [],
      },
      criteriaData: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    emits: ['uploadFileSuccess'],
    data() {
      return {
        newDataSetFormRules: {
          joinDataSetType: [
            {
              required: true,
              message: translate('请选择集合'),
              trigger: 'change',
            },
          ],
          labelType: [
            {
              required: true,
              message: translate('请选择标签'),
              trigger: 'change',
            },
          ],
        },

        importWay: 'importImg',
        aqimgTotal: 0,
        aqlabelTotal: 0,
        addForm: {
          cameraName: '',
          capturePos: '',
          customerLabel: '',
          enginName: '',
          enginLabel: '',
          dataSetId: '',
          factoryName: '',
          lineName: '',
          machineName: '',
          opticalMode: '',
          productSn: '',
          resolutionX: 0,
          resolutionY: 0,
          stationName: '',
        },

        uploadAqimgList: [],
        uploadAqlabelList: [],
        uploadAqzip: [],
        uploadAqimgpercentage: 0,
        allLabelList: [],
        uploadingDisaled: false, //上传时
        isZipList: [], // 判断是否存在压缩包

        uploadCount: 1,
        haveUnconfirmLabelFlag: false,
        fileChunk: 0, //当前分片数量
        bigFileMsg: {},
        readFileSHA256Total: 0, //让用户知道文件在获取哈希值
        parsing: false,
        index: 0, //图片解析次数
        imgFileType: {}, //用作处理aqimg,jpg,png,bmp
        imgFileContainer: {}, // 用作上传数据
      }
    },
    computed: {
      ...mapStores(recordProInfo),
      translate() {
        return translate
      },
      projectId() {
        return getStore({ name: 'projectId' })
      },
      socketMsg() {
        return this.projectStore.socketMsg
        // return this.$store.state.socketMsg
      },
      // 工位
      stationList() {
        const _list = this.criteriaData.stationSet
        if (_list) {
          return _list
        } else {
          return []
        }
      },
      // 相机
      cameraList() {
        const stationCameraCodeMap = this.criteriaData.stationCameraCodeMap
        const _list =
          stationCameraCodeMap && stationCameraCodeMap[this.addForm.stationName]
        if (_list) {
          return _list
        } else {
          return []
        }
      },
      // 采图点位
      captureList() {
        const cameraCodePointMap = this.criteriaData.cameraCodePointMap
        const _list =
          cameraCodePointMap && cameraCodePointMap[this.addForm.cameraName]
        if (_list) {
          return _list.sort((a, b) => {
            return a - b
          })
        } else {
          return []
        }
      },
      // 光照ID
      opticalList() {
        const pointOpticsMap = this.criteriaData.pointOpticsMap
        const _list = pointOpticsMap && pointOpticsMap[this.addForm.capturePos]
        if (_list) {
          return _list
        } else {
          return []
        }
      },

      // 客户标签
      customerLabelList() {
        const opticsCustomDefectMap = this.criteriaData.opticsCustomDefectMap
        const _list =
          opticsCustomDefectMap &&
          opticsCustomDefectMap[this.addForm.opticalMode]
        if (_list) {
          return _list
        } else {
          return []
        }
      },
      // AI工程名
      enginNameList() {
        const customDefectAiEnginMap = this.criteriaData.customDefectAiEnginMap
        const _list =
          customDefectAiEnginMap &&
          customDefectAiEnginMap[this.addForm.customerLabel]
        if (_list) {
          return _list
        } else {
          return []
        }
      },
      // 工程标签(computed)
      enginLabelList() {
        const EnginNameDefectMap = this.criteriaData.EnginNameDefectMap
        const _list =
          EnginNameDefectMap && EnginNameDefectMap[this.addForm.enginName]
        if (_list) {
          console.log(_list)
          return _list
        } else {
          return []
        }
      },
    },
    watch: {
      socketMsg(newVal) {
        const res = newVal
        // console.log(res);
        if (res.code === '1002') {
          //
          // this.$message.success(res.message);
          // this.uploadAqimgpercentage = 100;
          // setTimeout(() => {
          //   this.$router.push('/dataList');
          // }, 1000);
        } else if (res.code === '1003') {
          //
          this.$message.error(res.message)
          this.uploadAqimgpercentage = 100
          setTimeout(() => {
            this.$router.push('/dataList')
          }, 1000)
        }
        // 获取进度
        if (res.code === '1022') {
          // console.log(res);
          if (this.importWay === 'importZip') {
            // this.uploadAqimgpercentage = 50 + Math.floor((res.data.added / res.data.total) * 100) / 2;
            // console.log(this.uploadAqimgpercentage);
          }
        }

        if (res.code === '1023' && !this.haveUnconfirmLabelFlag) {
          this.$message({
            message: res.message,
            center: true,
            duration: 0,
            showClose: true,
            type: 'warning',
          })
          this.haveUnconfirmLabelFlag = true
        }
      },
      // 监听MD5是否去全部解析完成
      index(val) {
        if (val == this.uploadAqimgList.length) this.parsing = false
      },
      aqimgTotal(val) {
        if (val !== 0) {
          this.uploadAqimgList.forEach((item) => {
            this.readFileSHA256(item)
          })
        }
      },
    },
    mounted() {},
    created() {
      this.addForm.dataSetId = this.currntRow.id
      this.addForm.factoryName = this.currntRow.factoryName
      this.addForm.lineName = this.currntRow.lineName
      this.addForm.machineName = this.currntRow.machineName
    },
    methods: {
      stationChange() {
        this.addForm.cameraName = ''
        this.addForm.capturePos = ''
        this.addForm.opticalMode = ''
        this.addForm.customerLabel = ''
        this.addForm.enginName = ''
        this.addForm.enginLabel = ''
      },
      cameraChange() {
        this.addForm.capturePos = ''
        this.addForm.opticalMode = ''
        this.addForm.customerLabel = ''
        this.addForm.enginName = ''
        this.addForm.enginLabel = ''
      },
      captureChange() {
        this.addForm.opticalMode = ''
        this.addForm.customerLabel = ''
        this.addForm.enginName = ''
        this.addForm.enginLabel = ''
      },
      opticalChange() {
        this.addForm.customerLabel = ''
        this.addForm.enginName = ''
        this.addForm.enginLabel = ''
      },
      customerChange() {
        this.addForm.enginName = ''
        this.addForm.enginLabel = ''
      },
      enginNameChange() {
        this.addForm.enginLabel = ''
      },
      clearImg() {
        this.$refs.uploadAqimgRef.clearFiles()
        this.uploadAqimgList = []
        this.index = 0
        this.aqimgTotal = 0
        this.imgFileType = {}
        this.imgFileContainer = {}
      },
      /**
       * 校验光照ID 只允许数字
       * @param value
       */
      validateOpticalMode(value) {
        // 非数字，做相应的处理，比如清空输入框或提示错误信息
        if (!/^\d+$/.test(value)) {
          this.addForm.opticalMode = ''
          this.$message.warning(translate('请输入数字'))
        }
      },
      /**
       * 获取压缩包文件
       */
      getFileMsg(msg) {
        this.bigFileMsg = { ...msg }
      },
      // 获取上传压缩包信息
      getMsg(data) {
        if (data.length) {
          this.uploadAqimgpercentage = Math.floor(data[0].percent)
        }
        this.isZipList = data
      },
      sendDisaledMsg(msg) {
        //分片上传时获取子组件信息
        this.uploadingDisaled = msg
      },

      cancelUplaodAqFile() {
        // if (typeof this.cancelFun === 'function') {
        //   //取消上传时掐断请求
        //   this.cancelFun();
        // }
        // this.$router.push('/core/datalist/index');
        this.$emit('uploadFileSuccess')
      },
      uploadAqimg(file, fileList) {
        // console.log('file:::', fileList.length)
        // this.readFileSHA256(file)
        this.uploadAqimgList = fileList
        this.aqimgTotal = fileList.length
      },
      /**
       * 处理上传图片文件类型 归类
       */
      imgFileClassify(file) {
        const _lastIndex = file.name.lastIndexOf('.')
        const _imgType = file.name.substring(_lastIndex + 1)
        if (this.imgFileType[_imgType]) {
          const _fileList = this.imgFileType[_imgType]
          _fileList.push(file)
          this.imgFileType[_imgType] = _fileList
        } else {
          const _fileList = []
          _fileList.push(file)
          this.imgFileType[_imgType] = _fileList
        }
        // console.log(' this.imgFileType:::', this.imgFileType)
        this.mergeImg()
      },
      /**
       * 处理png,jpg里面_data,_model,_gerber
       */
      mergeImg() {
        Object.keys(this.imgFileType).forEach((el) => {
          if (['png', 'jpg', 'bmp'].includes(el)) {
            const _fileList = this.imgFileType[el]
            const _imgFileContent = {}
            _fileList.forEach((item) => {
              const pointIndex = item.name.lastIndexOf('.')
              const _fileName = item.name.substring(0, pointIndex)
              const _flag =
                _fileName.endsWith('_data') ||
                _fileName.endsWith('_model') ||
                _fileName.endsWith('_gerber')
              if (_flag) {
                const _index = item.name.lastIndexOf('_')
                const _name = item.name.substring(0, _index)
                const _imgType = item.name.substring(_index + 1, pointIndex)
                if (_imgFileContent[_name]) {
                  const _fileObj = _imgFileContent[_name]
                  _fileObj[`${_imgType}Img`] = item
                  _imgFileContent[_name] = _fileObj
                } else {
                  const _fileObj = {}
                  _fileObj[`${_imgType}Img`] = item
                  _imgFileContent[_name] = _fileObj
                }
              } else {
                const _fileObj = {
                  dataImg: item,
                }
                _imgFileContent[_fileName] = _fileObj
              }
            })
            // console.log('_imgFileContent:::', Object.values(_imgFileContent))
            let picDataImgList = Object.values(_imgFileContent)
            // 过滤符合上传条件的文件并构造对应结构
            picDataImgList = picDataImgList.filter((it) => {
              const _keys = Object.keys(it).length
              switch (_keys) {
                case 1:
                  return it.dataImg
                case 2:
                  return it.dataImg && it.modelImg
                case 3:
                  return it.dataImg && it.modelImg && it.gerberImg
              }
            })
            // console.log('picDataImgList::::', picDataImgList)
            picDataImgList.forEach((i) => {
              i.imgNum = Object.keys(i).length
            })
            this.imgFileContainer[el] = picDataImgList
          } else {
            this.imgFileContainer[el] = this.imgFileType[el]
          }
        })
        console.log('this.imgFileContainer::::', this.imgFileContainer)
        // 显示真是图片数量上传
        // this.aqimgTotal = 0
        // Object.keys(this.imgFileContainer).forEach((el) => {
        //   this.aqimgTotal += this.imgFileContainer[el]?.length
        // })
      },
      /**
       * 解析文件哈希值
       */
      // readFileSHA256() {
      //   this.parsing = true
      //   for (let i = 0; i < this.uploadAqimgList.length; i++) {
      //     const fileReader = new FileReader()
      //     fileReader.readAsArrayBuffer(this.uploadAqimgList[i].raw)
      //     fileReader.onload = (e) => {
      //       const wordArray = CryptoJS.lib.WordArray.create(e.target.result)
      //       const resHash = CryptoJS.SHA256(wordArray).toString() // 支持SHA1、MD5、SHA256等算法
      //       this.uploadAqimgList[i].md5 = resHash
      //       // console.log('第几个' + i, this.uploadAqimgList[i].md5);
      //       this.index++
      //     }
      //   }
      // },
      readFileSHA256(file) {
        this.parsing = true
        const fileReader = new FileReader()
        fileReader.readAsArrayBuffer(file.raw)
        fileReader.onload = (e) => {
          const wordArray = CryptoJS.lib.WordArray.create(e.target.result)
          const resHash = CryptoJS.SHA256(wordArray).toString() // 支持SHA1、MD5、SHA256等算法
          file.md5 = resHash
          this.imgFileClassify(file) //图片分类
          this.index++
        }
      },
      uploadAqlabel(file, fileList) {
        this.uploadAqlabelList = fileList
        this.aqlabelTotal = fileList.length
      },
      uploadAqZipOnChange(file, fileList) {
        this.uploadAqzip = fileList
      },
      uploadAqimgFilter() {
        //aqimg处理去重排序
        // 文件去重
        const res = new Map()
        const aqimgList = this.uploadAqimgList.filter(
          (a) => !res.has(a.name) && res.set(a.name, 1)
        )
        // 根据文件名称排序
        function compare(p) {
          return function (m, n) {
            const a = m[p]
            const b = n[p]
            return a.localeCompare(b, 'zh-CN', { numeric: true })
          }
        }
        aqimgList.sort(compare('name'))
        // console.log(aqimgList);
        return aqimgList
      },
      uploadAqlabelFilter() {
        //对aqlabel处理
        const aqlabelFilename = [] //获取aqimg文件名
        this.uploadAqlabelList.forEach((item) => {
          const i = item.name.indexOf('.')
          aqlabelFilename.push(item.name.substr(0, i))
        })

        // label文件去重
        const res = new Map()
        const arrObj = this.uploadAqlabelList.filter(
          (a) => !res.has(a.name) && res.set(a.name, 1)
        )
        // 根据文件名称排序
        function compare(p) {
          return function (m, n) {
            const a = m[p]
            const b = n[p]
            return a.localeCompare(b, 'zh-CN', { numeric: true })
          }
        }
        arrObj.sort(compare('name'))
        const result = []
        arrObj.forEach((item) => {
          aqlabelFilename.forEach((item2) => {
            // console.log(item2);
            if (item.name.substr(0, item.name.indexOf('.')) === item2) {
              result.push(item)
            }
          })
        })
        return result
      },
      // 压缩包上传前先存空值
      async handleUpLoadZipNull(type, file) {
        const fd = new FormData()
        // fd.append()
        let apiUrl
        if (type == 'img') {
          fd.append('dataSize', file.length)
          apiUrl = 'addImgByFile'
        } else {
          apiUrl = 'addImgInfoByZip'
        }
        Object.keys(this.addForm).forEach((el) => {
          fd.append(el, this.addForm[el])
        })
        fd.append('chunk', -1)
        const data = await solutionFile[apiUrl](fd)
        return data
      },
      // newDataSetForm表单提交
      newDataSetFormSubmit() {
        this.$refs.newDataSetFormRef.validate(async (valid) => {
          if (!valid) return
          // 文件上传形式
          if (this.importWay === 'importImg') {
            // const aqimgList = this.uploadAqimgFilter()
            const aqlabelList = this.uploadAqlabelFilter()
            if (this.aqimgTotal === 0 && this.aqlabelTotal === 0) {
              return this.$message.error('请上传图片')
            }
            // 图片形式上传
            this.uploadingDisaled = true
            this.imgFileContainer
            this.createUploadParams(this.imgFileContainer, aqlabelList)
            setTimeout(() => {
              // 文件上传成功后给父组件一个信息
              this.$emit('uploadFileSuccess')
            }, 1000)
          } else if (this.importWay === 'importZip') {
            if (this.isZipList.length === 0) {
              return this.$message.error('请上传压缩包！')
            }
            this.uploadingDisaled = true
            await this.handleUpLoadZipNull('zip')
            this.$refs.child.handleUpload()
            setTimeout(() => {
              this.$emit('uploadFileSuccess')
            }, 1000)
          }
        })
      },
      /**
       * 构造上传图片的参数集
       */
      async createUploadParams(aqimgList, aqlabelList) {
        let aqimgFiles = []
        let picFiles = []
        const labelFileObj = {}
        Object.keys(aqimgList).forEach((el) => {
          if (el === 'aqimg') {
            aqimgFiles = aqimgList['aqimg']
          } else {
            picFiles = picFiles.concat(aqimgList[el])
          }
        })

        if (aqimgFiles.length) {
          const uploadTotal = Math.ceil(aqimgFiles.length / 500)
          const needUploadFile = [
            ...(await this.validateUploadFile(aqimgFiles, 'aqimgFiles')),
          ] //返回文件名称数组
          aqlabelList.forEach((labelFile) => {
            const fileName = labelFile.name
            const index = fileName.indexOf('.aqlabel')
            const key = fileName.substring(0, index)
            labelFileObj[key] = labelFile.raw
          }) //构造aqlabel对象
          // console.log('=============', aqimgFiles);
          await this.handleUpLoadZipNull('img', aqimgFiles)
          await this.sendUploadImg(
            aqimgFiles,
            'aqimgFiles',
            uploadTotal,
            labelFileObj,
            needUploadFile
          )
        }
        // png格式文件上传
        if (picFiles.length) {
          const picDataImgList = [...picFiles] //构造数组结构
          //构造aqlabel对象
          aqlabelList.forEach((labelFile) => {
            const fileName = labelFile.name
            const index = fileName.indexOf('.aqlabel')
            const key = fileName.substring(0, index)
            labelFileObj[key] = labelFile.raw
          })

          const _totolChunk = Math.ceil(picDataImgList.length / 500)
          const needUploadFile = [
            ...(await this.validateUploadFile(picDataImgList, '')),
          ] //返回需要上传文件
          await this.handleUpLoadZipNull('img', picDataImgList)
          await this.sendUploadImg(
            picDataImgList,
            'pngFiles',
            _totolChunk,
            labelFileObj,
            needUploadFile
          )
        }
      },

      /**
       * 发送上传请求
       * @param {Array} imgFiles 需要上传文件
       * @param {String} imgParamName 文件类型
       * @param {Integer} uploadTotal 上传总次数
       * @param {Object} labelFileObj label文件
       * @param {Array} needUploadFile 记录另外一个接口要传给后端文件file,不包含就不需要传flie
       */
      async sendUploadImg(
        imgFiles,
        imgParamName,
        uploadTotal,
        labelFileObj,
        needUploadFile
      ) {
        let params = new FormData()
        // const mgFileInfos = []
        let imgCount = 1
        for (let j = 0, len = imgFiles.length; j < len; j++) {
          const imgFile = imgFiles[j]
          const fileName = imgFile.name
          if (imgParamName === 'aqimgFiles') {
            if (needUploadFile.includes(imgFiles[j].name)) {
              params.append(
                `imgFileInfos[${j % 500}].aqimgFile`,
                imgFiles[j].raw
              )
            }
            params.append(
              `imgFileInfos[${j % 500}].aqimgMetaData.md5`,
              imgFiles[j].md5
            )
            params.append(
              `imgFileInfos[${j % 500}].aqimgMetaData.name`,
              imgFiles[j].name
            )
            params.append(
              `imgFileInfos[${j % 500}].aqimgMetaData.size`,
              imgFiles[j].size
            )
            params.append(`imgFileInfos[${j % 500}].imgNum`, 0)
            // .aqimg后缀为6，直接截取掉
            const key = fileName.substring(0, fileName.length - 6)
            if (labelFileObj[key]) {
              params.append(
                `imgFileInfos[${j % 500}].aqlabelFile`,
                labelFileObj[key]
              )
            }
          }
          if (imgParamName === 'pngFiles') {
            //
            // console.log('==========', needUploadFile)
            let dataImgFlag = false
            if (imgFiles[j].dataImg) {
              dataImgFlag = needUploadFile.some((el) => {
                return el.dataImg?.name === imgFiles[j].dataImg.name
              })
            }
            let modelImgFlag = false
            if (imgFiles[j].modelImg) {
              modelImgFlag = needUploadFile.some((el) => {
                return el.modelImg?.name === imgFiles[j].modelImg.name
              })
            }
            let gerberImgFlag = false
            if (imgFiles[j].gerberImg) {
              gerberImgFlag = needUploadFile.some((el) => {
                return el.gerberImg?.name === imgFiles[j].gerberImg.name
              })
            }
            if (dataImgFlag) {
              params.append(
                `imgFileInfos[${j % 500}].dataImgFile`,
                imgFiles[j].dataImg.raw
              )
            }
            if (modelImgFlag) {
              params.append(
                `imgFileInfos[${j % 500}].modelImgFile`,
                imgFiles[j].modelImg.raw
              )
            }
            if (gerberImgFlag) {
              params.append(
                `imgFileInfos[${j % 500}].gerberImgFile`,
                imgFiles[j].gerberImg.raw
              )
            }
            params.append(`imgFileInfos[${j % 500}].imgNum`, imgFiles[j].imgNum)
            params.append(
              `imgFileInfos[${j % 500}].dataImgMetaData.md5`,
              imgFiles[j].dataImg.md5
            )
            params.append(
              `imgFileInfos[${j % 500}].dataImgMetaData.name`,
              imgFiles[j].dataImg.name
            )
            params.append(
              `imgFileInfos[${j % 500}].dataImgMetaData.size`,
              imgFiles[j].dataImg.size
            )
            if (imgFiles[j].modelImg)
              params.append(
                `imgFileInfos[${j % 500}].modelImgMetaData.md5`,
                imgFiles[j].modelImg.md5
              )
            if (imgFiles[j].modelImg)
              params.append(
                `imgFileInfos[${j % 500}].modelImgMetaData.name`,
                imgFiles[j].modelImg.name
              )
            if (imgFiles[j].modelImg)
              params.append(
                `imgFileInfos[${j % 500}].modelImgMetaData.size`,
                imgFiles[j].modelImg.size
              ) // png、jpg、bmp，name为‘_’前的数字，直接截取即可
            if (imgFiles[j].gerberImg)
              params.append(
                `imgFileInfos[${j % 500}].gerberImgMetaData.md5`,
                imgFiles[j].gerberImg.md5
              )
            if (imgFiles[j].gerberImg)
              params.append(
                `imgFileInfos[${j % 500}].gerberImgMetaData.name`,
                imgFiles[j].gerberImg.name
              )
            if (imgFiles[j].gerberImg)
              params.append(
                `imgFileInfos[${j % 500}].gerberImgMetaData.size`,
                imgFiles[j].gerberImg.size
              )
            const pngName = imgFile.dataImg.name
            const key = pngName.substring(0, pngName.indexOf('.'))
            if (labelFileObj[key]) {
              params.append(
                `imgFileInfos[${j % 500}].aqlabelFile`,
                labelFileObj[key]
              )
            }
          }

          //
          if (
            imgCount === 500 ||
            imgCount === imgFiles.length ||
            j === len - 1
          ) {
            if (this.fileChunk < uploadTotal) {
              params.append('chunk', this.fileChunk)
            }
            params.append('chunks', uploadTotal)
            params.append('dataSize', imgFiles.length)
            Object.keys(this.addForm).forEach((el) => {
              params.append(el, this.addForm[el])
            })
            // await dataManagerController.addImgInfoByFile(params, this);
            //   await fileController.addImgInfoByFile(params, this);
            await solutionFile.addImgByFile(params)
            // await fileController.addImgInfoByFile();
            this.uploadAqimgpercentage = parseInt(
              (this.uploadCount / uploadTotal) * 100
            )
            // 保存上传次数进度，显示在进度条

            imgCount = 0
            this.uploadCount++
            this.fileChunk++
            params = new FormData() //清空，重新放值
          }
          imgCount++
        }

        // this.$router.push('/core/datalist/index');
      },

      /**
       * 文件校验
       */
      async validateUploadFile(imgFiles, fileType) {
        let fileList = []
        const query = {
          imgBaseInfo: { ...this.addForm },
          imgFileInfos: [],
        }
        if (fileType === 'aqimgFiles') {
          imgFiles.forEach((el) => {
            query.imgFileInfos.push({
              aqimgMetaData: {
                name: el.name,
                md5: el.md5,
                size: el.size,
              },
            })
          })
        } else {
          imgFiles.forEach((el) => {
            const tempObj = {}
            if (el.dataImg) {
              tempObj.dataImgMetaData = {
                name: el.dataImg.name,
                md5: el.dataImg.md5,
                size: el.dataImg.size,
              }
            }
            if (el.modelImg) {
              tempObj.modelImgMetaData = {
                name: el.modelImg.name,
                md5: el.modelImg.md5,
                size: el.modelImg.size,
              }
            }
            if (el.gerberImg) {
              tempObj.gerberImgMetaData = {
                name: el.gerberImg.name,
                md5: el.gerberImg.md5,
                size: el.gerberImg.size,
              }
            }
            tempObj.imgNum = el.imgNum
            query.imgFileInfos.push(tempObj)
          })
        }

        const res = await solutionFile.filterExistImgFile(query)
        // console.log(res);
        if (res.code === 0) {
          const tempFile = [...res.data]
          if (fileType === 'aqimgFiles') {
            tempFile.forEach((el) => {
              fileList.push(el.aqimgMetaData.name)
            })
          } else {
            fileList = tempFile.map((el) => {
              const query = {}
              el.dataImgMetaData && (query.dataImg = { ...el.dataImgMetaData })
              el.modelImgMetaData &&
                (query.modelImg = { ...el.modelImgMetaData })
              el.gerberImgMetaData &&
                (query.gerberImg = { ...el.gerberImgMetaData })
              return query
            })
          }
        }
        return fileList
      },

      /**
       * 标签搜索
       */
      labelSearch(node, val) {
        if (val) {
          return this.$pinyinSearch.pinyinMatchStr(node.text, val)
        }
      },
    },
  }
</script>
<style scoped>
  .container {
    padding-top: 14px;
    height: 100%;
    box-sizing: border-box;
  }
</style>
