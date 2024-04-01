/*
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-01-11 14:23:34
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-04-11 10:20:54
 * @FilePath: \aq-work-ui\src\utils\format.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { formatTimeToStr } from '@/utils/date'
import { findSysDictionary } from '@/api/dictionaryManagement'
import { translate } from '@/i18n'
export const formatBoolean = (bool) => {
  if (bool !== null) {
    return bool ? translate('是') : translate('否')
  } else {
    return ''
  }
}
export const formatDate = (time) => {
  if (time !== null && time !== '') {
    const date = new Date(time)
    return formatTimeToStr(date, 'yyyy-MM-dd')
  } else {
    return ''
  }
}

export const filterDict = (value, options) => {
  const rowLabel = options && options.filter((item) => item.value === value)
  return rowLabel && rowLabel[0] && rowLabel[0].label
}

export const getDictFunc = async (type) => {
  const res = await findSysDictionary(type)
  const dicts = res.data?.sysDictionaryDetails
  // dicts.sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'))
  return dicts
}

export const renderUserList = (id, userList) => {
  const user = userList && userList.filter((item) => item.ID === id)
  // console.log('user[0].nickName: ', user[0].nickName)
  return user && user[0] && user[0].nickName
  // console.log('user: ', user)

  // if (user.length != 0) {
  //   let data = user[0]
  //   console.log('data: ', data)
  // }
  // return user.nickName
}

/**
 * 根据点位返回对应的点位信息 eg：",P103,P0333-0344"
 * @param input 输入的字符串，【必填】
 * @param prefix 前缀，只切割该前缀的字段和没有前缀的字段，没有前缀的纯数字会自动加上前缀 eg: P
 * @param clearPrefixZero 数字是否清除前导 0
 */
export const splitNumStr = (input, prefix = '', clearPrefixZero = true) => {
  const result = []
  for (const item of input.split(',').map((s) => s.trim())) {
    if (item === '') {
      continue
    }
    const count = item.split('-').length - 1
    if (count === 0) {
      // 普通数字格式
      result.push(formatSingleNumber(item, prefix, clearPrefixZero))
    } else if (count === 1) {
      // 数字范围格式
      result.push(...formatRangeNum(item, prefix, clearPrefixZero))
    } else {
      // 其它格式
      result.push(item)
    }
  }
  return result
}

// 如果去掉前缀还是数字，对其进行格式化，否则返回本身
const formatRangeNum = (item, prefix, clearPrefixZero) => {
  const split = item.split('-')
  const from = split[0].replace(prefix, '')
  const to = split[1].replace(prefix, '')

  // 去除前缀后不是数字
  if (isNaN(from) || isNaN(to)) {
    return [item]
  }
  const fromNumber = parseInt(from, 10)
  const toNumber = parseInt(to, 10)
  if (fromNumber >= toNumber) {
    return [item]
  }

  const result = []
  const numLen = from.length
  for (let i = fromNumber; i <= toNumber; i++) {
    if (clearPrefixZero) {
      result.push(prefix + i.toString())
    } else {
      result.push(prefix + i.toString().padStart(numLen, '0'))
    }
  }
  return result
}

// 如果去掉前缀还是数字，对其进行格式化，否则返回本身
const formatSingleNumber = (item, prefix, clearPrefixZero) => {
  let number = item.replace(prefix, '')
  // 去除前缀，不是数字返回其本身
  if (isNaN(number)) {
    return item
  }
  // 去除前导 0
  if (clearPrefixZero) {
    number = parseInt(number, 10).toString()
  }
  // 加上前缀返回
  return prefix + number
}
