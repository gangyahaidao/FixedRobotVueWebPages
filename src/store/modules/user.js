import { loginByUsername, logout, getUserInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { Message } from 'element-ui'

const user = {
  state: {
    user: '',
    status: '',
    code: '',
    token: getToken(),
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    setting: {
      articlePlatform: []
    }
  },
  mutations: {
    SET_CODE: (state, code) => {
      state.code = code
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
    },
    SET_SETTING: (state, setting) => {
      state.setting = setting
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },
  actions: {
    LoginByUsername({ commit }, userInfo) { // 用户名登录
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        loginByUsername(username, userInfo.password).then(response => { // store中的js程序只负责对全局状态进行管理，请求数据相关代码封装到api目录下面的js文件
          console.log('login response = ' + JSON.stringify(response.data))
          if (response.data.code === 0) {
            Message({
              message: '登录成功',
              type: 'success',
              duration: 2 * 1000
            })
            const data = response.data
            commit('SET_TOKEN', data.token) // 设置state属性的值
            setToken(data.token) // 本地缓存cookie的值
            resolve()
          } else {
            Message({
              message: response.data.message,
              type: 'error',
              duration: 2 * 1000
            })
            reject('获取用户信息失败: ' + response.data.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    GetUserInfo({ commit, state }) { // 在跳转到非白名单路由的时候会被permission.js拦截，进行拉取用户信息操作，调用此函数
      return new Promise((resolve, reject) => {
        getUserInfo(state.token).then(response => {
          if (!response.data) { // 应该是通过状态码来判断的，由于mockjs 不支持自定义状态码只能这样hack
            reject('error')
          }
          const data = response.data
          if (data.roles && data.roles.length > 0) { // 如果返回了一个合理角色数组
            commit('SET_ROLES', data.roles)
          } else {
            reject('获取用户信息错误，缺少角色信息')
          }
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.introduction)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    LogOut({ commit, state }) { // 登出
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },
    ChangeRoles({ commit }, role) {
      return new Promise(resolve => {
        commit('SET_TOKEN', role)
        setToken(role)
        getUserInfo(role).then(response => {
          const data = response.data
          commit('SET_NAME', data.name)
          commit('SET_ROLES', data.roles)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.introduction)
          resolve()
        })
      })
    }
  }
}

export default user
