<template>
  <el-dialog
    v-model="dialogFormVisible"
    :before-close="closeDialog"
    title="弹窗操作"
  >
    <el-form
      ref="dialogForm"
      label-width="130px"
      :model="formData"
      :rules="rules"
    >
      <el-form-item :label="translate('字典名（中）')" prop="name">
        <el-input
          v-model="formData.name"
          clearable
          :placeholder="translate('请输入字典名（中）')"
          :style="{ width: '100%' }"
        />
      </el-form-item>
      <el-form-item :label="translate('字典名（英）')" prop="type">
        <el-input
          v-model="formData.type"
          clearable
          :placeholder="translate('请输入字典名（英）')"
          :style="{ width: '100%' }"
        />
      </el-form-item>
      <el-form-item :label="translate('状态')" prop="status" required>
        <el-switch
          v-model="formData.status"
          :active-text="translate('开启')"
          :inactive-text="translate('停用')"
        />
      </el-form-item>
      <el-form-item :label="translate('描述')" prop="desc">
        <el-input
          v-model="formData.desc"
          clearable
          :placeholder="translate('请输入描述')"
          :style="{ width: '100%' }"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" @click="closeDialog">
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
  import { translate } from '@/i18n'
  import {
    createSysDictionary,
    updateSysDictionary,
  } from '@/api/dictionaryManagement'
  // import { uuid } from '@/utils'
  import { ref } from 'vue'
  const props = defineProps({
    dialogType: {
      type: String,
      default: '',
    },
  })
  const emits = defineEmits(['fetch-data'])
  // const $baseMessage = inject('$baseMessage')

  const dialogFormVisible = ref(false)
  const formData = ref({
    name: null,
    type: null,
    status: true,
    desc: null,
  })
  const rules = ref({
    name: [
      {
        required: true,
        message: translate('请输入字典名（中）'),
        trigger: 'blur',
      },
    ],
    type: [
      {
        required: true,
        message: translate('请输入字典名（英）'),
        trigger: 'blur',
      },
    ],
    desc: [
      {
        required: true,
        message: translate('请输入描述'),
        trigger: 'blur',
      },
    ],
  })
  const closeDialog = () => {
    dialogFormVisible.value = false
    formData.value = {
      name: null,
      type: null,
      status: true,
      desc: null,
    }
  }
  const dialogForm = ref(null)
  const enterDialog = async () => {
    dialogForm.value.validate(async (valid) => {
      if (!valid) return
      let res
      switch (props.dialogType) {
        case 'add':
          res = await createSysDictionary(formData.value)
          break
        case 'update':
          res = await updateSysDictionary(formData.value)
          break
        default:
          res = await createSysDictionary(formData.value)
          break
      }
      if (res.code === 0) {
        ElMessage.success(translate('操作成功'))
        closeDialog()
        emits('fetch-data')
      }
    })
  }
  const showEdit = (row) => {
    // if (row) state.form = { ...JSON.parse(JSON.stringify(row)), id: uuid() }
    // else state.form = { id: uuid(), parentKey: 'root' }
    if (props.dialogType === 'update') {
      formData.value = { ...JSON.parse(JSON.stringify(row)) }
    }
    dialogFormVisible.value = true
  }

  defineExpose({
    showEdit,
  })
</script>
