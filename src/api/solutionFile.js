import request from '@/utils/request'
export default {
  /**
   * 【解决方案】文件断点续传校验
   * @param {*} data
   * @returns
   */
  filterExistImgFile(data) {
    return request({
      url: '/v1/solutionFile/filterExistImgFile',
      method: 'post',
      data,
    })
  },
  /**
   * 【解决方案】添加图片
   * @param {*} data
   * @returns
   */
  addImgByFile(data) {
    return request({
      url: '/v2/solutionFile/addImgByFile',
      method: 'post',
      data,
    })
  },
  /**
   * 【解决方案】文件断点续传校验
   * @param {*} data
   * @returns
   */
  filterExistZip(data) {
    return request({
      url: '/v1/solutionFile/filterExistZip',
      method: 'post',
      data,
    })
  },
  /**
   * 【解决方案】以压缩包形式上传图片信息
   * @param {*} data
   * @returns
   */
  addImgInfoByZip(data) {
    return request({
      url: '/v2/solutionFile/addImgInfoByZip',
      method: 'post',
      data: data,
    })
  },
  /**
   * 【解决方案】以压缩包形式上传图片信息
   * @param {*} data
   * @returns
   */
  importImgByProject(data) {
    return request({
      url: '/v1/solutionFile/importImgByProject',
      method: 'post',
      data,
    })
  },
  /**
   * 【解决方案】下载原始图片
   * @param {*} data
   * @returns
   */
  downloadOriginImg(data, progressHandler) {
    return request({
      url: '/v1/solutionFile/exportZip',
      method: 'post',
      responseType: 'blob',
      data,
      onDownloadProgress: progressHandler,
    })
  },
  /**
   * 【解决方案】项目拉取
   * @param {*} data
   * @returns
   */
  pullSolutionData(data) {
    return request({
      url: '/v1/solution/pullSolutionData',
      method: 'post',
      data,
    })
  },
  /**
   * 【解决方案】项目推送
   * @param {*} data
   * @returns
   */
  pushSolutionData(data) {
    return request({
      url: '/v1/solution/pushSolutionData',
      method: 'post',
      data,
    })
  },
  /**
   * 【解决方案】项目停止同步
   * @param {*} data
   * @returns
   */
  stopSync(data) {
    return request({
      url: '/v1/solution/stopSync',
      method: 'post',
      data,
    })
  },
}
