<script lang="ts" setup>
  import { useSettingsStore } from '@/store/modules/settings'
  import { translate } from '@/i18n'
  import { ref, onMounted } from 'vue'

  const $pub: any = inject('$pub')
  const $baseMessage: any = inject('$baseMessage')

  const settingsStore: any = useSettingsStore()
  const { theme } = storeToRefs(settingsStore)

  const handleOpenTheme = () => {
    $pub('theme')
  }

  // 检查用户是否有主题配置的权限
  const checkThemeDrawerView = ref(false)
  const usrBtnAccess = JSON.parse(localStorage.getItem('usrBtnAccess') || '[]')
  const checkThemeBtn = () => {
    if (usrBtnAccess.includes('themeDrawer')) {
      checkThemeDrawerView.value = true
    }
  }
  onMounted(() => {
    checkThemeBtn() // 组件挂载后检查用户是否有配置主题的权限
  })

  const randomTheme = () => {
    $pub('random-theme')
  }
  const buy = () => {
    window.open('https://vue-admin-beautiful.com/authorization')
  }
  const getCode = () => {
    if (process.env.NODE_ENV === 'development') $pub('get-code')
    else
      ElMessageBox.prompt(
        '请输入密码(密码在购买时获得，跳转后需登录购买时绑定的github账号)',
        translate('温馨提示'),
        {
          confirmButtonText: translate('确定'),
          cancelButtonText: translate('取消'),
        }
      )
        .then(({ value }) => {
          if (value !== 'vabp') {
            $baseMessage('密码不正确！', 'error', 'vab-hey-message-error')
            return
          }
          $pub('get-code')
        })
        .catch(() => {})
  }

  const removeLocalStorage = () => {
    localStorage.clear()
    location.reload()
  }
</script>
<template>
  <!-- checkThemeDrawerView -->
  <ul v-if="true" class="vab-theme-setting">
    <li @click="handleOpenTheme">
      <a>
        <vab-icon icon="brush-2-line" />
        <p>{{ translate('主题配置') }}</p>
      </a>
    </li>
    <!-- <li @click="randomTheme">
      <a>
        <vab-icon icon="apps-line" />
        <p>{{ translate('随机换肤') }}</p>
      </a>
    </li>
    <li @click="buy">
      <a>
        <vab-icon icon="shopping-cart-2-line" />
        <p>{{ translate('购买源码') }}</p>
      </a>
    </li>
    <li @click="getCode">
      <a>
        <vab-icon icon="file-copy-line" />
        <p>{{ translate('拷贝源码') }}</p>
      </a>
    </li> -->
    <li @click="removeLocalStorage">
      <a>
        <vab-icon icon="delete-bin-4-line" />
        <p>
          {{ translate('清理缓存') }}
        </p>
      </a>
    </li>
  </ul>
</template>
<style lang="scss" scoped>
  .vab-theme-setting {
    position: fixed;
    top: 85%;
    right: -70px;
    // right: 0;
    z-index: $base-z-index - 2;
    padding: 10px 0 0 0;
    margin: 0;
    text-align: center;
    cursor: pointer;
    background: #e8f4ff !important;
    // background: var(--el-color-white);
    border: 1px solid $base-border-color;
    border-top-left-radius: $base-border-radius + 3;
    border-bottom-left-radius: $base-border-radius + 3;
    box-shadow: 0 0 50px 0 rgb(82 63 105 / 15%);
    transition: all 0.2s;
    transform: translateY(-50%);
    &:hover {
      right: 0;
      background: #ffffff !important;
    }

    > li {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px 10px 10px;
      margin: 0;
      list-style: none;

      &:nth-child(2) {
        [class*='ri-'] {
          animation: rotate 6s linear infinite;
        }
      }

      $colors: (
        1: #3698fd,
        2: #1bc3bb,
        3: #faa500,
        4: #b37feb,
        5: #ef4c5d,
      );

      @each $key, $color in $colors {
        &:nth-child(#{$key}) {
          a {
            color: $color;
            background: mix($base-color-white, $color, 90%);
            transition: color 0.15s ease, background-color 0.15s ease,
              border-color 0.15s ease, box-shadow 0.15s ease,
              -webkit-box-shadow 0.15s ease;

            &:hover {
              color: var(--el-color-white);
              background: $color;
            }
          }
        }
      }

      a {
        display: inline-block;
        width: 60px;
        height: 60px;
        padding-top: 10px;
        text-align: center;
        background: #f6f8f9;
        border-radius: $base-border-radius + 3;

        p {
          padding: 0;
          margin: 0;
          overflow: hidden;
          font-size: $base-font-size-small;
          line-height: 25px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
</style>
