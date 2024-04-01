<template>
  <div
    class="context-menu"
    :style="{ top: `${position.y}px`, left: `${position.x}px` }"
  >
    <ul>
      <li
        v-for="option in options"
        :key="option.label"
        @click="handleClick(option)"
      >
        {{ option.btnName }}
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    props: {
      position: {
        type: Object,
        default: () => ({
          x: 0,
          y: 0,
        }),
      },
      options: {
        type: Array,
        default: () => [],
      },
    },
    // ['position', 'options'], // 通过 props 传递位置和选项
    methods: {
      handleClick(option) {
        // 处理菜单选项的点击事件
        console.log('点击', option.fnHandler)
        this.$emit(option.fnHandler)
      },
    },
  }
</script>

<style scoped lang="scss">
  .context-menu {
    position: absolute;
    z-index: 1000;
    background: #fff;
    border: 1px solid #ccc;

    border-radius: 5px;
  }
  ul,
  li {
    margin: 0;
    padding: 2px 8px;
    list-style: none;
    white-space: nowrap;
  }
  li:hover {
    background-color: #ddd;
  }
</style>
