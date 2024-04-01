import { defineStore } from 'pinia'
import { getStore, setStore } from '@/utils/storage'
import solutionConfig from '@/api/solutionConfig'
import { ElMessage } from 'element-plus'
import { getLogo } from '@/api/systemInfo'
export const recordProInfo = defineStore('project', {
  state: () => ({
    solutionId: getStore({ name: 'solutionId' }) || '',
    solutionName: getStore({ name: 'solutionName' }) || '',
    socketMsg: {},
    progressList: [], //下载文件进度条
    keyCodeForm: {}, //用户配置快捷键
    defaultKeyCodeForm: {
      common: {
        upPage: {
          keyCode: '33',
        },
        downPage: {
          keyCode: '34',
        },
        leftPiece: {
          keyCode: '37',
        },
        upPiece: {
          keyCode: '38',
        },
        rightPiece: {
          keyCode: '39',
        },
        downPiece: {
          keyCode: '40',
        },
        chooseCurrentPage: {
          keyCode: '54',
          ctrlKey: true,
        },
        chooseAllPage: {
          keyCode: '53',
          ctrlKey: true,
        },
        deletePicture: {
          keyCode: '56',
          ctrlKey: true,
        },
        agreeAi: {
          keyCode: '57',
          ctrlKey: true,
        },
        fullScreen: {
          keyCode: '70',
          ctrlKey: true,
        },
        closeTab: {
          keyCode: '69',
          ctrlKey: true,
        },
      },
      vrs: {
        humanOk: {
          keyCode: '79',
          ctrlKey: true,
        },
        humanNg: {
          keyCode: '71',
          ctrlKey: true,
        },
        originPhotoShow: {
          keyCode: '49',
          ctrlKey: true,
        },
        aiPhotoShow: {
          keyCode: '50',
          ctrlKey: true,
        },
        humanPhotoShow: {
          keyCode: '51',
          ctrlKey: true,
        },
        checkImg: {
          keyCode: '82',
          ctrlKey: true,
        },
        labelImg: {
          keyCode: '83',
          ctrlKey: true,
        },
        checkAiRender: {
          keyCode: '68',
          ctrlKey: true,
        },
        focuSN: {
          keyCode: '81',
          ctrlKey: true,
        },
      },
      clean: {
        enlargePicture: {
          keyCode: '107',
        },
        previousImg: {
          keyCode: '188',
        },
        nextImg: {
          keyCode: '190',
        },
      },
    },
    datasetToClean: {}, //数据集到数据清洗
    projectIsAuth: getStore({ name: 'projectIsAuth' }) || false, //区分项目是共享还是用户
    showKeysValDrawer: false, // 展示Key值
    logoBySet: '', //获取用户设置的logo
  }),
  getters: {
    getSolutionId: (state) => state.solutionId,
    getSocketMsg: (state) => state.socketMsg,
    getKeycodeForm: (state) => state.keyCodeForm,
    getDefaultKeyCodeForm: (state) => state.defaultKeyCodeForm,
  },
  actions: {
    /**
     *获取快捷键
     */
    async getKeyCodeForm() {
      const res = await solutionConfig.getKeymap()
      if (res.code === 0) {
        // 使用默认快捷键
        if (!res.data.common) {
          res.data.common = this.defaultKeyCodeForm.common
        } else {
          res.data.common = JSON.parse(res.data.common)
        }
        if (!res.data.vrs) {
          res.data.vrs = this.defaultKeyCodeForm.vrs
        } else {
          res.data.vrs = JSON.parse(res.data.vrs)
        }
        if (!res.data.clean) {
          res.data.clean = this.defaultKeyCodeForm.clean
        } else {
          res.data.clean = JSON.parse(res.data.clean)
        }
        this.keyCodeForm = res.data
        // console.log('keyCodeForm:::', this.keyCodeForm)
      }
    },
    /**
     * 设置快捷键
     */
    async putKeyCodeForm(newKeyCodeForm = {}) {
      const req = { userId: newKeyCodeForm.userId }
      req.common = JSON.stringify(newKeyCodeForm.common)
      req.vrs = JSON.stringify(newKeyCodeForm.vrs)
      req.clean = JSON.stringify(newKeyCodeForm.clean)
      const res = await solutionConfig.putKeymap(req)
      if (res.code === 0) {
        this.keyCodeForm = newKeyCodeForm
        ElMessage({
          type: 'success',
          message: res.msg,
        })
      }
    },
    /**
     * 更新项目Id
     * @param {*} newId
     */
    updateSolutionId(newId) {
      this.solutionId = newId
      setStore({ name: 'solutionId', content: this.solutionId })
    },
    setSolutionName(newName) {
      this.solutionName = newName
      setStore({ name: 'solutionName', content: newName })
    },
    /**
     * 更新wsocket
     */
    setSocketMsg(newVal) {
      this.socketMsg = newVal
    },
    /**
     * 设置下载进度条
     */
    SET_PROGRESS(progressObj) {
      // 修改进度列表
      const matchProgressObj = this.progressList.find((item) => item.path === progressObj.path);
      // 没有匹配的进度对象，直接添加
      if (!matchProgressObj) {
        this.progressList.push(progressObj)
        return
      }
      // 有匹配的对象，更新进度
      matchProgressObj.progress = progressObj.progress
    },
    /**
     * 区分项目类型（共享|用户）
     */
    setProjectIsAuth(newVal) {
      this.projectIsAuth = newVal
      setStore({ name: 'projectIsAuth', content: newVal })
    },
    /**
     * 获取用户设置logo
     */
    async getLogoBySet() {
      //
      const res = await getLogo({})
      // console.log('logoSet:::', res)
      this.logoBySet = res.data
    },
    setLogo(newVal) {
      this.logoBySet = newVal
    },
  },
})
