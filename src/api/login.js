import request from '@/utils/request'

export function loginByUsername(username, password) {
  const logindata = {
    username, // 此种方式为ES6简写，uername即为key的值，value会自动填充
    password
  }
  return request({
    url: '/user/login',
    method: 'post',
    data: logindata // 使用POST的方式访问传参
  })
}

export function logout(token) {
  const data = { token }
  return request({
    url: '/user/logout',
    method: 'post',
    data: data
  })
}

export function getUserInfo(token) {
  // 构建一个json对象
  return request({
    url: '/user/getUserInfo',
    method: 'get',
    params: { token } // 将参数与请求地址合并，GET方式访问
  })
}

export function registerUser(regData) {
  return request({
    url: '/user/register',
    method: 'post',
    data: regData
  })
}
