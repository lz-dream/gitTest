<template>
  <div>
    <Form ref="formInline">
      <FormItem label="客户名称：">
        <Col span="4">
        <Input v-model="customerName" placeholder="客户名称"></Input>
        </Col>
        <Col span="2" style="text-align: center">
        电压等级：</Col>
        <Col span="4">
        <Input v-model="voltage" placeholder="电压等级"></Input>
        </Col>
        <div style="float:right;">
          <Button type="primary" @click="search()">查询</Button>
          <Button type="primary" @click="add()">新增</Button>
        </div>
        </Row>

      </FormItem>

    </Form>
    <Table border ref="selection" :columns="tableColumns" :data="tableData"></Table>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="totalSize" :current="pageCurrent" @on-change="changePage" @on-page-size-change="pageSizeChange" show-sizer show-total></Page>
      </div>
    </div>
    <Modal width="600"
           v-model="modal"
           ok-text="确定"
           cancel-text="取消"
           title="客户信息编辑页面">
      <Form ref="formValidate" :model="formValidate" :label-width="80" :rules="ruleValidate">
        <FormItem label="用电编号：">
          <Row>
            <Col span="9">
            <FormItem prop="electricNo">
              <Input v-model="formValidate.electricNo" required></Input>
            </FormItem>
            </Col>
            <Col span="6" style="text-align: center">
            公司名称：</Col>
            <Col span="9">
            <FormItem prop="customerName">
              <Input v-model="formValidate.customerName" required></Input>
            </FormItem>
            </Col>
          </Row>
        </FormItem>

        <FormItem label="申报人：">
          <Row>
            <Col span="9">
            <FormItem prop="declarationBy">
              <Input v-model="formValidate.declarationBy" required></Input>
            </FormItem>
            </Col>
            <Col span="6" style="text-align: center">
            身份证号：</Col>
            <Col span="9">
            <FormItem prop="idNumber">
              <Input v-model="formValidate.idNumber"></Input>
            </FormItem>
            </Col>
          </Row>
        </FormItem>

        <FormItem label="手机号：">
          <Row>
            <Col span="9">
            <FormItem prop="mobile">
              <Input type="text" v-model="formValidate.mobile" required></Input>
            </FormItem>
            </Col>
            <Col span="6" style="text-align: center">
            电压等级：</Col>
            <Col span="9">
            <FormItem prop="voltage">
              <Input type="text" v-model="formValidate.voltage"></Input>
            </FormItem>
            </Col>
          </Row>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="cancel()">取消</Button>
        <Button type="primary" @click="save()">保存</Button>
      </div>
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
        customerName:'',
        voltage:'',
        tableData: [],//加载数据
        modal: false,
        formValidate: {
          dbid: '',
          electricNo: '',
          declarationBy: '',
          customerName: '',
          idNumber: '',
          mobile: '',
          voltage: '',
          fkUserid:'0',
          isSynchrony:'0'
        },
        ruleValidate: {
          electricNo: [
            {required: true, message: '不能为空！', trigger: 'blur'}
          ],
          customerName: [
            {required: true, message: '不能为空！', trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '不能为空！', trigger: 'blur'}
          ],
          declarationBy: [
            {required: true, message: '不能为空！', trigger: 'blur'},
          ]
        }
      }
    },

    mounted() {
      this.search();
    },
    methods: {
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
        let customerName= that_.customerName;
        if(customerName==null||customerName==""){
          customerName="''";
        }
        let voltage= that_.voltage;
        if(voltage==null||voltage==""){
          voltage="''";
        }
        let pageCurrent = that_.pageCurrent;
        let pageSize = that_.pageSize;
        let startRow = (pageCurrent -1) * pageSize;
        console.log(pageCurrent+"+==="+startRow+'==='+pageSize);
        axios({
          method: 'get',
          url: url_ + '/api/customer/'+customerName+'/'+voltage,
          params:{
            startRow: startRow,
            pageSize: pageSize
          },
          withCredentials: true
        })
          .then(function (res) {
            console.log(res);
            that_.totalSize = res.data.totalCount;
            for (let i = 0; i < res.data.data.length; i++) {

              let rec = res.data.data[i];
              rec.index=pageSize*(pageCurrent-1)+i+1;
              console.log(rec)
              datas.push(rec)
            }
          }).catch(function (error) {
          console.log(error);
          that_.$Message.error(error);
        });

        that_.tableData = datas;
      },
      add(){
        this.modal = true;
        this.formValidate.dbid = '';
        this.formValidate.electricNo = '';
        this.formValidate.declarationBy = '';
        this.formValidate.customerName = '';
        this.formValidate.idNumber = '';
        this.formValidate.mobile = '';
        this.formValidate.voltage = '';
        this.formValidate.fkUserid = 0;
        this.formValidate.isSynchrony = 0;
      },
      edit(data) {
        /*if (data.status == 1 || data.status == '1') {
          this.$Message.warning('不能编辑已申报的信息！');
          return;
        }*/
        this.modal = true;
        this.formValidate.dbid = data.dbid;
        this.formValidate.electricNo = data.electricNo;
        this.formValidate.declarationBy = data.declarationBy;
        this.formValidate.customerName = data.customerName;
        this.formValidate.idNumber = data.idNumber;
        this.formValidate.mobile = data.mobile;
        this.formValidate.voltage = data.voltage;
        this.formValidate.fkUserid = data.fkUserid;
        this.formValidate.isSynchrony = data.isSynchrony;
      },
      save() {
        this.$refs['formValidate'].validate((valid) => {
          if (valid) {
            let that_ = this;
            let qs = require('qs');
            axios.post(url_ + '/api/customer',
              qs.stringify({
                dbid: that_.formValidate.dbid,
                electricNo: that_.formValidate.electricNo,
                customerName: that_.formValidate.customerName,
                declarationBy: that_.formValidate.declarationBy,
                idNumber: that_.formValidate.idNumber,
                mobile: that_.formValidate.mobile,
                voltage: that_.formValidate.voltage,
                updateTime: that_.formatDate(new Date()),
                // updateBy: userId,
                auditStatus: '1',
                fkUserid:that_.formValidate.fkUserid,
                isSynchrony:that_.formValidate.isSynchrony,
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
          }
        })
      },
      cancel(){
        this.modal = false;
      },
      del(dbid) {
        let that_ = this;
        let qs = require('qs');
        axios.delete(url_ + '/api/customer/'+dbid,
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
    },
    computed: {
      tableColumns() {
        let cols = [];
         cols.push({
//           type: 'index',
           title:'',
           key:'index',
           width: 60,
           align: 'center'
         });
        cols.push({
          title: '用电编号',
          align: 'left',
          key: 'electricNo'
        });
        cols.push({
          title: '公司名称',
          align: 'left',
          key: 'customerName',
        });
        cols.push({
          title: '申报人',
          align:'center',
          key: 'declarationBy',
          width: 90
        });
        cols.push({
          title: '身份证号',
          align:'center',
          key: 'idNumber',
          width: 120
        });
        cols.push({
          title: '手机号',
          align: 'center',
          key: 'mobile',
          width: '120'
        });
        cols.push({
          title: '电压等级',
          align: 'center',
          key: 'voltage',
          width: '90'
        });
        cols.push({
          title: '状态',
          align: 'center',
          key: 'auditStatus',
          width: '90',
          render: (h, params) => {
            let auditStatus = params.row.auditStatus;
            if (auditStatus == '1') {
              return "待审核"
            }else if (auditStatus == '2') {
              return "审核通过"
            } else if (auditStatus == '3') {
              return "审核退回；4：解除绑定"
            }else if (auditStatus == '4') {
              return "解除绑定"
            }
          }
        });
        cols.push({
          title: '操作',
          key: 'action',
          align: 'center',
          width: 130,
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
                    this.del(params.row.dbid)
                  }
                }
              }, '删除')
            ]);
          }
        });
        return cols;
      }
    }

  }
</script>
