/**status
 * Websocket 工具类
 *
 * @author zhang.pengfei
 * @version 0.5
 * @date 2022/1/10
 */
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user.ts'
const { username } = useUserStore()
// import i18n from '@/i18n'
class FlWebSocket {
  ws //WebSocket对象
  status //状态
  onmessageCallback //接收服务器消息的回调函数
  pingPong //心跳消息
  pingInterval //心跳定时器
  wsUrl //请求url

  /**
   * 初始化
   * @param {Function}} onmessageCallback  接收服务器消息的回调函数 192.168.1.73:18080
   */
  constructor(onmessageCallback) {
    const baseUrl = `ws://${window.location.hostname}:27407/ws?username=${username}`
    // let userInfo = store.getters.userInfo
    // let token = store.getters.access_token;
    // console.log('window.location.host:::', process.env.VUE_WS_BASE_URL)
    // console.log('usernamet:::', username)
    // console.log('userid:::', userid)
    this.wsUrl = baseUrl
    this.onmessageCallback = onmessageCallback
    this.connect()
  }

  /**
   * 建立连接
   */
  connect() {
    this.ws = new WebSocket(this.wsUrl)
    this.ws.onopen = (e) => {
      this.status = 'open'
      console.log(`websocket连接成功`, e, '状态：' + this.ws.readyState)
      this.heartCheck()
      this.getMessage()
    }
    this.ws.onerror = (e) => {
      ElMessage.error(
        '消息系统连接异常，请刷新页面（稍候刷新重试或者联系管理员）'
      )
    }
  }

  /**
   * 获取服务器返回消息
   */
  getMessage() {
    this.ws.onmessage = (e) => {
      if (e.data === 'pong') {
        this.pingPong = 'pong' // 服务器端返回pong
        console.log(`websocket服务器端返回pong`)
      } else {
        try {
          this.onmessageCallback(JSON.parse(e.data))
        } catch (error) {
          console.log('error:::', error)
        }
      }
    }
  }

  /**
   * 心跳检测 (120s发送一次心跳检测)
   */
  heartCheck() {
    // 心跳机制的时间可以自己与后端约定
    this.pingPong = 'ping' // ws的心跳机制状态值
    this.pingInterval = setInterval(() => {
      if (this.ws.readyState === 1) {
        // 检查ws为链接状态 才可发送
        this.ws.send('ping') // 客户端发送ping
      }
    }, 120000)
    this.pongInterval = setInterval(() => {
      if (this.pingPong === 'ping') {
        this.closeHandle('pingPong没有改变为pong') // 没有返回pong 重启webSocket
      }
      // 重置为ping 若下一次 ping 发送失败 或者pong返回失败(pingPong不会改成pong)，将重启
      console.log(`websocket服务器端返回pong`)
      this.pingPong = 'ping'
    }, 130000)
  }

  /**
   * 关闭重连
   * @param {String} e
   */
  closeHandle(e = 'err') {
    // 因为webSocket并不稳定，规定只能手动关闭(调closeMyself方法)，否则就重连
    if (this.status !== 'close') {
      console.log(`websocket断开，重连websocket`, e)
      if (this.pingInterval !== undefined && this.pongInterval !== undefined) {
        // 清除定时器
        clearInterval(this.pingInterval)
        clearInterval(this.pongInterval)
      }
      this.connect() // 重连
    } else {
      console.log(`websocket手动关闭，或者正在连接`)
    }
  }

  /**
   * 向服务器发送消息
   * @param {Object} msg
   */
  send(msg) {
    this.ws.send(msg)
  }

  /**
   * 关闭连接
   */
  close() {
    clearInterval(this.pingInterval)
    clearInterval(this.pongInterval)
    this.status = 'close'
    this.ws.send('close')
    this.ws.close()
    // console.log(i18n.t('i18_websocket_close'), 'close')
  }
}

export default FlWebSocket
