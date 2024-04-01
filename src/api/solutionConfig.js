import request from '@/utils/request'
// 新增用户项目授权信息-------------------------------------【授权管理】
const addProjectAuthInfo = (queryInfo) => {
  return request({
    url: '/v1/solutionConfig/addSolutionAuthInfo',
    method: 'post',
    data: queryInfo,
  })
}
// 修改用户项目授权信息
const updateProjectAuthInfo = (queryInfo) => {
  return request({
    url: '/v1/solutionConfig/updateSolutionAuthInfo',
    method: 'post',
    data: queryInfo,
  })
}
// 批量删除用户项目授权信息
const deleteSolutionAuth = (queryInfo) => {
  return request({
    url: '/v1/solutionConfig/deleteSolutionAuth',
    method: 'post',
    data: queryInfo,
  })
}
// 分页查询用户项目授权信息
const listProjectAuthInfo = (queryInfo) => {
  return request({
    url: '/v1/solutionConfig/listSolutionAuthInfo',
    method: 'post',
    data: queryInfo,
  })
}
/**
 * 【主页共享项目】被授权权限改变为未授权
 * @param {*} queryInfo
 * @returns
 */

const deleteSharedAuth = (queryInfo) => {
  return request({
    url: '/v1/solutionConfig/deleteSharedAuth',
    method: 'post',
    data: queryInfo,
  })
}
/**
 * 【主页】获取当前用户被授权的项目列表
 */
const getAuthorizedProjectList = (queryInfo) => {
  return request({
    url: '/v1/solutionConfig/getAuthorizedProjectList',
    method: 'post',
    data: queryInfo,
  })
}
/**
 * 【主页】获取当前用户被授权的项目列表
 */
const saveOrUpdateUserProjectConfig = (queryInfo) => {
  return request({
    url: '/v1/solutionConfig/saveOrUpdateUserProjectConfig',
    method: 'post',
    data: queryInfo,
  })
}
/**
 * 【主页】获取当前用户被授权的项目列表
 */
const getUserProjectConfig = (data) => {
  return request({
    url: '/v1/solutionConfig/getUserProjectConfig',
    method: 'post',
    data,
  })
}

/**
 * 【参数配置】删除用户项目设置信息
 */
const deleteUserProjectConfig = (queryInfo) => {
  return request({
    url: '/v1/solutionConfig/deleteUserProjectConfig',
    method: 'post',
    data: queryInfo,
  })
}
const getKeymap = (params) => {
  return request({
    url: '/v1/solutionConfig/keymap',
    method: 'get',
    params,
  })
}
const putKeymap = (data) => {
  return request({
    url: '/v1/solutionConfig/keymap',
    method: 'put',
    data,
  })
}

export default {
  addProjectAuthInfo,
  updateProjectAuthInfo,
  deleteSolutionAuth,
  listProjectAuthInfo,
  deleteSharedAuth,
  getAuthorizedProjectList,
  saveOrUpdateUserProjectConfig,
  getUserProjectConfig,
  deleteUserProjectConfig,
  getKeymap,
  putKeymap,
}
