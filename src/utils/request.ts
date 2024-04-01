import { useUserStore } from '@/store/modules/user'
import {
  baseURL,
  contentType,
  debounce,
  messageName,
  requestTimeout,
  statusName,
  successCode,
} from '@/config'
import qs from 'qs'
import router from '@/router'
import { isArray } from '@/utils/validate'
import { addErrorLog, needErrorLog } from '@vab/plugins/errorLog'
import { refreshToken } from '@/api/refreshToken'
import { gp } from '@gp'
import { recordProInfo } from '@/store/modules/project'
import { AxiosProgressEvent } from 'axios'

const { SET_PROGRESS } = recordProInfo()

let loadingInstance: any

let refreshToking = false

let requests: (() => void)[] = []
// 统一处理请求路径 拼接前缀
const jointConfigUrl = (url: string) => {
  const _url = url.split('/')
  const jointUrlObj: any = {
    '/api/user': [
      'authority',
      'base',
      'dict',
      'job',
      'menu',
      'user',
      'systemInfo',
    ],
    '/api/base': [
      'remote',
      'server',
      'monitorTask',
      'solution',
      'solutionVersion',
      'solutionConfig',
      'solutionDataSet',
      'solutionFile',
      'solutionCriteria',
      'pickPicExport',
      'solutionSource',
      'criteria',
      'vrs',
      'pcbDataTask',
      'vrsNav',
    ],
  }

  const _key = Object.keys(jointUrlObj).find((el) => {
    return jointUrlObj[el].find((item: string) => _url.includes(item))
  })
  // console.log('keyyyyy:::', _key)
  return `${_key}${url}`
}
// 操作正常Code数组
const codeVerificationArray = isArray(successCode)
  ? [...successCode]
  : [...[successCode]]

const CODE_MESSAGE: any = {
  200: '服务器成功返回请求数据',
  201: '新建或修改数据成功',
  202: '一个请求已经进入后台排队(异步任务)',
  204: '删除数据成功',
  400: '发出信息有误',
  401: '用户没有权限(令牌失效、用户名、密码错误、登录过期)',
  402: '令牌过期',
  403: '用户得到授权，但是访问是被禁止的',
  404: '访问资源不存在',
  406: '请求格式不可得',
  410: '请求资源被永久删除，且不会被看到',
  500: '服务器发生错误',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
}

// 防抖请求缓存
let debounceRequests: string[] = []

// 是否是重复请求
const isRepeatRequest = (requestStr: string) => {
  return debounceRequests.includes(requestStr)
}

// 格式化请求
const requestToStr = (config: any) => {
  const str = `${config.url}&&&${config.method}&&&${JSON.stringify(config.data)}&&&${JSON.stringify(config.params)}`
  // 有些请求会被某一层转义导致 config 获取不正确，去除转义相关字符
  return str.replace(/["\\]/g, '')
}

/**
 * axios请求拦截器配置
 * @param config
 * @returns {any}
 */
const requestConf: any = (config: any) => {
  const userStore = useUserStore()
  const { token } = userStore
  const projectStore = recordProInfo()
  const { solutionId } = projectStore

  // 规范写法 不可随意自定义
  if (token) config.headers['x-token'] = `${token}`
  if (solutionId) config.headers['Solutionid'] = solutionId
  if (
    config.data &&
    config.headers['Content-Type'] ===
      'application/x-www-form-urlencoded;charset=UTF-8'
  )
    config.data = qs.stringify(config.data)
  if (debounce.some((item) => config.url.includes(item)))
    loadingInstance = gp.$baseLoading()
  config.url = jointConfigUrl(config.url)

  // 接口防抖（完全相同的请求）
  const requestStr = requestToStr(config)
  if (isRepeatRequest(requestStr)) {
    return Promise.reject({ repeatRequest: true })
  }
  debounceRequests.push(requestStr)
  return config
}

/**
 * 刷新刷新令牌
 * @param config 过期请求配置
 * @returns {any} 返回结果
 */
const tryRefreshToken = async (config: any) => {
  if (!refreshToking) {
    refreshToking = true
    try {
      const {
        data: { token },
      }: any = await refreshToken()
      if (token) {
        const { setToken } = useUserStore()
        setToken(token)
        // 已经刷新了token，将所有队列中的请求进行重试
        requests.forEach((cb: any) => cb(token))
        requests = []
        return instance(requestConf(config))
      }
    } catch (error) {
      console.error('refreshToken error =>', error)
      router.push({ path: '/login', replace: true }).then(() => {})
    } finally {
      refreshToking = false
    }
  } else {
    return new Promise((resolve) => {
      // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
      requests.push(() => {
        resolve(instance(requestConf(config)))
      })
    })
  }
}

/**
 * axios响应拦截器
 * @param config 请求配置
 * @param data response数据
 * @param status HTTP status
 * @param statusText HTTP status text
 * @returns {Promise<*|*>}
 */
const handleData = async ({
  config,
  data,
  status,
  statusText,
  headers,
}: any) => {
  const { resetAll } = useUserStore()
  // 若data.code存在，覆盖默认code
  let code = data && data[statusName] ? data[statusName] : status
  // 若code属于操作正常code，则status修改为200
  if (codeVerificationArray.indexOf(data[statusName]) + 1) code = 200
  switch (code) {
    case 200:
      // 业务层级错误处理，以下是假定restful有一套统一输出格式(指不管成功与否都有相应的数据格式)情况下进行处理
      // 例如响应内容：
      // 错误内容：{ code: 1, msg: '非法参数' }
      // 正确内容：{ code: 200, data: {  }, msg: '操作正常' }
      if (
        headers['content-disposition'] &&
        headers['content-disposition'].includes('attachment')
      ) {
        return { data, headers }
      } else {
        return data
      }
    case 401:
      router.push({ path: '/login', replace: true }).then(() => {
        resetAll().then(() => {})
      })
      break
    case 402:
      return await tryRefreshToken(config)
    case 403:
      // router.push({ path: '/403' }).then(() => {})
      router.push({ name: 'myProject' }).then(() => {})
      break
  }
  // 异常处理
  // 若data.msg存在，覆盖默认提醒消息
  let errMsg = `${
    data && data[messageName]
      ? data[messageName]
      : CODE_MESSAGE[code]
      ? CODE_MESSAGE[code]
      : statusText
  }`
  if ([500, 403].includes(code)) {
    // console.log('data::::', data)
    if (data instanceof Blob && data.type === 'application/json') {
      const reader = new FileReader()
      reader.readAsText(data, 'utf-8')
      const _res: any = await new Promise((resolve, reject) => {
        reader.onload = function (e: any) {
          const _result = JSON.parse(e.target.result)
          resolve(_result)
        }
      })
      errMsg = _res.message
    } else {
      errMsg = data.message
    }
  } else if (code === 7) errMsg = data.msg

  // 是否显示高亮错误(与errorHandler钩子触发逻辑一致)
  gp.$baseMessage(errMsg, 'error', 'vab-hey-message-error', false)
  if (needErrorLog())
    addErrorLog({ message: errMsg, stack: data, isRequest: true })
  return Promise.resolve(data)
}

/**
 * @description axios初始化
 */
const instance = axios.create({
  // baseURL,
  timeout: requestTimeout,
  headers: {
    // 'Content-Type': contentType,
  },
})

/**
 * @description axios请求拦截器
 */
instance.interceptors.request.use(requestConf, (error) => {
  return Promise.reject(error)
})

/**
 * @description axios响应拦截器
 */
instance.interceptors.response.use(
  (response) => {
    close(response)
    return handleData(response)
  },
  (error) => {
    const { response, repeatRequest } = error
    close(response)
    if (repeatRequest) {
      gp.$baseMessage('请勿频繁操作', 'warning')
      return {}
    } else if (response === undefined) {
      if (loadingInstance) loadingInstance.close()
      gp.$baseMessage(
        '连接后台接口失败，可能由以下原因造成：后端不支持跨域CORS、接口地址不存在、请求超时等，请联系管理员排查后端接口问题 ',
        'error',
        'vab-hey-message-error',
        false
      )
      return {}
    } else return handleData(response)
  }
)

// 不论请求成功或失败都要执行的方法
const close = (response: any) => {
  if (loadingInstance) {
    loadingInstance.close()
  }
  if (response?.config) {
    const requestStr = requestToStr(response.config)
    debounceRequests = debounceRequests.filter((item) => item != requestStr)
  }
}

// 通用下载进度条逻辑，需要在定义 API 多定义一个参数，eg:
// apiXX(data, progressHandler) {
//   return request({
//     url: '/v1/api/xxx',
//     method: 'post',
//     responseType: 'blob',
//     data,
//     onDownloadProgress: progressHandler
//   })
// }
export function handleDownloadProgress(): (__arg0: AxiosProgressEvent) => any {
    // 这段代码是请求发送前调用的
    const uniSign = `${new Date().getTime()}`
    SET_PROGRESS({
      path: uniSign,
      progress: 0
    })
    // 返回要注册的 onDownloadProgress 方法，请求完成后执行
    return (progress: AxiosProgressEvent) => {
      if (!progress.total) {
        return
      }
      const downloadProgress = Math.round((100 * progress.loaded) / progress.total)
      SET_PROGRESS({path: uniSign, progress: downloadProgress})
    }
}

// 通用下载逻辑
export function handleDownload(res: any) {
  // 响应为 JSON，不做下载逻辑
  if (res.type === 'application/json' && !res.headers) {
    return
  }
  // chrome 内核下载逻辑
  let fileName = res.headers['content-disposition'].split('=')
  fileName = fileName?.length && fileName[1]
  fileName = decodeURI(fileName)
  const elink = document.createElement('a')
  elink.download = fileName
  elink.href = URL.createObjectURL(res.data)
  document.body.appendChild(elink)
  elink.click()
  document.body.removeChild(elink)
}

export default instance
