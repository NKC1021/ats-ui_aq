<template>
  <div class="content">
    <div v-show="isMultipleSelectedImg">
      <div>
        <el-row justify="space-between" style="padding: 3px 0">
          <el-col :span="8">
            <el-tag>
              {{ translate('图片 ID') }} : {{ selectedImgInfo.id }}
            </el-tag>
          </el-col>
          <el-col :span="16">
            <div style="float: right">
              <span style="font-size: 14px">
                {{
                  selectedImgInfo.hash
                    ? selectedImgInfo.hash.slice(0, 10) + '...'
                    : ''
                }}
              </span>
              <el-button
                v-show="selectedImgInfo.hash"
                link
                type="primary"
                @click="copyHash(selectedImgInfo.hash)"
              >
                {{ translate('复制图片哈希值') }}
              </el-button>
            </div>
          </el-col>
        </el-row>
        <el-tag>{{ translate('图片宽') }}:{{ selectedImgInfo.width }}</el-tag>
        <el-tag>{{ translate('图片高') }}:{{ selectedImgInfo.height }}</el-tag>
        <span :title="selectedImgInfo.originName">
          <el-tag style="margin-top: 3px">
            {{ translate('图片名称') }} :
            {{ `${selectedImgInfo.originName}` }}
          </el-tag>
        </span>

        <div class="imgs-show-content">
          <div
            v-for="(el, index) in selectedImgInfo.imageData"
            :key="index"
            class="img-show"
          >
            <img alt="" :src="'data:image/png;base64,' + el.images" />
          </div>
        </div>
        <div class="result-info">
          <h5>{{ translate('结果信息') }}</h5>

          <p>
            <span class="result-tag">{{ translate('人工结果') }}</span>
            :{{ selectedImgInfo.humanResult }}
          </p>
          <p>
            <span class="result-tag">{{ translate('AI结果') }}</span>
            :{{ selectedImgInfo.aiResult }}
          </p>
          <p>
            <span class="result-tag">{{ translate('产品AI结果') }}</span>
            :{{ selectedImgInfo.productAiResult }}
          </p>
          <p>
            <span class="result-tag">{{ translate('最终结果') }}</span>
            :{{ selectedImgInfo.finalResult }}
          </p>
        </div>
        <div class="labelInfo">
          <h5>{{ translate('标签信息') }}</h5>
          <p>
            <span class="label-tag">{{ translate('客户缺陷名') }}</span>
            :{{ customDefect }}
          </p>
          <p>
            <span class="label-tag">{{ translate('工程缺陷名') }}</span>
            :{{ enginDefect }}
          </p>
          <p>
            <span class="label-tag">{{ translate('AI工程名') }}</span>
            :{{ AIEnginDefect }}
          </p>
          <p>
            <span class="label-tag">{{ translate('AI标签') }}</span>
            :{{ AILabelDefect }}
          </p>
        </div>
      </div>
      <div class="moreInfo">
        <h5>{{ translate('图片信息') }}</h5>
        <p
          v-for="item in imgInfoKey"
          :key="item"
          style="white-space: nowrap"
          :title="detailsInfo_images[item]"
        >
          <span class="moreinfo-tag">{{ item }}</span>
          : {{ detailsInfo_images[item] }}
        </p>
        <h5>{{ translate('数据信息') }}</h5>
        <h6>{{ translate('基础信息') }}</h6>
        <p v-for="item in Object.keys(imgBaseInfoKeyObj)" :key="item">
          {{ imgBaseInfoKeyObj[item] }}: {{ selectedImgInfo[item] }}
        </p>
        <h6>{{ translate('生产信息') }}</h6>
        <p v-for="item in imgProductInfoKey" :key="item">
          {{ item }}:
          {{
            item === 'productSn'
              ? selectedImgInfo[item]
              : detailsInfo_infos[item]
          }}
        </p>
        <h6>{{ translate('综合检测结果') }}</h6>
        <p v-for="item in imgTestResultInfoKey" :key="item">
          {{ item }}:
          {{
            item === 'finalResult'
              ? selectedImgInfo[item]
              : detailsInfo_infos[item]
          }}
        </p>
        <h5>{{ translate('更多信息') }}</h5>
        <div class="more-info-box">
          <p>outline信息:{{ moreInfo_outline.Outline }}</p>
        </div>
        <h5>{{ translate('其他信息') }}</h5>
        <div v-for="(item, index) in detailsInfo_inspectInfos" :key="index">
          <p>modelName: {{ item['ModelName'] }}</p>
          <p>ROIs: {{ item['ROIs'] }}</p>
        </div>
      </div>
    </div>
    <div v-show="!isMultipleSelectedImg" class="empty-css">
      <el-empty :description="translate('请选中一张图片')" />
    </div>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import useClipboard from 'vue-clipboard3'
  export default {
    components: {},
    props: {
      selectedImgInfo: {
        type: Object,
        default: () => {},
      },
      isMultipleSelectedImg: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        checkData: [],
        show: false,
        result: { aiResultNameArr: [], aiResultScoreArr: [] },
        passTypeObj: { 1: '可放行', 2: '不确定', 3: '不可放行' },
        imgInfoKey: ['path', 'channel', 'height', 'width'],
        imgProductInfoKey: [
          'productSn',
          'productName',
          'productVersion',
          'lotId',
          'childLotId',
          'buildPhsae',
          'operatorName',
          'workClass',
        ],
        imgTestResultInfoKey: [
          'finalResult',
          'labels',
          'inspectFinishTime',
          'CT',
        ],
        imgBaseInfoKeyObj: {
          factoryName: '工厂',
          lineName: '线体',
          machineName: '机台',
          stationName: '工位',
          cameraName: '相机名',
          capturePos: '采图点位',
          opticalMode: '光照ID',
          imageNum: '图片数',
          resolutionX: 'x方向像素当量',
          resolutionY: 'Y方向像素当量',
        },
      }
    },
    computed: {
      translate() {
        return translate
      },
      imgWidth() {
        if (this.selectedImgInfo.imageData) {
          return this.selectedImgInfo.imageData.dataWidth
        } else {
          return 128
        }
      },
      imgHeight() {
        if (this.selectedImgInfo.imageData) {
          return this.selectedImgInfo.imageData.dataHeight
        } else {
          return 128
        }
      },
      imageData() {
        if (this.selectedImgInfo.imageData) {
          return this.selectedImgInfo.imageData
        } else {
          return {}
        }
      },
      jsonData() {
        if (this.selectedImgInfo.jsonData) {
          return JSON.parse(this.selectedImgInfo.jsonData)
        } else {
          return {}
        }
      },
      Polygon() {
        if (Object.keys(this.jsonData).length) {
          return this.jsonData.Regions[0].Polygon
        } else {
          return {}
        }
      },
      RgnInfo() {
        if (this.selectedImgInfo.layerInfo) {
          const obj = JSON.parse(this.selectedImgInfo.layerInfo)
          if (Object.keys(obj).length) {
            return obj.RgnInfo
          }
        } else {
          return {}
        }
        return {}
      },
      permissions() {
        return this.$store.getters.permissions
      },
      detailsInfo() {
        const _detailInfo = this.selectedImgInfo.detailInfos
        if (_detailInfo) {
          return JSON.parse(_detailInfo)
        } else {
          return {}
        }
      },
      /**
       * 图片基础信息
       */
      detailsInfo_infos() {
        const detailsInfo = this.detailsInfo.Infos
        if (detailsInfo) {
          return detailsInfo
        } else {
          return {}
        }
      },
      /**
       * 图片基础信息 取一个值
       */
      detailsInfo_images() {
        const detailsInfo = this.detailsInfo.Images
        if (detailsInfo && detailsInfo.length) {
          return detailsInfo[0]
        } else {
          return {}
        }
      },
      /**
       * 其他模型信息
       */
      detailsInfo_inspectInfos() {
        const detailsInfo = this.detailsInfo.InspectInfos
        if (detailsInfo && detailsInfo.length) {
          return detailsInfo
        } else {
          return []
        }
      },
      /**
       * 图片标签信息
       */
      selectedImgLabels() {
        const _labels = this.selectedImgInfo.labels
        if (_labels && _labels.length) {
          return _labels
        } else {
          return []
        }
      },
      /**
       * 客户缺陷名 labelType 1
       */
      customDefect() {
        const _mapList = this.selectedImgLabels
          .filter((el) => el.labelType === 1)
          .map((el) => {
            const str = []
            if (el.labelName) str.push(el.labelName)
            if (el.passType) str.push(this.passTypeObj[el.passType])
            return str.join('-')
          })

        return _mapList.toString()
      },
      /**
       * 工程缺陷名 labelType 2
       */
      enginDefect() {
        const _mapList = this.selectedImgLabels
          .filter((el) => el.labelType === 2)
          .map((el) => {
            const _arr = []
            if (el.enginName) {
              _arr.push(el.enginName)
            }
            if (el.labelName) {
              _arr.push(el.labelName)
            }
            if (el.passType) {
              _arr.push(this.passTypeObj[el.passType])
            }
            return _arr.join('-')
          })

        return _mapList.toString()
      },
      /**
       * AI标签 信息labelType 3
       */
      AILabelDefect() {
        const _mapList = this.selectedImgLabels
          .filter((el) => el.labelType === 3)
          .map((el) => `${el.labelName ? el.labelName : ''}`)
        return _mapList.toString()
      },
      AIEnginDefect() {
        let _mapList = this.selectedImgLabels
          .filter((el) => el.labelType === 2) // 1 客户缺陷名 2 工程缺陷名 3 AI标签
          .map((el) => `${el.enginName ? el.enginName : ''}`)
        _mapList = [...new Set(_mapList)]
        return _mapList.toString()
      },
      /**
       * 更多信息
       */
      moreInfo_outline() {
        const _detailInfos = this.selectedImgInfo.detailInfos
        if (_detailInfos) {
          return JSON.parse(_detailInfos)
        }
        return ''
      },
    },
    watch: {},
    created() {},
    mounted() {},
    methods: {
      /**
       * 拷贝hash值
       */
      async copyHash(hashVal) {
        const { toClipboard } = useClipboard()
        await toClipboard(hashVal)
      },
    },
  }
</script>
<style scoped lang="scss">
  .empty-css {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .content {
    height: 100%;
  }
  .imgs-show-content {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: start;
    .data-img {
      position: relative;
    }
    .img-show {
      width: 128px;
      height: 128px;
      background-color: #f4f5f4;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      margin: 2px 0 0 2px;
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }
  .text-show {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f4f5f4;
    font-size: 14px;
  }
  img {
    vertical-align: middle;
  }

  p {
    font-size: 14px;
  }
  .label-info {
    font-size: 14px;
    .label-type {
      text-align: right;
    }
  }
  .title {
    padding: 3px;
    color: rgb(218, 98, 98);
    font-size: 16px;
    background: rgb(240, 238, 238);
  }
  .img-css {
    height: 128px;
    width: 128px;
    object-fit: contain;
    background-color: #f4f5f4;
  }
  :deep() {
    .el-descriptions .el-descriptions__title {
      font-size: 15px !important;
    }
  }
  .imgs-show-content,
  .checkInfo,
  .labelInfo,
  .result-info,
  .moreInfo,
  .checkResult {
    // overflow: hidden;
    border: 1px solid #eee;
    margin-top: 5px;
    border-radius: 8px;
    padding: 5px 15px 5px 5px;
    h5,
    h6 {
      margin: 0;
    }
  }
  .moreInfo,
  .result-info,
  .labelInfo {
    h6 {
      padding-left: 5px;
      background-color: #f6f8f9;
    }
    p {
      padding-left: 10px;
      margin: 2px 0;
    }
  }
  .result-tag,
  .label-tag {
    display: inline-block;
    width: 70px;
    text-align: right;
  }
  .moreinfo-tag {
    display: inline-block;
    width: 50px;
    text-align: right;
  }
</style>
