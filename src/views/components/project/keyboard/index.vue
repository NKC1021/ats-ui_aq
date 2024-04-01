<template>
    <div
      v-if="debugMode"
      class="keymap-debug-button"
      :style="{ right: '10px', bottom: '10px' }"
    >
      <el-button @click="visible = !visible">
        {{ $parent.$options.name || $parent.$options.__file }}
      </el-button>
      <el-dialog v-model="visible">
        <el-descriptions border :column="3" title="快捷键DEBUG信息">
          <el-descriptions-item label="所在组件" :span="2">
            {{ $parent.$options.name || $parent.$options.__file }}
          </el-descriptions-item>
          <el-descriptions-item label="是否启用">{{ keyMethodFlag }}</el-descriptions-item>
          <el-descriptions-item label="最近触发按键" :span="3">
            <kbd v-if="recentKeyEvent.ctrlKey">Ctrl</kbd>
            <kbd v-if="recentKeyEvent.shiftKey">Shift</kbd>
            <kbd v-if="recentKeyEvent.altKey">Alt</kbd>
            <kbd>{{ recentKeyEvent.code }}</kbd>
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>
    </div>
</template>

<script>
  export default {
    props: {
      keyCodeForm: {
        type: Object,
        default: () => ({}),
      },
      debugMode: {
        type: Boolean,
        default: false,
      },
      idName: {
        type: String,
        default: '',
      },
      keyMethodFlag: {
        type: Boolean,
        default() {
          return true
        },
      },
      // 字母和数字默认的浏览器事件是否要触发
      numberLetterDefaultEvent: {
        type: Boolean,
        default() {
          return true
        },
      }
    },
    emits: [
      'handleAgreeAi',
      'showDetailPage',
      'changeImgTypeByParams',
      'showROIPosition',
      'updateImgROi',
      'showTagDialog',
      'setCtrlFlag',
      'upArrow',
      'downArrow',
      'leftArrow',
      'RightArrow',
      'upPage',
      'downPage',
      'deleteImg',
      'selectedPicToTag1',
      'selectedPicToTag2',
      'selectedPicToTag3',
      'setPicToDataCompare',
      'chooseCurPage',
      'chooseAllPage',
      'viewLargeImg',
      'labelByHistoryUpdate',
      'closeModifyDialog',
      'setLabelTreeMultipleFlag',
      'changeImgByRight',
      'changeImgByLeft',
      'humanokConfirm',
      'humanngConfirm',
      'showoriginPic',
      'showaiPic',
      'showhunmanPic',
      'fullscreen',
      'switchTab',
      'switchPanel',
      'switchImg',
      'switchLabel',
      'switchAiRender',
      'handleLetter', // 字母触发事件
      'handleNumber'  // 数字触发事件
    ],
    data() {
      return {
        visible: false,
        recentKeyEvent: {},
      }
    },
    watch: {},
    mounted() {
      // console.log('监听组件', '开始绑定监听')
      this.keyCodeMonitor()
    },
    unmounted() {
      document.removeEventListener("keydown", this.keyDownListener, true)
      document.removeEventListener("keyup", this.keyUpListener, false)
    },
    methods: {
      // 快捷键是否匹配，e 事件，keyInfo 快捷键配置
      keyMatched(e, keyInfo) {
        if (!e || !keyInfo || !keyInfo.keyCode) {
          return false
        }
        if (Number(e.keyCode) !== Number(keyInfo.keyCode)) {
          return false
        }
        if (Boolean(e.ctrlKey) !== Boolean(keyInfo.ctrlKey)) {
          return false
        }
        if (Boolean(e.altKey) !== Boolean(keyInfo.altKey)) {
          return false
        }
        if (Boolean(e.shiftKey) !== Boolean(keyInfo.shiftKey)) {
          return false
        }
        return true
      },
      // 仅数字，没有组合键
      isOnlyNumberKey(e) {
        if (e.ctrlKey || e.altKey || e.shiftKey) {
          return false
        }
        return (e.keyCode >= 96 && e.keyCode <= 105) || (e.keyCode >= 48 && e.keyCode <= 57)
      },
      // 仅字母，没有组合键(shift不算)
      isOnlyLetter(e) {
        if (e.ctrlKey || e.altKey) {
          return false
        }
        return e.keyCode >= 65 && e.keyCode <= 90
      },
      keyDownListener(e) {
        this.recentKeyEvent = e
        if (!this.keyMethodFlag) return
        const e1 = e || window.event || arguments.callee.caller.arguments[0]

        // 只有组合键是不让用的
        if (e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 18) {
          return false
        }
        if (this.isOnlyNumberKey(e1)) {
          // 仅数字
          this.$emit('handleNumber', 'agreeAi', e1)
          if (!this.numberLetterDefaultEvent) {
            window.event.returnValue = false
          }
        } else if (this.isOnlyLetter(e1)) {
          // 仅字母
          this.$emit('handleLetter', 'agreeAi', e1)
          if (!this.numberLetterDefaultEvent) {
            window.event.returnValue = false
          }
        } else if (this.keyMatched(e1, this.keyCodeForm['agreeAi'])) {
          // 认同AI
          this.$emit('handleAgreeAi', 'agreeAi', e1)
          window.event.returnValue = false
        }
          /* 基础操作 */
        //详情信息
        else if (this.keyMatched(e1, this.keyCodeForm['detailInfo'])) {
          this.$emit('showDetailPage', false)
          window.event.returnValue = false
        } else if (
          this.keyMatched(e1, this.keyCodeForm['firstPhotoShow'])
        ) {
          /* 图像显示 */
          // 首件图
          this.$emit('changeImgTypeByParams', 'modelPic', e1)
          window.event.returnValue = false
        }
        // 对比模板图
        else if (this.keyMatched(e1, this.keyCodeForm['changeShow'])) {
          this.$emit('changeImgTypeByParams', 'dataPic', e1)
          window.event.returnValue = false
        }
        // ROI轮廓图
        else if (this.keyMatched(e1, this.keyCodeForm['roiShow'])) {
          this.$emit('showROIPosition')
          window.event.returnValue = false
        }
        // 可视化图
        else if (this.keyMatched(e1, this.keyCodeForm['visionPhoto'])) {
          this.$emit('changeImgTypeByParams', 'visualPic', e1)
          window.event.returnValue = false
        }
        // 快捷更新ROI
        else if (this.keyMatched(e1, this.keyCodeForm['roiUpdate'])) {
          this.$emit('updateImgROi')
          window.event.returnValue = false
        }
        // Gerber图
        else if (this.keyMatched(e1, this.keyCodeForm['camShow'])) {
          this.$emit('changeImgTypeByParams', 'gerberPic', e1)
          window.event.returnValue = false
        }
        // 单选多选
        else if (this.keyMatched(e1, this.keyCodeForm['multiChoose'])) {
          this.$emit('setCtrlFlag', false)
          window.event.returnValue = false
        }
        // 上箭头 38
        else if (this.keyMatched(e1, this.keyCodeForm['upPiece'])) {
          this.$emit('upArrow', e1)
          window.event.returnValue = false
        }
        // 下箭头
        else if (this.keyMatched(e1, this.keyCodeForm['downPiece'])) {
          this.$emit('downArrow', e1)
          window.event.returnValue = false
        }
        // 左箭头
        else if (this.keyMatched(e1, this.keyCodeForm['leftPiece'])) {
          this.$emit('leftArrow', e1)
          window.event.returnValue = false
        }
        // 右箭头
        else if (this.keyMatched(e1, this.keyCodeForm['rightPiece'])) {
          this.$emit('RightArrow', e1)
          window.event.returnValue = false
        }
        //上一页
        else if (this.keyMatched(e1, this.keyCodeForm['upPage'])) {
          this.$emit('upPage', e1)
          window.event.returnValue = false
        }
        //下一页
        else if (this.keyMatched(e1, this.keyCodeForm['downPage'])) {
          this.$emit('downPage', e1)
          window.event.returnValue = false
        }
        //删除选中图片
        else if (this.keyMatched(e1, this.keyCodeForm['deletePicture'])) {
          this.$emit('deleteImg', e1)
          window.event.returnValue = false
        } //加入训练集
        else if (this.keyMatched(e1, this.keyCodeForm['addTrain'])) {
          this.$emit('selectedPicToTag1', e1)
          window.event.returnValue = false
        }
        //加入测试集
        else if (this.keyMatched(e1, this.keyCodeForm['addTest'])) {
          this.$emit('selectedPicToTag2', e1)
          window.event.returnValue = false
        }
        //加入无关集
        else if (this.keyMatched(e1, this.keyCodeForm['addNoRelation'])) {
          this.$emit('selectedPicToTag3', e1)
          window.event.returnValue = false
        }
        // 切换到对比页面
        else if (this.keyMatched(e1, this.keyCodeForm['comparePage'])) {
          this.$emit('setPicToDataCompare', e1)
          window.event.returnValue = false
        }
        // 当页全选
        else if (
          this.keyMatched(e1, this.keyCodeForm['chooseCurrentPage'])
        ) {
          this.$emit('chooseCurPage', '1')
          window.event.returnValue = false
        }
        //   全选所有页
        else if (this.keyMatched(e1, this.keyCodeForm['chooseAllPage'])) {
          this.$emit('chooseAllPage', '2')
          window.event.returnValue = false
        }
        // 放大图片
        else if (this.keyMatched(e1, this.keyCodeForm['enlargePicture'])) {
          this.$emit('viewLargeImg', e1)
          window.event.returnValue = false
        }
        // 历史标注
        else if (this.keyMatched(e1, this.keyCodeForm['labelByHistory'])) {
          this.$emit('labelByHistoryUpdate', e1)
          window.event.returnValue = false
        } else if (e1 && e1.keyCode === 27) {
          // e1.defaultPrevented = false;
          e1.returnValue = false //禁用ESC键功能
          this.$emit('closeModifyDialog')
          window.event.returnValue = false
        } else if (e1 && e1.keyCode === 16) {
          this.$emit('setLabelTreeMultipleFlag', true)
          window.event.returnValue = false
        }
        // + 控制向右切图
        else if (this.keyMatched(e1, this.keyCodeForm['nextImg'])) {
          this.$emit('changeImgByRight')
          window.event.returnValue = false
        }
        // - 控制向左切图
        else if (this.keyMatched(e1, this.keyCodeForm['previousImg'])) {
          this.$emit('changeImgByLeft')
          window.event.returnValue = false
        }
        // 人工OK
        else if (this.keyMatched(e1, this.keyCodeForm['humanOk'])) {
          this.$emit('humanokConfirm')
          window.event.returnValue = false
        }
        // 人工NG
        else if (this.keyMatched(e1, this.keyCodeForm['humanNg'])) {
          this.$emit('humanngConfirm')
          window.event.returnValue = false
        } else if (
          this.keyMatched(e1, this.keyCodeForm['originPhotoShow'])
        ) {
          this.$emit('showoriginPic')
          window.event.returnValue = false
        } else if (this.keyMatched(e1, this.keyCodeForm['aiPhotoShow'])) {
          this.$emit('showaiPic')
          window.event.returnValue = false
        } else if (
          this.keyMatched(e1, this.keyCodeForm['humanPhotoShow'])
        ) {
          this.$emit('showhunmanPic')
          window.event.returnValue = false
        } else if (this.keyMatched(e1, this.keyCodeForm['fullScreen'])) {
          this.$emit('fullscreen')
          window.event.returnValue = false
        } else if (this.keyMatched(e1, this.keyCodeForm['closeTab'])) {
          this.$emit('switchTab')
          window.event.returnValue = false
        } else if (this.keyMatched(e1, this.keyCodeForm['switchPanel'])) {
          this.$emit('switchPanel')
          window.event.returnValue = false
        }
        // 看原图
        else if (this.keyMatched(e1, this.keyCodeForm['checkImg'])) {
          this.$emit('switchImg')
          window.event.returnValue = false
        }
        // 切换到标注
        else if (this.keyMatched(e1, this.keyCodeForm['labelImg'])) {
          this.$emit('switchLabel')
          window.event.returnValue = false
        }
        // 切换ai效果图
        else if (this.keyMatched(e1, this.keyCodeForm['checkAiRender'])) {
          this.$emit('switchAiRender')
          window.event.returnValue = false
        }
      },
      keyUpListener(e) {
        if (!this.keyMethodFlag) return

        const e1 = e || window.event || arguments.callee.caller.arguments[0]
        if (this.keyMatched(e1, this.keyCodeForm['changeShow'])) {
          this.$emit('changeImgTypeByParams', 'dataPic', e1)
        }
        if (e1 && e1.keyCode === 16) {
          this.$emit('setLabelTreeMultipleFlag', false)
        }
        // 单选多选
        if (this.keyMatched(e1, this.keyCodeForm['multiChoose'])) {
          this.$emit('setCtrlFlag', true)
        }
      },
      keyCodeMonitor() {
        // 键盘按下事件
        document.addEventListener(
          'keydown',
           this.keyDownListener,
          true
        )
        // 键盘松开事件
        document.addEventListener(
          'keyup',
           this.keyUpListener,
          false
        )
      },
    },
  }
</script>

<style scoped>
.keymap-debug-button {
  position: fixed;
  z-index: 65535;
}
</style>
