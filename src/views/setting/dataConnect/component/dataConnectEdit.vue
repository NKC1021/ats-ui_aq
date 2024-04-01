<template>
  <el-dialog
    v-model="dialogVisible"
    :close-on-click-modal="false"
    :show-close="false"
    :title="translate('数据源')"
    width="40%"
  >
    <el-form
      ref="formDataRef"
      label-width="120px"
      :model="formData"
      :rules="rules"
    >
      <el-form-item :label="translate('数据源名称')">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item :label="translate('数据库类型')">
        <el-select
          v-model="formData.type"
          style="width: 100%"
          @change="databaseTypeChange"
        >
          <el-option label="mysql" value="mysql" />
          <el-option label="file" value="file" />
        </el-select>
      </el-form-item>
      <div v-if="formData.type === 'file'">
        <el-form-item :label="translate('路径')" prop="host">
          <el-input v-model="formData.host" />
        </el-form-item>
      </div>
      <div v-if="formData.type === 'mysql'">
        <el-form-item :label="translate('服务器')" prop="host">
          <el-input v-model="formData.host" />
        </el-form-item>
        <el-form-item :label="translate('端口')" prop="port">
          <el-input v-model="formData.port" />
        </el-form-item>
        <el-form-item :label="translate('用户名')" prop="username">
          <el-input v-model="formData.username" />
        </el-form-item>
        <el-form-item :label="translate('密码')" prop="password">
          <el-input v-model="formData.password" show-password type="password" />
        </el-form-item>
        <el-form-item :label="translate('数据库')" prop="database">
          <div class="dataBase-content">
            <el-select v-model="formData.database">
              <el-option
                v-for="item in allDataBaseName"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <el-button type="primary" @click="getDataBaseName">
              {{ translate('获取') }}
            </el-button>
          </div>
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCancel">{{ translate('取消') }}</el-button>
        <el-button type="primary" @click="onSubmit">
          {{ translate('确定') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
  import {
    listDataBaseName,
    createDataSourceNode,
    updateDataSourceNode,
  } from '@/api/dataSource'
  import { ref, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import { translate } from '@/i18n'
  const checkHost = (rule, value, callback) => {
    if (!value) {
      return callback(new Error(translate('必填')))
    }
    const reg = new RegExp(/^[0-9.]+$/)
    if (!reg.test(value)) {
      return callback(new Error(translate('仅可输入数字或英文句号')))
    } else {
      callback()
    }
  }
  const props = defineProps({
    dialogType: {
      type: String,
      default: 'create',
    },
  })
  const emits = defineEmits(['fetch-data'])
  const dialogVisible = ref(false)
  const formData = ref({
    type: 'mysql',
    name: '',
    host: '', //todo
    port: '3306',
    database: '',
    username: 'root',
    password: '',
  })

  const rules = computed(() => {
    const ruleObj = {
      port: [{ required: true, message: translate('必填'), trigger: 'blur' }],
      username: [
        { required: true, message: translate('必填'), trigger: 'blur' },
      ],
      password: [
        { required: true, message: translate('必填'), trigger: 'blur' },
      ],
      database: [
        { required: true, message: translate('必填'), trigger: 'change' },
      ],
    }
    if (formData.value.type === 'file') {
      const _host = [
        { required: true, message: translate('必填'), trigger: 'blur' },
      ]
      ruleObj['host'] = _host
    }
    if (formData.value.type === 'mysql') {
      const _host = [{ validator: checkHost, trigger: 'blur' }]
      ruleObj['host'] = _host
    }
    return ruleObj
  })
  const allDataBaseName = ref([])
  const formDataRef = ref(null)
  const showEdit = (row) => {
    if (props.dialogType === 'update') {
      formData.value = JSON.parse(JSON.stringify(row))
    }
    if (props.dialogType === 'create') {
      formDataRef.value &&
        formDataRef.value.validate((val) => {
          if (!val) {
            formDataRef.value.clearValidate()
          }
        })
    }
    dialogVisible.value = true
  }

  /**
   * 弹窗提交
   */
  const onSubmit = () => {
    formDataRef.value.validate(async (val) => {
      //
      if (val) {
        let res
        let query = {}
        if (formData.value.type === 'mysql') {
          query = { ...formData.value }
        }
        if (formData.value.type === 'file') {
          query = {
            type: formData.value.type,
            name: formData.value.name,
            host: formData.value.host,
          }
        }
        switch (props.dialogType) {
          case 'create':
            {
              res = await createDataSourceNode(query)
            }
            break
          case 'update':
            {
              res = await updateDataSourceNode(query)
            }
            break
        }
        if (res.code === 0) {
          onCancel()
          emits('fetch-data')
          ElMessage({ type: 'success', message: res.msg })
          nextTick(() => {})
        }
      }
    })
  }
  const onCancel = () => {
    formData.value = {
      type: 'mysql',
      name: '',
      host: '', //todo
      port: '3306',
      database: '',
      username: 'root',
      password: '',
    }
    allDataBaseName.value = []
    dialogVisible.value = false

    formDataRef.value.clearValidate()
  }
  let timer = null
  /**
   * 获取数据库名称
   */
  const getDataBaseName = async () => {
    const query = {
      host: formData.value.host,
      port: formData.value.port,
      username: formData.value.username,
      password: formData.value.password,
      type: formData.value.type,
    }
    if (timer) clearTimeout(timer)
    timer = setTimeout(async () => {
      const res = await listDataBaseName(query)
      if (res.code === 0) {
        allDataBaseName.value = res.data.DatabaseName
      }
    }, 500)
  }
  const databaseTypeChange = () => {
    formData.value.host = ''
  }
  defineExpose({
    showEdit,
  })
</script>
<style lang="scss" scoped>
  .dataBase-content {
    display: flex;
    align-items: center;
    width: 100%;
    .el-select {
      flex: 1;
      margin-right: 5px;
    }
  }
</style>
