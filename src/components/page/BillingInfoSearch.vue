<template>
  <div>
    <Form ref="formInline">
      <FormItem label="用电年月：">
        <Col span="3">
        <DatePicker type="month" v-model="dateBeg" placeholder="选择年月" style="width: 130px"></DatePicker>
        </Col>
        <Col span="1" style="text-align: center;width:40px;">至</Col>
        <Col span="3">
        <DatePicker type="month" v-model="dateEnd" placeholder="选择年月" style="width: 130px"></DatePicker>
        </Col>
        <div style="float:right;">
          <Button type="primary" @click="search()">查询</Button>
        </div>
        </Row>

      </FormItem>

    </Form>
    <div class="tableMsg">合同电量和成交价格信息（电量单位：MWh，价格：元/MWh）</div>
    <Table height="280" border :columns="tableColumns" :data="tableData"></Table>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="totalSize" :current="pageCurrent" :page-size="5" @on-change="changePage"   show-total></Page>
      </div>
    </div>
    <div class="tableMsg" style="margin-top:30px;">结算明细信息（电量单位：MWh，价格：元/MWh，金额：元）
      <Button type="primary" style="float:right;" @click="exportData()"><Icon type="ios-download-outline" style="margin-right:5px;"></Icon>导出数据</Button>
    </div>
    <Table border :columns="tableColumns2" :data="tableData2" ref="table"></Table>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="totalSize2" :current="pageCurrent2" :page-size="5" @on-change="changePage2"  show-total></Page>
      </div>
    </div>
  </div>
</template>
<style>
  .tableMsg{
    height: 38px;
    line-height: 38px;
    background: #f7f7f7;
    padding-left: 15px;
    border-radius: 3px;
    color: #333;
    font-weight: 600;
    margin-bottom: 10px;
  }
</style>
<script>
  import axios from 'axios'
  export default {
    data () {
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth()+2;
      if(month<10){
        month='0'+month;
      }
      if(month>12){
        month=month-12;
        year++;
      }
      let date_ = year+'-'+month;
      return {
        dateBeg:date_,
        dateEnd:date_,
        tableData: [],//加载数据
        tableData_total: [],//加载数据
        tableData2: [],//加载数据
        tableData2_total: [],//加载数据
        totalSize:0,//分页中的总数
        pageSize:5,//每页显示的条数
        pageCurrent:1,//第几页
        totalSize2:0,//分页中的总数
        pageSize2:5,//每页显示的条数
        pageCurrent2:1,//第几页
        rec_total:'',//合计
      }
    },
    mounted() {
      this.search();
    },
    methods: {
      //点击分页栏的页码
      changePage (val) {
        this.pageCurrent = val;
        this.showPage();
      },
      //点击分页栏的页码
      changePage2 (val) {
        this.pageCurrent2 = val;
        this.showPage2();
      },
      showPage(){
        let index = (this.pageCurrent-1)*this.pageSize;
        console.log(index)
        this.tableData=[];
        for(let i=index;i<index+this.pageSize;i++){
            if(i<this.totalSize){
              this.tableData.push(this.tableData_total[i]);
            }
        }
      },
      showPage2(){
        let index = (this.pageCurrent2-1)*this.pageSize2;
        this.tableData2=[];
        for(let i=index;i<index+this.pageSize2;i++){
          if(i<this.totalSize2){
            this.tableData2.push(this.tableData2_total[i]);
          }
        }
        this.tableData2.push(this.rec_total)
      },
      search(){//查询结算信息
        let datas = [];//查询结果数据集
        let datas_total = [];//查询结果数据集
        let datas2 = [];//查询结果数据集
        let datas2_total = [];//查询结果数据集
        let that_ = this;//重定义this
        let begMonth = that_.dateBeg.getMonth()+1;
        let endMonth = that_.dateEnd.getMonth()+1;
        if(that_.dateBeg.getFullYear()>that_.dateEnd.getFullYear()){
          that_.$Message.warning("用电年月开始时间不能大于结束时间！");
          return;
        }else if(that_.dateBeg.getFullYear()==that_.dateEnd.getFullYear()){
          if(begMonth>endMonth){
            that_.$Message.warning("用电年月开始时间不能大于结束时间！");
            return;
          }
        }
        let begDate = that_.dateBeg.getFullYear()+""+(begMonth<10?'0'+begMonth:begMonth);
        let endDate = that_.dateEnd.getFullYear()+""+(endMonth<10?'0'+endMonth:endMonth);

        axios({
          method: 'get',
          url: url_ + '/api/billingInfo',
          params:{
            dateBeg:begDate,
            dateEnd:endDate
          },
          withCredentials: true
        })
          .then(function (res) {
            that_.pageCurrent=1;
            that_.pageCurrent2=1;
            that_.totalSize = res.data.data.ev_shenb.length;
            that_.totalSize2 = res.data.data.ev_jsxx.length;
            for (let i = 0; i < res.data.data.ev_shenb.length; i++){
              let rec_ = res.data.data.ev_shenb[i];
              datas_total.push(rec_);
              if(i<that_.pageSize){
                datas.push(rec_)
              }
            }

            let total_zyht=0,total_zysj=0,total_zypr=0,total_zyxl=0,total_zmht=0,total_zmsj=0,total_zmxl=0,total_zkhdl=0,total_zkhfy=0;
            for (let i = 0; i < res.data.data.ev_jsxx.length; i++) {
              let rec = res.data.data.ev_jsxx[i];
              let zyht = rec.zyht == '' || rec.zyht == null ? 0 : rec.zyht;
              let zysj = rec.zysj == '' || rec.zysj == null ? 0 : rec.zysj;
              let zypr = rec.zypr == '' || rec.zypr == null ? 0 : rec.zypr;
              let zyxl = rec.zyxl == '' || rec.zyxl == null ? 0 : rec.zyxl;
              let zmht = rec.zmht == '' || rec.zmht == null ? 0 : rec.zmht;
              let zmsj = rec.zmsj == '' || rec.zmsj == null ? 0 : rec.zmsj;
              let zmxl = rec.zmxl == '' || rec.zmxl == null ? 0 : rec.zmxl;
              let zkhdl = rec.zkhdl == '' || rec.zkhdl == null ? 0 : rec.zkhdl;
              let zkhfy = rec.zkhfy == '' || rec.zkhfy == null ? 0 : rec.zkhfy;
              total_zyht=Number(Number(total_zyht)+Number(zyht)).toFixed(3);
              total_zysj=Number(Number(total_zysj)+Number(zysj)).toFixed(3);
              total_zypr=Number(Number(total_zypr)+Number(zypr)).toFixed(3);
              total_zyxl=Number(Number(total_zyxl)+Number(zyxl)).toFixed(3);
              total_zmht=Number(Number(total_zmht)+Number(zmht)).toFixed(3);
              total_zmsj=Number(Number(total_zmsj)+Number(zmsj)).toFixed(3);
              total_zmxl=Number(Number(total_zmxl)+Number(zmxl)).toFixed(3);
              total_zkhdl=Number(Number(total_zkhdl)+Number(zkhdl)).toFixed(3);
              total_zkhfy=Number(Number(total_zkhfy)+Number(zkhfy)).toFixed(3);
              datas2_total.push(rec);
              if(i<that_.pageSize2){
                datas2.push(rec)
              }
            }
            that_.rec_total = {"zbp_name":"合计","zyht":total_zyht,"zysj":total_zysj,"zypr":total_zypr,"zyxl":total_zyxl,"zmht":total_zmht,
              "zmsj":total_zmsj,"zmxl":total_zmxl,"zkhdl":total_zkhdl,"zkhfy":total_zkhfy};
            datas2.push(that_.rec_total)
          }).catch(function (error) {
          console.log(error);
          that_.$Message.error(error);
        });

        that_.tableData = datas;
        that_.tableData_total = datas_total;
        that_.tableData2 = datas2;
        that_.tableData2_total = datas2_total;
      },
      exportData () {
        let data = this.tableData2_total;
        data.push(this.rec_total);
        this.$refs.table.exportCsv({
          filename: '结算明细信息',
//            original:false,
          columns: this.tableColumns2,
          data: data

        });
      }
    },
    computed: {
      tableColumns() {
        let cols = [];
        cols.push({
          title: '用户名称',
          align: 'center',
          key: 'zbp_name',
          width: 160
        },{
          title: '用电年月',
          align: 'center',
          key:'zdate',
          width: 90/*,
          render: (h, params) => {
            return params.row.year + "-" + params.row.month
          }*/
        },{
          title: '年度分解合同电量',
          align: 'center',
          key: 'zyearm',
          width: 110
        },{
          title: '年度分解缩量',
          align: 'center',
          key: 'zyearmc',
          width: 110
        },{
          title: '年度双边价差/价格',
          align: 'center',
          key: 'zyearp',
          width: 120
        },{
          title: '月度双边合同电量',
          align: 'center',
          key: 'zmonthsm',
          width: 100
        },{
          title: '月度双边价格',
          align: 'center',
          width: 110,
          key:'zmonthp'
        },{
          title: '月度集中竞价合同电量',
          align: 'center',
          key:"zmonthjm",
          width: 100
        },{
          title: '月度集中竞价价格',
          key: 'zmonthjp',
          align: 'center',
          width: 100
        });
        return cols;
      },
      tableColumns2() {
        let cols = [];
        cols.push({
          title: '用户名称',
          align: 'center',
          key: 'zbp_name',
          fixed:'left',
          width: 160
        },{
          title: '用电年月',
          align: 'center',
          key:'zdate',
          width: 90/*,
          render: (h, params) => {
            return params.row.year + "-" + params.row.month
          }*/
        },{
          title: '年度分解合同电量(含缩量)',
          align: 'center',
          key: 'zyht',
          width: 120
        },{
          title: '年度实际用电量',
          align: 'center',
          key: 'zysj',
          width: 130
        },{
          title: '年度双边价差/价格',
          align: 'center',
          key: 'zypr',
          width: 120
        },{
          title: '年度享利',
          align: 'center',
          key: 'zyxl',
          width: 100
        },{
          title: '月合同量',
          align: 'center',
          width: 100,
          key:'zmht'
        },{
          title: '月实际用电量',
          align: 'center',
          key:'zmsj',
          width: 110
        },{
          title: '月度加权价',
          key: 'zmavp',
          align: 'center',
          width: 100
        },{
          title: '月度享利',
          key: 'zmxl',
          align: 'center',
          width: 100
        },{
          title: '考核电量',
          key: 'zkhdl',
          align: 'center',
          width: 100
        },{
          title: '考核价格',
          key: 'zkhpr',
          align: 'center',
          width: 100
        },{
          title: '考核费用',
          key: 'zkhfy',
          align: 'center',
          width: 100
        });
        return cols;
      }
    },
  }
</script>
