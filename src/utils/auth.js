import Cookies from 'js-cookie'

const TokenKey = 'Sale-SYS-User-Token' // 注意是token的key值不是value，value是登录的时候从服务器获取的

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
