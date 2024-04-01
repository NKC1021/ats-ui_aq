<!--  -->
<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      :close-on-click-modal="false"
      :title="translate('设置Logo')"
      width="30%"
    >
      <el-upload
        ref="uploadRef"
        accept=".jpg,.jpeg,.png,.gif"
        action=""
        :auto-upload="false"
        :on-change="fileChange"
        :show-file-list="false"
      >
        <template #trigger>
          <el-button type="primary">{{ translate('选择文件') }}</el-button>
        </template>
        <div v-show="logoBase64" class="show-img">
          <img alt="" :src="logoBase64" />
        </div>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelUpload">
            {{ translate('取消') }}
          </el-button>
          <el-button type="primary" @click="submitUpload">
            {{ translate('确定') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import { setLogo } from '@/api/systemInfo'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:show'],
    data() {
      return {
        fileList: [],
        logoBase64: '',
      }
    },
    computed: {
      dialogVisible: {
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
      ...mapStores(recordProInfo),
    },

    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      fileChange(file) {
        this.imageToBase64(file.raw)
      },

      imageToBase64(file) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          // console.log(`file 转 base64结果：${reader.result}`)
          this.logoBase64 = reader.result
        }
        reader.onerror = (error) => {
          console.log('Error: ', error)
        }
      },
      cancelUpload() {
        this.logoBase64 = ''
        this.dialogVisible = false
      },
      /**
       * 提交表单
       */
      async submitUpload() {
        const res = await setLogo({ id: this.logoBase64 })
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.projectStore.setLogo(this.logoBase64)
          this.cancelUpload()
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  .show-img {
    height: 100px;
    width: 100%;
    border: 1px solid #ddd;
    box-sizing: border-box;
    margin-top: 5px;
    padding: 5px;
    border-radius: 5px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  /* @import url(); 引入css类 */
</style>
