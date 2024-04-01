import request from '@/utils/request'
/**
 * 项目推送
 * @param {*} queryInfo
 * @returns
 */
const stopSync = (queryInfo) => {
  return request({
    url: '/oss/file/stopSync',
    method: 'post',
    data: queryInfo,
  })
}
/**
 * 项目拉取
 * @param {*} queryInfo
 * @returns
 */
const pullSolutionData = (queryInfo) => {
  return request({
    url: '/oss/file/pullSolutionData',
    method: 'post',
    data: queryInfo,
  })
}
/**
 * 项目推送
 * @param {*} queryInfo
 * @returns
 */
const pushSolutionData = (queryInfo) => {
  return request({
    url: '/oss/file/pushSolutionData',
    method: 'post',
    data: queryInfo,
  })
}
export default {
  stopSync,
  pullSolutionData,
  pushSolutionData,
}
