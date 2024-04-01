<!--
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-02-06 11:59:51
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-04-23 15:21:58
 * @FilePath: \admin-plus\src\views\index\defectMapping\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="mapping-container">
    <el-row :gutter="5">
      <el-col :span="4">
        <el-tabs v-model="activeName" class="option-tabs" style="height: 100%">
          <el-tab-pane
            :label="translate('查询')"
            name="first"
            style="height: 100%"
          >
            <div class="pane-container col-content query-form">
              <div class="title">{{ translate('查询条件') }}</div>
              <el-form
                :label-position="left"
                label-width="49px"
                :model="queryForm"
                @submit.prevent
              >
                <el-form-item :label="translate('机台')">
                  <el-select
                    v-model="queryForm.machineName"
                    clearable
                    filterable
                    :placeholder="translate('默认为全部机台')"
                  >
                    <el-option
                      v-for="item in ARS_MACHINE"
                      :key="item.label"
                      :label="item.label"
                      :value="item.label"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item :label="translate('料号')">
                  <el-select
                    v-model="queryForm.productName"
                    clearable
                    filterable
                    :placeholder="translate('默认为全部料号')"
                  >
                    <el-option
                      v-for="item in ARS_PRODUCT"
                      :key="item.label"
                      :label="item.label"
                      :value="item.label"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item :label="translate('模型')">
                  <el-select
                    v-model="queryForm.modelName"
                    clearable
                    filterable
                    :placeholder="translate('默认为全部模型')"
                  >
                    <el-option
                      v-for="item in ARS_MODEL"
                      :key="item.label"
                      :label="item.label"
                      :value="item.label"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item class="query-time-arr" :label="translate('时间')">
                  <el-date-picker
                    v-model="queryForm.startTime"
                    placeholder="Pick a day"
                    type="date"
                  />
                </el-form-item>
                <el-form-item class="query-time" :label="translate('维度')">
                  <el-select
                    v-model="queryForm.timeDimension"
                    :placeholder="translate('请选择')"
                  >
                    <el-option
                      v-for="item in TIME_DIMENSION"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item class="query-time" label="LOT">
                  <el-select
                    v-model="queryForm.lot"
                    clearable
                    :placeholder="translate('请选择')"
                  >
                    <el-option
                      v-for="item in testDataList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item class="query-time" :label="translate('面别')">
                  <el-select
                    v-model="queryForm.surfaceType"
                    clearable
                    :placeholder="translate('请选择')"
                  >
                    <el-option
                      v-for="item in testDataList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item class="query-button">
                  <el-button
                    icon="Search"
                    native-type="submit"
                    type="primary"
                    @click="clickQuery"
                  >
                    {{ translate('查询') }}
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="translate('展示配置')" name="second">
            <div class="pane-container">
              <div class="title">
                {{ translate('绘图配置') }}
                <el-button
                  icon="Refresh"
                  link
                  plain
                  size="small"
                  type="primary"
                  @click="handleRedrawPic"
                >
                  {{ translate('刷新') }}
                </el-button>
              </div>
              <el-checkbox v-model="redrawPic.defect">
                {{ translate('缺陷点') }}
              </el-checkbox>
              <el-checkbox v-model="redrawPic.hotPic">
                {{ translate('热力图') }}
              </el-checkbox>
            </div>
            <!-- <el-divider /> -->
            <div class="pane-container">
              <div class="title">
                {{ translate('绘制类别') }}
                <el-button
                  icon="Refresh"
                  link
                  plain
                  size="small"
                  type="primary"
                  @click="handleRedrawPic"
                >
                  {{ translate('刷新') }}
                </el-button>
              </div>
              <el-checkbox-group
                v-model="queryForm.defectTypeList"
                class="defect-type-list"
              >
                <el-checkbox
                  v-model="checkAll"
                  class="m-l-20"
                  :indeterminate="
                    allDefectList.length == queryForm.defectTypeList.length
                  "
                  @change="selectAllDefects"
                >
                  {{ translate('全部') }}
                </el-checkbox>
                <div
                  v-for="item in allDefectList"
                  :key="item"
                  class="defect-item"
                >
                  <el-checkbox :label="item" />
                  <el-color-picker
                    v-model="defectColor[item]"
                    :predefine="predefineColors"
                  
                  />
                </div>
              </el-checkbox-group>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
      <el-col :span="16">
        <div class="col-content">
          <picCanvas
            :defect-color="defectColor"
            :pic-data="picData"
            :redraw-pic="redrawPic"
            @picEvent="picEvent"
          />
        </div>
      </el-col>
      <el-col :span="4">
        <el-tabs class="option-tabs" style="height: 100%">
          <el-tab-pane :label="translate('详情')" style="height: 100%">
            <div class="pane-container">
              <div class="title">
                {{ translate('区域缺陷点详情') }}
              </div>
              <div class="detail-container">
                <div
                  v-for="item in defectArr"
                  :key="item.id"
                  class="detail-item"
                >
                  {{ translate('AI缺陷') }} {{ '：' + item.defectType }}
                  <br />
                  {{ translate('横坐标') }}{{ '：' + item.showX }}
                  <br />
                  {{ translate('纵坐标') }} {{ '：' + item.showY }}
                  <br />
                  {{ translate('报点数') }} {{ '：' + item.defectNum }}
                  <br />
                  <br />
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane
            disabled
            :label="translate('调色板')"
            style="height: 100%"
          >
            {{ translate('调色板') }}
          </el-tab-pane>
        </el-tabs>
        <!-- <div class="col-content">
          <div class="pane-container">
          </div> -->
        <!-- <div class="container">
            <div ref="topRef" class="top" :style="{ height: topHeight }"></div>
            <div ref="dragbar" class="dragbar" @mousedown="startDrag"></div>
            <div class="bottom" :style="{ height: bottomHeight }"></div>
          </div> -->
        <!-- </div> -->
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
  import { translate } from '@/i18n'
  import { recordUserParma } from '@/store/modules/record'
  import { shortcutsList } from '@/utils/timeConst'
  import { colorConstant, pointData, defectList } from './config'
  import picCanvas from './picCanvas'
  import { ref } from 'vue'
  import { imgData } from './img'
  const store = recordUserParma()

  const activeName = ref('first')
  //重画mapping图控制
  const redrawPic = ref({
    defect: true,
    hotPic: true,
    redraw: 0,
  })

  // 颜色相关处理
  const checkAll = ref(false)
  const allDefectList = ref(defectList)
  const defectColor = ref({})
  const predefineColors = ref(colorConstant.default)
  allDefectList.value.forEach((val, index) => {
    defectColor.value[val] = colorConstant.defect[index]
  })
  const selectAllDefects = (checked) => {
    if (checked) {
      allDefectList.value.forEach((item) => {
        queryForm.value.defectTypeList.push(item)
      })
    } else {
      queryForm.value.defectTypeList = []
    }
  }

  const testDataList = ref([
    {
      label: '假数据1',
      value: '假数据1',
    },
  ])
  const queryForm = ref({
    dataSourceId: store.dataSourceId, //数据源id
    machineName: null, //机台
    modelName: null, //模型
    productName: null, //料号
    timeDimension: null, //查询时间维度
    startTime: shortcutsList[0].value()[0], //开始时间
    endTime: shortcutsList[0].value()[1], //结束时间
    dateArr: shortcutsList[1].value(),
    defectTypeList: [],
    lot: null, //模型
    surfaceType: null, //模型
  })

  // 获取字典表
  const ARS_MACHINE = ref([])
  const ARS_MODEL = ref([])
  const ARS_PRODUCT = ref([])
  const TIME_DIMENSION = ref([])
  const getSysDictionary = async () => {
    const state = recordUserParma()
    ARS_MACHINE.value = state.ARS_MACHINE
    ARS_MODEL.value = state.ARS_MODEL
    ARS_PRODUCT.value = state.ARS_PRODUCT
    TIME_DIMENSION.value = state.TIME_DIMENSION
    queryForm.value.timeDimension = TIME_DIMENSION.value[0].value
  }

  // 子组件的回调
  const defectArr = ref([])
  const picEvent = (data) => {
    defectArr.value = []
    defectArr.value = [...data]
  }

  // 点击查询 & 刷新mapping图
  const clickQuery = () => {
    activeName.value = 'second'
    handleRedrawPic()
  }

  // 重画刷新mapping图
  const picData = ref({})
  const handleRedrawPic = () => {
    picData.value.gerberImage = imgData
    picData.value.mappingDefectList = pointData
    redrawPic.value.redraw = new Date().getTime()
  }

  // 页面初始化
  const init = async () => {
    await getSysDictionary()
    queryForm.value.dateArr = shortcutsList[3].value()
    handleRedrawPic()
  }

  onMounted(() => {
    init()
  })
</script>
<style lang="scss" scoped>
  .pane-container {
    margin-top: 25px;
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 25px;
      padding-bottom: 10px;
      margin-bottom: 10px;
      color: var(--el-color-primary);
      border-bottom: 1px solid var(--el-color-primary);
    }
  }
  .detail-container {
    height: 620px;
    overflow-y: auto;
  }
  .option-tabs {
    background: var(--el-color-primary-light-9);
  }
  :deep() {
    .el-tabs__nav {
      padding-left: 12px;
    }
    .el-tabs__header {
      margin: 0 3px !important;
      box-shadow: 0px 2px 4px 0px #ebebeb;
    }

    .el-tabs__header {
      margin: 0;
    }
    .el-divider--horizontal {
      margin: 20px 0 20px 0 !important;
    }
    .el-form-item__label {
      align-items: center;
      justify-content: flex-start;
    }
    .el-tab-pane {
      padding: 0px 15px 15px 15px;
    }
    .el-row {
      height: 100%;
      margin-bottom: 20px;
    }
    .el-row:last-child {
      margin-bottom: 0;
    }
    .el-col {
      border-radius: 4px;
    }

    .col-content {
      height: 100%;
      background: var(--el-color-primary-light-9);
      border-radius: 4px;
    }
    .el-color-picker--mini {
      top: -2px;
      height: 19px;
      padding-left: 3px;
    }
    .el-color-picker__trigger {
      width: 19px;
      height: 19px;
      padding: 1px;
    }
    .el-color-picker__icon {
      left: 0px;
    }
  }
  .defect-type-list {
    height: 528px;
    overflow-y: auto;
  }

  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .top,
  .bottom {
    flex: 1;
    height: 50%;
    background: #c5c1c1;
  }

  .dragbar {
    width: 100%;
    height: 10px;
    cursor: ns-resize;
    background-color: gray;
  }
  .mapping-container {
    padding: 0 0 5px 0 !important;
    background: #f6f8f9 !important;
  }
  .defect-item {
    height: 30px;
  }
</style>
