<template>
  <div>
    <Form ref="formInline">
      <FormItem label="公司名称：">
        <Col span="5">
        <Select v-model="customerId" >
          <Option v-for="item in companyList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        </Col>
        <Col span="2" style="text-align: center;">合同类型：</Col>
        <Col span="3">
          <Select v-model="contractType" >
            <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </Col>
        <Col span="2" style="text-align: center">合同状态：</Col>
        <Col span="2">
          <Select v-model="contractStatus">
            <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </Col>
        <div style="float:right;">
          <Button type="primary" @click="search()">查询</Button>
          <Button type="primary" @click="add()">新增</Button>
        </div>
      </FormItem>
    </Form>

    <Table border ref="selection" :columns="tableColumns" :data="tableData" stripe ></Table>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="totalSize" :current="pageCurrent" @on-change="changePage" @on-page-size-change="pageSizeChange" show-sizer show-total></Page>
      </div>
    </div>

    <Modal width="1000"
           v-model="modal"
           ok-text="确定"
           cancel-text="取消"
           @on-ok="save"
           title="合同信息编辑页面">
      <Form ref="formValidate" :model="formValidate" :label-width="80">
        <div id="vhtml" v-html="formValidate.text" @click="clickEdit();">
          {{formValidate.text}}
        </div>
      </Form>
    </Modal>
  </div>
</template>
<script>
  import axios from 'axios'
  export default {
    data() {
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
        totalSize:0,//分页中的总数
        pageSize:10,//每页显示的条数
        pageCurrent:1,//第几页
        companyList: [],
        customerId: '',
        contractType: '',
        contractStatus: '',
        typeList: [
          {value: '1', label: '年度双边合同'},
          {value: '2', label: '月度双边合同'},
          {value: '3', label: '月度集中竞价合同'}
        ],
        statusList: [
          {value: '1', label: '保存'},
          {value: '2', label: '提交'}
        ],
        tableData: [],//加载数据
        modal: false,
        showType: 'view',
        isClick: false,
        formValidate: {
          dbid: '',
          customerId: '',
          customerName: '',
          contractType: '',
          contractStatus: '',
          text: '',
          createTime: '',
          createBy: '',
          updateTime: '',
          updateBy: '',
          showType: ''
        }
      }
    },
    mounted() {
      this.searchCompanyList();
      this.search();
    },
    methods: {
      searchCompanyList() {
        let that_ = this;//重定义this
        let datas = [];
        axios({
          method: 'get',
          url: url_ + '/api/customer/user',
          withCredentials: true
        }).then(function (res) {
          for (let i = 0; i < res.data.data.length; i++) {
            let rec = res.data.data[i];
            datas.push({value: rec.dbid, label: rec.customerName});
          }
        }).catch(function (error) {
          console.log(error);
          that_.$Message.error(error);
        });
        that_.companyList = datas;
      },
      //点击分页栏的页码
      changePage (val) {
        this.pageCurrent = val;
        this.search();
      },
      //点击分页栏的每页数量执行此方法
      pageSizeChange(val){
        this.pageSize = val;
        this.search();
      },
      search() {
        let datas = [];//查询结果数据集
        let that_ = this;//重定义this
        let pageCurrent = that_.pageCurrent;
        let pageSize = that_.pageSize;
        let startRow = (pageCurrent -1) * pageSize;
        var totalCount = 0;
        axios.get(url_ + '/api/contract/list',{
          params:{
            customerId: that_.customerId,
            contractType: that_.contractType,
            contractStatus: that_.contractStatus,
            startRow: startRow,
            pageSize: pageSize
          },
          withCredentials: true
        }).then(function (res) {
          for (let i = 0; i < res.data.data.length; i++) {
            let rec = res.data.data[i];
            rec.contract.customerName = rec.customer.customerName;
            datas.push(rec.contract)
          }
          totalCount = res.data.totalCount;
          that_.totalSize = totalCount;
        }).catch(function (error) {
          console.log(error);
          that_.$Message.error(error);
        });

        that_.tableData = datas;
      },
      add(){
        let that_ = this;//重定义this
        let customerId = that_.customerId;
        if(customerId == null || customerId == ""){
          that_.$Message.error("请先选择公司！");
          return;
        }
        let contractType= that_.contractType;
        if(contractType == null || contractType == ""){
          that_.$Message.error("请先选择合同类型！");
          return;
        }
        axios({
          method: 'get',
          url: url_ + '/api/contractmodel/'+ contractType,
          withCredentials: true
        }).then(function (res) {
            if(!res.data.data) {
              that_.$Message.error("系统未配置该类型的合同模板！");
              return;
            }
          that_.isClick = false;
          that_.modal = true;
          that_.formValidate.dbid = '';
          that_.formValidate.customerId = customerId;
          that_.formValidate.customerName = '';
          that_.formValidate.contractType = contractType;
          that_.formValidate.contractStatus = '1';
          that_.formValidate.text = res.data.data.text;
          that_.formValidate.createTime = that_.formatDate(new Date());
          that_.formValidate.createBy = '';
          that_.formValidate.updateTime = '';
          that_.formValidate.updateBy = '';
          that_.formValidate.showType = 'add';
        }).catch(function (error) {
          console.log(error);
          that_.$Message.error(error);
        });
      },
      edit(data, type) {
        this.isClick = type == 'view';
        this.modal = true;
        this.formValidate.dbid = data.dbid;
        this.formValidate.customerId = data.customerId;
        this.formValidate.customerName = data.customerName;
        this.formValidate.contractType = data.contractType;
        this.formValidate.contractStatus = data.contractStatus;
        this.formValidate.text = type == 'view' ? data.text.replace(/contenteditable="true"/g, '') : data.text;
        this.formValidate.createTime = data.createTime;
        this.formValidate.createBy = data.createBy;
        this.formValidate.updateTime = data.updateTime;
        this.formValidate.updateBy = data.updateBy;
        this.formValidate.updateBy = type;
      },
      save() {
        let that_ = this;
        if(that_.formValidate.updateBy == 'view') {
            return;
        }
        let qs = require('qs');
        axios.post(url_ + '/api/contract',
          qs.stringify({
            dbid: that_.formValidate.dbid,
            customerId: that_.formValidate.customerId,
            customerName: that_.formValidate.customerName,
            contractType: that_.formValidate.contractType,
            contractStatus: that_.formValidate.contractStatus,
            text: document.getElementById('vhtml').innerHTML,
            createTime: that_.formValidate.createTime,
            createBy: that_.formValidate.createBy,
            updateTime: that_.formatDate(new Date()),
            updateBy: userId,
            withCredentials: true
          })
        ).then(function (res) {
          that_.modal = false;
          that_.$Message.success('保存成功！');
          that_.search();
        }).catch(function (error) {
          console.log(error);
          that_.$Message.error(error);
        });
      },
      submitd(data){
        let that_ = this;
        let qs = require('qs');
        axios.post(url_ + '/api/contract',
          qs.stringify({
            dbid: data.dbid,
            customerId: data.customerId,
            customerName: data.customerName,
            contractType: data.contractType,
            contractStatus: '2',
            text: data.text,
            createTime: data.createTime,
            createBy: data.createBy,
            updateTime: that_.formatDate(new Date()),
            updateBy: userId,
            withCredentials: true
          })
        ).then(function (res) {
          that_.modal = false;
          that_.$Message.success('保存成功！');
          that_.search();
        }).catch(function (error) {
          console.log(error);
          that_.$Message.error(error);
        });
      },
      del(dbid) {
        let that_ = this;
        let qs = require('qs');
        axios.delete(url_ + '/api/contract/' + dbid,
          qs.stringify({
            withCredentials: true
          })
        ).then(function (res) {
          that_.$Message.success('删除成功！');
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
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
          + " " + date.getHours() + seperator2 + date.getMinutes()
          + seperator2 + date.getSeconds();
        return currentdate;
      },
      clickEdit() {
        if(this.isClick == true) {
            return;
        }
        this.isClick = true;
        var itms = document.getElementsByTagName("span");
        for(var i = itms.length - 1; i >= 0; i--) {
          if(itms[i].getAttribute('width')) {
            itms[i].contentEditable = true;
            itms[i].onblur = function() {
              var num = this.getAttribute('width');
              var text = this.innerText.trim();
              if(text == '') {
                for(var j = 0; j < num; j++) {
                  text += '&nbsp;';
                }
              }
              this.innerHTML = text;
            };
            itms[i].onkeyup = function(event) {
              if(event.keyCode == 13) {
                this.blur();
              }
            };
            itms[i].focus();
            itms[i].blur();
          }
        }
      }
    },
    computed: {
      tableColumns() {
        let cols = [];
        cols.push({
          type: 'index',
          width: 60,
          align: 'center'
        });
        cols.push({
          title: '公司名称',
          align: 'left',
          key: 'customerName',
        });
        cols.push({
          title: '创建时间',
          align:'center',
          key: 'createTime',
          width: 180
        });
        cols.push({
          title: '合同类型',
          align:'center',
          key: 'contractType',
          width: 180,
          render: (h, params) => {
            let type = params.row.contractType;
            return type == '1' ? '年度双边合同' : type == '2' ? '月度双边合同' : '月度集中竞价合同';
          }
        });
        cols.push({
          title: '合同状态',
          align: 'center',
          key: 'contractStatus',
          width: 150,
          render: (h, params) => {
            let stat = params.row.contractStatus;
            return stat == '1' ? '保存' : '提交';
          }
        });
        cols.push({
          title: '操作',
          key: 'action',
          align: 'left',
          width: 220,
          render: (h, params) => {
            let stat = params.row.contractStatus;
            let buttons = [];
            buttons.push(h('Button', {props: {type: 'primary', size: 'small'}, style: {marginRight: '5px'}, on: {click: () => {this.edit(params.row, 'view')}}}, '预览'));
            if(stat == '1') {
              buttons.push(h('Button', {props: {type: 'primary', size: 'small'}, style: {marginRight: '5px'}, on: {click: () => {this.edit(params.row, 'edit')}}}, '编辑'));
              buttons.push(h('Button', {props: {type: 'primary', size: 'small'}, style: {marginRight: '5px'}, on: {click: () => {this.submitd(params.row, 'edit')}}}, '提交'));
              buttons.push(h('Button', {props: {type: 'primary', size: 'small'}, style: {marginRight: '5px'}, on: {click: () => {this.del(params.row.dbid)}}}, '删除'));
            }
            return h('div', buttons);
          }
        });
        return cols;
      }
    }
  }
</script>
<style type="text/css">
  #vhtml {font-family:仿宋_GB2312; font-size:16pt;}
  #vhtml p {line-height:30pt; margin:0pt;text-indent: 33pt;text-align:justify;}
  #vhtml table {border-collapse:collapse; margin-left:0; width: 100%}
  #vhtml tr {height:30pt;}
  #vhtml td {border: 0.75pt solid; vertical-align:middle; text-align: center; font-size:14pt}
  #vhtml .underline {text-decoration:underline;}
</style>

