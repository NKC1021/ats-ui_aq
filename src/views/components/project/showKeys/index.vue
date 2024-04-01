<!--  -->
<template>
  <div>
    <el-drawer
      v-model="projectStore.showKeysValDrawer"
      :size="300"
      :with-header="false"
    >
      <el-form label-width="110px">
        <h4>{{ translate('通用快捷键') }}</h4>
        <el-form-item :label="translate('上一页')">
          <kbd>{{ codeToDisplay(keycodeForm.common.upPage) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('下一页')">
          <kbd>{{ codeToDisplay(keycodeForm.common.downPage) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('上一张')">
          <kbd>{{ codeToDisplay(keycodeForm.common.upPiece) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('下一张')">
          <kbd>{{ codeToDisplay(keycodeForm.common.downPiece) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('左一张')">
          <kbd>{{ codeToDisplay(keycodeForm.common.leftPiece) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('右一张')">
          <kbd>{{ codeToDisplay(keycodeForm.common.rightPiece) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('全选所有页')">
          <kbd>{{ codeToDisplay(keycodeForm.common.chooseAllPage) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('全选当前页')">
          <kbd>{{ codeToDisplay(keycodeForm.common.chooseCurrentPage) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('删除选中图片')">
          <kbd>{{ codeToDisplay(keycodeForm.common.deletePicture) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('认同AI结果')">
          <kbd>{{ codeToDisplay(keycodeForm.common.agreeAi) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('全屏')">
          <kbd>{{ codeToDisplay(keycodeForm.common.fullScreen) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('侧边栏')">
          <kbd>{{ codeToDisplay(keycodeForm.common.closeTab) }}</kbd>
        </el-form-item>
        <h4>{{ translate('VRS快捷键') }}</h4>
        <el-form-item :label="translate('人工OK')">
          <kbd>{{ codeToDisplay(keycodeForm.vrs.humanOk) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('人工NG')">
          <kbd>{{ codeToDisplay(keycodeForm.vrs.humanNg) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('查看原图')">
          <kbd>{{ codeToDisplay(keycodeForm.vrs.originPhotoShow) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('查看AI效果')">
          <kbd>{{ codeToDisplay(keycodeForm.vrs.aiPhotoShow) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('查看标注')">
          <kbd>{{ codeToDisplay(keycodeForm.vrs.humanPhotoShow) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('复检页面1')">
          <kbd>{{ codeToDisplay(keycodeForm.vrs.checkImg) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('标注页面')">
          <kbd>{{ codeToDisplay(keycodeForm.vrs.labelImg) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('复检页面2')">
          <kbd>{{ codeToDisplay(keycodeForm.vrs.checkAiRender) }}</kbd>
        </el-form-item>
        <h4>{{ translate('数据清洗快捷键') }}</h4>
        <el-form-item :label="translate('放大图片')">
          <kbd>{{ codeToDisplay(keycodeForm.clean.enlargePicture) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('左切图')">
          <kbd>{{ codeToDisplay(keycodeForm.clean.previousImg) }}</kbd>
        </el-form-item>
        <el-form-item :label="translate('右切图')">
          <kbd>{{ codeToDisplay(keycodeForm.clean.nextImg) }}</kbd>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import { mapStores } from 'pinia'
  import { recordProInfo } from '@/store/modules/project'
  export default {
    data() {
      return {
        drawer: true,
        keyCodeList: {
          //键盘值列表
          9: 'Tab',
          13: 'Enter',
          16: 'Shift',
          17: 'Ctrl',
          18: 'Alt',
          20: 'CapsLk',
          32: 'Space',
          33: 'PgUp',
          34: 'PgDn',
          37: translate('左'),
          38: translate('上'),
          39: translate('右'),
          40: translate('下'),
          46: 'Del',
          48: '0',
          49: '1',
          50: '2',
          51: '3',
          52: '4',
          53: '5',
          54: '6',
          55: '7',
          56: '8',
          57: '9',
          65: 'A',
          66: 'B',
          67: 'C',
          68: 'D',
          69: 'E',
          70: 'F',
          71: 'G',
          72: 'H',
          73: 'I',
          74: 'J',
          75: 'K',
          76: 'L',
          77: 'M',
          78: 'N',
          79: 'O',
          80: 'P',
          81: 'Q',
          82: 'R',
          83: 'S',
          84: 'T',
          85: 'U',
          86: 'V',
          87: 'W',
          88: 'X',
          89: 'Y',
          90: 'Z',
          96: 'Num0',
          97: 'Num1',
          98: 'Num2',
          99: 'Num3',
          100: 'Num4',
          101: 'Num5',
          102: 'Num6',
          103: 'Num7',
          104: 'Num8',
          105: 'Num9',
          106: '*',
          107: '+',
          108: 'Enter',
          109: '-',
          110: 'Decimal',
          111: '/',
          186: ';',
          187: '=',
          188: '<',
          189: '_',
          190: '>',
          191: '?',
          192: '~',
          219: '[',
          220: '|',
          221: ']',
          222: '"',
        },
      }
    },
    computed: {
      ...mapStores(recordProInfo),
      keycodeForm() {
        return this.projectStore.getKeycodeForm
      },
      keysDrawer: {
        get() {
          return false
        },
      },
      translate() {
        return translate
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      codeToDisplay(keyInfo) {
        let displayKeyCode = ''
        if (keyInfo.ctrlKey) {
          displayKeyCode += 'Ctrl + '
        }
        if (keyInfo.altKey) {
          displayKeyCode += 'Alt + '
        }
        if (keyInfo.shiftKey) {
          displayKeyCode += 'Shift + '
        }
        if (keyInfo.keyCode) {
          displayKeyCode += this.keyCodeList[keyInfo.keyCode]
        }
        return displayKeyCode
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  h4 {
    margin: 0;
    padding: 6px;
    background: var(--el-color-primary);
    color: #fff;
    border-radius: 5px;
  }
  :deep() {
    .el-drawer__body {
      padding: 5px;
    }
    .el-form-item {
      margin-bottom: 8px;
    }
  }
</style>
