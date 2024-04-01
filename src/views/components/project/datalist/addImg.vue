<!--  -->
<template>
  <div class="body-content">
    <el-row class="head-nav">
      <el-col :span="12">
        <el-button icon="Back" type="primary" @click="goBack">
          {{ translate('返回') }}
        </el-button>
      </el-col>
    </el-row>
    <div class="main-content">
      <el-tabs
        v-model="tabNameVal"
        style="height: 100%"
        tab-position="left"
        type="border-card"
      >
        <el-tab-pane :label="translate('数据导入')" name="1">
          <addByFile
            :all-data-list="allDataList"
            :criteria-data="criteriaData"
            :currnt-row="currentRow"
            @upload-file-success="uploadFileSuccess"
          />
        </el-tab-pane>
        <el-tab-pane :label="translate('项目导入')" name="2">
          <addBySolution
            :all-data-list="allDataList"
            :currnt-row="currentRow"
            @upload-file-success="uploadFileSuccess"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
  import addByFile from './addImgByFile.vue'
  import addBySolution from './addImgBySolution.vue'
  import { translate } from '@/i18n'
  export default {
    components: { addBySolution, addByFile },
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      currentRow: {
        type: Object,
        default: () => {},
      },
      allDataList: {
        type: Array,
        default: () => [],
      },
      criteriaData: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    emits: ['update:show', 'update:currentRow', 'refreshDataList'],
    data() {
      return {
        tabNameVal: '1',
      }
    },
    computed: {
      translate() {
        return translate
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      goBack() {
        this.$emit('update:show', false)
        this.$emit('update:currentRow', {})
      },
      /**
       * 成功返回主页
       */
      uploadFileSuccess() {
        this.$emit('refreshDataList')
        this.goBack()
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .body-content {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    width: 100%;
    height: 100%;
    padding: 5px;
    background-color: #fff;
    .head-nav {
      padding-bottom: 5px;
    }
    .main-content {
      width: 100%;
      height: calc(100% - 37px);
      background-color: #ddd;
      :deep() {
        .el-tabs__content {
          padding: 5px;
          height: 100%;
        }
      }
    }
  }
</style>
