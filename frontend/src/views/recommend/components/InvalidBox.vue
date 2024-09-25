<template>
  <div>
    <div class="search-box">
      <input
        type="text"
        v-model="query"
        placeholder="请输入专利号。。。"
        @keyup.enter="getRecommendation"/>
      <el-button :loading="loading" @click="getRecommendation">推荐</el-button>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import axios from 'axios'
import * as r_const from '@/router/consts'
import * as utils_func from '@/utils/func'
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

export default {
  name: 'InvalidBox',
  data() {
    return {
      query: '',
      loading: false,
    }
  },
  methods: {
    async getRecommendation() {
      this.$emit('setLoading', true)
      this.loading=true;
      const response = await axios.get(
          r_const.queryRecommendInv, 
          { params: { patentID: this.query } },
        { withCredentials: true }
      )
      let recommended_patents = []
      //for (let i = 0; i<response.data.lenght; ++i) {
      //  
      //}
      recommended_patents = response.data;
      this.loading=false;
      this.$emit('setLoading', false)
      this.$emit('showRecommendation', recommended_patents, this.query)
    },
  },
}
</script>

<style scoped>
.search-box {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 500px;
  height: 50px;
  border: 2px solid #0078d7;
  border-radius: 5px;
  padding: 5px;
  margin-top: 20px;
}

input[type='text'] {
  width: 80%;
  height: 100%;
  padding: 5px;
  border: none;
  border-radius: 5px;
}

button {
  width: 20%;
  height: 100%;
  border: none;
  border-radius: 5px;
  background-color: #0078d7;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

input[type='text']:focus {
  outline: none !important;
}

button:hover {
  background-color: #00539b;
}

button:active {
  background-color: #004b8c;
}

button[disabled] {
  background-color: #dcdcdc;
  color: #a0a0a0;
  cursor: default;
}
</style>
