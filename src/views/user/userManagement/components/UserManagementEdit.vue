<template>
  <el-dialog
    v-model="addUserDialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :title="dialogTitle"
  >
    <div style="height: 60vh; overflow: auto; padding: 0 12px">
      <el-form
        ref="userForm"
        label-width="80px"
        :model="userInfo"
        :rules="rules"
      >
        <el-form-item
          v-if="props.dialogType === 'add'"
          :label="translate('用户名')"
          prop="username"
        >
          <el-input v-model="userInfo.username" />
        </el-form-item>
        <el-form-item
          v-if="props.dialogType === 'add'"
          :label="translate('密码')"
          prop="password"
        >
          <el-input v-model="userInfo.password" />
        </el-form-item>
        <el-form-item :label="translate('昵称')" prop="nickName">
          <el-input v-model="userInfo.nickName" />
        </el-form-item>
        <el-form-item :label="translate('手机号')" prop="phone">
          <el-input v-model="userInfo.phone" />
        </el-form-item>
        <el-form-item :label="translate('邮箱')" prop="email">
          <el-input v-model="userInfo.email" />
        </el-form-item>
        <el-form-item :label="translate('部门')" prop="deptId">
          <el-cascader
            v-model="userInfo.deptIds"
            :clearable="false"
            :options="deptOptions"
            :props="{
              multiple: true,
              checkStrictly: true,
              label: 'name',
              value: 'deptId',
              disabled: 'disabled',
              emitPath: false,
            }"
            :show-all-levels="false"
            style="width: 100%"
          />
        </el-form-item>
        <!-- 新增用户弹窗-部门 -->
        <el-form-item :label="translate('用户角色')" prop="authorityId">
          <el-cascader
            v-model="userInfo.authorityIds"
            :clearable="false"
            :options="authOptions"
            :props="{
              multiple: true,
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
        <!-- 新增用户弹窗-用户角色 -->
        <el-form-item :label="translate('头像')" label-width="80px">
          <upload-common class="upload-btn-media-library" @on-success="open">
            <div style="display: inline-block">
              <img
                v-if="userInfo.headerImg"
                class="header-img-box"
                :src="
                  userInfo.headerImg &&
                  userInfo.headerImg.slice(0, 4) !== 'http'
                    ? path + userInfo.headerImg
                    : userInfo.headerImg
                "
              />
              <div v-else class="header-img-box">
                {{ translate('从本地选择') }}
              </div>
            </div>
          </upload-common>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" @click="close">
          {{ translate('取消') }}
        </el-button>
        <el-button size="small" type="primary" @click="save">
          {{ translate('确定') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  <ChooseImg ref="chooseImg" :target="userInfo" :target-key="`headerImg`" />
</template>

<script setup>
  import { translate } from '@/i18n'
  import { ref, computed } from 'vue'
  import { admin_register, setUserInfo } from '@/api/userManagement'
  import ChooseImg from '@/components/chooseImg/index.vue'
  import UploadCommon from '@/components/upload/common.vue'

  const props = defineProps({
    dialogType: {
      type: String,
      default: '',
    },
    authOptions: {
      type: Array,
      default: () => {
        return []
      },
    },
    deptOptions: {
      type: Array,
      default: () => {
        return []
      },
    },
  })
  const emits = defineEmits(['fetch-data'])
  const $baseMessage = inject('$baseMessage')
  const rules = ref({
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, message: '最低2位字符', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '请输入用户密码', trigger: 'blur' },
      { min: 6, message: '最低6位字符', trigger: 'blur' },
    ],
    nickName: [{ required: true, message: '请输入用户昵称', trigger: 'blur' }],
    authorityId: [
      { required: true, message: '请选择用户角色', trigger: 'blur' },
    ],
    deptId: [{ required: true, message: '请选择部门', trigger: 'blur' }],
  })
  const dialogTitle = computed(() => {
    if (props.dialogType === 'add') {
      return translate('新增用户')
    }
    if (props.dialogType === 'edit') {
      return translate('编辑用户')
    }
    return ''
  })
  // 弹窗相关
  const userInfo = ref({
    username: '',
    password: '',
    nickName: '',
    headerImg: '',
    authorityId: '',
    authorityIds: [],
    deptInfo: '',
    deptIds: [],
    enable: 1,
    email: '',
    phone: '',
  })

  const path = ref(`http://${window.location.hostname}:27401/`)
  const addUserDialog = ref(false)

  const showEdit = (row) => {
    if (props.dialogType === 'edit') {
      userInfo.value = JSON.parse(JSON.stringify(row))
    }
    addUserDialog.value = true
  }
  /**
   * 关闭弹窗
   */
  const close = () => {
    userInfo.value = {
      username: '',
      password: '',
      nickName: '',
      headerImg: '',
      authorityId: '',
      authorityIds: [],
      enable: 1,
      email: '',
      phone: '',
    }
    addUserDialog.value = false
  }
  /**
   * 保存操作
   */
  const userForm = ref(null)
  const save = () => {
    userInfo.value.authorityId = userInfo.value.authorityIds[0]
    userInfo.value.deptId = userInfo.value.deptIds[0]
    userForm.value.validate(async (valid) => {
      if (valid) {
        let res = null
        switch (props.dialogType) {
          case 'add':
            {
              res = await admin_register({ ...userInfo.value })
            }
            break

          case 'edit':
            {
              res = await setUserInfo({ ...userInfo.value })
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
   * 上传成功返回url
   */
  const open = (url) => {
    console.log('url', url)
    userInfo.value.headerImg = url
  }
  defineExpose({
    showEdit,
  })
</script>

<style scoped lang="scss">
  .upload-btn-media-library {
    margin-left: 20px;
  }
  .header-img-box {
    width: 200px;
    height: 200px;
    border: 1px dashed #ccc;
    border-radius: 20px;
    text-align: center;
    line-height: 200px;
    cursor: pointer;
  }
</style>
