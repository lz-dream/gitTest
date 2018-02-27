import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes:
        [
          {
            path: '/',
            redirect: '/login'
          },
          {
            path: '/login',
            component: resolve => require(['../components/common/login.vue'], resolve)
          },
          {
            path: '/AccountInfo',
            name:'账户信息',
            component: resolve => require(['../components/common/index.vue'], resolve),
            children: [
              {
                path: '/UserInfo',
                name:'个人信息',
                component: resolve => require(['../components/page/UserInfo.vue'], resolve)
              },
              {
                path: '/MobileBind',
                name:'手机绑定管理',
                component: resolve => require(['../components/page/MobileBind.vue'], resolve)
              }
            ]
          },
          {
              path: '/BussinessHandle',
              name:'业务办理',
              component: resolve => require(['../components/common/index.vue'], resolve),
              children: [
                  {
                      path: '/ElectricReport',
                      name:'电量申报',
                      component: resolve => require(['../components/page/ElectricReport.vue'], resolve)
                  },
                {
                  path: '/ElectricReportSearch',
                    name:'电量申报查询',
                  component: resolve => require(['../components/page/ElectricReportSearch.vue'], resolve)
                },
            {
              path: '/BillingInfo',
                name:'结算信息查询',
              component: resolve => require(['../components/page/BillingInfoSearch.vue'], resolve)
            },
                {
                  path: '/ElectricContract',
                  name:'电子合同',
                  component: resolve => require(['../components/page/ElectricContract.vue'], resolve)
                }
              ]
          },
          {
            path: '/Customer',
              name:'客户管理',
            component: resolve => require(['../components/common/index.vue'], resolve),
            children: [
            {
              path: '/CustomerManage',
              name:'客户管理',
              component: resolve => require(['../components/page/CustomerManage.vue'], resolve)
              }
            ]
          }
        ]
})
