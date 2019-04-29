import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import errorLog from './modules/errorLog'
import permission from './modules/permission'
import tagsView from './modules/tagsView'
import user from './modules/user'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app, // 将模块添加进modules中，这样在其他地方可以使用this.$store.dispatch('xxxxx')去调用这些模块下面的actions函数
    errorLog,
    permission,
    tagsView,
    user
  },
  getters
})

export default store
