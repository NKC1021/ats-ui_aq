<template>
  <div class="keyBoard-data-tool-container">
    <div class="demo-drawer__content">
      <el-form label-width="100px" :model="userSetKeyForm">
        <el-alert :closable="false" show-icon type="warning">
          <kbd>Ctrl+W</kbd>
          <kbd>Ctrl+N</kbd>
          <kbd>Ctrl+T</kbd>
          {{ translate('等快捷键为浏览器必有的默认快捷键，不能设置') }}
        </el-alert>
        <h4>{{ translate('通用快捷键') }}</h4>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="translate('上一页')">
              <el-input
                v-model="userSetKeyForm.common.upPage"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.common.upPage)"
                @clear="keyFormClear('upPage')"
                @keyup="handleSetKey($event, 'upPage')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('下一页')">
              <el-input
                v-model="userSetKeyForm.common.downPage"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.common.downPage)"
                @clear="keyFormClear('downPage')"
                @keyup="handleSetKey($event, 'downPage')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('上一张')">
              <el-input
                v-model="userSetKeyForm.common.upPiece"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.common.upPiece)"
                @clear="keyFormClear('upPiece')"
                @keyup="handleSetKey($event, 'upPiece')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('下一张')">
              <el-input
                v-model="userSetKeyForm.common.downPiece"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.common.downPiece)"
                @clear="keyFormClear('downPiece')"
                @keyup="handleSetKey($event, 'downPiece')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('左一张')">
              <el-input
                v-model="userSetKeyForm.common.leftPiece"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.common.leftPiece)"
                @clear="keyFormClear('leftPiece')"
                @keyup="handleSetKey($event, 'leftPiece')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('右一张')">
              <el-input
                v-model="userSetKeyForm.common.rightPiece"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.common.rightPiece)"
                @clear="keyFormClear('rightPiece')"
                @keyup="handleSetKey($event, 'rightPiece')"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item :label="translate('全选所有页')">
              <el-input
                v-model="userSetKeyForm.common.chooseAllPage"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.common.chooseAllPage)"
                @clear="keyFormClear('chooseAllPage')"
                @keyup="handleSetKey($event, 'chooseAllPage')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('全选当前页')">
              <el-input
                v-model="userSetKeyForm.common.chooseCurrentPage"
                clearable
                :value="codeToDisplay(userSetKeyForm.common.chooseCurrentPage)"
                @clear="keyFormClear('chooseCurrentPage')"
                @keyup="handleSetKey($event, 'chooseCurrentPage')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('删除选中图片')">
              <el-input
                v-model="userSetKeyForm.common.deletePicture"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.common.deletePicture)"
                @clear="keyFormClear('deletePicture')"
                @keyup="handleSetKey($event, 'deletePicture')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('认同AI结果')">
              <el-input
                v-model="userSetKeyForm.common.agreeAi"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.common.agreeAi)"
                @clear="keyFormClear('agreeAi')"
                @keyup="handleSetKey($event, 'agreeAi')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('全屏')">
              <el-input
                v-model="userSetKeyForm.common.fullScreen"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.common.fullScreen)"
                @clear="keyFormClear('fullScreen')"
                @keyup="handleSetKey($event, 'fullScreen')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('侧边栏')">
              <el-input
                v-model="userSetKeyForm.common.closeTab"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.common.closeTab)"
                @clear="keyFormClear('closeTab')"
                @keyup="handleSetKey($event, 'closeTab')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <h4>{{ translate('VRS快捷键') }}</h4>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="translate('人工OK')">
              <el-input
                v-model="userSetKeyForm.vrs.humanOk"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.vrs.humanOk)"
                @clear="keyFormClear('humanOk')"
                @keyup="handleSetKey($event, 'humanOk')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('人工NG')">
              <el-input
                v-model="userSetKeyForm.vrs.humanNg"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.vrs.humanNg)"
                @clear="keyFormClear('humanNg')"
                @keyup="handleSetKey($event, 'humanNg')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('查看原图')">
              <el-input
                v-model="userSetKeyForm.vrs.originPhotoShow"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.vrs.originPhotoShow)"
                @clear="keyFormClear('originPhotoShow')"
                @keyup="handleSetKey($event, 'originPhotoShow')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('查看AI效果')">
              <el-input
                v-model="userSetKeyForm.vrs.aiPhotoShow"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.vrs.aiPhotoShow)"
                @clear="keyFormClear('aiPhotoShow')"
                @keyup="handleSetKey($event, 'aiPhotoShow')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('查看标注')">
              <el-input
                v-model="userSetKeyForm.vrs.humanPhotoShow"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.vrs.humanPhotoShow)"
                @clear="keyFormClear('humanPhotoShow')"
                @keyup="handleSetKey($event, 'humanPhotoShow')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('复检页面1')">
              <el-input
                v-model="userSetKeyForm.vrs.checkImg"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.vrs.checkImg)"
                @clear="keyFormClear('checkImg')"
                @keyup="handleSetKey($event, 'checkImg')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('标注页面')">
              <el-input
                v-model="userSetKeyForm.vrs.labelImg"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.vrs.labelImg)"
                @clear="keyFormClear('labelImg')"
                @keyup="handleSetKey($event, 'labelImg')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('复检页面2')">
              <el-input
                v-model="userSetKeyForm.vrs.checkAiRender"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.vrs.checkAiRender)"
                @clear="keyFormClear('checkAiRender')"
                @keyup="handleSetKey($event, 'checkAiRender')"
              />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="8">
            <el-form-item :label="translate('聚焦SN')">
              <el-input
                v-model="userSetKeyForm.vrs.focuSN"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.vrs.focuSN)"
                @clear="keyFormClear('focuSN')"
                @keyup="handleSetKey($event, 'focuSN')"
              />
            </el-form-item>
          </el-col> -->
        </el-row>
        <h4>{{ translate('数据清洗快捷键') }}</h4>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="translate('放大图片')">
              <el-input
                v-model="userSetKeyForm.clean.enlargePicture"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.clean.enlargePicture)"
                @clear="keyFormClear('enlargePicture')"
                @keyup="handleSetKey($event, 'enlargePicture')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('左切图')">
              <el-input
                v-model="userSetKeyForm.clean.previousImg"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.clean.previousImg)"
                @clear="keyFormClear('previousImg')"
                @keyup="handleSetKey($event, 'previousImg')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="translate('右切图')">
              <el-input
                v-model="userSetKeyForm.clean.nextImg"
                clearable
                maxlength="1"
                :value="codeToDisplay(userSetKeyForm.clean.nextImg)"
                @clear="keyFormClear('nextImg')"
                @keyup="handleSetKey($event, 'nextImg')"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="demo-drawer__footer">
        <el-button @click="handleClose">
          {{ translate('恢复默认') }}
        </el-button>
        <el-button type="primary" @click="updateKeyCodeForm">
          {{ translate('应用') }}
        </el-button>
      </div>
    </div>
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
        direction: 'ltr',
        userSetKeyForm: {}, //快捷键
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
      translate() {
        return translate
      },
      ...mapStores(recordProInfo),
      keyCodeForm() {
        return this.projectStore.getKeycodeForm
      },
      defaultKeyCodeForm() {
        return this.projectStore.getDefaultKeyCodeForm
      },
    },

    watch: {},
    created() {
      this.init(this.keyCodeForm)
    },
    mounted() {
      // console.log('this.keyCodeForm::::', this.keyCodeForm)
      // 关闭所有浏览器默认快捷键事件
      document.onkeydown = (e) => {
        if (
          // 屏蔽TAB键
          e.keyCode === 9 ||
          // 禁止使用ALT、 CTRL、 SHIFT、command + 任意键!
          ((e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) &&
            e.keyCode < 10000)
        ) {
          window.event.returnValue = false
        }
      }
    },
    beforeUnmount() {
      document.onkeydown = null
    },
    methods: {
      init(data) {
        this.userSetKeyForm = JSON.parse(JSON.stringify(data))
      },
      // 按键编码转显示, eg: 107->+
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
      // 用户设置快捷键
      handleClose() {
        const userId = this.userSetKeyForm.userId
        this.init(this.defaultKeyCodeForm)
        this.userSetKeyForm.userId = userId
      },
      updateKeyCodeForm() {
        // console.log(this.userSetKeyForm, this.defaultKeyForm);
        this.projectStore.putKeyCodeForm(this.userSetKeyForm)
      },
      findDuplicateKey(keyCode) {
        const allKeys = Object.values(this.userSetKeyForm).flatMap((el) =>
          Object.values(el)
        )
        return allKeys.find((el) => keyCode === Number(el))
      },
      // 校验快捷键
      validateKey(keyInfo) {
        this.$message.closeAll()
        // 退格、回车
        if (keyInfo.keyCode === 9 || keyInfo.keyCode === 8) {
          this.$message.error('不可使用删除键和Tab键!')
          return false
        }
        // 字母 或者 字母+Shift
        if (!keyInfo.ctrlKey && !keyInfo.altKey && (keyInfo.keyCode >= 65 && keyInfo.keyCode <= 90)) {
          this.$message.error('字母以及 Shift+字母 不能单独设置快捷键')
          return false
        }
        // 数字
        if (!keyInfo.ctrlKey && !keyInfo.shiftKey && !keyInfo.altKey &&
          ((keyInfo.keyCode >= 48 && keyInfo.keyCode <= 57) || (keyInfo.keyCode >= 96 && keyInfo.keyCode <= 105))
        ) {
          this.$message.error('数字不能单独设置快捷键')
          return false
        }
        // 校验按键重复
        if (this.findDuplicateKey(keyInfo)) {
          this.$message.error('键位重复，请重新设置')
          return false
        }
        return true
      },
      handleSetKey(e, item) {
        // Shift Ctrl Alt
        if (e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 18) {
          return
        }
        const keyInfo = {
          keyCode: e.keyCode,
          ctrlKey: e.ctrlKey,
          altKey: e.altKey,
          shiftKey: e.shiftKey,
        }
        if (!this.validateKey(keyInfo)) {
          // 校验未通过
          this.userSetKeyForm[moduleKey][item] = {}
          return
        }

        // 找到对应层级的键数组,['common', 'vrs', 'clean']
        const topLevelKeys = Object.keys(this.defaultKeyCodeForm)
        const moduleKey = topLevelKeys.find((topLevelKey) =>
          Object.keys(this.defaultKeyCodeForm[topLevelKey]).includes(item)
        )
        this.userSetKeyForm[moduleKey][item] = keyInfo
      },
      keyFormClear(item) {
        console.log('清空了操作', item)
        this.userSetKeyForm[item] = ''
      },
    },
  }
</script>

<style scoped lang="scss">
  /* 用户设置样式 */
  .demo-drawer__content h4 {
    background: var(--el-color-primary);
    padding: 5px 20px;
    margin-bottom: 35px;
    color: white;
    font-weight: 400;
  }
  .demo-drawer__footer {
    text-align: right;
  }
</style>
