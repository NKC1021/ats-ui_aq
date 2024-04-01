import request from '@/utils/request'

export function getList(params: any) {
  return request({
    url: '/roleManagement/getList',
    method: 'get',
    params,
  })
}

export function doEdit(data: any) {
  return request({
    url: '/roleManagement/doEdit',
    method: 'post',
    data,
  })
}

export function doDelete(data: any) {
  return request({
    url: '/roleManagement/doDelete',
    method: 'post',
    data,
  })
}
/**
 * 拷贝角色
 * @param data
 * @returns
 */
export function copyAuthority(data: any) {
  return request({
    url: '/v1/authority/copyAuthority',
    method: 'post',
    data,
  })
}
/**
 * 创建角色
 * @param data
 * @returns
 */
export function createAuthority(data: any) {
  return request({
    url: '/v1/authority/createAuthority',
    method: 'post',
    data,
  })
}
/**
 * 删除角色
 * @param data
 * @returns
 */
export function deleteAuthority(data: any) {
  return request({
    url: '/v1/authority/deleteAuthority',
    method: 'post',
    data,
  })
}
/**
 * 分页获取角色列表
 * @param data
 * @returns
 */
export function getAuthorityList(data: any) {
  return request({
    url: '/v1/authority/getAuthorityList',
    method: 'post',
    data,
  })
}
/**
 * 设置角色资源权限
 * @param data
 * @returns
 */
export function setDataAuthority(data: any) {
  return request({
    url: '/v1/authority/setDataAuthority',
    method: 'post',
    data,
  })
}
/**
 * 更新角色权限
 * @param data
 * @returns
 */
export function updateAuthority(data: any) {
  return request({
    url: '/v1/authority/updateAuthority',
    method: 'post',
    data,
  })
}
