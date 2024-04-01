import request from '@/utils/request'

export default {
  admin_register(data) {
    return request({
      url: '/v1/user/admin_register',
      method: 'post',
      data,
    })
  },
  batchCreateDept(data) {
    return request({
      url: '/v1/user/batchCreateDept',
      method: 'post',
      data,
    })
  },
  batchUpdateDept(data) {
    return request({
      url: '/v1/user/batchUpdateDept',
      method: 'post',
      data,
    })
  },
  changePassword(data) {
    return request({
      url: '/v1/user/changePassword',
      method: 'post',
      data,
    })
  },
  deleteDeptByIds(data) {
    return request({
      url: '/v1/user/deleteDeptByIds',
      method: 'post',
      data,
    })
  },
  deleteUser(params) {
    return request({
      url: `/v1/user/deleteUser/${params}`,
      method: 'delete',
    })
  },
  findDeptByIds(data) {
    return request({
      url: '/v1/user/findDeptByIds',
      method: 'post',
      data,
    })
  },
  getUserInfo(params) {
    return request({
      url: '/v1/user/getUserInfo',
      method: 'get',
      params,
    })
  },
  getUserList(data) {
    return request({
      url: '/v1/user/getUserList',
      method: 'post',
      data,
    })
  },
  innerGetUserInfo(data) {
    return request({
      url: '/v1/user/innerGetUserInfo',
      method: 'post',
      data,
    })
  },
  resetPassword(data) {
    return request({
      url: '/v1/user/resetPassword',
      method: 'post',
      data,
    })
  },
  setSelfInfo(data) {
    return request({
      url: '/v1/user/setSelfInfo',
      method: 'put',
      data,
    })
  },
  setUserAuthorities(data) {
    return request({
      url: '/v1/user/setUserAuthorities',
      method: 'post',
      data,
    })
  },
  setUserAuthority(data) {
    return request({
      url: '/v1/user/setUserAuthority',
      method: 'post',
      data,
    })
  },
  setUserDept(data) {
    return request({
      url: '/v1/user/setUserDept',
      method: 'post',
      data,
    })
  },
  setUserDepts(data) {
    return request({
      url: '/v1/user/setUserDepts',
      method: 'post',
      data,
    })
  },
  setUserInfo(data) {
    return request({
      url: '/v1/user/setUserInfo',
      method: 'put',
      data,
    })
  },
  listAllUser(data) {
    return request({
      url: '/v1/user/listAllUser',
      method: 'post',
      data,
    })
  },
}
