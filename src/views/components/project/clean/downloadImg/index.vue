<!--  -->
<template>
  <el-dialog
    v-model="downloadImgVis"
    :modal-append-to-body="false"
    :show-close="false"
    width="27%"
  >
    <el-form ref="exportImgRef" label-width="100px" :model="exportImgForm">
      <el-form-item
        :label="translate('图片类型')"
        prop="extName"
        :rules="{
          required: true,
          message: translate('必填'),
          trigger: 'change',
        }"
      >
        <el-select
          v-model="exportImgForm.extName"
          style="width: 100%"
          @change="exportTypeChange"
        >
          <el-option label="aqimg" :value="1" />
          <el-option label="png" :value="2" />
          <el-option label="jpg" :value="3" />
          <el-option label="bmp" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item :label="translate('图片效果')" prop="labelOption">
        <el-radio-group
          v-model="exportImgForm.labelOption"
          @change="labelOptionChange"
        >
          <el-radio :label="1">{{ translate('原图') }}</el-radio>
          <el-radio :label="2">{{ translate('标注效果图') }}</el-radio>
          <el-radio :label="3">{{ translate('AI效果图') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="translate('是否渲染')" prop="isRender">
        <!--    原图和aqimg不支持渲染    -->
        <el-checkbox
          v-model="exportImgForm.isRender"
          :disabled="
            exportImgForm.labelOption === 1 || exportImgForm.extName === 1
          "
          :false-label="0"
          :true-label="1"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="downloadImg">
        {{ translate('确定') }}
      </el-button>
      <el-button @click="downloadImgCancel">
        {{ translate('取消') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
  import { translate } from '@/i18n'
  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:show', 'downloadImg'],
    data() {
      return {
        exportImgForm: {
          extName: 4, // 默认导出bmp图片
          labelOption: 1,
          isRender: 0,
        },
      }
    },
    computed: {
      downloadImgVis: {
        get() {
          return this.show
        },
        set(newVal) {
          this.$emit('update:show', newVal)
        },
      },
      translate() {
        return translate
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      labelOptionChange() {
        this.exportImgForm.labelOption === 1 &&
          (this.exportImgForm.isRender = 0)
      },
      exportTypeChange() {
        this.exportImgForm.exportType === 1 && (this.exportImgForm.isRender = 0)
      },
      downloadImgCancel() {
        // this.$refs.exportImgRef.resetFields() 保留导出表单选项
        this.downloadImgVis = false
      },
      downloadImg() {
        this.$emit('downloadImg', this.exportImgForm)
        this.$nextTick(() => {
          this.downloadImgCancel()
        })
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
</style>
