<template>
  <div>
    <div class="modal">
      <p>Please define your terms here</p>
      <div id="wrapper" v-for="(input, k) in terms" :key="k">
        <div class='value'>
          <input type="text" class="form-control" v-model="input.Value" />
        </div>
        <div class='key'>
          <select v-model="input.Key">
            <option disabled value=""> Please select one </option>
            <option> Keywords </option>
            <option> CPC </option>
            <option> Inventor </option>
            <option> Assignee </option>
          </select>
        </div>
      </div>

      <button class="terms_btn" @click="addTerms">Add Term</button>
    </div>
    <button class="rbutton" @click="getRecommendation">Recommend</button>
  </div>
</template>

<script>
/* eslint-disable */
import axios from 'axios'
import * as r_const from '@/router/consts'
import * as utils_func from '@/utils/func'
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

export default {
  name: 'IDBox',
  data() {
    return {
      query: '',
      terms: [
        {
          Value: '',
          Key: ''
        },
      ],

    }
  },
  methods: {
    addTerms() {
      const newTerms={
        Value: '',
        Key: ''
      }
      this.terms.push(newTerms);
    },
    async getRecommendation() {
      this.$emit('setLoading', true)
      let querys = "";
      for (var i = 0; i < this.terms.length; ++i) {
        if (this.terms[i]['Key'] != "") {
          querys = querys + " (" + this.terms[i]['Key'] + ": " + this.terms[i]['Value'] + "); ";
        }
      }
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
      this.$emit('showRecommendation', recommended_patents, querys)
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
  width: 100%;
  height: 100%;
  padding: 5px;
  border-radius: 5px;
  margin-right: 5px;
}

.terms_btn {
  width: 20%;
  height:30px;
  border: none;
  border-radius: 5px;
  background-color: #0078d7;
  color: white;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 8px;
}

.rbutton {
  width: 30%;
  height:40px;
  border: none;
  border-radius: 5px;
  background-color: #0078d7;
  color: white;
  font-weight: bold;
  cursor: pointer;
  margin-right: 20px;
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

.wrapper {
  width:100%;
}

.key {
  display: inline-block;
  height : 20px;
  width : 40%;
  padding-top: 7px;
  padding-bottom: 7px;
}

.value {
  display: inline-block;
  height : 20px;
  width : 50%;
  padding-top: 7px;
  padding-bottom: 7px;
}
.modal {
  width: 500px;
}

</style>
