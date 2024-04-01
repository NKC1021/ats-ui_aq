import request from '@/utils/request'

const listVrsNavConfig = (data) => {
  return request({
    url: '/v1/vrsNav/listVrsNavConfig',
    method: 'post',
    data,
  })
}
const getEnableNavConfig = (data) => {
  return request({
    url: '/v1/vrsNav/getEnableNavConfig',
    method: 'post',
    data,
  })
}
const saveNavConfig = (data) => {
  return request({
    url: '/v1/vrsNav/saveNavConfig',
    method: 'post',
    data,
  })
}
const enableNavConfig = (data) => {
  return request({
    url: '/v1/vrsNav/enableNavConfig',
    method: 'post',
    data,
  })
}
const deleteNavConfig = (data) => {
  return request({
    url: '/v1/vrsNav/deleteNavConfig',
    method: 'post',
    data,
  })
}

export default {
  listVrsNavConfig,
  getEnableNavConfig,
  saveNavConfig,
  enableNavConfig,
  deleteNavConfig,
}
