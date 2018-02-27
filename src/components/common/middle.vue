<style scoped>

  .layout {
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
  }

  .layout-breadcrumb {
    padding: 10px 15px 0;
  }

  .layout-content {
    min-height: 700px;
    margin: 15px;
    overflow: hidden;
    background: #fff;
    border-radius: 4px;
  }

  .layout-content-main {
    padding: 5px 10px;
  }

  .layout-copy {
    text-align: center;
    padding: 10px 0 20px;
    color: #9ea7b4;
  }

  .layout-menu-left {
    background: #f5f7f9;

    min-width: 100px;
  }
  .layout-menu-left-left{
    position: relative;
  }

  .layout-header {
    height: 60px;
    background: #fff;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .1);
  }

  .layout-logo-left {
    width: 100%;
    height: 45px;
    background: #f5f7f9;
    border-radius: 3px;
    margin: 0 auto 15px;
    line-height: 45px;
    color: black;
    text-align: center;
    vertical-align: middle;
    overflow: hidden;
  }

  .layout-ceiling-main a {
    color: #9ba7b5;
  }

  .layout-hide-text .layout-text {
    display: none;
  }

  .ivu-col {
    transition: width .2s ease-in-out;
  }

</style>

<template>

  <div class="layout" :class="{'layout-hide-text': spanLeft < 4}">
    <Row type="flex">
      <i-col :span="spanLeft" class="layout-menu-left">
        <Menu active-name="setActive" width="auto" @on-select="routeTo">
          <div class="layout-logo-left">
            <h3>功能菜单</h3></div>

          <div v-for="item in $router.options.routes" v-if="!item.hidden">
              <Submenu :name="item.path">
                <template slot="title">
                  <Icon type="ios-keypad"></Icon>
                  {{item.name}}
                </template>
                <template v-for="child in item.children" v-if="item.children&&!child.hidden">
                  <MenuItem :name="child.path">{{child.name}}</MenuItem>

                </template>
              </Submenu>

          </div>
        </Menu>
      </i-col>
      <i-col :span="spanRight">
        <div class="layout-breadcrumb">
          <Breadcrumb>
            <Breadcrumb-item>功能菜单</Breadcrumb-item>
            <Breadcrumb-item>{{this.$route.name}}</Breadcrumb-item>
          </Breadcrumb>
        </div>
        <div class="layout-content">
          <div class="layout-content-main">
            <transition mode="out-in">
              <router-view></router-view>
            </transition>
          </div>
        </div>

      </i-col>
    </Row>
  </div>

</template>

<script>
  import axios from 'axios'
  export default {

    data() {
      return {
        spanLeft: 4,
        spanRight: 20
      }
    },
    computed: {
      setActive() {
        console.log("===="+this.$route.path)
        return this.$route.path.replace('/','');
      }
    },
    methods: {
      routeTo(e) {
        this.$router.push(e);
      }
    },
    created() {
      let _this = this;
      let userType = sessionStorage.getItem('userType');
      if(userType=="1"){
        _this.menuData = JSON.parse(sessionStorage.getItem("menu"));
        _this.$router.options.routes.forEach(function (item) {
          let menu_customer = _this.menuData[0].menu_customer;
          for(let i=0;i<menu_customer.length;i++){
            let menu = menu_customer[i];
            if(item.name){
              if (item.name == menu.name) {
                item.hidden = false;
                if (item.children) {
                  item.children.forEach(function (itemChild) {
                    itemChild.hidden = true;
                    if (menu.children) {
                      for(let j=0;j<menu.children.length;j++){
                        let menuChild = menu.children[j];
                        if (itemChild.name == menuChild.name) {
                          itemChild.hidden = false;
                          break;
                        }
                      }
                    }
                  })
                }
                break;
              }else{
                item.hidden = true;
              }
            }else{
              item.hidden = true;
            }
          }
        });
      }else{
        _this.$router.options.routes.forEach(function (item) {
          if(item.name==''||item.name==null){
            item.hidden=true;
          }
        });
        console.log(_this.$router.options.routes)
      }
    }
  }

</script>
