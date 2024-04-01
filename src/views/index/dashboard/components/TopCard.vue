<template>
  <vab-card class="top-card" :class="'top-card-' + background" shadow="hover">
    <span>{{ title }}</span>
    <p>
      <vab-count
        :decimals="countConfig.decimals"
        :duration="countConfig.duration"
        :end-val="countConfig.endVal"
        :prefix="countConfig.prefix"
        :separator="countConfig.separator"
        :start-val="countConfig.startVal"
        :suffix="countConfig.suffix"
      />
    </p>
    <div class="right-icon">
      <vab-icon :icon="icon" />
    </div>

    <div v-show="type === '1'" class="bottom">
      {{ translate('同比上个时段') }}
      <vab-icon icon="arrow-up-line" />
      <span>{{ percentage }}</span>
    </div>
    <div v-show="type === '2'" class="bottom">
      {{ translate('数量最多的缺陷') }}
      <vab-icon icon="arrow-right-s-line" />
      <span>{{ percentage }}</span>
    </div>
    <div v-show="type === '3'" class="bottom">
      {{ translate('最大缺陷报点数') }}
      <vab-icon icon="arrow-right-s-line" />
      <span>{{ percentage }}</span>
    </div>
  </vab-card>
</template>

<script>
  import { translate } from '@/i18n'
  import _ from 'lodash'
  import VabCount from '@/plugins/VabCount'

  export default defineComponent({
    name: 'TopCard',
    components: {
      VabCount,
    },
    props: {
      background: {
        type: String,
        default: 'white',
      },
      type: {
        type: String,
        default: '',
      },
      title: {
        type: String,
        default: 'Test',
      },
      icon: {
        type: String,
        default: 'album-line',
      },
      percentage: {
        type: String,
        default: '10%',
      },
      countConfig: {
        type: Object,
        default: () => {
          return {
            startVal: 0,
            endVal: 9527,
            decimals: 0,
            prefix: '',
            suffix: '',
            separator: ',',
            duration: 3000,
          }
        },
      },
    },
    setup() {
      const state = reactive({})

      return {
        ...toRefs(state),
        translate,
      }
    },
  })
</script>

<style lang="scss" scoped>
  .top-card {
    position: relative;
    height: 168px !important;

    p {
      font-size: 28px;
    }

    .right-icon {
      position: absolute;
      top: 50%;
      right: 20px;
      width: 60px;
      height: 60px;
      line-height: 60px;
      color: var(--el-color-primary);
      text-align: center;
      background: var(--el-color-primary-light-9);
      border-radius: 50%;
      transform: translateY(-50%);

      i {
        font-size: 35px;
      }
    }

    .bottom {
      .ri-arrow-right-s-line,
      .ri-arrow-up-line {
        width: 18px;
        height: 18px;
        margin: 0 3px 0 2px;
        color: var(--el-color-success);
        vertical-align: -3px !important;
        background: var(--el-color-success-light);
        border-radius: 50%;
        transform: scale(0.8);
      }

      span {
        color: var(--el-color-success);
      }
    }

    &-blue {
      color: #fff;
      background: var(--el-color-primary);
      background: linear-gradient(
        90deg,
        var(--el-color-primary-light-4),
        var(--el-color-primary)
      );

      .bottom {
        .ri-arrow-right-s-line,
        .ri-arrow-up-line {
          color: #fff;
          background: transparent;
        }

        .ri-arrow-right-s-line,
        .ri-arrow-up-line {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
          transform: scale(0.8);
        }

        span {
          color: #fff;
        }
      }
    }
  }
</style>
