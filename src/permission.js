import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'// progress bar style
import { getToken } from '@/utils/auth' // getToken from cookie

NProgress.configure({ showSpinner: false })// NProgress Configuration

function hasPermission(roles, permissionRoles) {
  if (roles.indexOf('admin') >= 0) return true
  if (!permissionRoles) return true
  return roles.some(role => permissionRoles.indexOf(role) >= 0)
}

const whiteList = ['/login', '/authredirect']// 不用重定向的白名单

router.beforeEach((to, from, next) => { // 根据路径动态生成左边栏列表
  NProgress.start()
  if (getToken()) { // 如果有token
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      if (store.getters.roles.length === 0) { // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetUserInfo').then(res => { // 拉取userinfo信息
          if (res.data.code === 0) {
            const roles = res.data.roles
            store.dispatch('GenerateRoutes', { roles }).then(() => { // 根据roles权限生成可访问的路由表
              router.addRoutes(store.getters.addRouters)
              next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
            })
          } else {
            Message.error('获取用户信息失败' + res.data.message)
            next({ path: '/login' }) // 跳转到登录页
          }
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            next({ path: '/login' }) // 跳转到登录页
          })
        })
      } else { // 没有动态改变权限的需求可直接next() 删除下方权限判断
        if (hasPermission(store.getters.roles, to.meta.roles)) {
          next()
        } else {
          next({ path: '/401', replace: true, query: { noGoBack: true }})
        }
      }
    }
  } else { // 没有token
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      next('/login') // 否则全部重定向到登录页
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
