import request from '@/utils/request'

export function fetchVendorList(token) {
  const data = {
    token
  }
  return request({
    url: '/vendor/list',
    method: 'post',
    data: data
  })
}

export function createVendor(data) {
  return request({
    url: '/vendor/add',
    method: 'post',
    data: data
  })
}

export function updateVendor(rowdata) {
  return request({
    url: '/vendor/updateVendor',
    method: 'post',
    data: rowdata
  })
}

export function deleteVendor(vendorId) {
  const data = {
    vendorId
  }
  return request({
    url: '/vendor/deleteVendor',
    method: 'post',
    data: data
  })
}
