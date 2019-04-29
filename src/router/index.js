import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* 布局文件 */
import Layout from '@/views/layout/Layout'

/**
 * 路由配置项
 *
当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
hidden: true; // (默认 false)

//当设置 noredirect 的时候该路由在面包屑导航中不可被点击
redirect: noredirect;

//当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
//只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
//若你想不管路由下面的 children 声明的个数都显示你的根路由
//你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
alwaysShow: true;

name: "router-name"; //设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
meta: {
  roles: ["admin", "editor"]; //设置该路由进入的权限，支持多个权限叠加
  title: "title"; //设置该路由在侧边栏和面包屑中展示的名字
  icon: "svg-name"; //设置该路由的图标
  noCache: true; //如果设置为true ,则不会被 <keep-alive> 缓存(默认 false)
}
*/

export const constantRouterMap = [ // 代表那些不需要动态判断权限的路由，如登录页、404、等通用页面
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/authredirect', component: () => import('@/views/login/authredirect'), hidden: true },
  { path: '/404', component: () => import('@/views/errorPage/404'), hidden: true },
  { path: '/401', component: () => import('@/views/errorPage/401'), hidden: true },
  {
    path: '/', // 首页
    component: Layout,
    redirect: '/dayMonitor',
    alwaysShow: true,
    meta: { title: 'home', icon: 'icon' },
    children: [{
      path: 'dayMonitor', // 首页统计信息显示
      component: () => import('@/views/home/dayRun'),
      name: 'dayRun',
      meta: { title: 'dayRun', icon: 'list' }
    },
    {
      path: 'abnormalList', // 异常列表
      component: () => import('@/views/home/abnormalList'),
      name: 'abnormalList',
      meta: { title: 'abnormalList', icon: 'peoples' }
    }
    ]
  },
  {
    path: '/warehouse', // 仓库管理相关界面
    component: Layout,
    redirect: '/warehouse/index',
    alwaysShow: true,
    meta: { title: 'warehouse', icon: 'example' },
    children: [
      {
        path: 'warehouseProductList', // 仓库商品列表
        component: () => import('@/views/warehouse/warehouseProductList'), // 此处很关键，必须要添加一个index.vue页面，然后从此页面再跳转到其他子页面配置不对子页面不会显示
        name: 'warehouseProductList',
        meta: { title: 'warehouseProductList', icon: 'list' }
      },
      {
        path: 'createGoods', // 新建商品
        component: () => import('@/views/warehouse/createGoods'), // 此处很关键，必须要添加一个index.vue页面，然后从此页面再跳转到其他子页面配置不对子页面不会显示
        name: 'CreateGoods',
        meta: { title: 'createGoods', icon: 'star' }
      }
    ]
  },
  {
    path: '/talkConfiguration', // 对话配置
    component: Layout,
    redirect: '/talkConfiguration/index',
    alwaysShow: true,
    meta: { title: 'talkConfiguration', icon: 'message' },
    children: [{
      path: 'list', // 机器人对话配置完成列表
      component: () => import('@/views/talkConfiguration/robotTalksList'),
      name: 'robottalkConfiguration',
      meta: { title: 'robottalkConfiguration', icon: 'list' }
    },
    {
      path: 'robotTalkTemplate', // 机器人对话模板
      component: () => import('@/views/talkConfiguration/robotTalkTemplate'),
      name: 'robotTalkTemplate',
      meta: { title: 'robotTalkTemplate', icon: 'star' }
    },
    {
      path: 'createRobotTalk', // 机器人对话模板
      component: () => import('@/views/talkConfiguration/createTalks'),
      name: 'CreateRobotTalk',
      meta: { title: 'CreateRobotTalk', icon: 'chart' }
    }]
  }
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [ // 数组中嵌套的对象
]
