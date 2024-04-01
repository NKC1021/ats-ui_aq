import request from '@/utils/request'

/**
 * 查看产品列表
 * @param {*} data
 * @returns
 */
const list = (data) => {
  return request({
    url: '/v1/vrs/list',
    method: 'post',
    data,
  })
}
/**
 * 查看产品列表对应图片
 * @returns
 */
const page = (data) => {
  return request({
    url: '/v1/vrs/page',
    method: 'post',
    data,
  })
}
/**
 * 列出图片Id，用于找到对应图片页码
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
const listImageId = (data) => {
  return request({
    url: '/v1/vrs/listImageId',
    method: 'post',
    data,
  })
}
/**
 * 更新人工标签
 * @returns
 */
const updateHumanLabel = (data) => {
  return request({
    url: '/v1/vrs/updateHumanLabel',
    method: 'post',
    data,
  })
}
/**
 *更新人工结果（OK/NG/Check）
 * @returns
 */
const updateHumanResult = (data) => {
  return request({
    url: '/v1/vrs/updateHumanResult',
    method: 'post',
    data,
  })
}
const updateLabelHumanResult = (data) => {
  return request({
    url: '/v1/vrs/updateLabelHumanResult',
    method: 'post',
    data,
  })
}
/**
 *删除标签
 * @returns
 */
const deleteImg = (data) => {
  return request({
    url: '/v1/vrs/delete',
    method: 'post',
    data,
  })
}
/**
 * 认同AI
 * @returns
 */
const agreeAi = (data) => {
  return request({
    url: '/v1/vrs/agreeAi',
    method: 'post',
    data,
  })
}
/**
 * 查看
 * @returns
 */
const listCondition = (data) => {
  return request({
    url: '/v1/vrs/listCondition',
    method: 'post',
    data,
  })
}
const listProductCondition = (data) => {
  return request({
    url: '/v1/vrs/listProductCondition',
    method: 'post',
    data,
  })
}
const listDefect = (data) => {
  return request({
    url: '/v1/vrs/listDefect',
    method: 'post',
    data,
  })
}
const exportZip = (data, progressHandler) => {
  return request({
    url: '/v1/vrs/exportZip',
    method: 'post',
    responseType: 'blob',
    data,
    onDownloadProgress: progressHandler
  })
}
const callback = (data) => {
  return request({
    url: '/v1/vrs/callback',
    method: 'post',
    data,
  })
}
/**
 * 缺陷列表查询
 * @param {*} data
 * @returns
 */
const listProductDefect = (data) => {
  return request({
    url: '/v1/vrs/listProductDefect',
    method: 'post',
    data,
  })
}
export default {
  list,
  page,
  updateHumanLabel,
  updateHumanResult,
  deleteImg,
  agreeAi,
  listCondition,
  exportZip,
  callback,
  listProductCondition,
  listDefect,
  listImageId,
  listProductDefect,
  updateLabelHumanResult,
}
