<template>
  <el-dialog
    v-model="dialogFormVisible"
    :before-close="close"
    :close-on-click-modal="false"
    :title="dialogTitle"
  >
    <el-form
      ref="authorityForm"
      label-width="100px"
      :model="form"
      :rules="rules"
    >
      <el-form-item :label="translate('父级角色')" prop="parentId">
        <el-cascader
          v-model="form.parentId"
          :disabled="props.dialogType == 'add'"
          filterable
          :options="AuthorityOption"
          :props="{
            checkStrictly: true,
            label: 'authorityName',
            value: 'authorityId',
            disabled: 'disabled',
            emitPath: false,
          }"
          :show-all-levels="false"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="translate('角色ID')" prop="authorityId">
        <el-input
          v-model="form.authorityId"
          autocomplete="off"
          :disabled="props.dialogType == 'edit'"
        />
      </el-form-item>
      <el-form-item :label="translate('角色名称')" prop="authorityName">
        <el-input v-model="form.authorityName" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" @click="close">
          {{ translate('取消') }}
        </el-button>
        <el-button size="small" type="primary" @click="enterDialog">
          {{ translate('确定') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import {
    doEdit,
    createAuthority,
    updateAuthority,
    copyAuthority,
  } from '@/api/roleManagement'
  import { getList } from '@/api/router'
  import { ref, computed } from 'vue'
  import { translate } from '@/i18n'
  // emits: ['fetch-data']
  const emits = defineEmits(['fetch-data'])
  const props = defineProps({
    dialogType: {
      type: String,
      default: '',
    },
  })
  const dialogTitle = computed(() => {
    if (props.dialogType === 'add') {
      return translate('添加角色')
    }
    if (props.dialogType === 'edit') {
      return translate('编辑角色')
    }
    if (props.dialogType === 'copy') {
      return translate('拷贝角色')
    }
    return ''
  })
  const $baseMessage = inject('$baseMessage')
  const mustUint = (rule, value, callback) => {
    if (!/^[0-9]*[1-9][0-9]*$/.test(value)) {
      return callback(new Error(rule.message))
    }
    return callback()
  }

  const state = reactive({
    formRef: null,
    treeRef: null,
    list: [],
  })
  const dialogFormVisible = ref(false)
  const AuthorityOption = ref([
    {
      authorityId: 0,
      authorityName: translate('根角色'),
    },
  ])
  const authorityForm = ref(null)
  // 表单
  const form = ref({
    authorityId: 0,
    authorityName: '',
    parentId: 0,
  })
  // 拷贝角色
  const copyForm = ref({})
  const rules = ref({
    authorityId: [
      { required: true, message: '请输入角色ID', trigger: 'blur' },
      { validator: mustUint, trigger: 'blur', message: '必须为正整数' },
    ],
    authorityName: [
      { required: true, message: '请输入角色名', trigger: 'blur' },
    ],
    parentId: [
      {
        required: true,
        message: '请选择请求方式',
        trigger: 'blur',
      },
    ],
  })
  /**
   * 展示弹窗
   */
  const showEdit = (row) => {
    // 编辑
    if (props.dialogType === 'edit') {
      form.value = JSON.parse(JSON.stringify(row))
    }
    // 新增子节点
    if (props.dialogType === 'add' && row) {
      //
      form.value.parentId = row.authorityId
    }
    // 拷贝
    if (props.dialogType === 'copy') {
      copyForm.value = row
      for (const k in form.value) {
        form.value[k] = row[k]
      }
    }
    dialogFormVisible.value = true
  }
  const close = () => {
    form.value = {
      authorityId: 0,
      authorityName: '',
      parentId: 0,
    }
    dialogFormVisible.value = false
  }
  /**
   *
   */
  const enterDialog = () => {
    authorityForm.value.validate(async (valid) => {
      if (valid) {
        let res = null
        switch (props.dialogType) {
          case 'add':
            {
              res = await createAuthority({ ...form.value })
            }
            break
          case 'edit':
            {
              res = await updateAuthority({ ...form.value })
            }
            break
          case 'copy':
            {
              const query = {
                authorityId: String(form.value.authorityId),
                authorityName: form.value.authorityName,
                parentId: String(form.value.parentId),
                oldAuthorityId: String(copyForm.value.authorityId),
              }
              res = await copyAuthority(query)
            }
            break
        }
        if (res.code === 0) {
          $baseMessage(res.msg, 'success', 'vab-hey-message-success')
          emits('fetch-data')
          close()
        }
      }
    })
  }
  /**
   * @param {Array} tableData 父组件表格数据
   * 构造父级角色级联
   */
  const setOptions = (tableData) => {
    AuthorityOption.value = [
      {
        authorityId: 0,
        authorityName: translate('根角色'),
      },
    ]
    setAuthorityOptions(tableData, AuthorityOption.value, false)
  }
  const setAuthorityOptions = (AuthorityData, optionsData, disabled) => {
    form.value.authorityId = String(form.value.authorityId)
    AuthorityData &&
      AuthorityData.forEach((item) => {
        if (item.children && item.children.length) {
          const option = {
            authorityId: item.authorityId,
            authorityName: item.authorityName,
            disabled: disabled || item.authorityId === form.value.authorityId,
            children: [],
          }
          setAuthorityOptions(
            item.children,
            option.children,
            disabled || item.authorityId === form.value.authorityId
          )
          optionsData.push(option)
        } else {
          const option = {
            authorityId: item.authorityId,
            authorityName: item.authorityName,
            disabled: disabled || item.authorityId === form.value.authorityId,
          }
          optionsData.push(option)
        }
      })
  }
  defineExpose({
    showEdit,
    setOptions,
  })
</script>

<style lang="scss" scoped>
  .vab-tree-border {
    width: 100%;
    height: 250px;
    padding: $base-padding;
    overflow-y: auto;
    border: 1px solid #dcdfe6;
    border-radius: $base-border-radius;
  }
</style>
