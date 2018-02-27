<style scoped>

.wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    padding-top: 150px;
    padding-bottom: 200px;
    /*background: -webkit-gradient(linear, 0 0, 0 bottom, from(#ff0000), to(rgba(0, 0, 255, 0.5)));*/
    /*background: #fff;*/
    /*url(http://78rbeb.com1.z0.glb.clouddn.com/wp-content/uploads/2014/03/free-blurred-web-backgrounds-04.jpg);*/
}
.wrapper > h1{
  text-align: center;
  vertical-align: middle;
  margin-bottom: 20px;
  color: #000;
}
.login {
    margin: 0 auto;
    padding: 200px auto;
    width: 200px;
    height: 100%;
}

</style>

<template>

<div class="wrapper">
<h1>
华能热力服务平台登录
</h1>
    <div class="login">
        <i-form ref="formInline" :model="formInline" :rules="ruleInline">
            <Form-item prop="user">
                <Input v-model="formInline.mobile" placeholder="请输入用户名"></Input>
            </Form-item>

            <Form-item prop="captcha">
                <Input v-model="formInline.captcha"  placeholder="请输入验证码"></Input>
            </Form-item>
            <div>
                <Form-item>
                    <Button type="info" disabled size="large">{{img}}</Button>
                    <Button type="text" @click="refreshYzm">换一张</Button>
               </Form-item>
            </div>


            <Form-item>
                <i-button type="success" @click.native="handleSubmit('formInline')" long>登录</i-button>
            </Form-item>
        </i-form>
    </div>
</div>

</template>

<script>
import axios from 'axios'
var _COUNT = 0;
axios.defaults.withCredentials = true;
export default {
    data() {
            return {
                formInline: {
                    mobile: '',
                    captcha:'',
                },
                img: this.getImg(),
                ruleInline: {
                  phonenum: [{
                        required: true,
                        message: '请填写用户名',
                        trigger: 'blur'
                    }],

                    captcha: [{
                        required: true,
                        message: '请填写验证码',
                        trigger: 'blur'
                    }]
                }
            }
        },
    methods: {
            handleSubmit(name) {
              let this_ = this;
              axios({
                method: 'post',
                url: url_+'/login',
                params:{
                  username:this_.formInline.mobile,
                  password:this_.formInline.captcha
                },
                withCredentials: true
              }).then(function (res) {
                console.log(res)
                let appData = require('../../../static/permission.json');
                sessionStorage.setItem('menu', JSON.stringify(appData.menu));
                console.log(sessionStorage.getItem("menu"))
                axios({
                  method: 'get',
                  url: url_ + '/getCurrentUser',
                  withCredentials: true
                }).then(function (res) {
                  let userType = res.data.data.userType;
                  sessionStorage.setItem('userType', userType);
                  console.log(userType)
                  this_.$router.push('/UserInfo');
                }).catch(function (error) {
                  console.log(error);
                });
              }).catch(function (error) {
                console.log(error);
              });
            },
            handleReset(val) {
                console.log(1231312312321)
            },
            //验证码刷新
            refreshYzm(){
                this.img = this.getImg();
            },
            getImg(){
                var chars = ['0','1','2','3','4','5','6','7','8','9'];
                var res = '';
                for(var i = 0; i < 4 ; i ++) {
                    var id = Math.ceil(Math.random()*9);
                    res += chars[id];
                }
                return res;
            }
        },
    created(){
    let _this = this;

  }
    }

</script>
<style>
    .ivu-form-item {
        margin-bottom: 18px;
    }
</style>
