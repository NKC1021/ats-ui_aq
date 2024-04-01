import request from '@/utils/request'
export default {
  /**
   *  获取分图导出配置表
   * @param
   * @returns
   */
  getPickPicExport(params) {
    return request.post('/v1/pickPicExport/getPickPicExport', { params })
  },
  saveOrUpdatePickPicExport(params) {
    return request.post('/v1/pickPicExport/saveOrUpdatePickPicExport', params)
  },
  // 导出
  pickImgExport(params) {
    return request({
      url: '/v1/pickPicExport/pickImgExport',
      method: 'post',
      data: params,
    })
  },
  // 停止导出
  stopPickImgExport(params) {
    return request({
      url: '/v1/pickPicExport/stopPickImgExport',
      method: 'post',
      data: params,
    })
  },
  // 删除分图导出配置
  deletePickPicExport(params) {
    return request({
      url: '/v1/pickPicExport/deletePickPicExport',
      method: 'post',
      data: params,
    })
  },
  // 获取下拉框选项
  getCriteriaData(params) {
    return request({
      url: '/v1/pickPicExport/getCriteriaData',
      method: 'post',
      data: params,
    })
  },
  exportPKExcel(data) {
    return request({
      url: '/v1/pickPicExport/exportPKExcel',
      method: 'post',
      responseType: 'blob',
      data,
    })
  },
}
