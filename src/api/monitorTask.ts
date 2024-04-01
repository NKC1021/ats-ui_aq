import request from '@/utils/request'

export default {
  /**
   * 删除监控任务
   * @param data
   * @returns
   */
  deleteMonitorTask(data: any) {
    return request({
      url: '/v1/monitorTask/deleteMonitorTask',
      method: 'post',
      data,
    })
  },
  /**
   * 查看所有监控任务配置
   * @param data
   * @returns
   */
  listMonitorTask(data: any) {
    return request({
      url: '/v1/monitorTask/listMonitorTask',
      method: 'post',
      data,
    })
  },
  /**
   * 查看所有监控任务执行记录
   * @param data
   * @returns
   */
  pageMonitorTaskRecord(data: any) {
    return request({
      url: '/v1/monitorTask/pageMonitorTaskRecord',
      method: 'post',
      data,
    })
  },
  /**
   * 保存监控任务
   * @param data
   * @returns
   */
  saveMonitorTask(data: any) {
    return request({
      url: '/v1/monitorTask/saveMonitorTask',
      method: 'post',
      data,
    })
  },
  /**
   * 停止监控任务
   * @param data
   * @returns
   */
  stopMonitorTask(data: any) {
    return request({
      url: '/v1/monitorTask/stopMonitorTask',
      method: 'post',
      data,
    })
  },
  /**
   * 触发监控任务
   * @param data
   * @returns
   */
  triggerMonitorTask(data: any) {
    return request({
      url: '/v1/monitorTask/triggerMonitorTask',
      method: 'post',
      data,
    })
  },
}
