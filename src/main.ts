/*
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-02-06 11:59:51
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-09-05 11:56:49
 * @FilePath: \admin-plus\src\main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp } from 'vue'
import App from './App.vue'
import { setupVab } from '~/library'
import { setupI18n } from '@/i18n'
import { setupStore } from '@/store'
import { setupRouter } from '@/router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style/element_visiable.scss'
import Avue from '@smallwei/avue'
import '@smallwei/avue/lib/index.css'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import pinyinSearch from '@/utils/pinYinSearch'
import { Message } from '@/utils/resetMessage'

/**
 * @description 正式环境默认使用mock，正式项目记得注释后再打包
 */
import { baseURL, pwa } from './config'
import { isExternal } from '@/utils/validate'
// import VueEasyTable from 'vue-easytable'

const app = createApp(App)
app.use(ElementPlus)
app.use(Avue)
app.use(VXETable)
app.config.globalProperties.$msg = Message
app.config.globalProperties.$pinyinSearch = pinyinSearch
app.config.unwrapInjectedRef = true

// app.use(VueEasyTable)
// if (process.env.NODE_ENV === 'production' && !isExternal(baseURL)) {
//   const { mockXHR } = require('@/utils/static')
//   mockXHR()
// }

/**
 * @description 生产环境启用组件初始化，编译，渲染和补丁性能跟踪。仅在开发模式和支持 Performance.mark API的浏览器中工作。
 */
//if (process.env.NODE_ENV === 'development') app.config.performance = true

if (pwa) require('./registerServiceWorker')

setupVab(app)
setupI18n(app)
setupStore(app)
setupRouter(app)
  .isReady()
  .then(() => app.mount('#app'))
