<template>
  <vab-query-form class="query-form">
    <vab-query-form-left-panel :span="24">
      <el-form
        class="form-bottom"
        inline
        label-position="right"
        label-width="49px"
        :model="searchInfo"
      >
        <el-form-item
          v-if="showkeys.includes('machineName')"
          :label="translate('机台')"
        >
          <el-select
            v-model="searchInfo.machineName"
            clearable
            filterable
            :placeholder="translate('默认为全部机台')"
            @clear="searchInfo.machineName = null"
          >
            <el-option
              v-for="(el, index) in machineNameList"
              :key="index"
              :label="el"
              :value="el"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="showkeys.includes('modelName')"
          :label="translate('模型')"
        >
          <el-select
            v-model="searchInfo.modelName"
            clearable
            filterable
            :placeholder="translate('默认为全部模型')"
            @clear="searchInfo.modelName = null"
          >
            <el-option
              v-for="(item, index) in modelNameList"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="showkeys.includes('productName')"
          :label="translate('料号')"
        >
          <el-select
            v-model="searchInfo.productName"
            clearable
            filterable
            :placeholder="translate('默认为全部料号')"
            @clear="searchInfo.productName = null"
          >
            <el-option
              v-for="(item, index) in productNameList"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="showkeys.includes('peopleName')"
          :label="translate('人员')"
        >
          <el-select
            v-model="searchInfo.peopleName"
            clearable
            filterable
            :placeholder="translate('默认为全部人员')"
            @clear="searchInfo.peopleName = null"
          >
            <el-option
              v-for="(item, index) in peopleNameList"
              :key="index"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="showkeys.includes('targetVal')"
          class="query-input-number"
          :label="translate('目标值')"
          label-width="62px"
        >
          <el-input-number
            v-model="searchInfo.targetVal"
            :max="100"
            :precision="2"
            :step="0.01"
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item
          v-if="showkeys.includes('dateTimes')"
          :label="translate('时间')"
        >
          <el-date-picker
            v-model="searchInfo.dateTimes"
            :end-placeholder="translate('结束日期')"
            range-separator="To"
            :shortcuts="shortcuts"
            :start-placeholder="translate('开始日期')"
            type="datetimerange"
          />
        </el-form-item>
        <el-form-item
          v-if="showkeys.includes('timeDimension')"
          :label="translate('时间维度')"
          label-width="80px"
        >
          <el-select v-model="searchInfo.timeDimension">
            <el-option
              v-for="(item, index) in timesList"
              :key="index"
              :label="translate(item.label)"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <slot name="search"></slot>
          <slot></slot>
        </el-form-item>
      </el-form>
    </vab-query-form-left-panel>
  </vab-query-form>
</template>
<script setup>
  import { computed } from 'vue'
  import { shortcutsList } from '@/utils/timeConst'
  import { recordUserParma } from '@/store/modules/record'
  import { translate } from '@/i18n'
  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => {
        return {}
      },
    },
  })
  const emit = defineEmits(['update:modelValue'])
  const store = recordUserParma()
  const shortcuts = shortcutsList
  const peopleNameList = ref([])
  const timesList = ref([])
  const searchInfo = computed({
    get() {
      return new Proxy(props.modelValue, {
        set(obj, name, val) {
          emit('update:modelValue', {
            ...obj,
            [name]: val,
          })
          return true
        },
      })
    },
    set(newVal) {
      emit('update:modelValue', newVal)
    },
  })
  searchInfo.value.dateTimes = shortcutsList[3].value()
  const showkeys = computed({
    get() {
      if (JSON.stringify(props.modelValue) !== '{}') {
        return Object.keys(props.modelValue)
      } else {
        return []
      }
    },
  })
  /**
   * 机台
   */
  const machineNameList = computed(() => {
    let _arr = []
    let _All = store.ARS_ALL
    if (searchInfo.value.modelName) {
      _All = _All.filter((el) => {
        if (el.model === searchInfo.value.modelName) {
          return el
        }
      })
    }
    if (searchInfo.value.productName) {
      _All = _All.filter((el) => {
        if (el.product === searchInfo.value.productName) {
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
  const modelNameList = computed(() => {
    let _arr = []
    let _All = store.ARS_ALL
    if (searchInfo.value.machineName) {
      _All &&
        _All.filter((el) => {
          if (el.machine === searchInfo.value.machineName) {
            return el
          }
        })
    }
    if (searchInfo.value.productName) {
      _All = _All.filter((el) => {
        if (el.product === searchInfo.value.productName) {
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
  const productNameList = computed(() => {
    let _arr = []
    let _All = store.ARS_ALL
    if (searchInfo.value.machineName) {
      _All = _All.filter((el) => {
        if (el.machine === searchInfo.value.machineName) {
          return el
        }
      })
    }
    if (searchInfo.value.modelName) {
      _All = _All.filter((el) => {
        if (el.model === searchInfo.value.modelName) {
          return el
        }
      })
    }
    _arr = _All.map((el) => el.product)
    _arr = [...new Set(_arr)]
    return _arr
  })
  peopleNameList.value = store.ARS_USER
  timesList.value = JSON.parse(JSON.stringify(store.TIME_DIMENSION))
  // console.log('llll', store.ARS_ALL)
  const addTimeList = (obj) => {
    timesList.value.push(obj)
  }
  defineExpose({ addTimeList })
</script>
