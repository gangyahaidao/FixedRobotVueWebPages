// 系统全局页面相关设置
import Cookies from 'js-cookie'

const app = {
  state: {
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    device: 'desktop', // 电脑桌面访问
    language: Cookies.get('language') || 'zh' // 默认显示中文
  },
  mutations: { // 同步方式更改store中的状态
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) { // 更新cookie的值
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened // 更新状态变量
      state.sidebar.withoutAnimation = false
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    SET_LANGUAGE: (state, language) => {
      state.language = language
      Cookies.set('language', language)
    }
  },
  actions: { // 封装更新状态的异步方法，实际上底层是调用同步的mutations方法
    toggleSideBar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
    closeSideBar({ commit }, { withoutAnimation }) { // { commit } == context { commit: local.commit } 另一个参数根据调用形式来写的：store.dispatch('closeSideBar', { withoutAnimation: false }
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    toggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    setLanguage({ commit }, language) {
      commit('SET_LANGUAGE', language)
    }
  }
}

export default app
