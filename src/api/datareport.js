import request from '@/utils/request'
import { getToken } from '@/utils/auth'

export function getPanelStatisticsData(floorName, saleDuration) { // 根据参数查询商品条目
  const data = {
    floorName,
    saleDuration
  }
  return request({
    url: '/datareport/getPanelStatisticsData',
    method: 'post',
    data: data
  })
}

export function getSaleChartList(listWeekNum) { // 获取指定星期数的销量金额百分比数组
  const data = {
    listWeekNum
  }
  return request({
    url: '/datareport/getSaleChartList',
    method: 'post',
    data: data
  })
}

export function getRobotSaleData(floorName, robotMachineId, weekNum) { // 根据楼层和机器人编号获取机器人销售商品信息
  const data = {
    floorName,
    robotMachineId,
    weekNum
  }
  return request({
    url: '/datareport/getRobotSaleData',
    method: 'post',
    data: data
  })
}

export function getGoodsSellCountInMonth() {
  return request({
    url: '/datareport/getGoodsSellCountInMonth',
    method: 'post',
    data: getToken()
  })
}

export function getAbnormalShortageListFromRobot() {
  return request({
    url: '/datareport/getAbnormalShortageListFromRobot',
    method: 'post',
    data: getToken()
  })
}
export function getAbnormalShipListFromOrders() {
  return request({
    url: '/datareport/getAbnormalShipListFromOrders',
    method: 'post',
    data: getToken()
  })
}

export function getGoodsReplenishDataList() {
  return request({
    url: '/datareport/getGoodsReplenishDataList',
    method: 'post',
    data: getToken()
  })
}

export function getReplenishLog(listQuery) {
  return request({
    url: '/log/getReplenishLog',
    method: 'post',
    data: listQuery
  })
}

export function getRobotReplenishLog(listQuery) {
  return request({
    url: '/log/getRobotContainerReplenishLog',
    method: 'post',
    data: listQuery
  })
}
