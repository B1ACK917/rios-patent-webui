<template>
  <div>
    <div class="search-box">
      <input
        type="text"
        v-model="query"
        placeholder="Input Patent Number..."
        @keyup.enter="getRecommendation"/>
      <button @click="getRecommendation">Recommend</button>
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
  name: 'GeneralBox',
  data() {
    return {
      query: '',
    }
  },
  methods: {
    async getRecommendation() {
      this.$emit('setLoading', true)
      //let queryID = utils_func.GenNonDuplicateID(24)
      //await axios.get(r_const.queryPostRecommend, {
      //  params: {
      //    queryID,
      //    patentID: this.query,
      //    sequence: 'all',
      //  },
      //})
      let recommended_patents = null
      //for (let i = 0; i < 65536; i++) {
      //  const response = await axios.get(r_const.queryGetRecommend, {
      //    params: {
      //      queryID,
      //    },
      //  })
      //  if (response.data.status) {
      //    recommended_patents = response.data.data.recommended_patents
      //    break
      //  }
      //  await sleep(r_const.queryTaskStatusGap)
      //}
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
