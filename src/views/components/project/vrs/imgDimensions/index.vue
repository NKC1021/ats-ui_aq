<template>
  <div class="img-form-box">
    <el-popover placement="bottom" trigger="hover" :width="350">
      <el-form ref="formRef" label-width="75px" :model="queryForm">
        <el-form-item>
          <div class="btn-box">
            <el-button icon="Refresh" @click="resetForm">
              {{ translate('重置') }}
            </el-button>
            <el-button icon="Search" type="primary" @click="submitForm">
              {{ translate('确定') }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item :label="translate('缺陷类型')" prop="aiLabel">
          <el-select
            v-model="queryForm.aiLabel"
            allow-create
            clearable
            collapse-tags
            collapse-tags-tooltip
            :filter-method="filterAilabelMenthod"
            filterable
            multiple
            style="width: 100%"
            :teleported="false"
            @blur="blurMethod"
            @focus="focusMethod"
          >
            <el-option
              v-for="(el, index) in filterAilabel"
              :key="index"
              :label="el.label"
              :value="el.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="translate('工位')" prop="stationName">
          <el-select
            v-model="queryForm.stationName"
            allow-create
            clearable
            collapse-tags
            collapse-tags-tooltip
            :filter-method="filterStationNamesMethod"
            filterable
            multiple
            style="width: 100%"
            :teleported="false"
            @blur="blurMethod"
            @focus="focusMethod"
          >
            <el-option
              v-for="(el, index) in filterStationNames"
              :key="index"
              :label="el"
              :value="el"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="translate('AI结果')" prop="aiResult">
          <el-select
            v-model="queryForm.aiResult"
            clearable
            collapse-tags
            collapse-tags-tooltip
            multiple
            style="width: 100%"
            :teleported="false"
          >
            <el-option label="OK" value="OK" />
            <el-option label="NG" value="NG" />
          </el-select>
        </el-form-item>
        <el-form-item :label="translate('采图点位')" prop="capturePos">
          <el-input
            v-model="queryForm.capturePos"
            clearable
            :placeholder="
              translate('点位以英文\',\'分隔，连续用\'-\'拼接 eg:5,9-13')
            "
            :title="
              translate(
                '多个点位以英文\'，\'分隔，连续多个点位可用\'起始点位-结束点位\' 表示，eg:5,9-13'
              )
            "
            @blur="blurMethod"
            @focus="focusMethod"
            @input="
              queryForm.capturePos = queryForm.capturePos.replace(/，/g, ',')
            "
          />
        </el-form-item>
        <el-form-item :label="translate('人工结果')" prop="humanResult">
          <el-select
            v-model="queryForm.humanResult"
            clearable
            collapse-tags
            collapse-tags-tooltip
            multiple
            style="width: 100%"
            :teleported="false"
          >
            <el-option label="OK" value="OK" />
            <el-option label="NG" value="NG" />
            <el-option label="UnMarked" value="" />
          </el-select>
        </el-form-item>
        <el-form-item :label="translate('过检/漏检')" prop="resultType">
          <el-select
            v-model="queryForm.resultType"
            clearable
            collapse-tags
            collapse-tags-tooltip
            multiple
            style="width: 100%"
            :teleported="false"
          >
            <el-option :label="translate('过检')" :value="1" />
            <el-option :label="translate('漏检')" :value="2" />
            <el-option :label="translate('真实OK')" :value="3" />
            <el-option :label="translate('真实NG')" :value="4" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #reference>
        <el-button type="primary">
          {{ translate('图片筛选') }}
        </el-button>
      </template>
    </el-popover>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  export default {
    props: {
      stationNames: {
        type: Array,
        default: () => [],
      },
      labelNames: {
        type: Array,
        default: () => [],
      },
      bankeycode: {
        type: Boolean,
        default: false,
      },
      modelValue: {
        type: Object,
        default: () => ({
          stationName: [],
          capturePos: '',
          aiResult: [],
          aiLabel: [],
          humanResult: [],
          resultType: [],
        }),
      },
    },
    emits: ['update:bankeycode', 'submitForm', 'update:modelValue'],
    data() {
      return {
        searchStationStr: '',
        searchAilabelStr: '',
        visible: false,
      }
    },
    computed: {
      translate() {
        return translate
      },
      queryForm: {
        get() {
          return this.modelValue
        },
        set(newVal) {
          this.$emit('update:modelValue', newVal)
        },
      },
      filterStationNames() {
        if (this.searchStationStr) {
          return this.$pinyinSearch.matchPinyin(
            this.stationNames,
            this.searchStationStr
          )
        }
        return this.stationNames
      },
      filterAilabel() {
        if (this.searchAilabelStr) {
          return this.$pinyinSearch.matchPinyin(
            this.labelNames,
            this.searchAilabelStr,
            'label'
          )
        }
        return this.labelNames
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      blurMethod() {
        this.$emit('update:bankeycode', true)
      },
      focusMethod() {
        this.$emit('update:bankeycode', false)
      },
      filterStationNamesMethod(str) {
        this.searchStationStr = str
      },
      filterAilabelMenthod(str) {
        this.searchAilabelStr = str
      },
      resetForm() {
        this.$refs.formRef.resetFields()
      },
      submitForm() {
        this.$emit('submitForm', this.queryForm)
      },
    },
  }
</script>
<style scoped lang="scss">
  .img-form-box {
    display: inline-block;
    margin-left: 10px;
  }
  .el-form {
    :deep() {
      .el-form-item {
        margin-bottom: 5px;
      }
    }
  }
  .btn-box {
    width: 100%;
    text-align: right;
  }
</style>
