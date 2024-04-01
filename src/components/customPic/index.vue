<template>
  <span class="headerAvatar">
    <template v-if="picType === 'avatar'">
      <el-avatar v-if="userStore.avatar" :size="30" :src="avatar" />
      <el-avatar v-else :size="30" :src="noAvatar" />
    </template>
    <template v-if="picType === 'img'">
      <img v-if="userStore.userInfo.headerImg" class="avatar" :src="avatar" />
      <img v-else class="avatar" :src="noAvatar" />
    </template>
    <template v-if="picType === 'file'">
      <img class="file" :src="file" />
    </template>
  </span>
</template>

<script>
  export default {
    name: 'CustomPic',
  }
</script>

<script setup>
  import noAvatarPng from '@/assets/noBody.png'
  import { useUserStore } from '@/store/modules/user'
  import { computed, ref } from 'vue'
  const props = defineProps({
    picType: {
      type: String,
      required: false,
      default: 'avatar',
    },
    picSrc: {
      type: String,
      required: false,
      default: '',
    },
  })
  const path = ref(`http://${window.location.hostname}:27401/`)
  const noAvatar = ref(noAvatarPng)

  const userStore = useUserStore()

  const avatar = computed(() => {
    if (props.picSrc === '') {
      if (userStore.avatar !== '' && userStore.avatar.slice(0, 4) === 'http') {
        return userStore.avatar
      }
      // return path.value + userStore.avatar
      return '' // 没有设置头像的也不从缓存里面拿了
    } else {
      if (props.picSrc !== '' && props.picSrc.slice(0, 4) === 'http') {
        return props.picSrc
      }

      return path.value + props.picSrc
    }
  })
  const file = computed(() => {
    if (props.picSrc && props.picSrc.slice(0, 4) !== 'http') {
      return path.value + props.picSrc
    }
    return props.picSrc
  })
</script>

<style scoped>
  .headerAvatar {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
  }
  .file {
    position: relative;
    width: 80px;
    height: 80px;
  }
</style>
