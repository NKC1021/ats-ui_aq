import request from '@/utils/request'

export function getList(params: any) {
  return request({
    url: '/userManagement/getList',
    method: 'get',
    params,
  })
}

export function doEdit(data: any) {
  return request({
    url: '/userManagement/doEdit',
    method: 'post',
    data,
  })
}

export function doDelete(data: any) {
  return request({
    url: '/userManagement/doDelete',
    method: 'post',
    data,
  })
}
/**
 * 用户注册账号
 * @param data
 * @returns
 */
export function admin_register(data: any) {
  return request({
    url: '/v1/user/admin_register',
    method: 'post',
    data,
  })
}
/**
 * 用户修改账号密码
 * @param data
 * @returns
 */
export function changePassword(data: any) {
  return request({
    url: '/v1/user/changePassword',
    method: 'post',
    data,
  })
}
/**
 * 删除用户
 * @param data
 * @returns
 */
export function deleteUser(params: any) {
  return request({
    url: `/v1/user/deleteUser/${params}`,
    method: 'delete',
  })
}
/**
 *
 * @param params 获取当前用户信息
 * @returns
 */
export function getUserInfo(params: any) {
  return request({
    url: '/v1/user/getUserInfo',
    method: 'get',
    params,
  })
}
/**
 * 分页获取角色
 * @param data
 * @returns
 */
export function getUserList(data: any) {
  return request({
    url: '/v1/user/getUserList',
    method: 'post',
    data,
  })
}
/**
 * 重置用户密码
 * @param data
 * @returns
 */
export function resetPassword(data: any) {
  return request({
    url: '/v1/user/resetPassword',
    method: 'post',
    data,
  })
}
/**
 * 设置当前用户信息
 * @param data
 * @returns
 */
export function setSelfInfo(data: any) {
  return request({
    url: '/v1/user/setSelfInfo',
    method: 'put',
    data,
  })
}
/**
 * 设置用户权限
 * @param data
 * @returns
 */
export function setUserAuthorities(data: any) {
  return request({
    url: '/v1/user/setUserAuthorities',
    method: 'post',
    data,
  })
}
/**
 * 更改用户权限
 * @param data
 * @returns
 */
export function setUserAuthority(data: any) {
  return request({
    url: '/v1/user/setUserAuthority',
    method: 'post',
    data,
  })
}
/**
 * 设置用户权限
 * @param data
 * @returns
 */
export function setUserDepts(data: any) {
  return request({
    url: '/v1/user/setUserDepts',
    method: 'post',
    data,
  })
}
/**
 * 设置用户信息
 * @param data
 * @returns
 */
export function setUserInfo(data: any) {
  return request({
    url: '/v1/user/setUserInfo',
    method: 'put',
    data,
  })
}
