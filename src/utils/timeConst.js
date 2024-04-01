/*
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-04-06 09:29:39
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-04-11 13:57:06
 * @FilePath: \admin-plus\src\utils\timeConst.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { translate } from '@/i18n'
// dataPick组件时间下拉
export const shortcutsList = [
  {
    text: translate('最近一天'),
    value: () => {
      const end = new Date()
      const start = new Date()
      // start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 59)
      return [start, end]
    },
  },
  {
    text: translate('最近一周'),
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 59)
      return [start, end]
    },
  },
  {
    text: translate('最近一月'),
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 59)
      return [start, end]
    },
  },
  {
    text: translate('最近三月'),
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 59)
      return [start, end]
    },
  },
  {
    text: translate('本周'),
    value: () => {
      // 本周：本周一零点时间到本周日最后一秒的时间

      // 获取当前日期
      const currentDate = new Date()
      // 计算本周的开始日期和结束日期
      const firstDay = new Date(currentDate)
      firstDay.setDate(currentDate.getDate() - currentDate.getDay() + 1)
      const lastDay = new Date(currentDate)
      lastDay.setDate(currentDate.getDate() - currentDate.getDay() + 7)
      // const end = new Date()
      // const start = new Date()
      // start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
      // start.setHours(0, 0, 0, 0)
      // end.setHours(23, 59, 59, 59)
      // return [start, end]
      firstDay.setHours(0, 0, 0, 0)
      lastDay.setHours(23, 59, 59, 59)
      return [firstDay, lastDay]
    },
  },
]
