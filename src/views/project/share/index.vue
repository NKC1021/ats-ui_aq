<!--
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-06-07 09:18:48
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-07-03 17:09:22
 * @FilePath: \fastlabel-view\src\views\home\shareproject\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<!--  -->
<template>
  <div class="share-data-tool-container">
    <el-table :data="tableData" height="100%">
      <el-table-column label="项目名称" prop="solutionName">
        <template #default="scope">
          <div class="project-name" @click="toNewRoute(scope.row)">
            {{ scope.row.solutionName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="归属人" prop="authorizeUsername" />
      <el-table-column label="权限" prop="permissionType">
        <template #default="scope">
          {{ permissionType(scope.row.permissionType) }}
        </template>
      </el-table-column>
      <el-table-column
        :formatter="timeFormatter"
        label="访问期限"
        prop="authorizedEndTime"
      />
      <el-table-column
        :formatter="openTimeFormatter"
        label="最近打开"
        prop="openTime"
      />
      <el-table-column
        :formatter="createTimeFormatter"
        label="创建时间"
        prop="createTime"
      />
      <el-table-column label="操作">
        <template #default="scope">
          <el-popconfirm
            :hide-after="100"
            :title="translate('是否删除数据')"
            @cancel="scope.row.visible = false"
            @confirm="handleDelRow(scope.row)"
          >
            <template #reference>
              <el-button
                icon="Delete"
                link
                type="primary"
                @click="scope.row.visible = false"
              >
                {{ translate('删除') }}
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty :description="translate('暂无数据')" />
      </template>
    </el-table>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import solution from '@/api/solution'
  import solutionConfig from '@/api/solutionConfig'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
  import { useRoutesStore } from '@/store/modules/routes'
  export default {
    data() {
      return {
        tableData: [],
      }
    },
    computed: {
      translate() {
        return translate
      },
      ...mapStores(recordProInfo, useRoutesStore),
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {
      this.projectStore.updateSolutionId('') //置空solutionId
      this.projectStore.setSolutionName('') //置空solutionId
      this.getList()
    },
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      timeFormatter(row) {
        return new Date(row.authorizedEndTime).toLocaleString()
      },
      openTimeFormatter(row) {
        return new Date(row.openTime).toLocaleString()
      },
      createTimeFormatter(row) {
        return new Date(row.createTime).toLocaleString()
      },
      /**
       * 显示权限类型
       * 0:未被授权 1:只读 2:可编辑
       */
      permissionType(type) {
        const typeObj = {
          0: this.translate('未被授权'),
          1: this.translate('只读'),
          2: this.translate('可编辑'),
        }
        return typeObj[type]
      },
      /* 跳转到数据清洗 */
      async toNewRoute(proInfo) {
        if (new Date(proInfo.authorizedEndTime) > new Date()) {
          this.projectStore.updateSolutionId(proInfo.solutionId)
          this.projectStore.setSolutionName(proInfo.solutionName)
          this.routesStore.filterAuthMenu(true)
          const firstTabInProject = this.routesStore.getFirstRouteInProjectTab()
          if (!firstTabInProject) {
            this.$message.error(translate('本角色无项目访问权限！'))
            return
          }
          this.$router.push({ name: firstTabInProject })
          await solution.open()
          // this.$router.push({ name: 'standard' })
        } else {
          return this.$message.error(translate('本角色无项目访问权限！'))
        }
      },

      /**
       * 获取列表
       */
      async getList() {
        const data = await solutionConfig.getAuthorizedProjectList({})
        const newArray = data.data.filter((element) => {
          return element.permissionType !== 0
        })
        this.tableData = newArray
        // newArray.map((e) => {
        //   const obj = {}
        //   obj.name = e.solutionDO.name
        //   obj.createBy = e.solutionDO.createBy
        //   obj.openTime = e.openTime
        //   obj.permissionTypeName =
        //     e.permissionType == 0
        //       ? '未被授权'
        //       : e.permissionType == 1
        //       ? '只读'
        //       : '可编辑'
        //   obj.desc = e.solutionDO.desc
        //   obj.name = e.solutionDO.name
        //   return obj
        // })
      },
      /**
       * 删除行
       */
      async handleDelRow(row) {
        const query = {
          ids: [],
        }
        query.ids.push(row.id)
        await solutionConfig.deleteSharedAuth(query)
        this.getList()
      },
    },
  }
</script>
<style scoped lang="scss">
  .tip-content {
    text-align: center;
    margin: 3px 0;
  }
  .tip-button {
    text-align: center;
    margin: 0;
  }
  .project-name {
    cursor: pointer;
    color: var(--el-color-primary);
  }
</style>
