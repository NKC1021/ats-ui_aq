<template>
  <div class="defect-config-box">
    <el-popover placement="right" trigger="hover" :width="250">
      <el-form label-width="75px" :model="vrsCutConfig" size="small">
        <p class="title">{{ translate('设置') }}</p>
        <el-form-item :label="translate('全屏')" prop="isFullScreen">
          <el-checkbox v-model="vrsCutConfig.isFullScreen" />
        </el-form-item>
        <el-form-item :label="translate('显示大图')" prop="isShowImg">
          <el-checkbox v-model="vrsCutConfig.isShowImg" />
        </el-form-item>
        <el-form-item :label="translate('图片列表')" prop="isShowImgInfoList">
          <el-checkbox v-model="vrsCutConfig.isShowImgInfoList" />
        </el-form-item>
        <el-form-item :label="translate('裁剪尺寸')" prop="cutDefectMinSize">
          <el-input-number
            v-model="vrsCutConfig.cutDefectMinSize"
            controls-position="right"
            :min="1"
            style="width: 100px"
            @blur="inputNumberBlur"
            @focus="inputNumberFocus"
          />
        </el-form-item>
        <p class="title">{{ translate('小图行列') }}</p>
        <el-form-item label="行数">
          <el-input-number
            v-model="vrsCutConfig.rowSet"
            controls-position="right"
            :max="6"
            :min="1"
            style="width: 100px"
            @blur="inputNumberBlur"
            @focus="inputNumberFocus"
          />
        </el-form-item>
        <el-form-item :label="translate('列数')">
          <el-input-number
            v-model="vrsCutConfig.colSet"
            controls-position="right"
            :max="6"
            :min="1"
            style="width: 100px"
            @blur="inputNumberBlur"
            @focus="inputNumberFocus"
          />
        </el-form-item>

        <el-form-item>
          <div class="btns-box">
            <el-button type="primary" @click="setConfirm">
              {{ translate('确定') }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #reference>
        <el-icon class="icon-setting"><Setting /></el-icon>
      </template>
    </el-popover>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  export default {
    props: {
      modelValue: {
        type: Object,
        default: () => ({}),
      },
      keyCodeFlag: {
        type: Boolean,
        default: false,
      },
      // 用作比较 是否保存到数据库
      startVrsset: {
        type: Object,
        default: () => ({}),
      },
    },
    emits: ['update:modelValue', 'setConfirm', 'update:keyCodeFlag'],
    data() {
      return {}
    },
    computed: {
      translate() {
        return translate
      },
      vrsCutConfig: {
        get() {
          return this.modelValue
        },
        set(newVal) {
          this.$emit('update:modelValue', newVal)
        },
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      setConfirm() {
        // 表单若没有变化就不用发请求
        const _flag = this.isObjectEqual(this.startVrsset, this.modelValue)
        if (_flag) return
        const _isRequest =
          this.startVrsset.cutDefectMinSize !==
            this.modelValue.cutDefectMinSize ||
          this.startVrsset.isShowImg !== this.modelValue.isShowImg
        // 裁剪尺寸变化才发请求
        this.$emit('setConfirm', _isRequest)
        this.$notify.closeAll()
        this.$notify({
          title: translate('提示'),
          message: translate('已保存配置'),
          type: 'warning',
          position: 'top-left',
        })
      },
      inputNumberFocus() {
        this.$emit('update:keyCodeFlag', false)
      },
      inputNumberBlur() {
        this.$emit('update:keyCodeFlag', true)
      },
      /**
       * 判断两个对象是否一值
       */
      isObjectEqual(obj1, obj2) {
        const obj1Keys = Object.keys(obj1)
        const obj2Keys = Object.keys(obj2)

        if (obj1Keys.length !== obj2Keys.length) {
          return false
        }
        for (const key of obj1Keys) {
          if (obj1[key] !== obj2[key]) {
            return false
          }
        }

        return true
      },
    },
  }
</script>
<style scoped lang="scss">
  .defect-config-box {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translate(-50%, -50%);
    transition: 0.3s all;
    z-index: 2000;
    .icon-setting {
      padding: 2px;
      background: var(--el-color-primary);
      border-radius: 2px;
      font-size: 20px;
      color: #fff;
    }
    &:hover {
      transform: translate(0, -50%);
    }
  }
  .title {
    margin: 0;
  }
  .btns-box {
    width: 100%;
    text-align: right;
  }
  .el-form {
    :deep() {
      .el-form-item {
        margin-bottom: 5px;
      }
    }
  }
</style>
