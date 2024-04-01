import request from '@/utils/request'
// 【服务管理】查看服务配置
const listServer = (params) => {
  return request({
    url: '/v1/server/listServer',
    method: 'get',
    params,
  })
}

// 【服务管理】保存服务配置，传id为更新，不传为新增
const saveServer = (data) => {
  return request({
    url: '/v1/server/saveServer',
    method: 'post',
    data,
  })
}

// 【服务管理】删除服务配置信息
const deleteServer = (params) => {
  return request({
    url: '/v1/server/deleteServer',
    method: 'post',
    data: params,
  })
}

// 【远程服务】登录
const login = (params) => {
  return request({
    url: '/v1/server/login',
    method: 'post',
    data: params,
  })
}
// 【远程服务】登录
const test = (params) => {
  return request({
    url: '/v1/remote/test',
    method: 'post',
    data: params,
  })
}

// 【远程服务】获取项目+版本信息
const listProjectDetails = (params) => {
  return request({
    url: '/base/remoteApi/listProjectDetails',
    method: 'post',
    data: params,
  })
}

// 【远程服务】获取项目信息
const listProjectInfo = (params) => {
  return request({
    url: '/base/remoteApi/listProjectInfo',
    method: 'post',
    data: params,
  })
}

// 【本地服务】获取项目信息
const listLocalProjectDetails = (params) => {
  return request({
    url: '/base/projectHomePage/listProjectDetails',
    method: 'post',
    data: params,
  })
}

// 【项目同步】项目拉取
const pullData = (params) => {
  return request({
    url: '/oss/file/pullData',
    method: 'post',
    data: params,
  })
}

// 【项目同步】项目推送
const pushData = (params) => {
  return request({
    url: '/oss/file/pushData',
    method: 'post',
    data: params,
  })
}

// 【项目同步】停止项目同步
const stopSync = (params) => {
  return request({
    url: '/oss/file/stopSync',
    method: 'post',
    data: params,
  })
}

// 【本地服务】获取启用版本信息
const getEnableVersion = (headers) => {
  return request({
    url: '/base/versionManage/getEnableVersion',
    method: 'get',
    headers: headers,
  })
}

// 【项目同步】停止项目同步
const getProgress = (params) => {
  return request({
    url: '/base/projectHomePage/getProgress',
    method: 'post',
    data: params,
  })
}
// 【远程服务】获取共享项目详细信息
const listAuthProjectDetails = (params) => {
  return request({
    url: '/base/remoteApi/listAuthProjectDetails',
    method: 'post',
    data: params,
  })
}
// 【远程服务】获取共享项目信息
const listAuthProjectInfo = (params) => {
  return request({
    url: '/base/remoteApi/listAuthProjectInfo',
    method: 'post',
    data: params,
  })
}
// 【远程服务】测试权限标识
// const test = (params)=>{
//   return request({
//     url:"/base/remoteApi/test",
//     method:"post",
//     data:params
//   })
// }
// 【远程服务】测试服务器是否有效
const testRemoteAlive = (params) => {
  return request({
    url: '/base/remoteApi/testRemoteAlive',
    method: 'get',
    params,
  })
}
// 【远程服务】获取项目模型详细信息
const listModelDetails = (params) => {
  return request({
    url: '/base/remoteApi/listModelDetails',
    method: 'post',
    data: params,
  })
}
// 【远程服务】获取项目模型详细信息
const listAuthModelDetails = (params) => {
  return request({
    url: '/base/remoteApi/listAuthModelDetails',
    method: 'post',
    data: params,
  })
}
// 【远程服务】获取项目信息
const listSolutionDetails = (params) => {
  return request({
    url: '/v1/remote/listSolutionDetails',
    method: 'post',
    data: params,
  })
}
// 【远程服务】获取项目信息
const listAuthSolutionDetails = (params) => {
  return request({
    url: '/v1/remote/listAuthSolutionDetails',
    method: 'post',
    data: params,
  })
}
// 【远程服务】获取项目信息
const listSolution = (params) => {
  return request({
    url: '/v1/remote/listSolution',
    method: 'post',
    data: params,
  })
}
// 【远程服务】获取项目详细信息
const listAuthSolution = (params) => {
  return request({
    url: '/v1/remote/listAuthSolution',
    method: 'post',
    data: params,
  })
}
/**
 * 共享路径登录
 * @param {*} params
 * @returns
 */
const loginSharePath = (params) => {
  return request({
    url: '/v1/server/loginSharePath',
    method: 'post',
    data: params,
  })
}

export default {
  listServer,
  saveServer,
  deleteServer,
  login,
  test,
  loginSharePath,
  listProjectInfo,
  listProjectDetails,
  listLocalProjectDetails,
  pullData,
  pushData,
  stopSync,
  getEnableVersion,
  getProgress,
  listAuthProjectDetails,
  listAuthProjectInfo,
  testRemoteAlive,
  listModelDetails,
  listAuthModelDetails,
  listSolutionDetails,
  listAuthSolutionDetails,
  listSolution,
  listAuthSolution,
}
