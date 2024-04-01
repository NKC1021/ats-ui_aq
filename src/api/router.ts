import request from '@/utils/request'

export function getList() {
  return request({
    url: '/router/getList',
    method: 'get',
  })
}
export function getMenu(data: any) {
  return request({
    url: '/v1/menu/getMenu',
    method: 'post',
    data,
  })
}
export function addBaseMenu(data: any) {
  return request({
    url: '/v1/menu/addBaseMenu',
    method: 'post',
    data,
  })
}
