import request from '@/utils/request'

export function getSaleMoneyByFloorName(floorName) { // 根据参数查询商品条目
  const data = {
    floorName
  }
  return request({
    url: '/datareport/getSaleMoneyByFloorName',
    method: 'post',
    data: data
  })
}

export function getRobotSellWeekDataByFloorName(floorName) {
  const data = {
    floorName
  }
  return request({
    url: '/datareport/getRobotsTotalSaleWeekCountByFloorName',
    method: 'post',
    data: data
  })
}
