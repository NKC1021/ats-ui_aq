<template>
  <div class="vrs-nav-set-box">
    <div
      v-for="(box, i) in boxes"
      :id="i"
      :key="box"
      class="draggable"
      :style="{
        backgroundColor: i == selectBox ? activeColor : deActiveColor,
        width: `${box.rect.width}px`,
        height: `${box.rect.height}px`,
        transform: `translate(${box.rect.x}px, ${box.rect.y}px)`,
        zIndex: box.zIndex,
      }"
      @click="selectBox = i"
      @dblclick="box.zIndex++"
    >
      {{ box.tag }}, {{ box.rect }}
    </div>
  </div>
</template>
<script>
  // import { translate } from '@/i18n'
  import '@interactjs/auto-start'
  import '@interactjs/actions/drag'
  import '@interactjs/actions/resize'
  import '@interactjs/modifiers'
  import '@interactjs/dev-tools'
  import interact from '@interactjs/interact'

  export default defineComponent({
    name: 'VrsNavSet',
    props: {},
    setup(props, { emit }) {
      const state = reactive({
        selectBox: -1,
        activeColor: '#5c7c4c',
        deActiveColor: '#6c706a',
        boxes: [
          {
            tag: 'C1',
            rect: { x: 0, y: 0, width: 160, height: 160 },
            zIndex: 1,
          },
          {
            tag: 'C2',
            rect: { x: 180, y: 0, width: 160, height: 160 },
            zIndex: 1,
          },
          {
            tag: 'C3',
            rect: { x: 360, y: 0, width: 160, height: 160 },
            zIndex: 1,
          },
          {
            tag: 'C4',
            rect: { x: 0, y: 180, width: 160, height: 160 },
            zIndex: 1,
          },
        ],
      })
      interact('.draggable')
        .resizable({
          edges: { left: true, right: true, bottom: true, top: true },
          listeners: {
            move(event) {
              const box = state.boxes[event.target.id]
              // 大小变化
              box.rect.width = event.rect.width
              box.rect.height = event.rect.height

              // 从左上角 resize 坐标会变
              box.rect.x += event.deltaRect.left
              box.rect.y += event.deltaRect.top
            },
          },
          modifiers: [
            interact.modifiers.snap({
              targets: [interact.snappers.grid({ x: 20, y: 20 })],
              range: Infinity,
              relativePoints: [{ x: 0, y: 0 }],
            }),
            interact.modifiers.restrictEdges({
              outer: 'parent',
            }),
            interact.modifiers.restrictSize({
              min: { width: 50, height: 50 },
            }),
          ],
        })
        .draggable({
          modifiers: [
            interact.modifiers.snap({
              targets: [interact.snappers.grid({ x: 20, y: 20 })],
              range: Infinity,
              relativePoints: [{ x: 0, y: 0 }],
            }),
          ],
          listeners: {
            move(event) {
              const box = state.boxes[event.target.id]
              box.rect.x += event.dx
              box.rect.y += event.dy
            },
          },
        })
      return {
        ...toRefs(state),
      }
    },
  })
</script>

<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .vrs-nav-set-box {
    position: relative;
    flex: 1;
    height: 100%;
    background: #ddd;
  }

  .draggable {
    position: absolute;
    padding: 10px;
    color: white;
    touch-action: none;
    user-select: none;
    border-radius: 0.75em;
  }
</style>
