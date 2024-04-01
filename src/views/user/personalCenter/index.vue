<template>
  <div class="personal-center-container">
    <el-row :gutter="20">
      <el-col :lg="8" :md="12" :sm="24" :xl="8" :xs="24">
        <vab-card shadow="hover">
          <div class="personal-center-user-info">
            <el-avatar :size="100" :src="`${avatar}`" />
            <div class="personal-center-user-info-full-name">
              {{ userInfo.userName }}
            </div>
            <div class="personal-center-user-info-follow">
              <a href="" target="_blank">
                <el-button round type="primary">
                  <vab-icon icon="group-line" />
                  Follow me
                </el-button>
              </a>
            </div>

            <ul class="personal-center-user-info-list">
              <li>
                <vab-icon icon="user-3-line" />
                {{ translate('昵称') }}：{{ userInfo.nickName }}
              </li>
              <li>
                <vab-icon icon="cellphone-fill" />
                {{ translate('电话') }}：{{ userInfo.phone }}
              </li>
              <li>
                <vab-icon icon="mail-line" />
                {{ translate('邮箱') }}：{{ userInfo.email }}
              </li>
              <li>
                <vab-icon icon="community-line" />
                {{ translate('部门') }}：{{ userInfo.deptInfo?.name }}
              </li>
              <li>
                <vab-icon icon="map-pin-2-line" />
                {{ translate('地址略') }}
              </li>
              <li>
                <vab-icon icon="code-s-slash-line" />
                {{ translate('技术略') }}
              </li>
              <li>
                <el-divider />
                <h5>{{ translate('个性标签') }}</h5>
                <el-tag>{{ translate('无') }}</el-tag>
              </li>
            </ul>
          </div>
        </vab-card>
      </el-col>
      <el-col :lg="16" :md="12" :sm="24" :xl="16" :xs="24">
        <vab-card shadow="hover">
          <el-tabs v-model="activeName">
            <el-tab-pane :label="translate('基本信息')" name="first">
              <el-col :lg="12" :md="16" :sm="24" :xl="12" :xs="24">
                <el-form label-width="80px" :model="userInfo">
                  <el-form-item :label="translate('昵称')">
                    <el-input v-model="userInfo.nickName" />
                  </el-form-item>
                  <el-form-item :label="translate('手机')">
                    <el-input v-model="userInfo.phone" />
                  </el-form-item>
                  <el-form-item :label="translate('邮箱')">
                    <el-input v-model="userInfo.email" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="onSubmit">
                      {{ translate('保存') }}
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-col>
            </el-tab-pane>
            <el-tab-pane :label="translate('密码修改')" name="second">
              <el-col :lg="12" :md="16" :sm="24" :xl="12" :xs="24">
                <el-form label-width="80px" :model="passwordForm">
                  <el-form-item :label="translate('旧密码')">
                    <el-input v-model="passwordForm.password" />
                  </el-form-item>
                  <el-form-item :label="translate('新密码')">
                    <el-input v-model="passwordForm.newPassword" />
                  </el-form-item>
                  <el-form-item :label="translate('确认新密码')">
                    <el-input v-model="passwordForm.confirmPassword" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleChangePassword">
                      {{ translate('保存') }}
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-col>
            </el-tab-pane>
          </el-tabs>
        </vab-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
  import { translate } from '@/i18n'
  import { useUserStore } from '@/store/modules/user'
  import { setUserInfo, changePassword } from '@/api/userManagement'
  import { getUserInfo } from '@/api/user'
  import { ref } from 'vue'

  const emit = defineEmits(['fetch-data'])
  const $baseMessage = inject('$baseMessage')
  const userStore = useUserStore()
  const { avatar, userName, nickName } = storeToRefs(userStore)
  const userInfo = ref({})
  const activeName = ref('first')
  const passwordForm = ref({
    id: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
  })

  const onSubmit = async () => {
    const res = await setUserInfo({ ...userInfo.value })
    if (res.code === 0) {
      $baseMessage(res.msg, 'success', 'vab-hey-message-success')
      emit('fetch-data')

      close()
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.value.newPassword.length < 6) {
      $baseMessage('新密码不能小于6位', 'error', 'vab-hey-message-error')
      return
    }
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      $baseMessage('两次输入新密码不一致', 'error', 'vab-hey-message-error')
      return
    }
    const res = await changePassword({ ...passwordForm.value })
    if (res.code === 0) {
      $baseMessage(res.msg, 'success', 'vab-hey-message-success')
    }
  }

  const init = async () => {
    // basePath = ref(`http://${window.location.hostname}:27401/`)
    // console.log('basePath::::', avatar.value)
    const { data } = await getUserInfo()
    userInfo.value = data.userInfo
    passwordForm.value.id = data.userInfo.id
    // console.log('data========', data)
  }

  // let basePath = null
  onMounted(() => {
    init()
  })
</script>

<style lang="scss" scoped>
  $base: '.personal-center';
  #{$base}-container {
    padding: 0 !important;
    background: $base-color-background !important;

    #{$base}-user-info {
      padding: $base-padding;
      text-align: center;

      :deep() {
        .el-avatar {
          img {
            cursor: pointer;
          }
        }
      }

      &-full-name {
        margin-top: 15px;
        font-size: 24px;
        font-weight: 500;
        color: #262626;
      }

      &-description {
        margin-top: 8px;
      }

      &-follow {
        margin-top: 15px;
      }

      &-list {
        margin-top: 18px;
        line-height: 30px;
        text-align: left;
        list-style: none;

        h5 {
          margin: -20px 0 5px 0;
        }

        :deep() {
          .el-tag {
            margin-right: 10px !important;
          }

          .el-tag + .el-tag {
            margin-left: 0;
          }
        }
      }
    }

    #{$base}-item {
      display: flex;

      i {
        font-size: 40px;
      }

      &-content {
        box-sizing: border-box;
        flex: 1;
        margin-left: $base-margin;

        &-second {
          margin-top: 8px;
        }
      }
    }
  }
</style>
