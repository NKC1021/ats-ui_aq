<template>
  <div class="nav-set-view">
    <!-- 操作按钮 -->
    <el-row style="margin-bottom: 10px">
      <el-col class="head-btns" :span="8" style="margin-left: 10px">
        <el-button icon="Plus" plain type="primary" @click="addSquare()">
          {{ translate('添加') }}
        </el-button>
        <el-button icon="CircleCheck" type="primary" @click="saveConfig()">
          {{ translate('保存') }}
        </el-button>
        <el-button icon="ArrowLeft" plain type="primary" @click="returnTable">
          {{ translate('返回') }}
        </el-button>
      </el-col>
    </el-row>

    <!-- 视图 -->
    <div class="nav-set-box">
      <div class="left-nav-box">
        <div
          v-for="(box, i) in boxes"
          :id="i"
          :key="box"
          class="draggable"
          :style="{
            backgroundColor: i == selectBoxIndex ? activeColor : deActiveColor,
            width: `${box.rect.width}px`,
            height: `${box.rect.height}px`,
            transform: `translate(${box.rect.x}px, ${box.rect.y}px)`,
            zIndex: box.zIndex,
          }"
          @click="clickBox(i)"
          @contextmenu.prevent="handleRightClick($event, i)"
          @dblclick="dblclickBox(i)"
        >
          {{ box.name }}
        </div>
      </div>
      <div class="right-nav-box container">
        <div class="right-header">
          <el-descriptions
            v-if="selectBoxIndex !== -1"
            border
            direction="vertical"
            :title="translate('选中节点的详情')"
          >
            <el-descriptions-item :label="translate('节点名')">
              {{ boxes[selectBoxIndex].name }}
            </el-descriptions-item>
            <el-descriptions-item :label="translate('点位')">
              {{ boxes[selectBoxIndex].point }}
            </el-descriptions-item>
            <el-descriptions-item :label="translate('坐标宽高')">
              {{ boxes[selectBoxIndex].rect }}
            </el-descriptions-item>
            <el-descriptions-item :label="translate('置顶系数')">
              {{ boxes[selectBoxIndex].zIndex }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="right-content">
          <el-table :data="boxes" height="100%">
            <el-table-column :label="translate('节点名')" prop="name" />
            <el-table-column :label="translate('点位')" prop="point" />
          </el-table>
        </div>
      </div>
    </div>
    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="nodeDialogVis"
      :close-on-click-modal="false"
      title="编辑"
      width="22%"
    >
      <el-form
        ref="navEdit"
        label-width="70px"
        :model="nodeEditForm"
        :rules="nodeRules"
        size="default"
      >
        <el-form-item :label="translate('节点号')" prop="index">
          <el-input v-model="nodeEditForm.index" disabled />
        </el-form-item>
        <el-form-item :label="translate('名称')" prop="name">
          <el-input
            ref="nameInput"
            v-model="nodeEditForm.name"
            @keyup.enter="saveNodeConfig"
          />
        </el-form-item>
        <el-form-item :label="translate('置顶系数')" prop="zIndex">
          <el-input
            v-model="nodeEditForm.zIndex"
            @keyup.enter="saveNodeConfig"
          />
        </el-form-item>
        <el-form-item :label="translate('点位')" prop="point">
          <el-input
            v-model="nodeEditForm.point"
            :placeholder="
              translate('点位以英文\',\'分隔，连续用\'-\'拼接 eg:5,9-13')
            "
            :title="
              translate(
                '多个点位以英文\'，\'分隔，连续多个点位可用\'起始点位-结束点位\' 表示，eg:5,9-13'
              )
            "
            @input="
              nodeEditForm.capturePos = nodeEditForm.capturePos
                ? nodeEditForm.capturePos.replace(/，/g, ',')
                : nodeEditForm.capturePos
            "
            @keyup.enter="saveNodeConfig"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="saveNodeConfig">
          {{ translate('确定') }}
        </el-button>
        <el-button @click="nodeDialogVis = false">
          {{ translate('取消') }}
        </el-button>
      </template>
    </el-dialog>
    <!-- 右键菜单 -->
    <aq-context-menu :menus="menus" ref="contextRef" :width="120" />
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import vrsNavApi from '@/api/vrsNav'
  import '@interactjs/auto-start'
  import '@interactjs/actions/drag'
  import '@interactjs/actions/resize'
  import '@interactjs/modifiers'
  import '@interactjs/dev-tools'
  import interact from '@interactjs/interact'
  import AqContextMenu from '@/components/contextMenu/AqContextMenu'

  export default {
    props: {
      editDetailObj: {
        type: Object,
        default: () => ({
          id: '',
          name: '',
          detail: [],
        }),
      },
    },
    components: { AqContextMenu },
    emits: ['returnTable'],
    // components: { leftNavSet, rightNavSet },
    data() {
      return {
        contextRef: null,
        position: {},
        menus: [
          { icon: 'delete-bin-5-line', code: 'delete', name: translate('删除'), action: (i) => (this.boxes.splice(i, 1)) },
          { icon: 'align-top', code: 'zTop', name: translate('置顶'), action: (i) => (this.boxes[i].zIndex = this.maxZIndex + 1) }
        ],
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
          capturePos: '',
        },
        selectBoxIndex: -1,
        activeColor: '#77AF5B',
        deActiveColor: '#8A9187',
        boxes: [],
      }
    },
    computed: {
      translate() {
        return translate
      },
      maxZIndex() {
        if (!this.boxes) {
          return 0
        }
        let maxZ = this.boxes[0].zIndex
        for (let i = 1; i < this.boxes.length; i++) {
          maxZ = Math.max(maxZ, this.boxes[i].zIndex)
        }
        return maxZ
      },
      minZIndex() {
        if (!this.boxes) {
          return 0
        }
        let minZ = this.boxes[0].zIndex
        for (let i = 1; i < this.boxes.length; i++) {
          minZ = Math.min(minZ, this.boxes[i].zIndex)
        }
        return minZ
      },
    },
    watch: {
      editDetailObj: {
        handler(newVal) {
          console.log(newVal)
          // this.boxes = newVal.detail
          // if(newVal.detail.length>0)
          this.boxes = newVal.detail.length > 0 ? JSON.parse(newVal.detail) : []
        },
        deep: true,
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {
      // this.boxes = editDetailObj.detail ? JSON.parse(editDetailObj.detail) : []
      console.log('this.boxes===', this.boxes)
      this.init()
    },
    methods: {
      // 右键事件
      handleRightClick(event, index) {
        this.$refs.contextRef.openContextDialog(event, index)
      },
      saveConfig() {
        const param = {
          id: this.editDetailObj.id,
          name: this.editDetailObj.name,
          detail: JSON.stringify(this.boxes),
        }
        vrsNavApi.saveNavConfig(param).then(() => {
          this.returnTable()
        })
      },
      returnTable() {
        this.$emit('returnTable', '返回')
      },
      clickBox(index) {
        this.contextMenuVisible = false
        if (this.selectBoxIndex === index) {
          this.boxes[index].zIndex++
        } else {
          this.selectBoxIndex = index
        }
      },
      dblclickBox(index) {
        this.nodeEditForm.index = index
        this.nodeEditForm.name = this.boxes[index].name
        this.nodeEditForm.point = this.boxes[index].point
        this.nodeEditForm.zIndex = this.boxes[index].zIndex
        this.nodeDialogVis = true
        this.$nextTick(() => {
          this.$refs.nameInput.focus()
        })
      },
      saveNodeConfig() {
        const index = this.nodeEditForm.index
        this.boxes[index].name = this.nodeEditForm.name
        this.boxes[index].point = this.nodeEditForm.point
        this.boxes[index].zIndex = this.nodeEditForm.zIndex
        this.nodeDialogVis = false
      },
      addSquare() {
        const index = this.boxes.length - 1
        let x = 0
        let y = 0
        let zIndex = 1
        if (this.boxes?.length > 0) {
          x = this.boxes[index].rect.x + 10
          y = this.boxes[index].rect.y + 10
          zIndex = this.boxes[index].zIndex + 1
        }
        this.boxes.push({
          name: this.nodeName,
          rect: {
            x: x,
            y: y,
            width: 50,
            height: 50,
          },
          capturePos: '',
          zIndex: zIndex,
        })
      },
      init() {
        const _this = this
        interact('.draggable')
          .resizable({
            edges: { left: true, right: true, bottom: true, top: true },
            listeners: {
              move(event) {
                const box = _this.boxes[event.target.id]
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
                targets: [interact.snappers.grid({ x: 10, y: 10 })],
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
                targets: [interact.snappers.grid({ x: 10, y: 10 })],
                range: Infinity,
                relativePoints: [{ x: 0, y: 0 }],
              }),
            ],
            listeners: {
              move(event) {
                const box = _this.boxes[event.target.id]
                box.rect.x += event.dx
                box.rect.y += event.dy
              },
            },
          })
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
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
    background: var(--el-color-primary-light-9);
    // background: #ddd;
  }

  .right-nav-box {
    width: 500px;
    height: 100%;
    // background: pink;
  }

  .right-nav-box .container {
    display: flex;
    flex-direction: column;
    height: 100%; /* 100%视窗高度 */
  }

  .right-header {
    height: 50%;
    padding: 10px;
    margin: 1px;
    background: var(--el-color-primary-light-9);
    // background-color: lightblue;
  }

  .right-content {
    flex: 1; /* 占据剩余空间 */
    height: 50%;
    padding: 10px;
    background: var(--el-color-primary-light-9);
    // background-color: lightgreen;
  }

  .draggable {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    touch-action: none;
    user-select: none;
    border: 1px solid #ffffff;
    // border-radius: 0.75em;
    // padding: 5px;
  }

  .context-menu {
    position: absolute;
    z-index: 1000;
    color: black;
    background: #fff;
    border: 1px solid #ccc;
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
</style>
