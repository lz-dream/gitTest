<template>
  <div>
    <Form ref="formInline">
      <FormItem label="交易类型：">
        <Col span="3">
        <Select v-model="tradingType" style="width:100px">
          <Option v-for="item in tradingTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        </Col>
        <Col span="2" style="text-align: center">申报类型：</Col>
        <Col span="3">
        <Select v-model="declarationType" style="width:100px">
          <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        </Col>
       <!-- <Col span="3" style="text-align: center">申报有效开始日期：</Col>
        <Col span="3">
        <Input v-model="begDate" disabled></Input>
        </Col>
        <Col span="2" style="text-align: center">
        结束日期：</Col>
        <Col span="3">
        <Input v-model="endDate" disabled></Input>

        </Col>-->
        <div style="float:right;">
          <Button type="primary" @click="search()">查询</Button>
        </div>
        </Row>

      </FormItem>

    </Form>
    <Table border :columns="tableColumns" :data="tableData"></Table>
    <Modal width="700"
           v-model="modal"
           title="电量申报编辑页面">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
        <FormItem label="客户名称：">
          <Row>
            <Col span="9">
            <FormItem prop="customerName">
              <Input v-model="formValidate.customerName" disabled></Input>
            </FormItem>
            </Col>
            <Col span="6" style="text-align: center">
            用电年月：</Col>
            <Col span="9">
            <FormItem prop="yearMonth">
              <Input v-model="formValidate.yearMonth" disabled></Input>
            </FormItem>
            </Col>
          </Row>
        </FormItem>

        <FormItem label="合同电量合计(MWH)：">
          <Row>
            <Col span="9">
            <FormItem prop="total">
              <Input v-model="formValidate.total" disabled></Input>
            </FormItem>
            </Col>
            <Col span="6" style="text-align: center">
            申报日期：</Col>
            <Col span="9">
            <FormItem prop="yearMonth">
              <Input v-model="formValidate.reportDate" disabled></Input>
            </FormItem>
            </Col>

          </Row>
        </FormItem>

        <FormItem label="分解电量(MWH)：">
          <Row>
            <Col span="9">
            <FormItem prop="decomposition">
              <Input v-model="formValidate.decomposition" disabled></Input>
            </FormItem>
            </Col>
            <Col span="6" style="text-align: center">
            缩减量(MWH)：</Col>
            <Col span="9">
            <FormItem prop="shrinkage">
              <Input type="text" v-model="formValidate.shrinkage"></Input>
            </FormItem>
            </Col>

          </Row>
        </FormItem>

        <FormItem label="月度双边意向电量(MWH)：">
          <Row>
            <Col span="9">
            <FormItem prop="bilateral">
              <Input type="text" v-model="formValidate.bilateral"></Input>
            </FormItem>
            </Col>
            <Col span="6" style="text-align: center">集中竞价意向电量(MWH)：</Col>
            <Col span="9">
            <FormItem prop="bidding">
              <Input type="text" v-model="formValidate.bidding"></Input>
            </FormItem>
            </Col>

          </Row>

        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" :loading="modal_loading1" @click="report(1)">申报</Button>
        <Button type="primary" :loading="modal_loading2" @click="report(0)">保存</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import axios from 'axios'

  export default {
    data() {
      let year = new Date().getFullYear();
      let month = new Date().getMonth() + 2;
      if(month>12){
        month=month-12;
      }
      const validate = (rule, value, callback) => {
        if(value==null){
          value=0
        }
        let reg = /^(\d+(\.\d{2})?)?$/;
        if (!reg.test(value)) {
          callback(new Error(rule.message));
        } else {
          callback();
        }
      };
      return {
        tradingType:'Z2',
        declarationType:'Z002',
        tradingTypeList:[
          {
            value: 'Z1',
            label: '跨省'
          },
          {
            value: 'Z2',
            label: '省内'
          },
        ],
        typeList:[
          {
            value: 'Z002',
            label: '月度申报'
          },
          {
            value: 'Z001',
            label: '年度申报'
          },
        ],
        tableData: [],//加载数据
        modal: false,
        modal_loading1: false,
        modal_loading2: false,
        formValidate: {
          dbid: '',
          electricNo: '',
          declarationType: '',
          tradingType: '',
          customerName: '',
          yearMonth: '',
          validDateBeg:"",
          validDateEnd:"",
          reportDate: '',
          createTime: '',
          declarationTime: '',
          total: '',
          decomposition: '',
          shrinkage: '',
          bilateral: '',
          bidding: ''
        },

        ruleValidate: {
          shrinkage: [
            {validator: validate, message: '请输入小数位数不超过两位的字值！', trigger: 'blur'}
          ],
          bilateral: [
//            {required: true, message: '双边意向电量不能为空！', trigger: 'blur'},
            {validator: validate, message: '请输入小数位数不超过两位的字值！', trigger: 'blur'}

          ],
          bidding: [
            {validator: validate, message: '请输入小数位数不超过两位的字值！', trigger: 'blur'}

          ]
        }
      }
    },

    mounted() {
    },
    methods: {
      search() {
        let datas = [];//查询结果数据集
        let that_ = this;//重定义this
        axios({
          method: 'get',
          url: url_ + '/api/electricReport',
          params:{
            declarationType:that_.declarationType,
            tradingType:that_.tradingType
          },
          withCredentials: true
        })
          .then(function (res) {
            for (let i = 0; i < res.data.data.length; i++) {
              let rec = res.data.data[i];
              let total_ = 0;
              let decomposition = rec.electricReport.decomposition == '' || rec.electricReport.decomposition == null ? 0 : rec.electricReport.decomposition;//分解量
              let shrinkage = rec.electricReport.shrinkage == '' || rec.electricReport.shrinkage == null ? 0 : rec.electricReport.shrinkage;//缩减量
              let bilateral = rec.electricReport.bilateral == '' || rec.electricReport.bilateral == null ? 0 : rec.electricReport.bilateral;//双边意向
              let bidding = rec.electricReport.bidding == '' || rec.electricReport.bidding == null ? 0 : rec.electricReport.bidding;//竞价意向电量
              total_ = decomposition - shrinkage + bilateral + bidding;
              rec.electricReport.total = total_;
              if(res.data.data[i].customer!=null){
                rec.electricReport.customerName = res.data.data[i].customer.customerName;
              }else{
                rec.electricReport.customerName = "";
              }
              datas.push(rec.electricReport)
            }
          }).catch(function (error) {
          console.log(error);
          that_.$Message.error(error);
        });

        that_.tableData = datas;
      },
      edit(data) {
        let that_ =this;
        if (data.status == 1 || data.status == '1') {
          this.$Message.warning('不能编辑已申报的信息！');
          return;
        }
        let nowTime = new Date();
        let startTime = new Date(Date.parse(data.validDateBeg+" 00:00:00"));
        let endTime = new Date(Date.parse(data.validDateEnd+" 23:59:59"));
        if(!(nowTime>=startTime&&nowTime<=endTime)){
          that_.$Message.warning("当前时间不在有效期内，不能编辑！");
          return;
        }
        this.modal = true;
        this.formValidate.dbid = data.dbid;
        this.formValidate.electricNo = data.electricNo;
        this.formValidate.declarationType = data.declarationType;
        this.formValidate.tradingType = data.tradingType;
        this.formValidate.customerName = data.customerName;
        this.formValidate.yearMonth = data.yearMonth;
        this.formValidate.validDateBeg = data.validDateBeg;
        this.formValidate.validDateEnd = data.validDateEnd;
        this.formValidate.createTime = data.createTime;
        this.formValidate.declarationTime = data.declarationTime;
        this.formValidate.reportDate = data.createTime?data.createTime.substring(0,10):'';
        this.formValidate.total = data.total;
        this.formValidate.decomposition = data.decomposition;
        this.formValidate.shrinkage = data.shrinkage;
        this.formValidate.bilateral = data.bilateral;
        this.formValidate.bidding = data.bidding;
      },
      report(value) {
        this.$refs['formValidate'].validate((valid) => {
          if (valid) {
            let that_ = this;
            let decomposition = that_.formValidate.decomposition;//分解电量
            let shrinkage = that_.formValidate.shrinkage;//缩减量
            let bilateral = that_.formValidate.bilateral;//双边意向
            let bidding = that_.formValidate.bidding;//竞价
            if(shrinkage!=0&&shrinkage!=null&&((bilateral!=0&&bilateral!=null)||(bidding!=0&&bidding!=null))){
              this.$Message.error('不能同时填写缩减量和月度增量!');
              return;
            }
            decomposition = decomposition==null||decomposition==""?0:decomposition;
            shrinkage = shrinkage==null||shrinkage==""?0:shrinkage;
            if(decomposition<shrinkage){//分解量不能小于缩量
              this.$Message.error('分解电量不能小于缩减量！');
              return;
            }
            let qs = require('qs');
            axios.post(url_ + '/api/electricReport',
              qs.stringify({
                dbid: that_.formValidate.dbid,
                electricNo: that_.formValidate.electricNo,
                declarationType: that_.formValidate.declarationType,
                tradingType: that_.formValidate.tradingType,
                decomposition: that_.formValidate.decomposition,
                validDateBeg: that_.formValidate.validDateBeg,
                validDateEnd: that_.formValidate.validDateEnd,
                yearMonth: that_.formValidate.yearMonth,
                shrinkage: that_.formValidate.shrinkage==null?0:that_.formValidate.shrinkage,
                bilateral: that_.formValidate.bilateral==null?0:that_.formValidate.bilateral,
                bidding: that_.formValidate.bidding==null?0:that_.formValidate.bidding,
                declarationTime: value==1?that_.formatDate(new Date()):that_.formValidate.declarationTime,
                updateTime: that_.formatDate(new Date()),
                createTime: that_.formValidate.createTime,
               // updateBy: userId,
                status: value,
                withCredentials: true
              })
            ).then(function (res) {
              that_.modal_loading1 = false;
              that_.modal = false;
              if(res.data.msg=='success'){
                if(value==1||value=='1'){
                  that_.$Message.success('申报成功！');

                }else{
                  that_.$Message.success('保存成功！');
                }
              that_.search();
              }else{
                if(value==1||value=='1'){
                  that_.$Message.success('申报失败！');

                }else{
                  that_.$Message.success('保存失败！');
                }
              }

            }).catch(function (error) {
              that_.modal_loading1 = false;
              console.log(error);
              that_.$Message.error(error);
            });
          }
        });
      },
      report2(data) {
        let that_ = this;
        if(data.status==1||data.status=='1'){
          that_.$Message.warning("已经申报信息的不能重复申报！");
          return;
        }
        let nowTime = new Date();
        let startTime = new Date(Date.parse(data.validDateBeg+" 00:00:00"));
        let endTime = new Date(Date.parse(data.validDateEnd+" 23:59:59"));
        if(!(nowTime>=startTime&&nowTime<=endTime)){
          that_.$Message.warning("当前时间不在有效期内，不能上报！");
          return;
        }
        if (data.shrinkage == '' || data.shrinkage == null) {
          data.shrinkage = 0;
        }
        if (data.bilateral == '' || data.bilateral == null) {
          data.bilateral = 0;
        }
        if (data.bidding == '' || data.bidding == null) {
          data.bidding = 0;
        }
        let qs = require('qs');
        axios.post(url_ + '/api/electricReport',
          qs.stringify({
            dbid: data.dbid,
            electricNo: data.electricNo,
            declarationType: data.declarationType,
            tradingType: data.tradingType,
            decomposition: data.decomposition,
            validDateBeg: data.validDateBeg,
            validDateEnd: data.validDateEnd,
            yearMonth: data.yearMonth,
            shrinkage: data.shrinkage,
            bilateral: data.bilateral,
            bidding: data.bidding,
            declarationTime: that_.formatDate(new Date()),
            updateTime: that_.formatDate(new Date()),
            createTime: that_.formValidate.createTime,
            status: '1',
            withCredentials: true
          })
        ).then(function (res) {
          that_.$Message.success('申报成功！');
          that_.search();
        }).catch(function (error) {
          console.log(error);
          that_.$Message.error(error);
        });
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
        let minutes = date.getMinutes();
        if(minutes<10){
          minutes='0'+minutes;
        }
        let seconds = date.getSeconds();
        if(seconds<10){
          seconds='0'+seconds;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
          + " " + date.getHours() + seperator2 + minutes
          + seperator2 + seconds;
        return currentdate;
      },
    },
    computed: {
      tableColumns() {
        let cols = [];
        cols.push({
          title: '客户名称',
          align: 'center',
          key: 'customerName',
          fixed:"left",
          width: 160
        },{
          title: '用电年月',
          align: 'center',
          width: 90,
          render: (h, params) => {
            return params.row.yearMonth
          }
        },{
          title: '合同电量合计(MWH)',
          align: 'center',
          key: 'total',
          width: 120
        },{
          title: '分解电量(MWH)',
          align: 'center',
          key: 'decomposition',
          width: 90
        },{
          title: '缩减量(MWH)',
          align: 'center',
          key: 'shrinkage',
          width: 80
        },{
          title: '月度双边意向电量(MWH)',
          align: 'center',
          key: 'bilateral',
          width: 120
        },{
          title: '集中竞价意向电量(MWH)',
          align: 'center',
          key: 'bidding',
          width: 140
        },
          {
            title: '申报有效开始日期',
            align: 'center',
            width: 100,
            key:'validDateBeg'
          },
          {
            title: '申报有效结束日期',
            align: 'center',
            width: 100,
            key:'validDateEnd'
          },{
          title: '申报日期',
          align: 'center',
          width: 100,
          key:'declarationTime',
          render: (h, params) => {
            if(params.row.declarationTime!=null&&params.row.declarationTime!=""){
              return params.row.declarationTime.substr(0,10);
            }else{
              return params.row.declarationTime;
            }
          }
        },{
          title: '状态',
          align: 'center',
          width: 80,
          render: (h, params) => {
            if (params.row.status == '1') {
              return "已申报"
            }
            return "已保存"
          }
        },{
          title: '操作',
          key: 'action',
          align: 'center',
          width: 130,
//          fixed: 'right',
          render: (h, params) => {
            let flag = false;
            if(params.row.status=="1"){
              flag=true;
            }
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  disabled:flag,
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.edit(params.row)
                  }
                }
              }, '编辑'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  disabled:flag,
                },
                on: {
                  click: () => {
                    let decomposition = params.row.decomposition;//分解电量
                    let shrinkage = params.row.shrinkage;//缩减量
                    let bilateral = params.row.bilateral;//双边意向
                    let bidding = params.row.bidding;//竞价
                    if(shrinkage!=0&&shrinkage!=null&&((bilateral!=0&&bilateral!=null)||(bidding!=0&&bidding!=null))){
                      this.$Message.error('不能同时填写缩减量和月度增量！');
                      return;
                    }
                    decomposition = decomposition==null||decomposition==""?0:decomposition;
                    shrinkage = shrinkage==null||shrinkage==""?0:shrinkage;
                    if(decomposition<shrinkage){//分解量不能小于缩量
                      this.$Message.error('分解电量不能小于缩减量！');
                      return;
                    }
                    let that_ = this;
                    this.$Modal.confirm({
                      title: '提示',
                      content: '<p>请确认是否申报本条信息？</p>',
                      onOk: () => {
                        that_.report2(params.row)
                      },
                      onCancel: () => {
                        this.$Message.info('您选择了取消!');
                      }
                    });
                  }
                }
              }, '申报')
            ]);
          }
        });
        return cols;
      }
    },
    created(){
      let that_ = this;
      axios({
        method: 'get',
        url: url_ + '/api/electricReport/getRemotePeriod',
        withCredentials: true
      })
        .then(function (res) {
          console.log(res.data.data)
          if(res.data.msg=="success"){
            that_.search();
          }else{
            that_.$Message.error("获取申报有效期失败！");
          }
        }).catch(function (error) {
        console.log(error);
        that_.$Message.error(error);
      });
    }

  }
</script>
