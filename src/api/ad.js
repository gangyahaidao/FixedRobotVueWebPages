import request from '@/utils/request'
import { getToken } from '@/utils/auth'

export function createAdTemplate(formObj) { // 创建一个广告模板
  return request({
    url: '/adtemplate/createAdTemplate',
    method: 'post',
    data: formObj
  })
}

export function updateAdTemplate(formObj) { // 创建一个广告模板
  return request({
    url: '/adtemplate/updateAdTemplate',
    method: 'post',
    data: formObj
  })
}

export function getAdTemplateList() { // 创建一个广告模板
  return request({
    url: '/adtemplate/getAdTemplateList',
    method: 'post',
    data: getToken()
  })
}

export function getAdTemplateById(templateId) {
  const data = {
    templateId
  }
  return request({
    url: '/adtemplate/getAdTemplateById',
    method: 'post',
    data: data
  })
}
