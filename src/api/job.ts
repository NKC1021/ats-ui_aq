import request from '@/utils/request'
/**
 * 检出率-时间视图
 * @param data
 * @returns
 */
export function findArsDetectableDate(data: any) {
  return request({
    url: '/v1/report/findArsDetectableDate',
    method: 'post',
    data,
  })
}
/**
 * 检出率-缺项分布视图
 * @param data
 * @returns
 */
export function findArsDetectableLabel(data: any) {
  return request({
    url: '/v1/report/findArsDetectableLabel',
    method: 'post',
    data,
  })
}
/**
 * 检出率-人员视图
 * @param data
 * @returns
 */
export function findArsDetectablePeople(data: any) {
  return request({
    url: '/v1/report/findArsDetectablePeople',
    method: 'post',
    data,
  })
}
/**
 * 查看正在运行的任务组
 * @param data
 * @returns
 */
export function getRunningJobGroup(data: any) {
  return request({
    url: '/v1/job/getRunningJobGroup',
    method: 'post',
    data,
  })
}
/**
 * 查看任务组列表
 * @param data
 * @returns
 */
export function listJobGroup(data: any) {
  return request({
    url: '/v1/job/listJobGroup',
    method: 'post',
    data,
  })
}
/**
 * 运行任务组
 * @param data
 * @returns
 */
export function runJobGroup(data: any) {
  return request({
    url: '/v1/job/runJobGroup',
    method: 'post',
    data,
  })
}
/**
 * 过滤率-时间视图
 * @param data
 * @returns
 */
export function findArsFilterDate(data: any) {
  return request({
    url: '/v1/report/findArsFilterDate',
    method: 'post',
    data,
  })
}
/**
 * 过滤率-设备视图
 * @param data
 * @returns
 */
export function findArsFilterMachine(data: any) {
  return request({
    url: '/v1/report/findArsFilterMachine',
    method: 'post',
    data,
  })
}

/**
 * 过滤率-详情试图
 * @param data
 * @returns
 */
export function findArsFilterDetail(data: any) {
  return request({
    url: '/v1/report/findArsFilterDetail',
    method: 'post',
    data,
  })
}

/**
 * 过滤率-料号视图
 * @param data
 * @returns
 */
export function findArsFilterProduct(data: any) {
  return request({
    url: '/v1/report/findArsFilterProduct',
    method: 'post',
    data,
  })
}
/**
 * AI漏失率-时间视图
 * @param data
 * @returns
 */
export function findLossRateDate(data: any) {
  return request({
    url: '/v1/report/findLossRateDate',
    method: 'post',
    data,
  })
}
/**
 * AI漏失率-料号视图
 * @param data
 * @returns
 */
export function findLossRateProduct(data: any) {
  return request({
    url: '/v1/report/findLossRateProduct',
    method: 'post',
    data,
  })
}
/**
 * 修改任务组配置
 * @param data
 * @returns
 */
export function updateJobGroup(data: any) {
  return request({
    url: '/v1/job/updateJobGroup',
    method: 'post',
    data,
  })
}
/**
 * AI漏失率-料号详情视图
 * @param data
 * @returns
 */
export function findLossRateDetail(data: any) {
  return request({
    url: '/v1/report/findLossRateDetail',
    method: 'post',
    data,
  })
}
/**
 * AI漏失率-料号详情视图
 * @param data
 * @returns
 */
export function pageGroupRunningInfo(data: any) {
  return request({
    url: '/v1/job/pageGroupRunningInfo',
    method: 'post',
    data,
  })
}
/**
 * 新增任务组配置
 * @param data
 * @returns
 */
export function createRunningJobGroup(data: any) {
  return request({
    url: '/v1/job/createRunningJobGroup',
    method: 'post',
    data,
  })
}
/**
 * 删除任务组配置
 * @param data
 * @returns
 */
export function deleteRunningJobGroup(data: any) {
  return request({
    url: `/v1/job/deleteRunningJobGroup/${data}`,
    method: 'delete',
  })
}
/**
 * 机台产能视图-机台维度
 * @param data
 * @returns
 */
export function findMachineCap(data: any) {
  return request({
    url: `/v1/report/findMachineCap`,
    method: 'post',
    data,
  })
}
/**
 * 人员产能视图-人员维度
 * @param data
 * @returns
 */
export function findPeopleCapInPeople(data: any) {
  return request({
    url: `/v1/report/findPeopleCapInPeople`,
    method: 'post',
    data,
  })
}
/**
 * 人员产能视图-自定义时间维度
 * @param data
 * @returns
 */
export function findPeopleCapInTime(data: any) {
  return request({
    url: '/v1/report/findPeopleCapInTime',
    method: 'post',
    data,
  })
}
/**
 * 人员产能视图-班次维度
 * @param data
 * @returns
 */
export function findPeopleCapInShift(data: any) {
  return request({
    url: '/v1/report/findPeopleCapInShift',
    method: 'post',
    data,
  })
}
/**
 * 查看任务
 * @param data
 * @returns
 */
export function listJob(data: any) {
  return request({
    url: '/v1/job/listJob',
    method: 'post',
    data,
  })
}
