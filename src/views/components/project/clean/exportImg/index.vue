<!--  -->
<template>
  <div>
    <el-dialog
      v-model="pickImgExportDialog"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :show-close="false"
      :title="translate('分图导出')"
      width="650px"
    >
      <el-form
        ref="pickImgExportRef"
        label-width="120px"
        :model="pickImgExportForm"
      >
        <el-form-item
          :label="translate('导出条件名称')"
          prop="name"
          :rules="{
            required: true,
            message: translate('必填'),
            trigger: 'change',
          }"
        >
          <el-input v-model="pickImgExportForm.name" />
        </el-form-item>
        <el-form-item
          :label="translate('图片数量')"
          prop="picNum"
          :rules="{
            required: true,
            message: translate('必填'),
            trigger: 'change',
          }"
        >
          <el-select v-model="pickImgExportForm.picNum" style="width: 100%">
            <el-option label="1" value="1" />
            <el-option label="2" value="2" />
            <el-option label="3" value="3" />
            <el-option label="4" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item
          :label="translate('图片类型')"
          prop="imgType"
          :rules="{
            required: true,
            message: translate('必填'),
            trigger: 'change',
          }"
        >
          <el-select v-model="pickImgExportForm.imgType" style="width: 100%">
            <el-option label="PNG" value="PNG" />
            <el-option label="BMP" value="BMP" />
          </el-select>
        </el-form-item>
        <el-form-item
          :label="translate('导出类型')"
          prop="type"
          :rules="{
            required: true,
            message: translate('必填'),
            trigger: 'change',
          }"
        >
          <el-row :gutter="15">
            <el-col :span="17">
              <el-select
                v-model="pickImgExportForm.type"
                style="width: 100%"
                @change="typeChange"
              >
                <el-option :label="translate('指定目录')" :value="1" />
                <el-option
                  :label="translate('AIDI工程(首个模块)')"
                  :value="2"
                />
                <el-option
                  :label="translate('AIDI工程(工厂模式)')"
                  :value="3"
                />
              </el-select>
            </el-col>
            <el-col :span="7">
              <el-checkbox
                v-model="pickImgExportForm.keepOriginName"
                :disabled="pickImgExportForm.type !== 1"
                :label="translate('保留原始文件名')"
                size="large"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item :label="translate('图片效果')">
          <el-row :gutter="15">
            <el-col :span="17">
              <el-select
                v-model="pickImgExportForm.labelOption"
                style="width: 100%"
                @change="labelOptionChangeChange"
              >
                <el-option :label="translate('原图')" :value="1" />
                <el-option :label="translate('标注效果图')" :value="2" />
                <el-option :label="translate('AI效果图')" :value="3" />
              </el-select>
            </el-col>
            <el-col :span="7">
              <el-checkbox
                v-model="pickImgExportForm.isRender"
                :disabled="
                  pickImgExportForm.type !== 1 ||
                  pickImgExportForm.labelOption === 1
                "
                :false-label="0"
                :label="translate('是否渲染')"
                size="large"
                :true-label="1"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          :label="translate('导出路径')"
          prop="path"
          :rules="{
            required: true,
            message: translate('必填'),
            trigger: 'change',
          }"
        >
          <el-input v-model="pickImgExportForm.path" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="pickImgExportSubmit">
          {{ translate('确定') }}
        </el-button>
        <el-button @click="pickImgExportCancel">
          {{ translate('取消') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
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
    emits: ['update:show', 'exportSubmit'],
    data() {
      return {
        labelOptionName: {
          1: translate('原图'),
          2: translate('标注效果图'),
          3: translate('AI效果图'),
        },
        pickImgExportForm: {
          name: '清洗页面创建分图导出任务',
          picNum: '1',
          imgType: 'PNG',
          type: 1,
          path: '',
          keepOriginName: false,
          labelOption: 1, // 1: 原图 2: 标注效果图 3: AI效果图
          isRender: 0,
        },
        exportImgPathTypeList: [
          {
            label: translate('指定目录'),
            value: 1,
          },
          {
            label: translate('AIDI工程(首个模块)'),
            value: 2,
          },
          {
            label: translate('AIDI工程(工厂模式)'),
            value: 3,
          },
        ],
      }
    },
    computed: {
      translate() {
        return translate
      },
      pickImgExportDialog: {
        get() {
          return this.show
        },
        set(newVal) {
          this.$emit('update:show', newVal)
        },
      },
    },
    watch: {
      pickImgExportDialog(newVal) {
        !newVal && this.pickImgExportCancel()
      },
    },
    created() {},
    methods: {
      labelOptionChangeChange() {
        if (this.pickImgExportForm.labelOption === 1) {
          this.pickImgExportForm.isRender = 0
        }
      },
      pickImgExportSubmit() {
        this.$refs.pickImgExportRef.validate(async (val) => {
          if (!val) return
          this.$emit('exportSubmit', this.pickImgExportForm)
        })
      },
      pickImgExportCancel() {
        this.pickImgExportForm.keepOriginName = false
        this.$refs.pickImgExportRef.resetFields()
        this.pickImgExportDialog = false
      },
      /**
       * 导出类型变化：指定目录、AIDI工程(首个模块)、AIDI工程(工厂模式)
       * （1）导出到AI工程的图片不可渲染
       */
      typeChange() {
        this.pickImgExportForm.keepOriginName = false
        if (
          this.pickImgExportForm.type === 3 ||
          this.pickImgExportForm.type === 2
        ) {
          // 导出到AIDI工程
          console.log('导出到AIDI工程，不可渲染')
          this.pickImgExportForm.isRender = 0
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  .el-row {
    width: 100%;
  }
  /* @import url(); 引入css类 */
</style>
