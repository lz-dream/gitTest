<style scoped>
    .wrapper{
        background: #eee;
        padding: 1px;
    }
    .wrapper-header {
        box-shadow: 0 1px 1px rgba(0,0,0,.08);
    }
    .wrapper-header .ivu-menu-horizontal {
        height: 80px;
        line-height: 80px;
    }
    .ivu-menu-light {
        background: #fff;
    }
    .ivu-menu {
        display: block;
        margin: 0;
        padding: 0;
        outline: 0;
        list-style: none;
        color: #495060;
        font-size: 14px;
        position: relative;
    }
    .wrapper-header-nav {
        width: 90%;
        height: 0px;
        margin: 0 auto;
    }
    .wrapper-header-nav-logo {
        height: 0px;
        /*margin-top: 15px;*/
        float: left;
    }
    .wrapper-header-nav-list {
        height: inherit;
        float: right;
    }
    .wrapper-container {
        background: #fff;
        width: 95%;
        margin: 10px auto 10px;
        border-radius: 6px;
        box-shadow: 0 1px 1px 0 rgba(0,0,0,.1);
    }
    .middle{

    }
    .footer{
        background: #fff;
        color: #797575;
    }
    .footer-main{
        width: 90%;
        margin: 0 auto;
    }
    .footer-main .ivu-row {
        text-align: center;
        padding: 20px 0;
    }
</style>
<template>
    <div>
        <div class="wrapper">
            <div class="wrapper-header">
                <ul class="ivu-menu ivu-menu-light ivu-menu-horizontal">
                    <div class="wrapper-header-nav">
                        <div class="wrapper-header-nav-logo router-link-active">
                          <a :href="indexUrl">
                            <img src="../../../static/image/logo.jpg" style="margin-top: 15px;">
                          </a>
                        </div>
                        <div class="wrapper-header-nav-search"></div>
                        <div class="wrapper-header-nav-list"><li class="ivu-menu-item">
                            <i class="ivu-icon ivu-icon-person"></i>
                                {{staffName}}
                            </li>

                            <li class="ivu-menu-item"><i class="ivu-icon ivu-icon-ios-analytics"></i>
                                <Button type="text" @click="exit">退出</Button>
                            </li>
                        </div>
                    </div>
                </ul>
            </div>
            <div class="wrapper-container">
                <middle></middle>
            </div>
        </div>
        <div class="footer">
            <div class="footer-main">
                <div class="ivu-row">
                    <div>Copyright  2017  华能山东信息技术有限公司版权所有</div>
                    <div>华能山东信息技术有限公司</div>
                    <div><a href="../../../static/image/hnsdyx.com_cert.jpg" target='_blank'>华能山东信息技术有限公司域名证书</a></div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import axios from 'axios'
    import middle from "./middle.vue"
    export default {

        data () {
            return {
              indexUrl:url_+"/static/index.html",
                staffName:''
            }
        },
        mounted(){
        },
        methods: {
            exit(){
                this.$Modal.confirm({
                    title: '确认退出，返回主页面',
                    content: '<p>请确认是否退出当前用户</p>',
                    onOk: () => {
                      window.location.href=url_+"/registerFileUpload/logout"
                    },
                    onCancel: () => {
                        this.$Message.info('您选择了取消!');
                    }
                });
            },
        },
        components: {
            'middle': middle
      },
      created(){
        let _this = this;
        axios({
          method: 'get',
          url: url_ + '/getCurrentUser',
          withCredentials: true
        }).then(function (res) {
          _this.staffName = res.data.data.mobile;
          userType = res.data.data.userType;
        }).catch(function (error) {
          console.log(error);
        });
      }
    }
</script>
