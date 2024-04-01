import request from '@/utils/request'
/**
 * 查询用户解决方案
 * @param {*} data
 * @returns
 */
const listSolution = (data) => {
  return request({
    url: '/v1/solution/list',
    method: 'post',
    data,
  })
}
/**
 * 创建解决方案
 * @param {*} data
 * @returns
 */
const createSolution = (data) => {
  return request({
    url: '/v1/solution/create',
    method: 'post',
    data,
  })
}
/**
 * 修改解决方案
 * @param {*} data
 * @returns
 */
const updateSolution = (data) => {
  return request({
    url: '/v1/solution/update',
    method: 'post',
    data,
  })
}
/**
 * 删除解决方案
 * @param {*} data
 * @returns
 */
const deleteSolution = (data) => {
  return request({
    url: '/v1/solution/delete',
    method: 'post',
    data,
  })
}
/**
 * 获取解决方案
 * @param {*} data
 * @returns
 */
const getById = (params) => {
  return request({
    url: '/v1/solution/getById',
    method: 'get',
    params,
  })
}
// 【远程服务】获取项目+版本信息
const listDetails = (params) => {
  return request({
    url: '/v1/solution/listDetails',
    method: 'post',
    data: params,
  })
}

/**
 * 打开解决方案
 * @param {*} params
 * @returns
 */
const open = (params) => {
  return request({
    url: '/v1/solution/open',
    method: 'get',
    params,
  })
}
/**
 * 检查是否有项目期限
 * @param {*} params
 * @returns
 */
const checkReadAuth = (params) => {
  return request({
    url: '/v1/solution/checkReadAuth',
    method: 'get',
    params,
  })
}
/**
 * 检查是否有写项目期限
 * @param {*} params
 * @returns
 */
const checkWriteAuth = (params) => {
  return request({
    url: '/v1/solution/checkWriteAuth',
    method: 'get',
    params,
  })
}
// 获取下拉框选项
const getCriteriaMapping = (data) => {
  return request({
    url: '/v1/solution/getCriteriaMapping',
    method: 'post',
    data,
  })
}
export default {
  listSolution,
  createSolution,
  updateSolution,
  deleteSolution,
  getById,
  listDetails,
  open,
  checkReadAuth,
  checkWriteAuth,
  getCriteriaMapping,
}
