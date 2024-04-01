<template>
  <div
    ref="navRef"
    class="nav-set-view"
    @contextmenu.prevent="handleRightClick"
  >
    <!-- 视图 -->
    <div class="nav-set-box">
      <div class="left-nav-box">
        <div
          v-for="(box, i) in boxes"
          :id="i"
          :key="box"
          :class="{
            'nav-box-item': true,
            'nav-box-item-select': box.select,
            'nav-box-item-ng': box.ng,
          }"
          :style="{
            width: `${box.rect.width * scaleRatioX}px`,
            height: `${box.rect.height * scaleRatioY}px`,
            transform: `translate(${(box.rect.x + offsetX) * scaleRatioX}px, ${
              (box.rect.y + offsetY) * scaleRatioY
            }px)`,
            zIndex: box.zIndex,
          }"
          @click="clickNode(i)"
          @dblclick="dblclickBox(i)"
        >
          <span>{{ box.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import { splitNumStr } from '@/utils/format'
  import { isArray1ContainsArray2 } from '@/utils/util'
  import vrsNavApi from '@/api/vrsNav'
  import '@interactjs/auto-start'
  import '@interactjs/actions/drag'
  import '@interactjs/actions/resize'
  import '@interactjs/modifiers'
  import '@interactjs/dev-tools'
  // import interact from '@interactjs/interact'
  // import leftNavSet from './leftNavSet.vue'
  // import rightNavSet from './rightNavSet.vue'
  export default {
    props: {
      showNavObj: {
        type: Object,
        default: () => ({
          aiNgCapturePos: [],
          selectPoint: '',
        }),
      },
    },
    emits: ['clickNode', 'navNodeInfo'],
    // components: { leftNavSet, rightNavSet },
    data() {
      return {
        contextMenuVisible: false,
        position: {},
        tableData: [],
        nodeRules: {
          name: [
            {
              required: true,
              message: translate('必填'),
              trigger: 'blur',
            },
          ],
        },
        nodeDialogVis: false,
        nodeName: '新节点',
        nodeEditForm: {
          index: '',
          name: '',
          point: '',
          zIndex: '',
        },
        selectBoxIndex: -1,
        boxes: [],
        navPicData: '',
        scaleRatioX: 1,
        scaleRatioY: 1,
        offsetX: 0,
        offsetY: 0,
      }
    },
    computed: {
      translate() {
        return translate
      },
    },
    watch: {
      showNavObj: {
        handler(newVal) {
          this.handleNodeStyle(newVal)
        },
        deep: true,
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {
      this.getData()
    },
    methods: {
      // 右键事件
      handleRightClick(event) {
        // 阻止默认的右键菜单弹出
        event.preventDefault()
        const x = event.offsetX
        const y = event.offsetY
        this.position = { x, y }
        this.contextMenuVisible = true
      },
      handleContextMenuItemClick(option) {
        const param = {
          id: this.navPicData.id,
          name: this.navPicData.name,
          detail: JSON.stringify(this.boxes),
        }
        vrsNavApi.saveNavConfig(param).then(() => {})
        this.contextMenuVisible = false
        console.log('option::', option)
      },
      // 控制节点样式
      handleNodeStyle(data) {
        this.boxes.forEach((item) => {
          if (!item.point) {
            return
          }
          const pointArr = splitNumStr(item.point)
          item.ng = !!isArray1ContainsArray2(pointArr, data.aiNgCapturePos)
          // 点位没有的话，不改变选中的样式
          if (data.selectPoint) {
            item.select = pointArr.includes(data.selectPoint)
          }
        })
        // console.log('this.boxes的值', this.boxes, data)
      },
      async getData() {
        const res = await vrsNavApi.getEnableNavConfig({})
        if (res.code === 0 && res.data) {
          this.navPicData = res.data
          this.boxes = JSON.parse(res.data.detail)
          // 回传父组件信息
          const obj = {}
          this.boxes.forEach((item) => {
            if (item.point) {
              const pointArr = splitNumStr(item.point)
              for (const element of pointArr) {
                obj[element] = item.name
              }
            }
          })
          this.$emit('navNodeInfo', obj)

          // 修改放大系数
          this.renderBoxsWH()
        }
      },
      /**
       * 修改放大系数 可提供给父组件调用
       */
      renderBoxsWH() {
        const w = this.$refs.navRef.offsetWidth
        const h = this.$refs.navRef.offsetHeight
        let maxX = 0,
          maxY = 0,
          minX = Infinity,
          minY = Infinity
        for (const box of this.boxes) {
          maxX = Math.max(maxX, box.rect.x + box.rect.width)
          maxY = Math.max(maxY, box.rect.y + box.rect.height)
          minX = Math.min(minX, box.rect.x)
          minY = Math.min(minY, box.rect.y)
        }
        this.scaleRatioX = w / (maxX - minX)
        this.scaleRatioY = h / (maxY - minY)
        this.offsetX = minX === Infinity ? 0 : -minX
        this.offsetY = minY === Infinity ? 0 : -minY
      },
      clickNode(index) {
        this.boxes.forEach((item, i) => {
          item.select = index === i
        })
        console.log('子组件日志：子组件单击')
        this.$emit('clickNode', this.boxes[index])
      },
      dblclickBox(index) {
        console.log('子组件日志：子组件双击', index)
      },
    },
  }
</script>
<style scoped lang="scss">
  .nav-set-view {
    width: 100%;
    height: 100%;
  }

  .nav-set-box {
    display: flex;
    width: 100%;
    height: 94%;
  }

  .left-nav-box {
    position: relative;
    flex: 1;
    height: 100%;
    margin: 1px;
  }

  .nav-box-item {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    touch-action: none;
    user-select: none;
    border: 1px solid #ffffff;
    background-color: #b9b9b9;
    span {
      background-color: #b9b9b9;
    }
  }

  .context-menu {
    position: absolute;
    z-index: 1000;
    color: black;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  ul,
  li {
    padding: 2px 8px;
    margin: 0;
    white-space: nowrap;
    list-style: none;
  }
  li:hover {
    background-color: #ddd;
  }

  .nav-box-item-ng {
    background-color: var(--el-color-danger);
    span {
      background-color: var(--el-color-danger);
    }
  }

  .nav-box-item-select {
    border: 3px solid var(--el-color-primary);
    background-image: linear-gradient(
        -45deg,
        transparent 49%,
        var(--el-color-primary) 49%,
        var(--el-color-primary) 51%,
        transparent 51%
      ),
      linear-gradient(
        -45deg,
        transparent 49%,
        var(--el-color-primary) 49%,
        var(--el-color-primary) 51%,
        transparent 51%
      );
    background-size: 50px 50px;
    background-position: 0 0, 25px 0;
  }
</style>
