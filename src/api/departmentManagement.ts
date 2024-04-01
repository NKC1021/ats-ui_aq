import request from '@/utils/request'
export function doEdit(data: any) {
  return request({
    url: '/departmentManagement/doEdit',
    method: 'post',
    data,
  })
}

export function batchCreateDept(data: any) {
  return request({
    url: '/v1/user/batchCreateDept',
    method: 'post',
    data,
  })
}

export function batchUpdateDept(data: any) {
  return request({
    url: '/v1/user/batchUpdateDept',
    method: 'post',
    data,
  })
}

export function findDeptByIds(data: any) {
  return request({
    url: '/v1/user/findDeptByIds',
    method: 'post',
    data,
  })
}

export function deleteDeptByIds(data: any) {
  return request({
    url: '/v1/user/deleteDeptByIds',
    method: 'post',
    data,
  })
}
