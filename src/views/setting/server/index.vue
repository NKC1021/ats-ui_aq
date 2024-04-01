<!--  -->
<template>
  <div class="server-data-tool-container">
    <el-tabs
      v-model="tabActiveName"
      style="height: 100%"
      tab-position="left"
      type="border-card"
    >
      <el-tab-pane label="ATS" name="1">
        <atsServer :server-list="atsServerList" @get-server-list="listServer" />
      </el-tab-pane>

      <el-tab-pane label="共享服务" name="3">
        <authServer
          :service-list="authServiceList"
          @get-server-list="listServer"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import remoteApi from '@/api/remoteApi'
  import atsServer from '@/views/components/project/server/atsServer/index.vue'
  import authServer from '@/views/components/project/server/shareServer/index.vue'
  export default {
    components: { authServer, atsServer },
    data() {
      return {
        tabActiveName: '1',
        authServiceList: [],
        atsServerList: [],
      }
    },
    computed: {},
    //生命周期 - 创建完成（访问当前this实例）
    created() {
      this.listServer()
    },
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      /**
       * 获取服务列表
       */
      async listServer() {
        const res = await remoteApi.listServer()
        if (res.code === 0) {
          this.atsServerList = [...res.data].filter((el) => el.type === 1)
          this.authServiceList = [...res.data].filter((el) => el.type === 3)
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  :deep() {
    .el-tabs--border-card > .el-tabs__content {
      padding: 10px 10px 10px 0px;
      height: 100%;
      .el-tab-pane {
        height: 100%;
      }
    }
  }
</style>
