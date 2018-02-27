<template>

  <div>
    <Table border ref="selection" :columns="tableColumns" :data="tableData"></Table>
    <Modal width="450" v-model="modal"
           title="手机号更改窗口">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="90">
        <FormItem label="新手机号：" prop="newMobile">
          <Input v-model="formValidate.newMobile" placeholder="请输入新手机号"></Input>
        </FormItem>
        <FormItem label="验证码：">
          <Row>
            <Col span="15">
            <FormItem prop="captcha">
              <Input v-model="formValidate.captcha" placeholder="请输入验证码"></Input>
            </FormItem>
            </Col>
            <Col span="9" style="text-align: right">
            <Button type="warning" :disabled="formValidate.captchaStatus" @click="getCaptcha()">
              {{formValidate.captchaBtnMsg}}
            </Button>
            </Col>

          </Row>
        </FormItem>
        <FormItem label="授权协议：">
          <Row>
            <Upload :before-upload="handleUpload" :on-success="handleSuccess" action="/register/fileUpLoad">
            <!--<Upload :before-upload="handleUpload" :on-success="handleSuccess" action="http://localhost:8080/register/fileUpLoad">-->
              <Button type="primary" icon="ios-cloud-upload-outline">选择文件</Button>
            </Upload>
          </Row>
        </FormItem>

      </Form>
      <div slot="footer">
        <Button type="primary" @click="submit()">确定</Button>
      </div>
    </Modal>
    <Modal width="450" v-model="modal2"
           title="手机号解绑窗口"
           ok-text="确定"
           cancel-text="取消"
           @on-ok="del">
      <div>
        <p>您确定解绑手机号{{formItem.mobile}}吗？</p>
      </div>
    </Modal>
  </div>
</template>
<script>
  import axios from 'axios';

  export default {
    data() {
      //验证手机号规则
      const validateMobile = (rule, value, callback) => {
        let reg = /^1[3|4|5|8]\d{9}$/;
        if (!reg.test(value)) {
          callback(new Error("请输入正确的手机号码！"));
          return;
        }
        if (value == this.formValidate.mobile) {
          callback(new Error("不能和旧手机号相同！"));
          return;
        }
        callback();
      };

      return {
        tableData: [],//加载数据
        modal: false,
        modal2: false,
        formItem: {
          data:null,
          dbid: '',
          mobile: ''
        },
        formValidate: {
          mobile: '',
          electricNo: '',
          newMobile: '',
          captcha: '',
          agreement: '',
          file: null,
          customerName:'',
          licenceNo:'',
          businesslicense:'',
          captchaBtnMsg: "获取短信验证码",
          captchaStatus: false
        },

        ruleValidate: {
          newMobile: [
            {required: true, message: '不能为空！', trigger: 'blur'},
            {validator: validateMobile, trigger: 'blur'}
          ],
          captcha: [
            {required: true, message: '不能为空！', trigger: 'blur'},
          ]
        }
      }
    },

    mounted() {
      this.search();
    },
    methods: {
      search() {//查询
        let datas = [];//查询结果数据集
        let that_ = this;//重定义this
        axios({
          method: 'get',
          url: url_ + '/api/mobileBind',
          withCredentials: true
        })
          .then(function (res) {
            console.log(res);
            for (let i = 0; i < res.data.data.length; i++) {
              var customer = res.data.data[i].customer;
              var user = res.data.data[i].user;
              if(customer!=null){
                customer.mobile = user.mobile;
                datas.push(customer)
              }
            }
          }).catch(function (error) {
          that_.$Message.error(error);
        });

        that_.tableData = datas;
      },
      edit(data) {//更换
        if (data.auditStatus == 1 || data.auditStatus == '1') {
          this.$Message.warning('待审核状态的信息不能进行更换操作！');
          return;
        }
        this.modal = true;
        this.formValidate.customerName = data.customerName;
        this.formValidate.licenceNo = data.licenceNo;
        this.formValidate.businesslicense = data.businesslicense;
        this.formValidate.electricNo = data.electricNo;
        this.formValidate.mobile = data.mobile;
      },
      submit() {
        this.$refs['formValidate'].validate((valid) => {
          if (valid) {
            let that_ = this;
            if (that_.formValidate.file == null) {
              that_.$Message.warning('请上传授权协议！');
              return;
            }
            let qs = require('qs');
                axios.post(url_ + '/api/mobileBind/getMsg/'+that_.formValidate.newMobile,
                  qs.stringify({
                    customerName: that_.formValidate.customerName,
                    licenceNo:that_.formValidate.licenceNo,
                    businesslicense:that_.formValidate.businesslicense,
                    electricNo: that_.formValidate.electricNo,
                    captcha: that_.formValidate.captcha,
                    newMobile: that_.formValidate.newMobile,
                    mobile: that_.formValidate.mobile,
                    filename: that_.formValidate.agreement,
                    createTime: that_.formatDate(new Date())
                  })
                ).then(function (res) {
                  if(res.data.msg=="success"){
                    that_.modal = false;
                    that_.$Message.success('提交成功，请耐心等待审批！');
                    that_.search();
                  }else{
                    that_.$Message.error(res.data.data);
                  }
                }).catch(function (error) {
                  console.log(error);
                  that_.$Message.error(error);
                });
             }
        });
      },
      remove(data) {
        if (data.auditStatus == 1 || data.auditStatus == '1') {
          this.$Message.warning('待审核状态的信息不能进行解绑操作！');
          return;
        }
        this.modal2 = true;
        this.formItem.dbid = data.dbid;
        this.formItem.mobile = data.mobile;
        data.fkUserId=0;
        this.formItem.data = data;
      },
      del() {
        let that_ = this;
        let qs = require('qs');
        console.log(that_.formItem.data);
        axios.post(url_ + '/api/mobileBind/unbundling',
          qs.stringify({
            dbid: that_.formItem.data.dbid,
            licenceNo:that_.formItem.data.licenceNo,
            businesslicense:that_.formItem.data.businesslicense,
            electricNo: that_.formItem.data.electricNo,
            customerName: that_.formItem.data.customerName,
            mobile: that_.formItem.data.mobile,
            fkUserId: 0,
            updateTime: that_.formatDate(new Date()),
            auditStatus:"1",
            withCredentials: true
          })
        ).then(function (res) {
          that_.modal = false;
          that_.$Message.success('解绑成功！');
          that_.search();
        }).catch(function (error) {
          console.log(error);
          that_.$Message.error(error);
        });
      },
      handleUpload(file) {
        let filename= file.name;
        console.log(filename);
        let fileMsg = filename.split(".");
        let fileType = fileMsg[1].toLowerCase();
        if(fileType=="jpg"||fileType=="jpeg"||fileType=="png"||fileType=="gif"||fileType=="psd"||fileType=="svg"||fileType=="bmp"||fileType=="tiff"||fileType=="swf"){
          this.formValidate.file = file;
        }else{
          this.$Message.error("请上传图片格式的授权协议文件！");
          return false;
        }

      },
      handleSuccess(response){
        this.formValidate.agreement = response.data;
      },
      getCaptcha() {
        let that_ = this;
        let newMobile = that_.formValidate.newMobile;
        let reg = /^1[3|4|5|8]\d{9}$/;
        if (!reg.test(newMobile)) {
          that_.$Message.error("请输入正确的手机号码！");
          return;
        }
        if (newMobile == this.formValidate.mobile) {
          that_.$Message.error("不能和旧手机号相同！");
          return;
        }
        this.formValidate.captchaStatus = true;
        let count = 60;
        let qs = require('qs');
        axios.get(url_ + '/api/mobileBind/sendMsg/' + that_.formValidate.newMobile,
          qs.stringify({
            withCredentials: true
          })
        ).then(function (res) {
          console.log(res)
          if(res.msg=="success"){
            that_.$Message.success('发送成功！');
          }else{
            that_.$Message.error('发送失败！');
          }
        }).catch(function (error) {
          console.log(error);
          that_.$Message.error(error);
        });
        let timer = setInterval(() => {
          count--;
          if (count <= 0) {
            clearInterval(timer);
            this.formValidate.captchaStatus = false;
            this.formValidate.captchaBtnMsg = "重新获取验证码";
          } else {
            this.formValidate.captchaBtnMsg = count + "秒后重新获取";
          }
        }, 1000);
      },
      formatDate(date) {
        let seperator1 = "-";
        let seperator2 = ":";
        let month = date.getMonth() + 1;
        let strDate = date.getDate();
        if (month >= 1 && month <= 9) {
          month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
          strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
          + " " + date.getHours() + seperator2 + date.getMinutes()
          + seperator2 + date.getSeconds();
        return currentdate;
      },
    },
    computed: {
      tableColumns() {
        let cols = [];
        /* cols.push({
           type: 'selection',
           width: 60,
           align: 'center'
         });*/
        cols.push({
          title: '用电编号',
          align: 'left',
          key: 'electricNo',
        });
        cols.push({
          title: '客户名称',
          align: 'left',
          key: 'customerName',
        });
        cols.push({
          title: '手机号码',
          align: 'center',
          width: 150,
          key: 'mobile'
        });
        cols.push({
          title: '操作',
          key: 'action',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.edit(params.row)
                  }
                }
              }, '更换'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.remove(params.row)
                  }
                }
              }, '解绑')
            ]);
          }
        });
        return cols;
      }
    },

  }
</script>
