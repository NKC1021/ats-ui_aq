<!--  -->
<template>
  <div ref="domRef" class="add-label-component" @click="clickPic"></div>
  <div class="add-label-box" :style="`top:${shwoTop}px;left:${showLeft}px`">
    <el-input
      ref="labelRef"
      v-model="labelName"
      @blur="blurMethod"
      @focus="focusMethod"
      @keyup.enter="labelNameEnter"
    />
    <ul v-show="labelNameData.length" class="label-name-items">
      <li
        v-for="(el, index) in labelNameData"
        :key="index"
        class="label-item"
        @click="labelNameClick(el)"
      >
        <span
          class="select-color-tip"
          :style="`background:${colorTag[`${el.tagId % 10}`]} ;`"
        ></span>
        <span>{{ el.label }}</span>

        <el-button
          icon="Delete"
          link
          size="small"
          type="primary"
          @click.stop="deleteLabel(el)"
        />
      </li>
    </ul>
    <div v-show="!labelNameData.length" class="no-labels">
      <el-empty description="无数据" :image-size="100" />
    </div>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import { colorTag } from './index.js'
  export default {
    props: {
      top: {
        type: Number,
        default: 0,
      },
      left: {
        type: Number,
        default: 0,
      },
      bodyWidth: {
        type: Number,
        default: 0,
      },
      bodyHeight: {
        type: Number,
        default: 0,
      },
      show: {
        type: Boolean,
        default: false,
      },
      tags: {
        type: Array,
        default: () => [],
      },
      keycodeFlag: {
        type: Boolean,
        default: true,
      },
    },
    emits: ['update:show', 'addLabelname', 'deletelabel', 'update:keycodeFlag'],
    data() {
      return {
        labelName: '',
        addLabelWidth: 200, // 弹窗宽
        addLabelHeight: 250, //弹窗高
      }
    },
    computed: {
      translate() {
        return translate
      },
      colorTag() {
        return colorTag
      },
      labelNameData() {
        if (!this.labelName) return this.tags
        return this.$pinyinSearch.matchPinyin(this.tags, this.labelName)
      },
      /**
       * 展示添加标签位置
       */
      shwoTop() {
        let _top = this.bodyHeight - this.top
        _top =
          _top > this.addLabelHeight ? this.top : this.top - this.addLabelHeight
        return _top > 0 ? _top + 10 : 0
      },
      showLeft() {
        let _left = this.bodyWidth - this.left
        _left = _left > this.addLabelWidth ? this.left : this.left - _left
        return _left > 0 ? _left + 10 : 0
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {
      /**
       * 聚焦输入框
       */
      this.$refs.labelRef.focus()
    },
    methods: {
      /**
       *
       * 回车事件
       */
      labelNameEnter() {
        if (this.labelNameData.length) return
        // console.log('valval:::', this.labelName)
        this.$emit('addLabelname', this.labelName, true)
        this.$nextTick(() => {
          this.closeAddLabel()
        })
      },
      /**
       * 点击标签
       */
      labelNameClick(item) {
        // console.log('点击的标签::::', item)
        this.$emit('addLabelname', item.label)
        this.$nextTick(() => {
          this.closeAddLabel()
        })
      },
      /**
       * 关闭弹窗
       */
      closeAddLabel() {
        this.$emit('update:show', false)
      },
      /**
       * 遮罩层点击关闭弹窗
       */
      clickPic() {
        this.closeAddLabel()
      },
      /**
       * 删除标签
       */
      deleteLabel(item) {
        this.$emit('deletelabel', item)
      },
      blurMethod() {
        this.$emit('update:keycodeFlag', true)
      },
      focusMethod() {
        this.$emit('update:keycodeFlag', false)
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .add-label-component {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 1900;
    background: rgba(0, 0, 0, 0.05);
  }
  .add-label-box {
    width: 200px;
    height: 250px;
    box-sizing: border-box;
    padding: 10px;
    position: fixed;
    left: 0;
    top: 0;
    box-shadow: 0 0 10px 5px #3c3b531a;
    background-color: #fff;
    border-radius: 5px;
    z-index: 2000;
    .no-labels {
      width: 100%;
      height: calc(100% - 32px);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .label-name-items {
      margin-top: 5px;
      width: 100%;
      height: calc(100% - 32px);
      overflow: hidden;
      overflow-y: auto;
      .label-item {
        width: 100%;
        padding: 4px 2px;
        cursor: pointer;
        // background: #eaeaea;
        border: 2px solid #fff;
        border-radius: 5px;
      }
      .label-item:hover {
        color: var(--el-color-primary);
        // background: var(--el-color-primary);
        background: #f5f7fa;
      }
    }
  }
  .select-color-tip {
    display: inline-block;
    width: 8px;
    height: 14px;
    position: relative;
    top: 2px;
    border-radius: 2px;
    margin-right: 6px;
  }
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
