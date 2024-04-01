<template>
  <el-dialog
    v-model="dialogFormVisible"
    :close-on-click-modal="false"
    :title="state.title"
    width="500px"
    @close="closeDialog"
  >
    <el-form
      ref="formRef"
      label-width="80px"
      :model="form"
      :rules="state.rules"
    >
      <el-form-item :label="translate('父节点')" prop="parentName">
        <el-select
          v-model="form.parentId"
          :placeholder="translate('请选择父节点')"
          style="width: 100%"
        >
          <el-option
            :label="form.parentName"
            style="height: auto; padding: 0"
            :value="form.parentId"
          >
            <el-tree
              ref="treeRef"
              :data="departmentTreeData"
              default-expand-all
              node-key="id"
              :props="state.defaultProps"
              show-checkbox
              @check="handleNodeCheck"
              @node-click="handleNodeClick"
            />
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="translate('名称')" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item :label="translate('描述')" prop="description">
        <el-input v-model="form.description" />
      </el-form-item>
      <el-form-item :label="translate('排序')" prop="order">
        <el-input-number
          v-model="form.sort"
          class="mx-4"
          controls-position="right"
          :max="999"
          :min="1"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">{{ translate('取消') }}</el-button>
      <el-button type="primary" @click="saveDept">
        {{ translate('确定') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { batchUpdateDept } from '@/api/departmentManagement'
  import { ref, reactive, computed } from 'vue'
  import { translate } from '@/i18n'
  const props = defineProps({
    treeData: {
      type: Array,
      default: () => [],
    },
  })
  const emits = defineEmits(['fetch-data'])
  const $baseMessage = inject('$baseMessage')
  const state = reactive({
    formRef: null,
    treeData: [],
    defaultProps: {
      children: 'children',
      label: 'name',
    },

    rules: {
      parentName: [
        { required: true, trigger: 'blur', message: '请选择父节点' },
      ],
      name: [{ required: true, trigger: 'blur', message: '请输入名称' }],
      sort: [{ required: true, trigger: 'blur', message: '请输入排序' }],
    },
    title: '',
  })
  const dialogFormVisible = ref(false)
  const form = ref({
    parentName: '',
    parentId: '',
    name: '',
    sort: '',
    deptId: '',
    description: '',
  })
  const treeRef = ref(null)
  /*
   * 当props.treeData发生变化，重新构造部门树结构
   */
  const departmentTreeData = computed(() => {
    const _arr = []
    const _obj = {
      deptId: 0,
      name: '根节点',
      children: props.treeData,
    }
    _arr.push(_obj)
    return initDepartmentTreeData(_arr, [])
  })
  /**
   * 构造部门树结构
   */
  const initDepartmentTreeData = (originData = [], treeData = []) => {
    originData.forEach((el) => {
      //
      const obj = {
        id: el.deptId,
        name: el.name,
      }
      treeData.push(obj)
      if (el.children?.length) {
        initDepartmentTreeData(el.children, (obj.children = []))
      }
    })
    return treeData
  }
  const handleNodeClick = (node) => {
    // console.log('node', node)
    form.value.parentName = node.name
    form.value.parentId = node.id
    treeRef.value.setCheckedKeys([])
    treeRef.value.setChecked(node.id, true, true)
  }
  const handleNodeCheck = (checkedNodes) => {
    // console.log('checkedKeys', checkedKeys)
    form.value.parentName = checkedNodes.name
    form.value.parentId = checkedNodes.id
    treeRef.value.setCheckedKeys([])
    treeRef.value.setChecked(checkedNodes.id, true, true)
  }
  const showEdit = (row) => {
    if (!row) {
      state.title = '添加'
    } else {
      state.title = '编辑'
      form.value = JSON.parse(JSON.stringify(row))
    }
    dialogFormVisible.value = true
  }
  const closeDialog = () => {
    form.value = {
      parentName: '',
      parentId: '',
      name: '',
      sort: '',
    }
    dialogFormVisible.value = false
  }
  /**
   * 保存部门信息
   */
  const saveDept = async () => {
    const query = {
      id: form.value.deptId === '' ? null : form.value.deptId, // 部门ID（为null新增）
      parentId: form.value.parentId, // 父级部门ID
      name: form.value.name, // 部门名称
      description: form.value.description, // 部门描述
      sort: form.value.sort == null ? 999 : form.value.sort, // 排序
    }
    const queryList = { list: [] }
    queryList.list.push(query)

    const { msg } = await batchUpdateDept(queryList) // 批量更新或保存部门信息
    $baseMessage(msg, 'success', 'vab-hey-message-success')
    emits('fetch-data') // 触发父组件的fetch-data事件
    closeDialog()
  }
  defineExpose({
    showEdit,
  })
</script>
