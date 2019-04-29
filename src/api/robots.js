import request from '@/utils/request'

export function fetchDialogList(groupId, type, tabPaneState, timeIntervalName, currentSelectName) {
  const data = {
    groupId,
    type,
    tabPaneState,
    timeIntervalName,
    currentSelectName
  }
  return request({
    url: '/dialog/getDialogList',
    method: 'post',
    data: data
  })
}

export function addDialog(groupId, total, type, tabPaneState, timeIntervalName, currentSelectName) {
  const data = {
    groupId,
    total,
    type,
    tabPaneState,
    timeIntervalName,
    currentSelectName
  }
  return request({
    url: '/dialog/addDialog',
    method: 'post',
    data: data
  })
}

export function updateDialog(row) {
  return request({
    url: '/dialog/updateDialog',
    method: 'post',
    data: row
  })
}

export function deleteDialog(id, type) {
  const data = {
    id,
    type
  }
  return request({
    url: '/dialog/deleteDialog',
    method: 'post',
    data: data
  })
}

// 添加机器人回话模板数据
export function addTemplateTalk(type, newtodo) {
  const data = {
    type,
    newtodo
  }
  return request({
    url: '/dialog/addTemplateTalk',
    method: 'post',
    data: data
  })
}
export function deleteTemplateTalk(type, newtodo) {
  const data = {
    type,
    newtodo
  }
  return request({
    url: '/dialog/deleteTemplateTalk',
    method: 'post',
    data: data
  })
}
export function getRobotTemplateLists(type, newtodo) {
  return request({
    url: '/dialog/getRobotTemplateLists',
    method: 'post'
  })
}

export function createNewTalk(floorName, talkName) {
  const data = {
    floorName,
    talkName
  }
  return request({
    url: '/dialog/createNewTalk',
    method: 'post',
    data: data
  })
}

export function getTalkGroupList(searchStr) {
  const data = {
    searchStr
  }
  return request({
    url: '/dialog/getTalkGroupList',
    method: 'post',
    data: data
  })
}

export function updateGroupRowTalk(row) {
  const data = {
    row
  }
  return request({
    url: '/dialog/updateGroupRowTalk',
    method: 'post',
    data: data
  })
}

export function deleteTalkGroupById(id) {
  const data = {
    id
  }
  return request({
    url: '/dialog/deleteTalkGroupById',
    method: 'post',
    data: data
  })
}

export function getTalkGroupById(groupId) {
  const data = {
    groupId
  }
  return request({
    url: '/dialog/getTalkGroupById',
    method: 'post',
    data: data
  })
}

export function getTalkGroupNamesList(token) {
  return request({
    url: '/dialog/getTalkGroupNamesList',
    method: 'post',
    data: token
  })
}
