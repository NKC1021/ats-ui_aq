import { defineStore } from 'pinia'
import {
  findSysDictionary,
  listArsConditionDictionary,
} from '@/api/dictionaryManagement.ts'
export const recordUserParma = defineStore('record', {
  state: () => ({
    /**
     * 数据源Id
     */
    dataSourceId: JSON.parse(localStorage.getItem('enableDataSource')) || [],
    /**
     * ars机台
     */
    ARS_MACHINE: [],
    /**
     * 料号
     */
    ARS_PRODUCT: [],
    /**
     * 模型
     */
    ARS_MODEL: [],
    /**
     *时间
     */
    TIME_DIMENSION: [],
    /**
     * 用户
     */
    ARS_USER: [],
    /**
     * ARS 机台料号模型集合
     */
    ARS_ALL: [],
  }),
  getters: {},
  actions: {
    /**
     * 获取机台
     */
    async getMachineList() {
      const res = await findSysDictionary({ type: 'ARS_MACHINE' })
      this.ARS_MACHINE = res.data?.sysDictionaryDetails
    },
    /**
     * 获取料号
     */
    async getProductList() {
      const res = await findSysDictionary({ type: 'ARS_PRODUCT' })
      this.ARS_PRODUCT = res.data?.sysDictionaryDetails
    },
    /**
     * 获取模型
     */
    async getModelList() {
      const res = await findSysDictionary({ type: 'ARS_MODEL' })
      this.ARS_MODEL = res.data?.sysDictionaryDetails
    },
    /**
     * 获取时间
     */
    async getTimeList() {
      const res = await findSysDictionary({ type: 'TIME_DIMENSION' })
      this.TIME_DIMENSION = res.data?.sysDictionaryDetails
    },
    /**
     * 获取时间
     */
    async getPeopleList() {
      const res = await findSysDictionary({ type: 'ARS_USER' })
      this.ARS_USER = res.data?.sysDictionaryDetails
    },
    /**
     * 获取ARS 机台 料号 模型
     */
    async getAllDetailsByARS() {
      const res = await listArsConditionDictionary()
      this.ARS_ALL = res.data
    },
  },
})
