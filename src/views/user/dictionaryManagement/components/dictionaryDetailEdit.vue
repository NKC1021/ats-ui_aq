<template>
  <el-dialog
    v-model="dialogFormVisible"
    :before-close="closeDialog"
    title="弹窗操作"
  >
    <el-form
      ref="dialogForm"
      label-width="110px"
      :model="formData"
      :rules="rules"
      size="medium"
    >
      <el-form-item :label="translate('展示值')" prop="label">
        <el-input
          v-model="formData.label"
          clearable
          :placeholder="translate('请输入展示值')"
          :style="{ width: '100%' }"
        />
      </el-form-item>
      <el-form-item label="字典值" prop="value">
        <el-input
          v-model="formData.value"
          clearable
          :placeholder="translate('请输入字典值')"
          :style="{ width: '100%' }"
        />
      </el-form-item>
      <el-form-item :label="translate('启用状态')" prop="status" required>
        <el-switch
          v-model="formData.status"
          :active-text="translate('开启')"
          :inactive-text="translate('停用')"
        />
      </el-form-item>
      <el-form-item :label="translate('排序标记')" prop="sort">
        <el-input-number
          v-model.number="formData.sort"
          :placeholder="translate('启用状态启用状态')"
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
    createSysDictionaryDetail,
    updateSysDictionaryDetail,
  } from '@/api/dictionaryManagement'
  // import { uuid } from '@/utils'
  import { ref } from 'vue'
  const props = defineProps({
    dialogType: {
      type: String,
      default: '',
    },
    activeRow: {
      type: Object,
      default: () => {
        return {}
      },
    },
  })
  const emits = defineEmits(['fetch-data'])
  // const $baseMessage = inject('$baseMessage')

  const dialogFormVisible = ref(false)
  const formData = ref({
    label: null,
    value: null,
    status: true,
    sort: null,
  })
  const rules = ref({
    label: [
      {
        required: true,
        message: '请输入展示值',
        trigger: 'blur',
      },
    ],
    value: [
      {
        required: true,
        message: '请输入字典值',
        trigger: 'blur',
      },
    ],
    sort: [
      {
        required: true,
        message: '排序标记',
        trigger: 'blur',
      },
    ],
  })

  const closeDialog = () => {
    dialogFormVisible.value = false
    formData.value = {
      label: null,
      value: null,
      status: true,
      sort: null,
    }
  }
  const dialogForm = ref(null)
  const enterDialog = async () => {
    dialogForm.value.validate(async (valid) => {
      if (!valid) return
      let res
      switch (props.dialogType) {
        case 'add':
          res = await createSysDictionaryDetail(formData.value)
          break
        case 'update':
          res = await updateSysDictionaryDetail(formData.value)
          break
        default:
          res = await createSysDictionaryDetail(formData.value)
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
    if (props.dialogType === 'update') {
      formData.value = { ...JSON.parse(JSON.stringify(row)) }
      delete formData.value.sys_dictionary_id
    }

    formData.value.sysDictionaryId = props.activeRow.id
    dialogFormVisible.value = true
  }

  defineExpose({
    showEdit,
  })
</script>
