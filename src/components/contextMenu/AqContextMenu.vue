<script setup>
/*
使用方法：通过 ref 调用 openContextDialog, eg:
  <div @contextmenu="() => contextRef.openContextDialog($event)" />
  <aq-context-menu ref="contextRef" />
参数 props：
  modal 是否拦截对下层元素的点击
  width 菜单栏宽度
  menus 菜单【重要】
    code 唯一 key 值，emit [menuClick] 事件，可以根据 code 判断执行什么方法
    name 菜单名
    icon 菜单图标
    children 子菜单
    action 方法 (d) => {}，d 为 openContextDialog 传递进来的 data，默认为 null
    disabled 菜单禁用
    separator 是否是分割线，name 不为空时分割线中间会显示 name
  isRoot 是否是根菜单，只会在根菜单执行 action 方法
事件 emit：
  menuClick 点击菜单触发，(menu, data) => {}，menu 为被点击的目录，data 为 openContextDialog 传递进来的 data
方法（可通过 ref 调用）：
  openContextDialog(e, data, top, left) 打开弹窗
    e 点击事件主要为了读取 clientX，clientY 计算坐标
    data [可选] 传递数据进组件方便执行方法，默认为 null
    top [可选] 默认读取 e 的 clientY
    left [可选] 默认读取 e 的 clientX
  closeContextDialog() 关闭弹窗
*/

  const props = defineProps({
    // 用来控制菜单打开的时候，是否拦截对下层的鼠标事件
    modal: {
      type: Boolean,
      default: true,
    },
    width: {
      type: Number,
      default: 200,
    },
    menus: {
      type: Array,
      default: () => [
        {
          code: 'test1',
          name: '测试1',
          icon: 'alarm-warning-line',
          action: (d) => {
            alert(d)
          },
        },
        {
          code: 'test2',
          name: '测试2',
          children: [
            { code: 'test2-1', name: '测试2-1', icon: 'alarm-warning-line' },
            { separator: true },
            { code: 'test2-2', name: '测试2-2' },
            { code: 'test2-3', name: '测试2-3', disabled: true },
          ],
        },
        { separator: true, name: '分割线' },
        { code: 'test3', name: '测试3', disabled: true },
      ],
    },
    isRoot: {
      type: Boolean,
      default: true,
    }
  })

  const emit = defineEmits(['menuClick'])

  const contentRef = ref(null)
  const subContextDialog = ref(null)
  const data = ref(null)
  const visible = ref(false)
  const top = ref(0)
  const left = ref(0)
  const subMenus = ref([])

  // 点击时可以传递 data 进来，触发的菜单点击的时候会将数据返回
  const openContextDialog = (e, _data = null, _top = e.clientY, _left = e.clientX) => {
    e.preventDefault()
    visible.value = true
    // 计算边界条件
    data.value = _data
    top.value = _top
    left.value = Math.min(_left, document.body.clientWidth - props.width)
    // 没有办法立马获取高度
    nextTick(() => top.value = Math.min(_top, document.body.clientHeight - 20 - contentRef.value?.offsetHeight))
  }
  const closeContextDialog = () => {
    visible.value = false
  }
  // 菜单悬浮事件
  const handleMenuHover = (e, menu) => {
    if (menu.children?.length) {
      // 打开子菜单
      subMenus.value = menu.children
      // 右边宽度不够时在左边打开
      const _left = left.value + props.width * 2 > document.body.clientWidth ? left.value - props.width : left.value + props.width
      const _top = e.target.getBoundingClientRect().y || e.clientY || top.value
      subContextDialog.value.openContextDialog(e, data.value, _top, _left)
    } else {
      // 关闭子菜单
      subContextDialog.value.closeContextDialog()
    }
  }
  // 菜单点击事件
  const handleMenuClick = (menu) => {
    if (props.isRoot && menu.action) {
      menu.action(data.value)
    }
    emit('menuClick', menu, data.value)
    closeContextDialog()
  }

  defineExpose({ openContextDialog, closeContextDialog })
</script>

<template>
  <div
    v-if="visible"
    class="context-dialog"
    @contextmenu="(e) => e.preventDefault()"
  >
    <div
      class="context-dialog-modal"
      :style="{ pointerEvents: props.modal ? 'all' : 'none' }"
      @click="closeContextDialog"
    />
    <div
      ref="contentRef"
      class="context-dialog-content"
      :style="{ top: top + 'px', left: left + 'px', width: width + 'px' }"
    >
      <slot name="content"></slot>
      <div class="context-dialog-menus">
        <div v-for="(menu, i) in props.menus" :key="i">
          <div v-if="menu.separator" class="context-dialog-menu-separator">
            <el-divider>{{ menu.name }}</el-divider>
          </div>
          <div
            v-else
            :class="{
            'context-dialog-menu-item': true,
            'context-dialog-menu-item-disabled': menu.disabled,
          }"
            @click="handleMenuClick(menu)"
            @mouseenter="handleMenuHover($event, menu)"
          >
            <div class="context-dialog-menu-item-left">
              <vab-icon v-if="menu.icon" :icon="menu.icon" />
              {{ menu.name }}
            </div>
            <div class="context-dialog-menu-item-right">
              <vab-icon v-if="menu.children?.length" icon="arrow-right-s-line"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <AqContextMenu
      ref="subContextDialog"
      :is-root="false"
      :menus="subMenus"
      :modal="false"
      :width="props.width"
      @menu-click="handleMenuClick"
    />
  </div>
</template>

<style lang="scss" scoped>
  .context-dialog-modal {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2001;
  }

  .context-dialog-content {
    position: fixed;
    box-shadow: 0 0 10px 5px #3c3b531a;
    background-color: #fff;
    border-radius: 5px;
    z-index: 2002;
  }

  .context-dialog-menu-separator {
    margin: 0 $base-margin / 2;
    padding: 0;

    .el-divider {
      margin: 0;
    }
  }

  .context-dialog-menu-item {
    cursor: default;
    height: 36px;
    display: flex;
    vertical-align: center;
    justify-content: space-between;
    padding: $base-padding;
    margin: $base-margin / 2;

    i {
      color: var(--el-color-primary);
    }
  }

  .context-dialog-menu-item-disabled {
    color: var(--el-text-color-disabled);
    pointer-events: none;
    background-color: unset;
  }

  .context-dialog-menu-item:hover {
    background-color: var(--el-color-primary);
    color: var(--el-color-white);
    border-radius: 5px;

    i {
      color: var(--el-color-white);
    }
  }
</style>
