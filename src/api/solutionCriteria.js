import request from '@/utils/request'
// 获取检测标准信息（树状结构）
const treeCriteria = (queryInfo) => {
  return request({
    url: '/v1/solutionCriteria/treeCriteria',
    method: 'post',
    data: queryInfo,
  })
}

// 添加检测标准
const createCriteria = (queryInfo) => {
  return request({
    url: '/v1/solutionCriteria/createCriteria',
    method: 'post',
    data: queryInfo,
  })
}

// 添加组合检测标准
const createGroupCriteria = (queryInfo) => {
  return request({
    url: '/v1/solutionCriteria/createGroupCriteria',
    method: 'post',
    data: queryInfo,
  })
}

// 保存关联标准字段信息todo
const saveCriteriaRelate = (queryInfo) => {
  return request({
    url: '/base/solution/saveCriteriaRelate',
    method: 'post',
    data: queryInfo,
  })
}

// 删除标准
const deleteCriteria = (queryInfo) => {
  return request({
    url: '/v1/solutionCriteria/deleteCriteria',
    method: 'post',
    data: queryInfo,
  })
}

// 删除标准关联关系todo
const deleteCriteriaRelate = (queryInfo) => {
  return request({
    url: '/base/solution/deleteCriteriaRelate',
    method: 'post',
    data: queryInfo,
  })
}

// 删除组合检测标准
const deleteGroupCriteria = (queryInfo) => {
  return request({
    url: '/v1/solutionCriteria/deleteGroupCriteria',
    method: 'post',
    data: queryInfo,
  })
}

// 修改检测标准
const updateCriteria = (queryInfo) => {
  return request({
    url: '/v1/solutionCriteria/updateCriteria',
    method: 'post',
    data: queryInfo,
  })
}

// 修改检测标准顺序
const updateCriteriaOrder = (queryInfo) => {
  return request({
    url: '/v1/solutionCriteria/updateCriteriaOrder',
    method: 'post',
    data: queryInfo,
  })
}

// 获取图片数据
const getImgDataByHash = (queryInfo) => {
  return request({
    url: '/base/solutionSource/getImgDataByHash',
    method: 'post',
    data: queryInfo,
  })
}

/**
 * 导入
 * @param {*} queryInfo
 * @returns
 */
const importCriteriaBySolution = (queryInfo) => {
  return request({
    url: '/v1/solutionCriteria/importCriteriaBySolution',
    method: 'post',
    data: queryInfo,
  })
}

export default {
  treeCriteria,
  createCriteria,
  createGroupCriteria,
  saveCriteriaRelate,
  deleteCriteria,
  deleteCriteriaRelate,
  deleteGroupCriteria,
  updateCriteria,
  updateCriteriaOrder,
  getImgDataByHash,
  importCriteriaBySolution,
}
