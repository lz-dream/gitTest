import Vue from 'vue'
import App from './App'
import router from './router'
import VueMarkdown from 'vue-markdown'
import iView from 'iview'
import store from './store'
import 'iview/dist/styles/iview.css'
import VueQuillEditor from 'vue-quill-editor'
import IEcharts from 'vue-echarts-v3';
import axios from 'axios'
import VueAxios from 'vue-axios'
import utils from './utils'

//git test
Vue.prototype.$ajax = axios
Vue.prototype.$utils=utils

Vue.use(iView)
Vue.use(VueMarkdown)
Vue.use(IEcharts)
Vue.use(VueAxios, axios)

Vue.config.productionTip = false
axios.defaults.baseURL = 'http://localhost';

new Vue({
    el: '#app',
    router,
    store,
    VueMarkdown,
    template: '<App/>',
    components: { App }
})

export { app, router, store }


