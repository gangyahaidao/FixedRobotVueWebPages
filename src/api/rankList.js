import request from '@/utils/request'

export function getWXUserRankList(listWeekNum) { // 根据参数查询商品条目
  const data = {
    listWeekNum
  }
  return request({
    url: '/rankList/getWXUserRankList',
    method: 'post',
    data: data
  })
}

export function getSellBestGoodsList(listWeekNum) { // 根据参数查询商品条目
  const data = {
    listWeekNum
  }
  return request({
    url: '/rankList/getSellBestGoodsList',
    method: 'post',
    data: data
  })
}

export function getRobotSellRankList(listWeekNum) { // 根据参数查询商品条目
  const data = {
    listWeekNum
  }
  return request({
    url: '/rankList/getRobotSellRankList',
    method: 'post',
    data: data
  })
}
