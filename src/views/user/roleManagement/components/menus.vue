<template>
  <div>
    <div class="clearfix sticky-button">
      <el-input
        v-model="filterText"
        class="fitler"
        :placeholder="translate('筛选')"
      />
      <el-button class="fl-right" type="primary" @click="relation">
        {{ translate('确定') }}
      </el-button>
    </div>
    <div class="tree-content">
      <el-tree
        ref="menuTree"
        :data="menuTreeData"
        :default-checked-keys="menuTreeIds"
        default-expand-all
        :filter-node-method="filterNode"
        highlight-current
        node-key="id"
        :props="menuDefaultProps"
        show-checkbox
        @check="nodeChange"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span>
              <el-button
                :disabled="!node.checked"
                link
                size="small"
                :style="{
                  color:
                    row.defaultRouter === data.name ? '#E6A23C' : '#85ce61',
                }"
                type="primary"
                @click="() => setDefault(data)"
              >
                {{
                  row.defaultRouter === data.name
                    ? translate('首页')
                    : translate('设为首页')
                }}
              </el-button>
            </span>
            <span v-if="data.menuBtn.length">
              <el-button
                link
                size="small"
                type="primary"
                @click="() => OpenBtn(data)"
              >
                {{ translate('分配按钮') }}
              </el-button>
            </span>
          </span>
        </template>
      </el-tree>
    </div>
    <el-dialog
      v-model="btnVisible"
      destroy-on-close
      :title="translate('分配按钮')"
    >
      <el-table
        ref="btnTableRef"
        :data="btnData"
        row-key="ID"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column :label="translate('按钮名称')" prop="name" />
        <el-table-column :label="translate('按钮备注')" prop="desc" />
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">{{ translate('取消') }}</el-button>
          <el-button type="primary" @click="enterDialog">
            {{ translate('确定') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import {
    getBaseMenuTree,
    getMenuAuthority,
    addMenuAuthority,
  } from '@/api/menuManagement'
  import { updateAuthority } from '@/api/roleManagement'
  import { getAuthorityBtn, setAuthorityBtn } from '@/api/authorityBtn'
  import { nextTick, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { translate } from '@/i18n'

  const props = defineProps({
    row: {
      default: function () {
        return {}
      },
      type: Object,
    },
  })

  const emit = defineEmits(['changeRow'])
  const filterText = ref('')
  const menuTreeData = ref([])
  const menuTreeIds = ref([])
  const needConfirm = ref(false)

  const menuDefaultProps = ref({
    children: 'children',
    label: function (data) {
      return data.meta.title
    },
  })

  const init = async () => {
    // 获取所有菜单树
    const res = await getBaseMenuTree({})
    menuTreeData.value = res.data
    const res1 = await getMenuAuthority({ authorityId: props.row.authorityId })
    const menus = res1.data
    const arr = []
    menus.length &&
      menus.forEach((item) => {
        // 防止直接选中父级造成全选
        if (!menus.some((same) => same.parentId === item.menuId)) {
          arr.push(Number(item.menuId))
        }
      })
    menuTreeIds.value = arr
  }

  init()

  const setDefault = async (data) => {
    const res = await updateAuthority({
      authorityId: props.row.authorityId,
      AuthorityName: props.row.authorityName,
      parentId: props.row.parentId,
      defaultRouter: data.name,
    })
    if (res.code === 0) {
      ElMessage({ type: 'success', message: '设置成功' })
      emit('changeRow', 'defaultRouter', res.data.authority.defaultRouter)
    }
  }
  const nodeChange = () => {
    needConfirm.value = true
  }
  // 暴露给外层使用的切换拦截统一方法
  const enterAndNext = () => {
    relation()
  }
  // 关联树 确认方法
  const menuTree = ref(null)
  const relation = async () => {
    const checkArr = menuTree.value.getCheckedNodes(false, true)
    const res = await addMenuAuthority({
      menus: checkArr,
      authorityId: props.row.authorityId,
    })
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '菜单设置成功!',
      })
    }
  }

  defineExpose({ enterAndNext, needConfirm })

  const btnVisible = ref(false)

  const btnData = ref([])
  const multipleSelection = ref([])
  const btnTableRef = ref()
  const menuID = ref()
  const OpenBtn = async (data) => {
    menuID.value = data.id
    const res = await getAuthorityBtn({
      menuId: data.id,
      authorityId: props.row.authorityId,
    })
    if (res.code === 0) {
      openDialog(data)
      await nextTick()
      // selected即sys_base_menu_btn_id，菜单按钮ID
      if (res.data.selected) {
        res.data.selected.forEach((select_id) => {
          btnData.value.some((item) => {
            if (item.id === select_id) {
              btnTableRef.value.toggleRowSelection(item, true)
            }
          })
        })
      }
    }
  }

  const handleSelectionChange = (val) => {
    multipleSelection.value = val
  }

  const openDialog = (data) => {
    btnVisible.value = true
    btnData.value = data.menuBtn
  }

  const closeDialog = () => {
    btnVisible.value = false
  }
  const enterDialog = async () => {
    const selected = multipleSelection.value.map((item) => item.id)
    const res = await setAuthorityBtn({
      authorityId: props.row.authorityId,
      menuId: menuID.value,
      selected,
    })
    if (res.code === 0) {
      ElMessage({ type: 'success', message: '设置成功' })
      btnVisible.value = false
    }
  }

  const filterNode = (value, data) => {
    if (!value) return true
    // console.log(data.mate.title)
    return data.meta.title.indexOf(value) !== -1
  }

  watch(filterText, (val) => {
    menuTree.value.filter(val)
  })
</script>

<script>
  export default {
    name: 'Menus',
  }
</script>

<style lang="scss" scope>
  @import '@/style/button.scss';
  .custom-tree-node {
    span + span {
      margin-left: 12px;
    }
  }
</style>
