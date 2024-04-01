import request from '@/utils/request'
/**
 * 删除任务
 * @param {*} data
 * @returns
 */
const deleteTask = (data) => {
  return request({
    url: '/v1/pcbDataTask/delete',
    method: 'post',
    data,
  })
}
/**
 * 查看任务
 * @param {*} data
 * @returns
 */
const getTask = (data) => {
  return request({
    url: '/v1/pcbDataTask/get',
    method: 'post',
    data,
  })
}
/**
 * 查看执行记录
 * @param {*} data
 * @returns
 */
const pageRecord = (data) => {
  return request({
    url: '/v1/pcbDataTask/pageRecord',
    method: 'post',
    data,
  })
}
/**
 * 保存任务
 * @param {*} data
 * @returns
 */
const save = (data) => {
  return request({
    url: '/v1/pcbDataTask/save',
    method: 'post',
    data,
  })
}
/**
 * 停止任务
 * @param {*} data
 * @returns
 */
const stop = (data) => {
  return request({
    url: '/v1/pcbDataTask/stop',
    method: 'post',
    data,
  })
}
/**
 * 触发任务
 * @param {*} data
 * @returns
 */
const trigger = (data) => {
  return request({
    url: '/v1/pcbDataTask/trigger',
    method: 'post',
    data,
  })
}
export default {
  deleteTask,
  getTask,
  pageRecord,
  save,
  stop,
  trigger,
}
