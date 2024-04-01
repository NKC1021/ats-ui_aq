<script lang="ts" setup>
  import { useRoutesStore } from '@/store/modules/routes'
  import { isExternal } from '@/utils/validate'
  import { isHashRouterMode } from '@/config'
  import { VabRoute } from '/#/router'
  import { useSettingsStore } from '@/store/modules/settings'
  import variables from '@vab/styles/variables/variables.module.scss'
  import { translate } from '@/i18n'
  import { recordProInfo } from '@/store/modules/project'
  import FlWebSocket from '@/utils/websocket'
  import { onUnmounted } from 'vue'

  defineProps({
    layout: {
      type: String,
      default: 'horizontal',
    },
  })
  const projectStore = recordProInfo()
  let socketMsg = {
    close: () => {},
  }
  const onmessageCallback = (data: any) => {
    // console.log('websocketData:::', data)
    projectStore.setSocketMsg(data)
  }
  socketMsg = new FlWebSocket(onmessageCallback)
  onUnmounted(() => {
    // console.log('组件销毁::::')
    socketMsg.close()
  })
  const solutionName = computed(() => {
    return projectStore.solutionName
  })
  const routesStore = useRoutesStore()
  const { getActiveMenu: activeMenu, getRoutes: routes } =
    storeToRefs(routesStore)
  const showKeysDrawer = () => {
    projectStore.showKeysValDrawer = !projectStore.showKeysValDrawer
  }
  // const { getRoutes: routes } = storeToRefs(routesStore)
  // const route: VabRoute = useRoute()
  // const router = useRouter()
  // const $pub: any = inject('$pub')
  // const settingsStore = useSettingsStore()
  // const { foldSideBar } = settingsStore
  // const { device } = storeToRefs(settingsStore)
  // const handleLink = (data: any) => {
  //   if (data.children && data.children.length !== 0) return
  //   const routePath = data.path
  //   const target = data.meta.target
  //   if (target === '_blank') {
  //     if (isExternal(routePath)) window.open(routePath)
  //     else if (route.path !== routePath)
  //       isHashRouterMode
  //         ? window.open(`/#${routePath}`)
  //         : window.open(routePath)
  //   } else {
  //     if (isExternal(routePath)) window.location.href = routePath
  //     else if (route.path !== routePath) {
  //       if (device.value === 'mobile') foldSideBar()
  //       router.push(data.path)
  //     } else $pub('reload-router-view')
  //   }
  // }
</script>
<template>
  <div class="vab-header">
    <div class="vab-main">
      <el-row :gutter="20">
        <el-col :span="6">
          <vab-logo />
        </el-col>
        <el-col :span="18">
          <div class="right-panel">
            <!-- <div
              v-for="(rootMenu, rootMenuIndex) in routes"
              :key="rootMenuIndex"
              class="aqs-menu-view"
            >
              <div class="aqs-menu-top">
                <vab-icon :icon="rootMenu.meta.icon" />
                <span>{{ translate(rootMenu.meta.title) }}</span>
              </div>
              <div class="aqs-menu-drop">
                <div class="aqs-menu-layout">
                  <div
                    v-for="(menuItem, menuIndex) in rootMenu.children"
                    :key="menuIndex"
                    :class="
                      menuItem.meta.activeName === 'border'
                        ? 'aqs-menu-content border'
                        : 'aqs-menu-content'
                    "
                  >
                    <div
                      :class="
                        menuItem.children && menuItem.children.length !== 0
                          ? 'aqs-menu none-click'
                          : 'aqs-menu'
                      "
                      @click="handleLink(menuItem)"
                    >
                      <vab-icon :icon="menuItem.meta.icon" />
                      {{ translate(menuItem.meta.title) }}
                      <vab-icon
                        v-if="
                          menuItem.children && menuItem.children.length !== 0
                        "
                        icon="arrow-right-s-line"
                      />
                    </div>
                    <div
                      v-for="(subMenuItem, subMenuIndex) in menuItem.children"
                      :key="subMenuIndex"
                      class="aqs-sub-menu"
                      @click="handleLink(subMenuItem)"
                    >
                      <vab-icon :icon="subMenuItem.meta.icon" />
                      <span>{{ translate(subMenuItem.meta.title) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> -->

            <el-menu
              v-if="'horizontal' === layout"
              :active-text-color="variables['menu-color-active']"
              :background-color="variables['menu-background']"
              :default-active="activeMenu.data"
              menu-trigger="hover"
              mode="horizontal"
              popper-append-to-body
              style="width: 100%"
              :text-color="variables['menu-color']"
            >
              <template
                v-for="(item, index) in routes.flatMap((route) =>
                  route['meta'] &&
                  route['meta']['levelHidden'] &&
                  route['children']
                    ? [...route['children']]
                    : route
                )"
              >
                <vab-menu
                  v-if="item['meta'] && !item['meta']['hidden']"
                  :key="index + item['name']"
                  :item="item"
                  :layout="layout"
                />
              </template>
            </el-menu>
            <el-tooltip
              :content="solutionName"
              :disabled="solutionName.length < 8"
              effect="dark"
              placement="bottom"
            >
              <div v-show="solutionName" class="head-project-name">
                {{ solutionName }}
              </div>
            </el-tooltip>
            <span
              class="keys-tip"
              :title="translate('查看快捷键')"
              @click="showKeysDrawer"
            >
              <el-icon><Paperclip /></el-icon>
            </span>
            <vab-error-log />
            <vab-lock />
            <!-- <vab-search /> -->
            <!-- <vab-notice /> -->
            <vab-full-screen />
            <vab-language />
            <vab-theme />
            <vab-refresh />
            <vab-avatar />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @use 'sass:math';

  $base-menu-height: 40px;
  .aqs-menu-view:hover {
    .aqs-menu-drop {
      height: 330px;
      transition: all 0.1s;
    }
  }
  .aqs-menu-drop {
    position: absolute;
    top: 60px;
    right: 10px;
    z-index: 10;
    width: 1058px;
    height: 0px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0px 12px 12px 0 rgb(0 0 0 / 7%);
    .aqs-menu-content {
      margin-right: 60px;
      color: #000;
    }
    .aqs-menu-content.border {
      height: 18em;
      padding-right: 60px;
      border-right: 1px var(--el-border-color) solid;
    }

    .aqs-sub-menu {
      display: flex;
      font-size: 14px;
      line-height: 30px;
      cursor: pointer;
      border-radius: 3px;
      span {
        line-height: 34px;
      }
    }
    .aqs-sub-menu:hover {
      color: var(--el-color-primary);
    }
    .aqs-menu-layout {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      justify-content: flex-start;
      max-height: 330px;
      padding: 15px 30px;
      i {
        margin-right: 3px;
        margin-left: 0px !important;
        color: inherit !important;
      }
    }
  }

  .aqs-menu {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    min-width: 90px;
    height: 40px;
    font-size: 14px;
    line-height: 40px;
    color: var(--el-color-primary);
    cursor: pointer;
    border-radius: 3px;
  }

  .aqs-menu.none-click {
    cursor: default;
    i {
      cursor: default !important;
    }
  }

  .aqs-menu-top {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    min-width: 90px;
    height: 40px;
    font-size: 15px;
    line-height: 40px;
    color: #fff;
    cursor: pointer;
    border-radius: 3px;
    span {
      margin-left: 3px;
    }
    i {
      font-size: 15px;
    }
  }
  .aqs-menu-top:hover {
    background: var(--el-color-primary);
  }

  .vab-header {
    display: flex;
    align-items: center;
    justify-items: flex-end;
    height: $base-header-height;
    background: $base-menu-background;

    .vab-main {
      padding: 0 $base-padding 0 $base-padding;

      .right-panel {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: $base-header-height;
        .keys-tip {
          display: inline-block;
          width: 16px;
          height: 16px;
          line-height: 16px;
          margin-left: 10px;
          cursor: pointer;
          i {
            font-size: 16px;
          }
        }
        :deep() {
          .el-sub-menu__icon-more {
            margin-top: #{math.div($base-menu-height - 20, 2)} !important;
            margin-right: 20px !important;
          }

          > .el-menu--horizontal.el-menu {
            > .el-sub-menu > .el-sub-menu__title {
              padding-right: 0;

              > .el-sub-menu__icon-arrow {
                position: relative !important;
                margin-top: -5px !important;
                margin-right: 0;
                margin-left: 30px;
              }
            }

            > .el-menu-item {
              .el-tag {
                position: relative !important;
                margin-top: 0 !important;
                margin-right: -20px;
                margin-left: 25px;
              }

              .vab-dot {
                float: right;
                margin-top: #{math.div($base-header-height - 6, 2)} + 1;
              }

              @media only screen and (max-width: 1199px) {
                .el-tag {
                  display: none;
                }
              }
            }
          }

          .el-menu {
            border: 0 !important;
            * {
              border: 0 !important;
            }
            &.el-menu--horizontal {
              display: flex;
              align-items: center;
              justify-content: flex-end;
              width: 100%;
              height: $base-menu-height;
              border: 0 !important;

              > .el-menu-item,
              > .el-sub-menu {
                height: $base-menu-height;
                margin-right: 3px;
                line-height: $base-menu-height;
                border-radius: 3px;

                .el-sub-menu__icon-arrow {
                  float: right;
                  margin-top: 7px;
                }

                > .el-sub-menu__title {
                  display: flex;
                  align-items: flex-start;
                  height: $base-menu-height;
                  line-height: $base-menu-height;
                  border: 0 !important;
                  border-radius: 3px;
                }
              }
            }

            [class*='ri-'],
            .vab-icon {
              margin-left: 0;
              color: var(--el-color-white);
              cursor: pointer;
            }

            .el-sub-menu {
              .vab-icon {
                margin-top: 12px !important;
              }
            }

            .el-sub-menu,
            .el-menu-item {
              i,
              .vab-icon {
                color: inherit;
              }

              &.is-active {
                border: 0 !important;

                .el-sub-menu__title {
                  border: 0 !important;
                }
              }
            }

            .el-menu-item {
              &.is-active {
                background: var(--el-color-primary) !important;
              }
            }
          }

          .user-name {
            color: var(--el-color-white);
          }

          .user-name + i {
            color: var(--el-color-white);
          }

          [class*='ri-'] {
            margin-left: $base-margin;
            color: var(--el-color-white);
            cursor: pointer;
          }

          button {
            svg {
              margin-right: 0;
              color: var(--el-color-white);
              cursor: pointer;
              fill: var(--el-color-white);
            }
          }
        }
      }
    }
  }
</style>

<!--由于element-plus
bug使用popper-append-to-body=false会导致多级路由无法显示，故所有菜单必须生成至body下，样式必须放到body下-->
<style lang="scss">
  @use 'sass:math';
  @mixin menuActiveHover {
    &:hover,
    &.is-active {
      i {
        color: var(--el-color-white) !important;
      }

      color: var(--el-color-white) !important;
      background: var(--el-color-primary) !important;

      .el-sub-menu__title {
        i {
          color: var(--el-color-white) !important;
        }

        color: var(--el-color-white) !important;
        background: var(--el-color-primary) !important;
      }
    }
  }

  .el-popper {
    .el-menu--horizontal {
      height: #{math.div($base-header-height, 1.4)};
      border-bottom: 0 solid transparent !important;
      @media only screen and (max-width: 1199px) {
        .el-tag {
          display: none;
        }
      }

      .el-tag {
        position: absolute;
        right: 20px;
        margin-top: 0 !important;
      }

      .vab-dot {
        position: absolute;
        right: 20px;
        margin-top: 0 !important;
      }

      .el-menu-item,
      .el-sub-menu {
        height: #{math.div($base-header-height, 1.4)} !important;
        line-height: #{math.div($base-header-height, 1.4)} !important;
        @include menuActiveHover;

        i,
        svg {
          color: inherit;
        }

        .el-sub-menu__icon-arrow {
          float: right;
        }

        .el-sub-menu__title {
          height: #{math.div($base-header-height, 1.4)} !important;
          line-height: #{math.div($base-header-height, 1.4)} !important;
          @include menuActiveHover;
        }
      }
    }
  }
</style>
