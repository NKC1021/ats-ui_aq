import request from '@/utils/request'

export function getLogo(params) {
  return request({
    url: '/v1/systemInfo/getLogo',
    method: 'get',
    params,
  })
}
export function setLogo(data) {
  return request({
    url: '/v1/systemInfo/setLogo',
    method: 'post',
    data,
  })
}
