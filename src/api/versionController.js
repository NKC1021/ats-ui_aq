import request from '@/utils/request'
import { recordProInfo } from '@/store/modules/project'
const { SET_PROGRESS } = recordProInfo()
// import store from '../../store/index.js'
/**
 * @desc 获取项目所有历史版本
 */
const listVersion = (data) => {
  return request({
    url: '/v1/solutionVersion/listVersion',
    method: 'post',
    data,
  })
}
/**
 * @desc 切换指定版本
 * @param {object} queryInfo
 * @returns
 */
const resetVersion = (queryInfo) => {
  return request({
    url: '/v1/solutionVersion/resetVersion',
    method: 'post',
    data: queryInfo,
  })
}
/**
 * @desc 批量删除项目历史版本
 * @param {*} queryInfo
 * @returns
 */
const deleteVersion = (queryInfo) => {
  return request({
    url: '/v1/solutionVersion/deleteVersion',
    method: 'post',
    data: queryInfo,
  })
}
/**
 * @desc 保存项目快照版本
 * @param {*} queryInfo
 * @returns
 */
const commitVersion = (queryInfo) => {
  return request({
    url: '/v1/solutionVersion/commitVersion',
    method: 'post',
    data: queryInfo,
  })
}
/**
 * @desc 获取项目更改状态
 * @param {*} params
 * @returns
 */
const getVersionModifyState = (params) => {
  return request({
    url: '/base/versionManage/getVersionModifyState',
    method: 'get',
    params,
  })
}

// 导出版本文件
const downloadVersion = (data) => {
  return request({
    url: '/oss/file/downloadVersion',
    method: 'post',
    data,
  })
}
// 下载版本文件 hash 索引文件
const downloadVersionHash = (data) => {
  return request({
    url: '/v1/solutionVersion/downloadVersionHash',
    method: 'post',
    data,
    responseType: 'blob',
  })
}
// 导出版本
/* const downloadVersionAll = (params)=>{
    return request({
        url:'/oss/file/downloadVersionAll',
        method:'post',
        params,
        responseType: 'blob',
        File:'file'
    })
} */
const downloadVersionAll = (queryInfo) => {
  const uniSign = `${new Date().getTime()}`
  SET_PROGRESS({
    path: uniSign,
    progress: 0,
  })
  let downProgress = {}
  return request({
    url: '/v2/solutionVersion/downloadVersionAll',
    method: 'post',
    timeout: 2 * 60 * 60 * 1000,
    data: queryInfo,
    responseType: 'blob',
    onDownloadProgress(progress) {
      // console.log('progress:::::', progress)
      downProgress = Math.round((100 * progress.loaded) / progress.total) // progress对象中的loaded表示已经下载的数量，total表示总数量，这里计算出百分比
      SET_PROGRESS({
        path: uniSign,
        progress: downProgress,
      })
    },
  })
}
/**
 * 下载版本文件
 * @param {*} data
 * @returns
 */
const downloadVersionFile = (data) => {
  return request({
    url: '/v1/solutionVersion/downloadVersionFile',
    method: 'post',
    responseType: 'blob',
    data,
  })
}
/**
 * 根据ID获取快照
 * @param {*} params
 * @returns
 */
const getById = (params) => {
  return request({
    url: '/v1/solutionVersion/getById',
    method: 'get',
    params,
  })
}
/**
 * 查看版本列表
 * @param {*} data
 * @returns
 */
const listVersionBySolutionId = (data) => {
  return request({
    url: '/v1/solutionVersion/listVersionBySolutionId',
    method: 'post',
    data,
  })
}
/**
 * 保存版本
 * @param {*} data
 * @returns
 */
const saveVersion = (data) => {
  return request({
    url: '/v1/solutionVersion/saveVersion',
    method: 'post',
    data,
  })
}
/**
 * 修改版本信息
 * @param {*} data
 * @returns
 */
const updateVersion = (data) => {
  return request({
    url: '/v1/solutionVersion/updateVersion',
    method: 'post',
    data,
  })
}
/**
 * 修改版本信息
 * @param {*} data
 * @returns
 */
const uploadVersionAll = (data) => {
  return request({
    url: '/v2/solutionVersion/uploadVersionAll',
    method: 'post',
    data,
  })
}
export default {
  listVersion,
  deleteVersion,
  commitVersion,
  getVersionModifyState,
  uploadVersionAll,
  downloadVersion,
  downloadVersionHash,
  downloadVersionAll,
  downloadVersionFile,
  getById,
  resetVersion,
  listVersionBySolutionId,
  saveVersion,
  updateVersion,
}
