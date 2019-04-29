import request from '@/utils/request'

export function fetchList(query) { // 根据参数查询商品条目
  return request({
    url: '/goods/list',
    method: 'post',
    data: query
  })
}

export function fetchListAll(token) { // 加载所有的上架商品列表
  const data = {
    token
  }
  return request({
    url: '/goods/listAll',
    method: 'post',
    data: data
  })
}

export function createGoods(data) {
  return request({
    url: '/goods/create',
    method: 'post',
    data
  })
}

export function updateGoods(rowdata) {
  return request({
    url: '/goods/updateRowData',
    method: 'post',
    data: rowdata
  })
}

export function updateRowInfo(rowdata) {
  return request({
    url: '/goods/updateRowData',
    method: 'post',
    data: rowdata
  })
}

export function testButton() {
  const data = {
    machineID: '3',
    code: 'xxxxx',
    nickName: 'xxxxx', // 发送之前最好先进行Emoji转换，看一下js能否进行转换
    avatarUrl: 'xxx',
    gender: 'xxx',
    city: 'xxx',
    province: 'xxx',
    country: 'xxx',
    language: 'xxx'
  }
  return request({
    url: '/weixin/getGoodsList',
    method: 'post',
    data: data
  })
}

export function updateRepertory(addGoodsForm) {
  return request({
    url: '/goods/updateRepertory',
    method: 'post',
    data: addGoodsForm
  })
}
