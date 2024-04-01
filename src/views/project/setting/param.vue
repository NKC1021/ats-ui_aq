<template>
  <div class="param-data-tool-container">
    <el-tabs
      v-model="active"
      class="tabs-set"
      style="height: 100%"
      tab-position="left"
      type="border-card"
    >
      <el-tab-pane :label="translate('参数配置')" name="param">
        <paramCom />
      </el-tab-pane>
      <el-tab-pane :label="translate('VRS配置')" name="vrsSet">
        <vrsSetCom />
      </el-tab-pane>
      <el-tab-pane :label="translate('VRS导航配置')" name="vrsNavSet">
        <vrsNavSetCom />
      </el-tab-pane>
      <!-- <el-tab-pane v-if="permissions.cloud_service" :label="$t('i18_standard_config')" name="standard">
          <standard></standard>
        </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import paramCom from '@/views/components/project/setting/param.vue'
  import vrsSetCom from '@/views/components/project/setting/vrsSet.vue'
  import vrsNavSetCom from '@/views/components/project/setting/vrsNavSet.vue'
  // import { mapGetters } from 'vuex'
  export default {
    components: {
      paramCom,
      vrsSetCom,
      vrsNavSetCom,
    },
    data() {
      return {
        active: 'vrsNavSet',
      }
    },
    computed: {
      translate() {
        return translate
      },
    },
  }
</script>

<style scoped lang="scss">
  .el-tabs {
    margin-left: 10px;
  }
  .tabs-set {
    :deep() {
      .el-tabs__content {
        height: 100%;
        .el-tab-pane {
          height: 100%;
        }
      }
    }
  }
</style>
