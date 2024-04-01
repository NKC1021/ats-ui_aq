import request from '@/utils/request'

export function getTree(params: any) {
  return request({
    url: '/menuManagement/getTree',
    method: 'get',
    params,
  })
}

export function doEdit(data: any) {
  return request({
    url: '/menuManagement/doEdit',
    method: 'post',
    data,
  })
}

export function doDelete(data: any) {
  return request({
    url: '/menuManagement/doDelete',
    method: 'post',
    data,
  })
}
// --------------------------------------
/**
 * 新增菜单
 * @param data
 * @returns
 */
export function addBaseMenu(data: any) {
  return request({
    url: '/v1/menu/addBaseMenu',
    method: 'post',
    data,
  })
}
/**
 * 增加menu和角色关联关系
 * @param data
 * @returns
 */
export function addMenuAuthority(data: any) {
  return request({
    url: '/v1/menu/addMenuAuthority',
    method: 'post',
    data,
  })
}
/**
 * 获取动态路由
 * @param data
 * @returns
 */
export function getMenu(data: any) {
  return request({
    url: '/v1/menu/getMenu',
    method: 'post',
    data,
  })
}
/**
 * 删除菜单
 * @param data
 * @returns
 */
export function deleteBaseMenu(data: any) {
  return request({
    url: '/v1/menu/deleteBaseMenu',
    method: 'post',
    data,
  })
}
/**
 * 根据ID查询菜单
 * @param data
 * @returns
 */
export function getBaseMenuById(data: any) {
  return request({
    url: '/v1/menu/getBaseMenuById',
    method: 'post',
    data,
  })
}
/**
 * 获取用户动态菜单
 * @param data
 * @returns
 */
export function getBaseMenuTree(data: any) {
  return request({
    url: '/v1/menu/getBaseMenuTree',
    method: 'post',
    data,
  })
}
/**
 * 分页获取基础menu列表
 * @param data
 * @returns
 */
export function getMenuList(data: any) {
  return request({
    url: '/v1/menu/getMenuList',
    method: 'post',
    data,
  })
}
/**
 * 分页获取基础menu列表
 * @param data
 * @returns
 */
export function getUserMenuBtn(data: any) {
  return request({
    url: '/v1/menu/getUserMenuBtn',
    method: 'post',
    data,
  })
}
/**
 * 更新菜单
 * @param data
 * @returns
 */
export function updateBaseMenu(data: any) {
  return request({
    url: '/v1/menu/updateBaseMenu',
    method: 'post',
    data,
  })
}
/**
 * 获取指定角色menu
 * @param data
 * @returns
 */
export function getMenuAuthority(data: any) {
  return request({
    url: '/v1/menu/getMenuAuthority',
    method: 'post',
    data,
  })
}
