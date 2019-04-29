import Vue from 'vue'
import store from './store'

// 可以设置只在生产环境中显示错误日志
// if (process.env.NODE_ENV === 'production') {

Vue.config.errorHandler = function(err, vm, info, a) {
  Vue.nextTick(() => {
    store.dispatch('addErrorLog', {
      err,
      vm,
      info,
      url: window.location.href
    })
    console.error(err, info)
  })
}

// }
