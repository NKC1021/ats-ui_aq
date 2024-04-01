import request from '@/utils/request'
/**
 * 创建or修改数据集
 * @param {*} data
 * @returns
 */
const saveDataSet = (params) => {
  return request({
    url: '/v1/solutionDataSet/save',
    method: 'post',
    data: params,
  })
}
/**
 * 查询当前项目下所有数据集
 * @param {*} params
 * @returns
 */
const listDataSet = (params) => {
  return request({
    url: '/v1/solutionDataSet/list',
    method: 'get',
    params,
  })
}
/**
 * 删除数据集
 * @param {*} data
 * @returns
 */
const deleteDataSet = (data) => {
  return request({
    url: '/v1/solutionDataSet/delete',
    method: 'post',
    data,
  })
}
/**
 * 合并数据集
 * @param {*} data
 * @returns
 */
const mergeDataSet = (data) => {
  return request({
    url: '/v1/solutionDataSet/merge',
    method: 'post',
    data,
  })
}
/**
 * 合并数据集
 * @param {*} params
 * @returns
 */
const listBySolutionId = (params) => {
  return request({
    url: '/v1/solutionDataSet/listBySolutionId',
    method: 'get',
    params,
  })
}
/**
 * 创建or修改数据集
 * @param {*} data
 * @returns
 */

export default {
  listDataSet,
  deleteDataSet,
  mergeDataSet,
  listBySolutionId,
  saveDataSet,
}
