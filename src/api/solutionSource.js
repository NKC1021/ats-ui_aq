import request from '@/utils/request'
/**
 * 分页查询原始数据
 * @param {*} data
 * @returns
 */
const pageImgData = (data) => {
  return request({
    url: '/v1/solutionSource/pageImgData',
    method: 'post',
    data,
  })
}
/**
 * 认同AI结果
 * @param {*} data
 * @returns
 */
const agreeAiResult = (data) => {
  return request({
    url: '/v1/solutionSource/agreeAiResult',
    method: 'post',
    data,
  })
}
/**
 * 关联到检测标准
 * @param {*} data
 * @returns
 */
const associateCriteria = (data) => {
  return request({
    url: '/v1/solutionSource/associateCriteria',
    method: 'post',
    data,
  })
}
/**
 * 删除原始数据
 * @param {*} data
 * @returns
 */
const deleteSourceImage = (data) => {
  return request({
    url: '/v1/solutionSource/deleteSourceImage',
    method: 'post',
    data,
  })
}
/**
 * 取消与检测标准的关联
 * @param {*} data
 * @returns
 */
const disassociateCriteria = (data) => {
  return request({
    url: '/v1/solutionSource/disassociateCriteria',
    method: 'post',
    data,
  })
}
/**
 * 查看条件筛选树
 * @param {*} data
 * @returns
 */
const listConditionTree = (data) => {
  return request({
    url: '/v1/solutionSource/listConditionTree',
    method: 'post',
    data,
  })
}
/**
 * 查看可以被关联的标准
 * @param {*} data
 * @returns
 */
const listCriteriaCouldAssociate = (params) => {
  return request({
    url: '/v1/solutionSource/listCriteriaCouldAssociate',
    method: 'get',
    params,
  })
}
/**
 * 根据查询条件过滤可以使用的标签
 * @param {*} data
 * @returns
 */
const listLabelNameByCondition = (data) => {
  return request({
    url: '/v1/solutionSource/listLabelNameByCondition',
    method: 'post',
    data,
  })
}
/**
 * 查看标签筛选树
 * @param {*} data
 * @returns
 */
const listLabelTree = (data) => {
  return request({
    url: '/v1/solutionSource/listLabelTree',
    method: 'post',
    data,
  })
}
/**
 * 移动原始数据
 * @param {*} data
 * @returns
 */
const moveSourceImage = (data) => {
  return request({
    url: '/v1/solutionSource/moveSourceImage',
    method: 'post',
    data,
  })
}
/**
 * 修改图片人工结果
 * @param {*} data
 * @returns
 */
const updateImgLabel = (data) => {
  return request({
    url: '/v1/solutionSource/updateImgLabel',
    method: 'post',
    data,
  })
}
/**
 * 保存图片人工结果
 * @param {*} data
 * @returns
 */
const saveImgLabel = (data) => {
  return request({
    url: '/v1/solutionSource/saveImgLabel',
    method: 'post',
    data,
  })
}
/**
 * 保存图片人工结果
 * @param {*} data
 * @returns
 */
const removeImgLabel = (data) => {
  return request({
    url: '/v1/solutionSource/removeImgLabel',
    method: 'post',
    data,
  })
}
/**
 * 查询图片标签
 * @param {*} data
 * @returns
 */
const listImgLabel = (data) => {
  return request({
    url: '/v1/solutionSource/listImgLabel',
    method: 'post',
    data,
  })
}
/**
 * 查询图片标签
 * @param {*} data
 * @returns
 */
const getMapByKey = (data) => {
  return request({
    url: '/v1/solutionSource/getMapByKey',
    method: 'post',
    data,
  })
}
/**
 * 修改图片信息
 * @param {*} data
 * @returns
 */
const updateImgInfo = (data) => {
  return request({
    url: '/v1/solutionSource/updateImgInfo',
    method: 'post',
    data,
  })
}
/**
 * 获取图片信息
 * @param {*} data
 * @returns
 */
const getImgDataByHash = (data) => {
  return request({
    url: '/v1/solutionSource/getImgDataByHash',
    method: 'post',
    data,
  })
}
/**
 * 获取图片数据
 * @param {*} data
 * @returns
 */
const listImgDataByIds = (data) => {
  return request({
    url: '/v1/solutionSource/listImgDataByIds',
    method: 'post',
    data,
  })
}
/**
 * 去重图片
 * @param {*} data
 * @returns
 */
const deleteDuplicateImg = (data) => {
  return request({
    url: '/v1/solutionSource/deleteDuplicateImg',
    method: 'post',
    data,
  })
}
export default {
  pageImgData,
  agreeAiResult,
  associateCriteria, //
  disassociateCriteria, //
  deleteSourceImage,
  listConditionTree,
  listCriteriaCouldAssociate, //
  listLabelNameByCondition,
  listLabelTree,
  moveSourceImage,
  updateImgLabel,
  saveImgLabel,
  removeImgLabel,
  listImgLabel,
  getMapByKey,
  updateImgInfo,
  getImgDataByHash,
  listImgDataByIds,
  deleteDuplicateImg,
}
