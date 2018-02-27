// 引入vue
import Vue from 'vue'
// 引入vuex
import Vuex from 'vuex'
// 引入modules
import modules from './modules'
// vue根注入vuex的store
Vue.use(Vuex)
// 组装store
const store = new Vuex.Store({
  modules
 // strict: debug    // 非生产环境使用vue的strict模式，以保证store中的state都是由mutations进行修改
})

export default store