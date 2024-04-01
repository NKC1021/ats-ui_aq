<!--  -->
<template>
  <div>
    <el-drawer
      v-model="isShowDrawer"
      class="set-drawer"
      direction="rtl"
      size="20%"
      :title="translate('列显隐设置')"
    >
      <div>
        <div>
          <el-checkbox
            v-model="showAllCol"
            :indeterminate="showColList.length !== allColNameList.length"
            @change="handleShowAllCol"
          >
            {{ translate('全选') }}
          </el-checkbox>
          <el-checkbox v-model="showSome" @change="handleShowSomeCol">
            {{ translate('勾选关键列') }}
          </el-checkbox>
        </div>

        <el-checkbox-group
          v-model="showColList"
          style="display: flex; flex-direction: column"
          @change="handleChangeSelect"
        >
          <el-checkbox
            v-for="item in allColAndLabel"
            :key="item.value"
            :label="item.value"
          >
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
        <div style="padding-top: 10px">
          <el-button @click="handleShowOption(0)">
            {{ translate('取消') }}
          </el-button>
          <el-button type="primary" @click="handleShowOption(1)">
            {{ translate('保存') }}
          </el-button>

          <el-tooltip
            class="item"
            :content="translate('所有标准的显隐列和列宽都恢复默认值')"
            effect="dark"
            placement="top"
          >
            <el-button type="danger" @click="restoreDefault()">
              {{ translate('默认设置') }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import { deepClone } from '@/utils/util'
  import solutionConfig from '@/api/solutionConfig'
  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      allColAndLabel: {
        type: Array,
        default: () => [],
      },
    },
    emits: ['update:show'],
    data() {
      return {
        showColList: [], // 显示的列
        showSome: false,

        allColNameList: [], // 所有列（和展示顺序一致）
      }
    },
    computed: {
      translate() {
        return translate
      },
      showAllCol: {
        get() {
          if (this.showColList.length === this.allColNameList.length) {
            return true
          }
          return false
        },
        set() {},
      },
      isShowDrawer: {
        get() {
          return this.show
        },
        set(newVal) {
          this.$emit('update:show', newVal)
        },
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      /**
       * @description: 显示全部
       * @param {*} checked
       */
      handleShowAllCol(checked) {
        this.showSome = false
        if (checked) {
          this.allColNameList.forEach((item) => {
            this.showColList.push(item)
          })
        } else {
          this.showColList = []
        }
      },
      /**
       * 勾选关键列
       */
      handleShowSomeCol(checked) {
        if (checked) {
          console.log('this.primaryColNameList;', this.primaryColNameList)
          this.showColList = []
          this.showColList = deepClone(this.primaryColNameList)
          this.showColList.push('ROIs')
        } else {
          this.showColList = []
        }
      },
      // 隐藏or显示列的控制逻辑
      handleShowOption(index, deleteWidth) {
        if (index == 0) {
          this.isShowDrawer = false
          return
        }
        this.saveOrUpdateUserProjectConfig()
        this.showColumns(this.showColList)
        const hideList = this.allColNameList.filter(
          (item) => !this.showColList.includes(item)
        )
        this.hideColumns(hideList)
        this.isShowDrawer = false
        this.showSome = false
      },
      /**
       * @description:获取用户项目设置信息
       */
      async getUserProjectConfig() {
        const { data } = await solutionConfig.getUserProjectConfig()
        this.userConfig = data.data || {}
        if (this.userConfig && this.userConfig.solutionSopConfig) {
          const solutionSopConfigObj = JSON.parse(
            this.userConfig.solutionSopConfig
          )
          if (solutionSopConfigObj) {
            for (const key in solutionSopConfigObj) {
              this.dbColConfig[key] = solutionSopConfigObj[key].config || {}
            }
          }
        }
      },
      async restoreDefault() {
        if (this.userConfig) {
          this.userConfig.solutionSopConfig = ''
        } else {
          this.userConfig = {}
          this.userConfig.solutionSopConfig = ''
        }
        await solutionConfig.saveOrUpdateUserProjectConfig(this.userConfig)
        this.init()
        this.isShowDrawer = false
      },
      // 隐藏列
      hideColumns(keys) {
        this.$refs['standardTableRef'].hideColumnsByKeys(keys)
      },
      // 显示列
      showColumns(keys) {
        this.$refs['standardTableRef'].showColumnsByKeys(keys)
      },
      // 隐藏or显示列的勾选change事件
      handleChangeSelect(val) {
        this.showColList = val
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  :deep() {
    .set-drawer {
      .el-drawer__header {
        margin-bottom: 10px;
        padding-top: 10px;
      }
      .el-drawer__body {
        padding: 0px 20px 10px;
      }
    }
  }
</style>
