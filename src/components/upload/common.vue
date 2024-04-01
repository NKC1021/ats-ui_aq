<template>
  <div>
    <el-upload
      :action="uploadPath"
      :before-upload="checkFile"
      class="upload-btn"
      :headers="{ 'x-token': userStore.token }"
      :on-error="uploadError"
      :on-success="uploadSuccess"
      :show-file-list="false"
    >
      <!-- <el-button type="primary">普通上传</el-button> -->
      <slot></slot>
    </el-upload>
  </div>
</template>

<script setup>
  import { translate } from '@/i18n'
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  // import { useUserStore } from '@/pinia/modules/user'
  import { useUserStore } from '@/store/modules/user'
  const emit = defineEmits(['on-success'])
  const uploadPath = ref('')
  const userStore = useUserStore()
  console.log('登录用户信息', userStore)
  const fullscreenLoading = ref(false)

  const checkFile = (file) => {
    fullscreenLoading.value = true
    const isJPG = file.type === 'image/jpeg'
    const isPng = file.type === 'image/png'
    const isLt2M = file.size / 1024 / 1024 < 0.5
    if (!isJPG && !isPng) {
      ElMessage.error(translate('上传图片只能是 jpg或png 格式!'))
      fullscreenLoading.value = false
    }
    if (!isLt2M) {
      ElMessage.error(
        translate('未压缩未见上传图片大小不能超过 500KB，请使用压缩上传')
      )
      fullscreenLoading.value = false
    }
    return (isPng || isJPG) && isLt2M
  }

  const uploadSuccess = (res) => {
    const { data } = res
    if (data.url) {
      emit('on-success', data.url)
    }
  }

  const uploadError = () => {
    ElMessage({
      type: 'error',
      message: '上传失败',
    })
    fullscreenLoading.value = false
  }
  onMounted(() => {
    uploadPath.value = `http://${window.location.hostname}:27401/v2/file/upload`
  })
</script>

<script>
  export default {
    name: 'UploadCommon',
    methods: {},
  }
</script>
