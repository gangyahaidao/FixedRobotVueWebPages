const getters = {
  sidebar: state => state.app.sidebar, // 侧边栏是否打开
  language: state => state.app.language, // 页面选择的语音
  device: state => state.app.device, // 打开页面使用的设备，手机？电脑
  visitedViews: state => state.tagsView.visitedViews, // 已经访问页面的路由记录
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token, // 用户本地缓存的token值，此处封装便于用store访问，如：store.getters.token
  avatar: state => state.user.avatar, // 用户图像地址
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  status: state => state.user.status,
  roles: state => state.user.roles,
  setting: state => state.user.setting,
  permission_routers: state => state.permission.routers, // 用户权限路由列表
  addRouters: state => state.permission.addRouters,
  errorLog: state => state.errorLog.logs // 系统错误日志
}

export default getters
