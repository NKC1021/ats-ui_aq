import request from '@/utils/request'

export function getTree(params: any) {
  return request({
    url: '/dictionaryManagement/getTree',
    method: 'get',
    params,
  })
}

export function getList(params: any) {
  return request({
    url: '/dictionaryManagement/getList',
    method: 'get',
    params,
  })
}

export function doEdit(data: any) {
  return request({
    url: '/dictionaryManagement/doEdit',
    method: 'post',
    data,
  })
}

export function doDelete(data: any) {
  return request({
    url: '/dictionaryManagement/doDelete',
    method: 'post',
    data,
  })
}
/**
 * 新增字典数据
 * @param data
 * @returns
 */
export function createSysDictionary(data: any) {
  return request({
    url: '/v1/dict/createSysDictionary',
    method: 'post',
    data,
  })
}
/**
 * 新增字典detail数据
 * @param data
 * @returns
 */
export function createSysDictionaryDetail(data: any) {
  return request({
    url: '/v1/dict/createSysDictionaryDetail',
    method: 'post',
    data,
  })
}
/**
 * 删除SysDictionary
 * @param params
 * @returns
 */
export function deleteSysDictionary(params: any) {
  return request({
    url: `/v1/dict/deleteSysDictionary/${params}`,
    method: 'delete',
  })
}
/**
 * 删除SysDictionaryDetail
 * @param params
 * @returns
 */
export function deleteSysDictionaryDetail(params: any) {
  return request({
    url: `/v1/dict/deleteSysDictionaryDetail/${params}`,
    method: 'delete',
  })
}
/**
 * 用id、type、status查询SysDictionary
 * @param params
 * @returns
 */
export function findSysDictionary(params: any) {
  return request({
    url: '/v1/dict/findSysDictionary',
    method: 'get',
    params,
  })
}
/**
 * 用id、type、status查询SysDictionaryDetail
 * @param params
 * @returns
 */
export function findSysDictionaryDetail(params: any) {
  return request({
    url: `/v1/dict/findSysDictionaryDetail/${params}`,
    method: 'get',
  })
}
/**
 *分页获取SysDictionary列表
 * @param data
 * @returns
 */
export function pageSysDictionary(data: any) {
  return request({
    url: '/v1/dict/pageSysDictionary',
    method: 'post',
    data,
  })
}
/**
 * 分页获取SysDictionaryDetail列表
 * @param data
 * @returns
 */
export function pageSysDictionaryDetail(data: any) {
  return request({
    url: '/v1/dict/pageSysDictionaryDetail',
    method: 'post',
    data,
  })
}
/**
 * 更新SysDictionary
 * @param data
 * @returns
 */
export function updateSysDictionary(data: any) {
  return request({
    url: '/v1/dict/updateSysDictionary',
    method: 'put',
    data,
  })
}
/**
 * 更新SysDictionaryDetail
 * @param data
 * @returns
 */
export function updateSysDictionaryDetail(data: any) {
  return request({
    url: '/v1/dict/updateSysDictionaryDetail',
    method: 'put',
    data,
  })
}
/**
 * 查詢ARS 机台 料号 模型
 * @param data
 * @returns
 */
export function listArsConditionDictionary(data: any) {
  return request({
    url: '/v1/dict/listArsConditionDictionary',
    method: 'get',
    data,
  })
}
