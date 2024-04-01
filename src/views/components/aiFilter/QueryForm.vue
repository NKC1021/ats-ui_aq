<!--
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-04-04 16:52:27
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-04-19 09:40:59
 * @FilePath: \admin-plus\src\views\index\aiFilterEquipment\QueryForm
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="ai-filter">
    <el-row>
      <el-col :span="22">
        <el-form
          inline
          :label-position="right"
          label-width="49px"
          :model="queryForm"
          @submit.prevent
        >
          <el-form-item :label="translate('机台')" label-width="43px">
            <el-select
              v-model="queryForm.machineName"
              clearable
              filterable
              :placeholder="translate('默认为全部机台')"
            >
              <el-option
                v-for="item in ARS_MACHINE"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-show="queryType.type === 'time'"
            :label="translate('料号')"
          >
            <el-select
              v-model="queryForm.productName"
              clearable
              filterable
              :placeholder="translate('默认为全部料号')"
            >
              <el-option
                v-for="item in ARS_PRODUCT"
                :key="item"
                :label="item"
                :value="item"
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
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="translate('时间')">
            <el-date-picker
              v-model="queryForm.dateArr"
              :end-placeholder="translate('结束时间')"
              range-separator="To"
              :shortcuts="shortcuts"
              :size="size"
              :start-placeholder="translate('开始时间')"
              type="datetimerange"
              unlink-panels
            />
          </el-form-item>
          <el-form-item
            v-show="queryType.type === 'time' && !isShowTable"
            class="query-time"
            :label="translate('时间维度')"
            label-width="80px"
          >
            <el-select
              v-model="queryForm.timeDimension"
              placeholder="默认选择第一个"
            >
              <el-option
                v-for="item in TIME_DIMENSION"
                :key="item.value"
                :label="translate(item.label)"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item class="query-button">
            <el-button
              icon="Search"
              native-type="submit"
              type="primary"
              @click="queryData"
            >
              {{ translate('查询') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="2" style="text-align: right">
        <el-button
          circle
          icon="Switch"
          type="primary"
          @click="HandleIsShowTable"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
  import dayjs from 'dayjs'
  import { shortcutsList } from '@/utils/timeConst'
  import {
    findArsFilterMachine,
    findArsFilterDetail,
    findArsFilterProduct,
    findArsFilterDate,
  } from '@/api/job'
  import { recordUserParma } from '@/store/modules/record'
  import { translate } from '@/i18n'
  const store = recordUserParma()
  const emits = defineEmits([
    'getData',
    'popoverSubmit',
    'HandleIsShowTable',
    'loadding',
  ])
  const props = defineProps({
    queryType: {
      type: Object,
      default: () => {},
    },
    // 记录父组件横坐标值
    queryTypeVal: {
      type: String,
      default: '',
    },
  })

  console.log(props.queryType)
  const queryForm = ref({
    dataSourceId: store.dataSourceId, //数据源id
    machineName: null, //机台
    modelName: null, //模型
    productName: null, //料号
    timeDimension: null, //查询时间维度
    startTime: '', //开始时间
    endTime: '', //结束时间

    dateArr: [],
    type: '过滤率',
    filterDisplaySet: 70, //低于设置值的变红色，可点击跳转报表
  })

  const shortcuts = shortcutsList
  const queryData = async () => {
    emits('loadding', true)

    // 构建时间属性
    queryForm.value.startTime = queryForm.value.dateArr[0]
    queryForm.value.endTime = queryForm.value.dateArr[1]
    let res
    if (!isShowTable.value) {
      // 柱状图模式
      switch (props.queryType.type) {
        case 'equipment':
          // 设备
          res = await findArsFilterMachine(queryForm.value)
          break
        case 'matnr': {
          // 料号

          res = await findArsFilterProduct(queryForm.value)
          break
        }
        case 'time':
          // 时间
          res = await findArsFilterDate(queryForm.value)
          //构造时间节点
          res.data = getDateByTimeDimension(
            res.data,
            queryForm.value.timeDimension
          )
          // console.log('res.data:::::', res)
          break
      }
    } else res = await findArsFilterDetail(queryForm)

    if (res.code === 0) {
      emits('getData', {
        isShowTable: isShowTable.value,
        data: res.data,
      })
    }
    emits('loadding', false)
  }

  const isShowTable = ref(false)
  const HandleIsShowTable = () => {
    emits('HandleIsShowTable', (isShowTable.value = !isShowTable.value))
    // 切换模式导致的请求，需要修改页面查询条件
    if (isShowTable.value) {
      switch (props.queryType.type) {
        case 'equipment':
          // 设备
          queryForm.value.machineName = props.queryTypeVal
          break
        case 'matnr': {
          // 料号
          queryForm.value.productName = props.queryTypeVal
          break
        }
        case 'time': {
          const dateList = transformDateByTimeDimension(
            props.queryTypeVal,
            queryForm.value.timeDimension
          )
          // 修改页面显示效果
          queryForm.value.dateArr[0] =
            dateList && dateList[0].getTime()
              ? dateList[0]
              : queryForm.value.startTime
          queryForm.value.dateArr[1] =
            dateList && dateList[1].getTime()
              ? dateList[1]
              : queryForm.value.endTime
          break
        }
      }
      // 使用完后清除数据
      emits('ClearQueryTypeVal')
    }
    queryData()
  }
  /**
   * 机台
   */
  const ARS_MACHINE = computed(() => {
    let _arr = []
    let _All = store.ARS_ALL
    if (queryForm.value.modelName) {
      _All = _All.filter((el) => {
        if (el.model === queryForm.value.modelName) {
          return el
        }
      })
    }
    if (queryForm.value.productName) {
      _All = _All.filter((el) => {
        if (el.product === queryForm.value.productName) {
          return el
        }
      })
    }
    _arr = _All.map((el) => el.machine)
    _arr = [...new Set(_arr)]
    return _arr
  })
  /**
   * 模型
   */
  const ARS_MODEL = computed(() => {
    let _arr = []
    let _All = store.ARS_ALL
    if (queryForm.value.machineName) {
      _All.filter((el) => {
        if (el.machine === queryForm.value.machineName) {
          return el
        }
      })
    }
    if (queryForm.value.productName) {
      _All = _All.filter((el) => {
        if (el.product === queryForm.value.productName) {
          return el
        }
      })
    }
    _arr = _All.map((el) => el.model)
    _arr = [...new Set(_arr)]
    return _arr
  })
  /**
   * 料号
   */
  const ARS_PRODUCT = computed(() => {
    let _arr = []
    let _All = store.ARS_ALL
    if (queryForm.value.machineName) {
      _All = _All.filter((el) => {
        if (el.machine === queryForm.value.machineName) {
          return el
        }
      })
    }
    if (queryForm.value.modelName) {
      _All = _All.filter((el) => {
        if (el.model === queryForm.value.modelName) {
          return el
        }
      })
    }
    _arr = _All.map((el) => el.product)
    _arr = [...new Set(_arr)]
    return _arr
  })
  const TIME_DIMENSION = ref([])
  // 获取字典表
  const getSysDictionary = async () => {
    const state = recordUserParma()
    TIME_DIMENSION.value = state.TIME_DIMENSION
    queryForm.value.timeDimension = TIME_DIMENSION.value[0].value
  }

  const init = async () => {
    await getSysDictionary()
    queryForm.value.dateArr = shortcutsList[3].value()
    queryData()
  }
  /**
   * 根据维度来控制时间范围
   */
  const getDateByTimeDimension = (data = [], timeDimension) => {
    let _tempData = []
    // 时 1  // 日2
    if ([1, 2].includes(timeDimension)) {
      _tempData = data.filter((el) => {
        const start = el.dataTime
        el.dataTime = `${dayjs(start).format('YYYY-MM-DD HH')}时`
        return el
      })
    }

    // 周 3
    if (timeDimension === 3) {
      _tempData = data.filter((el) => {
        const start = el.dataTime
        const end = new Date(
          new Date(start).getTime() + 1000 * 60 * 60 * 24 * 7 - 1000
        )
        el.dataTime = `${dayjs(start).format('YYYY-MM-DD HH')}时|${dayjs(
          end
        ).format('YYYY-MM-DD HH')}时`
        return el
      })
    }
    // 月 4
    if (timeDimension === 4) {
      _tempData = data.filter((el) => {
        const start = el.dataTime
        const end = new Date(
          new Date(start).getTime() + 1000 * 60 * 60 * 24 * 30 - 1000
        )
        el.dataTime = `${dayjs(start).format('YYYY-MM-DD HH')}时|${dayjs(
          end
        ).format('YYYY-MM-DD HH')}时`
        return el
      })
    }
    return _tempData
  }
  /**
   * 转换时间
   */
  const transformDateByTimeDimension = (dateVal = '', timeDimension) => {
    const _timeVal = dateVal.split('|')
    const _timeList = _timeVal.map((el) => {
      return el.replace('时', '')
    })

    if (timeDimension === 1) {
      const dateList = _timeList.map((el) => {
        return `${el}:00:00`
      })
      const start = new Date(dateList[0])
      const end = new Date(new Date(start).getTime() + 1000 * 60 * 60 - 1000)
      return [start, end]
    }
    if (timeDimension === 2) {
      const dateList = _timeList.map((el) => {
        return `${el}:00:00`
      })
      const start = new Date(dateList[0])
      const end = new Date(
        new Date(start).getTime() + 1000 * 60 * 60 * 24 - 1000
      )
      return [start, end]
    }
    if (timeDimension === 3) {
      const dateList = _timeList.map((el) => {
        return `${el}:00:00`
      })
      const start = new Date(dateList[0])
      const end = new Date(dateList[1])
      return [start, end]
    }
    if (timeDimension === 4) {
      const dateList = _timeList.map((el) => {
        return `${el}:00:00`
      })
      const start = new Date(dateList[0])
      const end = new Date(dateList[1])
      return [start, end]
    }
  }
  onMounted(() => {
    init()
  })
  defineExpose({
    HandleIsShowTable,
  })
</script>
<style lang="scss" scoped></style>
