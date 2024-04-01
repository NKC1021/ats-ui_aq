/**
 * 拼音检索工具类
 *
 * @author zhang.pengfei
 * @version 0.5
 * @date 2022/1/17
 */
import pinyinMatch from 'pinyin-match'
import pinyin from 'pinyin'

/**
 * 缓存标签的拼音
 */
const pinyinCacheMap = new Map()

/**
 * 按拼音检索list中的单个key
 * @param {Array} list
 * @param {String} value
 * @param {String} key
 * @returns
 */
function pinyinSearch(list, value, key) {
  if (key) {
    return list.filter((item) => {
      return pinyinMatch.match(item[`${key}`], value)
    })
  } else {
    return list.filter((item) => {
      return pinyinMatch.match(item, value)
    })
  }
}

/**
 * 按拼音检索list中的多个key
 * @param {Array} list
 * @param {String} value
 * @param {Array} keyList
 * @returns
 */
function pinyinSearchByKeyList(list, value, keyList) {
  if (Array.isArray(keyList)) {
    return list.filter((item) => {
      for (const element of keyList) {
        const resultElement = pinyinMatch.match(item[`${element}`], value)
        if (resultElement) {
          return resultElement
        }
      }
    })
  } else {
    return list.filter((item) => {
      return pinyinMatch.match(item, value)
    })
  }
}

/**
 * 按拼音匹配字符串（只能首字母匹配，不需要连续）
 * @param {String} list
 * @param {String} value
 * @returns
 */
function pinyinMatchStr(str, value) {
  return pinyinRegexMatch(str, value.toLocaleLowerCase())
}

/**
 * 匹配对象中的某些字段（只能首字母匹配，不需要连续）
 *
 * @param {Array} list 封装对象list，或 string 类型 list
 * @param {String} pinyin 拼音首字符
 * @param {any} keys 可以输入一个或多个字段名 eg: 'labelName', ['labelName'], ['dataCenterLabel', 'enginLabel', 'test']
 *                   不输入标签将会匹配 list 中元素本身 eg: [], null
 * @param {String} keyVal 输入要搜索对象的属性里面的值
 */
function matchPinyin(list, pinyin, keys = [], keyVal = []) {
  if (!pinyin) {
    return list
  }
  if (!(keys instanceof Array)) {
    keys = [keys]
  }
  if (!(keyVal instanceof Array)) {
    keyVal = [keyVal]
  }
  return list.filter((o) => {
    if (keys && keys.length > 0 && keyVal.length > 0) {
      for (const k of keyVal) {
        if (o[k]) {
          for (const key of keys) {
            if (pinyinRegexMatch(o[k][key], pinyin.toLocaleLowerCase())) {
              return true
            }
          }
        }
      }
    } else if (keys && keys.length > 0) {
      // 有一个字段匹配上了，就算匹配上了
      for (const key of keys) {
        if (pinyinRegexMatch(o[key], pinyin.toLocaleLowerCase())) {
          return true
        }
      }
    } else {
      return pinyinRegexMatch(o, pinyin.toLocaleLowerCase())
    }
    return false
  })
}

/**
 * 判断字符串与拼音是否匹配
 *
 * @param {String} str
 * @param {String} pinyin
 */
function pinyinRegexMatch(str, pinyin) {
  const pinyinRegex = `${pinyin.split('').join('{1}.*')}{1}`
  // 是否繁体字搜索
  if (whetherItBelongToChina(pinyin)) {
    return new RegExp(pinyinRegex).test(str)
  } else {
    const firstLetter = getFirstLetter(str)
    return new RegExp(pinyinRegex).test(firstLetter)
  }
}

/**
 * 获取标签首字母
 * @param {String} str
 */
function getFirstLetter(str) {
  if (!pinyinCacheMap.has(str)) {
    pinyinCacheMap[str] = pinyin(str, {
      heteronym: true,
      style: pinyin.STYLE_FIRST_LETTER,
    })
      .map((o) => o.join(''))
      .join('')
      .toLocaleLowerCase()
  }
  return pinyinCacheMap[str]
}

/**
 * 判断是否属于中文
 */
function whetherItBelongToChina(pinyin) {
  return /^[\u4E00-\u9FA5]+$/.test(pinyin)
}
export default {
  pinyinSearch,
  pinyinSearchByKeyList,
  pinyinMatchStr,
  matchPinyin,
}
