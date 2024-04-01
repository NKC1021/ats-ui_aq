/**
 * @description 路由拦截状态管理，目前两种模式：all模式与intelligence模式，其中partialRoutes是菜单暂未使用
 */
import { asyncRoutes, constantRoutes, resetRouter } from '@/router'
import { convertRouter, filterRoutes } from '@/utils/routes'
import { authentication, rolesControl } from '@/config'
import { OptionType, RoutesModuleType } from '/#/store'
import { isArray } from '@/utils/validate'
import { getList, getMenu } from '@/api/router'
import { gp } from '@gp'
import { VabRouteRecord } from '/#/router'
import { getUserMenuBtn } from '@/api/menuManagement'
import { recordProInfo } from '@/store/modules/project'

const projectStore = recordProInfo()
export const useRoutesStore = defineStore('routes', {
  state: (): RoutesModuleType => ({
    /**
     * 一级菜单值
     */
    tab: {
      data: undefined,
    },
    /**
     * 一级菜单
     */
    tabMenu: undefined,
    /**
     * 自定义激活菜单
     */
    activeMenu: {
      data: undefined,
    },
    /**
     * 一级菜单
     */
    routes: [],
    tempRoutes: [], //备用一级路由
  }),
  getters: {
    getTab: (state) => state.tab,
    getTabMenu: (state) =>
      state.tab.data
        ? state.routes.find((route) => route.name === state.tab.data)
        : { meta: { title: '' }, redirect: '404' },
    getActiveMenu: (state) => state.activeMenu,
    getRoutes: (state) =>
      state.routes.filter((_route) => _route.meta.hidden !== true),
    getProjectRoutes: (state) =>
      (state.routes.find((_route) => _route.meta.hidden !== true && _route.name === 'project')?.children || []),
    getPartialRoutes: (state) =>
      state.routes.find((route) => route.name === state.tab.data)?.children ||
      [],
  },
  actions: {
    clearRoutes() {
      this.routes = []
    },
    /**
     * @description 多模式设置路由
     * @param mode
     * @returns
     */
    async setRoutes(mode = 'none') {
      // 设置游客路由关闭路由拦截(不需要可以删除)
      const control = mode === 'visit' ? false : rolesControl
      // 默认前端路由
      // const routes = [...asyncRoutes]

      let routes = []
      // 设置后端路由(不需要可以删除)
      if (authentication === 'all') {
        // console.log('diaoyong')
        const { data: list } = await getMenu({})
        // const res = await getUserMenuBtn({})
        // const btnKeyList: any[] = []
        // res.data.forEach((ele: any) => {
        //   btnKeyList.push(ele.SysBaseMenuBtn.name)
        // })
        // localStorage.setItem('usrBtnAccess', JSON.stringify(btnKeyList))
        if (!isArray(list))
          gp.$baseMessage(
            '路由格式返回有误！',
            'error',
            'vab-hey-message-error'
          )
        if (list[list.length - 1].path !== '*')
          list.push({
            path: '/:pathMatch(.*)*',
            redirect: '/404',
            name: 'NotFound',
            meta: { hidden: true },
          })
        routes = convertRouter(list)
        // console.log('路由：', routes)
      }

      // 根据权限和rolesControl过滤路由
      const accessRoutes = filterRoutes([...constantRoutes, ...routes], control)
      // 设置菜单所需路由
      this.routes = JSON.parse(JSON.stringify(accessRoutes))
      this.tempRoutes = JSON.parse(JSON.stringify(accessRoutes))
      this.filterAuthMenu(projectStore.projectIsAuth)
      // 根据可访问路由重置Vue Router
      await resetRouter(accessRoutes)
    },
    changeMenuMeta(options: OptionType) {
      function handleRoutes(routes: VabRouteRecord[]) {
        return routes.map((route) => {
          if (route.name === options.name)
            Object.assign(route.meta, options.meta)
          if (route.children && route.children.length)
            route.children = handleRoutes(route.children)
          return route
        })
      }
      this.routes = handleRoutes(this.routes)
    },
    /**
     * @description 修改 activeName
     * @param activeMenu 当前激活菜单
     */
    changeActiveMenu(activeMenu: string) {
      this.activeMenu.data = activeMenu
    },
    /**
     * 共享项目进入项目要去掉共享
     */
    filterAuthMenu(isAuth: boolean) {
      projectStore.setProjectIsAuth(isAuth)
      function filterMenu(routes: VabRouteRecord[]) {
        return routes.filter((route) => {
          if (route.children && route.children.length)
            route.children = filterMenu(route.children)
          return route.name !== 'auth'
        })
      }
      if (isAuth) {
        this.routes = filterMenu(this.routes)
      } else {
        this.routes = JSON.parse(JSON.stringify(this.tempRoutes))
      }
    },
    /**
     * @description 获取 项目 里面的第一个路由
     * @returns 第一个路由对象或undefined
     */
    getFirstRouteInProjectTab() {
      if (!this.getProjectRoutes.length) return undefined
      return this.getProjectRoutes[0].name;
    },
  },
})
