<template>
  <div>
    <Form ref="formInline">
      <FormItem label="交易类型：">
        <Col span="3">
        <Select v-model="tradingType" style="width:100px">
          <Option v-for="item in tradingTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        </Col>
        <Col span="2" style="text-align: center">
        客户名称：</Col>
        <Col span="4">
        <Select v-model="electricNo" style="width:150px">
          <Option v-for="item in companyList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        </Col>
        <Col span="2" style="text-align: center">用电年月</Col>
        <Col span="3">
        <DatePicker type="month" v-model="dateBeg" placeholder="选择年月" style="width: 130px"></DatePicker>
        </Col>
        <Col span="1" style="text-align: center;width:40px;">至</Col>
        <Col span="3">
          <DatePicker type="month" v-model="dateEnd" placeholder="选择年月" style="width: 130px"></DatePicker>
        </Col>
        <div style="float:right;">
          <Button type="primary" @click="search()">查询</Button>
          <Button type="primary" style="margin-left:5px;" @click="exportData()"><Icon type="ios-download-outline" style="margin-right:5px;"></Icon>导出数据</Button>
        </div>
        </Row>
      </FormItem>
    </Form>
    <Table border ref="table" :columns="tableColumns" :data="tableData"></Table>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="totalSize" :current="pageCurrent" :page-size="10" @on-change="changePage"  show-total></Page>
      </div>
    </div>
  </div>
</template>
<script>
  import axios from 'axios'

  export default {
    data() {
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth()+2;
      if(month>12){
        month=month-12;
        year++;
      }
      let date_ = year+'-'+month;
      return {
        electricNo:'',
        dateBeg:date_,
        dateEnd:date_,
        tradingType:'',
        tradingTypeList:[
          {
            value: '',
            label: '全部'
          },
          {
            value: 'Z1',
            label: '跨省'
          },
          {
            value: 'Z2',
            label: '省内'
          },
        ],
        companyList: [],
        tableData: [],//加载数据
        tableData_total: [],//加载数据
        totalSize:0,//分页中的总数
        pageSize:10,//每页显示的条数
        pageCurrent:1,//第几页
        rec_total:'',//合计
      }
    },

    mounted() {
      this.searchCompanyList();
      this.search();
    },
    methods: {
      //点击分页栏的页码
      changePage(val) {
        this.pageCurrent = val;
        this.showPage();
      },
      showPage(){
        let index = (this.pageCurrent-1)*this.pageSize;
        this.tableData=[];
        for(let i=index;i<index+this.pageSize;i++){
          if(i<this.totalSize){
            this.tableData.push(this.tableData_total[i]);
          }
        }
        this.tableData.push(this.rec_total)
      },
      search() {
        let datas = [];//第一页查询结果数据集
        let datas_total = [];//查询结果数据集
        let that_ = this;//重定义this
        if(Date.parse(that_.dateBeg)>Date.parse(that_.dateEnd)){
          that_.$Message.error("用电年月结束时间不能小于开始时间，请重新选择！");
          return;
        };
        let begM  = that_.dateBeg.getMonth()+1;
        let endM  = that_.dateEnd.getMonth()+1;
        let begD = that_.dateBeg.getFullYear()+""+(begM<10?"0"+begM:begM);
        let endD = that_.dateEnd.getFullYear()+""+(endM<10?"0"+endM:endM);
        axios({
          method: 'get',
          url: url_ + '/api/electricReport/search',
          params:{
            tradingType:that_.tradingType,
            electricNo:that_.electricNo,
            dateBeg:begD,
            dateEnd:endD
          },
          withCredentials: true
        }).then(function (res) {
          that_.pageCurrent=1;
          that_.totalSize = res.data.data.EV_SHENB.length;
          let total_hj=0,total_zyearm=0,total_zyearmc=0,total_zmonthsm=0,total_zmonthjm=0;
          for (let i = 0; i < res.data.data.EV_SHENB.length; i++) {
            let rec = res.data.data.EV_SHENB[i];
            let total_ = 0;
            let zyearm = rec.zyearm == '' || rec.zyearm == null ? 0 : rec.zyearm;//分解量
            let zyearmc = rec.zyearmc == '' || rec.zyearmc == null ? 0 : rec.zyearmc;//缩减量
            let zmonthsm = rec.zmonthsm == '' || rec.zmonthsm == null ? 0 : rec.zmonthsm;//双边意向
            let zmonthjm = rec.zmonthjm == '' || rec.zmonthjm == null ? 0 : rec.zmonthjm;//竞价意向电量
            total_ = Number(Number(zyearm) - Number(zyearmc) + Number(zmonthsm) + Number(zmonthjm)).toFixed(3);
            rec.total = total_;
            total_zyearm=Number(Number(total_zyearm)+Number(zyearm)).toFixed(3);
            total_zyearmc=Number(Number(total_zyearmc)+Number(zyearmc)).toFixed(3);
            total_zmonthsm=Number(Number(total_zmonthsm)+Number(zmonthsm)).toFixed(3);
            total_zmonthjm=Number(Number(total_zmonthjm)+Number(zmonthjm)).toFixed(3);
            total_hj=Number(Number(total_hj)+Number(total_)).toFixed(3);
            if(rec.zzfld00000h=='Z1'){
              rec.zzfld00000h = "跨省";
            }else if(rec.zzfld00000h=='Z2'){
              rec.zzfld00000h = "省内";
            }else{
              rec.zzfld00000h="";
            }
            if (res.data.data.EV_SHENB[i].zbp_name != null) {
              rec.zbp_name = res.data.data.EV_SHENB[i].zbp_name;
            } else {
              rec.zbp_name = "";
            }
            datas_total.push(rec);
            if(i<that_.pageSize){
              datas.push(rec)
            }
          }
          that_.rec_total = {"zbp_name":"合计","zyearm":total_zyearm,"zyearmc":total_zyearmc,"zmonthsm":total_zmonthsm,"zmonthjm":total_zmonthjm,"total":total_hj};
          datas.push(that_.rec_total)
        }).catch(function (error) {
          console.log(error);
          that_.$Message.error(error);
        });

        that_.tableData = datas;
        that_.tableData_total = datas_total;
      },
      exportData () {
        let data = this.tableData_total;
        data.push(this.rec_total);
        this.$refs.table.exportCsv({
          filename: '电量申报查询',
          columns: this.tableColumns,
          data:data

        });
      },
      searchCompanyList() {
        let that_ = this;//重定义this
        let datas = [];
        axios({
          method: 'get',
          url: url_ + '/api/customer/user',
          withCredentials: true
        }).then(function (res) {
          datas.push({value:'',label:'全部'});
          for (let i = 0; i < res.data.data.length; i++) {
            let rec = res.data.data[i];
            datas.push({value: rec.electricNo, label: rec.customerName});
          }
        }).catch(function (error) {
          console.log(error);
          that_.$Message.error(error);
        });
        that_.companyList = datas;
      },
      formatDate(date,type) {
        let seperator1 = "-";
        let month = date.getMonth() + 1;
        if (month <= 9) {
          month = "0" + month;
        }
        date.get
        let currentdate = date.getFullYear() + seperator1 + month + seperator1;
        if(type=="beg"){
          currentdate+="01 00:00:00";
        }else{
          if(month==1||month==3||month==5||month==7||month==8||month==10||month==12){
            currentdate+="31 23:59:59";
          }else if(month==2){
            if(date.getFullYear()%4==0){
              currentdate+="29 23:59:59";
            }else{
              currentdate+="28 23:59:59";
            }
          }else{
            currentdate+="30 23:59:59";
          }

        }
        return currentdate;
      },
    },
    computed: {
      tableColumns() {
        let cols = [];
        cols.push({
          title: '客户名称',
          align: 'left',
          key: 'zbp_name',
          fixed:'left',
          width: 160
        });
        cols.push({
          title: '用电年月',
          align: 'center',
          key:'zdate',
          width: 90
        });
        cols.push({
          title: '交易类型',
          align: 'center',
          key:'zzfld00000h',
          width: 90
        });
        cols.push({
          title: '合同电量合计(MWH)',
          align: 'center',
          key: 'total',
          width: 120
        });
        cols.push({
          title: '分解电量(MWH)',
          align: 'center',
          key: 'zyearm',
          width: 130
        });
        cols.push({
          title: '缩减量(MWH)',
          align: 'center',
          key: 'zyearmc',
          width: 120
        });
        cols.push({
          title: '双边意向电量(MWH)',
          align: 'center',
          key: 'zmonthsm',
          width: 120
        });
        cols.push({
          title: '集中竞价意向电量(MWH)',
          align: 'center',
          key: 'zmonthjm',
          width: 140
        });
        cols.push({
          title: '月度申报日期',
          align: 'center',
          width: 120,
          key:'zdates'
        });

        return cols;
      }
    },

  }
</script>
