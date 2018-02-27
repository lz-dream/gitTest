import * as types from './types'
export default {
  state:{
    yrcsdata:[]
  },
  mutations: {
    [types.YrcsData] (state,Param) {
      state.yrcsdata=Param     
    }
  },
  actions: {
    YrcsData({ commit },Param ) {
      commit(types.YrcsData,Param);
      
    }
    
  }
}