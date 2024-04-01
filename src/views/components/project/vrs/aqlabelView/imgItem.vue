<!--  -->
<template>
  <div class="img-list-item">
    <div :class="['image-top', { 'image-top-select': sourceData.select }]">
      <span class="image-order">{{ sourceData?.id }}</span>
      <span
        :class="[
          'canvas-tag',
          { 'segment-tag-ng': sourceData.type === 'NG' },
          { 'segment-tag-ok': sourceData.type === 'OK' },
        ]"
      >
        {{ sourceData.type }}
      </span>
      <img alt="" draggable="false" :src="`data:image/png;base64,${dataImg}`" />
    </div>
    <div class="image-title">{{ sourceData?.value }}</div>
  </div>
</template>

<script>
  import { dataImg } from './index.js'
  export default {
    props: {
      sourceData: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    data() {
      return {}
    },
    computed: {
      dataImg() {
        return dataImg
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {},
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */

  .img-list-item {
    margin-bottom: 10px;
    .image-top:hover {
      border-color: var(--el-color-primary);
    }

    .image-top {
      width: 100%;
      height: 114px;
      background-color: #f5f6fc;
      border: 2px solid #fff;
      position: relative;
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .image-order {
        position: absolute;
        top: 0;
        left: 0;
        font-size: 12px;
        line-height: 18px;
        padding: 0px 4px;
        background-color: var(--el-color-primary);
        color: #fff;
      }
      .canvas-tag {
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: 12px;
        line-height: 18px;
        padding: 0 4px;
      }
      .segment-tag-ok {
        background-color: #dbeadf;
        color: #1fac3f;
      }
      .segment-tag-ng {
        background-color: #f6d6db;
        color: #c50b2a;
      }
    }
    .image-top-select {
      border-color: var(--el-color-primary);
    }
    .image-title {
      width: 100%;
      padding: 0 20px;
      background-color: #f5f6fc;
      height: 22px;
      line-height: 22px;
      margin-top: 5px;
      text-align: center;
    }
  }
</style>
