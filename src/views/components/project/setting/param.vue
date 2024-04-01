<template>
  <div class="box-container">
    <div class="param">
      <h4>{{ translate('测量颜色设置') }}</h4>
      <el-form label-width="100px" :model="form">
        <el-row>
          <el-col :span="3">
            <el-form-item :label="translate('测量框颜色')">
              <el-color-picker v-model="form.roiFrameColor" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item :label="translate('测量字体颜色')">
              <el-color-picker v-model="form.roiFontColor" />
            </el-form-item>
          </el-col>
        </el-row>
        <h4>{{ translate('像素精度设置') }}</h4>
        <el-form-item :label="translate('像素精度设置')">
          <el-input-number
            v-model="form.roiPrecision"
            controls-position="right"
            :min="0"
            :precision="2"
            :step="0.1"
            @change="validateRoiPrecision"
          />
          <span>um</span>
        </el-form-item>
      </el-form>

      <el-row>
        <el-col class="params-btns" :span="6">
          <div>
            <el-button
              icon="el-icon-refresh-left"
              type="primary"
              @click="resetProjectConfig"
            >
              {{ translate('恢复默认') }}
            </el-button>
            <el-button
              icon="el-icon-circle-check"
              type="primary"
              @click="updateProjectConfig"
            >
              {{ translate('应用') }}
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import { setStore } from '@/utils/storage'
  import solutionConfig from '@/api/solutionConfig'
  export default {
    data() {
      return {
        form: {
          userProjectConfigId: 0, // 默认的roi配置信息
          roiFrameColor: '#00ff00',
          roiFontColor: '#000000',
          roiPrecision: 0.0,
        },
        resetForm: {
          roiFrameColor: '',
          roiFontColor: '',
          roiPrecision: null,
        },
      }
    },
    computed: {
      translate() {
        return translate
      },
    },
    created() {
      this.getProjectConfig()
    },
    methods: {
      /**
       * @desc 设置用户-重置表单默认值
       */
      resetProjectConfig() {
        Object.keys(this.resetForm).forEach((k) => {
          this.form[k] = this.resetForm[k]
        })
        console.log(this.form)
      },
      /**
       * validateRoiFontColor - 验证roiFontColor：与数据库限制条件保持一致
       */
      validateRoiPrecision() {
        // Validate roiPrecision here
        const value = this.form.roiPrecision.toString()
        const regex = /^\d{0,3}(\.\d{0,2})?$/

        if (!regex.test(value)) {
          // Invalid precision format
          this.$message.error('请输入有效的数值，最多两位小数，最多五个数字。')
          // Reset to previous value or set to null
          this.form.roiPrecision = 0
        }
      },
      /**
       * @desc 设置用户-项目维度配置信息
       */
      async updateProjectConfig() {
        this.validateRoiPrecision()

        const res = await solutionConfig.saveOrUpdateUserProjectConfig({
          id:
            this.form.userProjectConfigId !== 0
              ? this.form.userProjectConfigId
              : null,
          roiFrameColor: this.form.roiFrameColor,
          roiFontColor: this.form.roiFontColor,
          roiPrecision: this.form.roiPrecision,
        })

        if (res.code === 0) {
          // 左侧提示框
          this.$notify({
            showClose: false,
            type: 'success',
            title: '保存成功',
            position: 'top-left',
          })
          this.getProjectConfig()
        }
      },
      /**
       * @desc 获取用户-项目维度配置信息
       */
      async getProjectConfig() {
        const res = await solutionConfig.getUserProjectConfig({})
        // 获取不到项目配置则使用默认值
        if (res.code === 0 && res.data) {
          this.form.userProjectConfigId = res.data.id
          this.form.roiFrameColor = res.data.roiFrameColor
            ? res.data.roiFrameColor
            : '#00ff00'
          this.form.roiFontColor = res.data.roiFontColor
            ? res.data.roiFontColor
            : '#000000'
          this.form.roiPrecision = res.data.roiPrecision
            ? res.data.roiPrecision
            : 0.0
        } else {
          this.form.roiFrameColor = '#00ff00'
          this.form.roiFontColor = '#000000'
          this.form.roiPrecision = 0.0
        }
        Object.keys(this.resetForm).forEach((k) => {
          this.resetForm[k] = this.form[k]
        })
        setStore({
          name: 'roiFrameColor',
          content: this.form.roiFrameColor,
          type: 'session',
        })
        setStore({
          name: 'roiFontColor',
          content: this.form.roiFontColor,
          type: 'session',
        })
        setStore({
          name: 'roiPrecision',
          content: this.form.roiPrecision,
          type: 'session',
        })
      },
    },
  }
</script>

<style scoped lang="scss">
  .params-btns {
    padding: 40px;
    text-align: center;
  }
</style>
