import request from '@/utils/request'
/**
 * 新增数据源节点
 * @param data
 * @returns
 */
export function createDataSourceNode(data: any) {
  return request({
    url: '/v1/data_source/createDataSourceNode',
    method: 'post',
    data,
  })
}
/**
 * 删除数据源节点
 * @param data
 * @returns
 */
export function deleteDataSourceNode(data: any) {
  return request({
    url: '/v1/data_source/deleteDataSourceNode',
    method: 'post',
    data,
  })
}
/**
 * 获取数据源节点
 * @param params
 * @returns
 */
export function getDataSourceNode(params: any) {
  return request({
    url: '/v1/data_source/getDataSourceNode',
    method: 'get',
    params,
  })
}
/**
 * 获取数据源节点
 * @param params
 * @returns
 */
export function pageDataSourceNode(params: any) {
  return request({
    url: '/v1/data_source/pageDataSourceNode',
    method: 'get',
    params,
  })
}
/**
 * ping数据源节点
 * @param params
 * @returns
 */
export function pingDataSourceNode(params: any) {
  return request({
    url: '/v1/data_source/pingDataSourceNode',
    method: 'get',
    params,
  })
}
/**
 * 刷新数据源节点
 * @param params
 * @returns
 */
export function refreshDataSourceNode(params: any) {
  return request({
    url: '/v1/data_source/refreshDataSourceNode',
    method: 'get',
    params,
  })
}
/**
 * 更新数据源
 * @param data
 * @returns
 */
export function updateDataSourceNode(data: any) {
  return request({
    url: '/v1/data_source/updateDataSourceNode',
    method: 'put',
    data,
  })
}
/**
 * 列表数据库名称
 * @param data
 * @returns
 */
export function listDataBaseName(data: any) {
  return request({
    url: '/v1/data_source/listDataBaseName',
    method: 'post',
    data,
  })
}
/**
 * 清除数据报表信息
 * @param data
 * @returns
 */
export function clearDataSourceReport(data: any) {
  return request({
    url: '/v1/data_source/clearDataSourceReport',
    method: 'post',
    data,
  })
}
