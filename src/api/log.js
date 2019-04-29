import request from '@/utils/request'

export function fetchListAll(token, logEntityName) { // 传递token和要查询日志对象的名字
  const data = {
    token,
    logEntityName
  }
  return request({
    url: '/log/getLogListAll',
    method: 'post',
    data: data
  })
}

export function fetchList(query) { // 按条件进行查询
  return request({
    url: '/log/getLogList',
    method: 'post',
    data: query
  })
}

export function getUserConsumerOrderList(listQuery) {
  return request({
    url: '/log/getUserConsumerOrderList',
    method: 'post',
    data: listQuery
  })
}
