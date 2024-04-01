<!--  -->
<template>
  <div v-show="visible" class="download">
    <el-card :body-style="{ minWidth: '250px' }" shadow="always">
      <div class="header">
        <span>正在下载,请稍等</span>
        <el-button icon="Close" link type="primary" @click="closeDownload" />
      </div>
      <el-progress
        v-for="(item, index) in progressList"
        :key="index"
        :percentage="item.progress"
      />
    </el-card>
  </div>
</template>

<script>
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
  export default {
    data() {
      return {
        visible: false,
      }
    },
    computed: {
      ...mapStores(recordProInfo),
      progressList() {
        return this.projectStore.progressList
      },
      progressLength() {
        return this.projectStore.progressList.length
      },
    },
    watch: {
      progressLength(newVal) {
        this.visible = Boolean(newVal)
      },
      progressList: {
        handler() {
          const flag = this.progressList.every((el) => el.progress === 100)
          if (flag) {
            setTimeout(() => {
              this.closeDownload()
            }, 1000)
          }
        },
        deep: true,
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {
      window.addEventListener('beforeunload', this.handleBeforeUnload)
    },
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {
    },
    unmounted() {
      window.removeEventListener('beforeunload', this.handleBeforeUnload)
    },
    methods: {
      closeDownload() {
        this.projectStore.progressList = this.progressList.filter(
          (el) => el.progress !== 100
        )
      },
      // 未下载完成提醒
      handleBeforeUnload(e) {
        if (this.progressLength === 0) {
          return
        }
        e.returnValue = 'ReturnValue 只要不为空字符串就可以触发浏览器自带的确认逻辑'
      },
    },
  }
</script>
<style scoped lang="scss">
  .download {
    position: fixed;
    left: 25px;
    bottom: 50px;
    .header {
      padding: 0 5px 5px;
      border-bottom: 1px solid #f4f4f5;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
    }
  }
  /* @import url(); 引入css类 */
</style>
