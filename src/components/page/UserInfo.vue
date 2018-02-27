<template>
  <div>
    <h3 style="color:cornflowerblue;margin:15px;">欢迎您！</h3>
    <Form :model="formItem" :label-width="80">
      <FormItem label="手机号：">
        <Row>
          <Col span="5">{{formItem.mobile}}
          </Col>
          <Col span="2" style="text-align: center">关联编号：</Col>
          <Col span="5">{{formItem.electircNos}}
          </Col>
        </Row>
      </FormItem>
      <FormItem label="注册时间：">
        <Row>
          <Col span="5">{{formItem.registrationTime}}
          </Col>
        </Row>
      </FormItem>
    </Form>
    <div id="workList">待办事项</div>
    <Collapse v-model="value1">
      <Panel name="1">
        电量申报(0条)
        <div slot="content">
        <Table border :columns="tableColumns" :data="tableData"></Table>
        </div>
      </Panel>
      <Panel name="2">
        电子合同(0条)
        <div slot="content">
          <Table border :columns="tableColumns2" :data="tableData" stripe ></Table>

        </div>
      </Panel>
    </Collapse>
  </div>

</template>
<style>
  #workList{
    height: 38px;
    line-height: 38px;
    background: #f7f7f7;
    padding-left: 15px;
    border-radius: 3px;
    color:#666;
  }
  .ivu-collapse{
    background:none;
    border:none;
  }
  .ivu-collapse-content>.ivu-collapse-content-box{
    padding-top:0;
  }
  .ivu-collapse>.ivu-collapse-item {
    border-top: none;
  }
</style>
<script>
  import axios from 'axios'

  export default {
    data () {
      return {
        value1: ['1','2'],
        tableData: [],//加载数据
        formItem: {
          mobile: '15969862636',
          electircNos: '1234567890',
          registrationTime: '2017-12-12 12:12:12'
        }
      }
    },
    mounted() {
      this.search();
    },
    methods: {
      search(){
        let that = this;
        axios({
          method: 'get',
          url: url_ + '/getCurrentUser',
          withCredentials: true
        }).then(function (res) {
          console.log(res)
          let user = res.data.data;
          that.formItem.mobile = user.mobile;
          that.formItem.registrationTime = user.registrationTime;
          let electircNos = "";
          for(let i=0;i<user.customers.length;i++){
            if(i==0){
              electircNos=user.customers[i].electricNo;
            }else{
              electircNos=electircNos+","+user.customers[i].electricNo;
            }
          }
          that.formItem.electircNos = electircNos;

        }).catch(function (error) {
          console.log(error);
        });
      }
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
            return params.row.year + "-" + params.row.month
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
          title: '双边意向电量(MWH)',
          align: 'center',
          key: 'bilateral',
          width: 120
        },{
          title: '集中竞价意向电量(MWH)',
          align: 'center',
          key: 'bidding',
          width: 140
        },{
          title: '申报日期',
          align: 'center',
          width: 100,
          key:'createTime',
          render: (h, params) => {
            if(params.row.createTime!=null&&params.row.createTime!=""){
              return params.row.createTime.substr(0,10);
            }else{
              return params.row.createTime;
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
              }, '编辑'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.report2(params.row)
                  }
                }
              }, '申报')
            ]);
          }
        });
        return cols;
      },
      tableColumns2() {
        let cols = [];
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
        return cols;
      }
    },
  }
</script>
