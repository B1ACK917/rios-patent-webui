<template>
  <div class="sql-gen-page">
    <el-form :inline="true" ref="form">
      <el-form-item>
        <el-select style="width:120px" v-model="model" placeholder="Model">
          <el-option
            v-for="item in modelOption"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="ElIconChatDotRound"
          @click="sqlGen"
          id="submitBtn">Gen SQL</el-button>
        <el-button
          type="primary"
          :icon="ElIconUpload"
          @click="sqlExec"
          id="submitBtn">Run SQL</el-button>
        <el-button type="success" @click="autoRunPhase1" id="submitBtn">Autorun</el-button>
      </el-form-item>
    </el-form>
    <div>
      <el-input
        class="userInput"
        type="textarea"
        placeholder="Input text"
        v-model="sqlgen"
        @keyup.enter.native="sqlGen">
      </el-input>
    </div>
    <div v-loading="sqlLoading">
      <textarea class="GenResponse" id="sqlGenResponse"></textarea>
    </div>
    <div v-loading="hiveLoading">
      <textarea class="GenResponse" id="hiveResponse" readonly></textarea>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import {
  ChatDotRound as ElIconChatDotRound,
  Upload as ElIconUpload,
} from '@element-plus/icons-vue'
import {shallowRef} from "vue";

import * as r_const from '@/router/consts'
import axios from 'axios'
import * as utils_func from '@/utils/func'

export default {
  components : {
    ElIconChatDotRound,
    ElIconUpload
  },
  data() {
    return {
      modelOption: [
        {
          value: 'llama2-13b-tuned',
          label: 'llama2-13b-tuned',
        },
        {
          value: 'llama-65b',
          label: 'llama-65b',
        },
        {
          value: 'llama2-70b',
          label: 'llama2-70b',
        },
      ],
      model: 'llama2-13b-tuned',
      sqlgen: '',
      sqlLoading: false,
      hiveLoading: false,
      llmQueryID: 0,
      hiveQueryID: 0,
      sqlGenFinished: false,
      ElIconChatDotRound: shallowRef(ElIconChatDotRound),
      ElIconUpload: shallowRef(ElIconUpload),
    }
  },
  name: 'SQLGenPage',
  methods: {
    async sqlGen() {
      this.llmQueryID = utils_func.GenNonDuplicateID(24)
      this.sqlLoading = true
      const response = await axios.get(r_const.queryPostLLMChat, {
        params: {
          queryID: this.llmQueryID,
          model: this.model,
          content: this.sqlgen,
        },
      })
      if (response.data.status) {
        this.$emit(
          'openNotification',
          'info',
          'Server Response',
          'SQL Generating'
        )
        this.querySQLGenStatus()
      } else {
        this.sqlLoading = false
        let sqlGenResponse = document.getElementById('sqlGenResponse')
        this.$emit('openNotification', 'error', 'Server Response', 'Error')
        sqlGenResponse.value = response.data.reason
      }
    },

    async querySQLGenStatus() {
      const response = await axios.get(r_const.queryLLMChatStatus, {
        params: {
          queryID: this.llmQueryID,
          model: this.model,
        },
      })
      var nodeRes = response.data
      if (nodeRes.status) {
        this.$emit('openNotification', 'success', 'Server Response', 'SQL OK')
        this.sqlLoading = false
        let sqlGenResponse = document.getElementById('sqlGenResponse')
        sqlGenResponse.value = nodeRes.data
        this.sqlGenFinished = true
      } else {
        setTimeout(this.querySQLGenStatus, r_const.queryTaskStatusGap)
      }
    },

    async sqlExec() {
      this.hiveLoading = true
      this.$emit('openNotification', 'info', 'Server Response', 'SQL Running')
      let sqlGenResponse = document.getElementById('sqlGenResponse')
      let response = await axios.get(r_const.queryExecSQL, {
        params: {
          content: sqlGenResponse.value,
        },
      })
      if (response.data.status) {
        this.$emit('openNotification', 'success', 'Server Response', 'Finished')
        if (response.data.num_record > 0) {
          this.$emit('setTable', response.data.raw_data, response.data.taskid)
        } else {
          this.$emit('clearTable')
        }
        document.getElementById(
          'hiveResponse'
        ).value = `Fetched ${response.data.num_record} results.\n\n${response.data.es_result}`
      } else {
        this.$emit('openNotification', 'error', 'Server Response', 'Error')
        this.$emit('clearTable')
        document.getElementById('hiveResponse').value = JSON.stringify(
          response.data.es_result
        )
      }
      this.hiveLoading = false
    },

    async autoRunPhase1() {
      this.sqlGen()
      this.sqlExec()
    },
  },
}
</script>

<style scoped>
.sql-gen-page {
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  height: 74vh;
  width: 80vw;
  overflow-x: hidden;
  overflow-y: auto;
  border: 2px solid #d4d3d3e6;
  border-radius: 5px;
}

.userInput {
  width: 70vw;
  height: 6vh;
  margin: 0 auto;
  padding: 10px;
  text-align: left;
  border-radius: 4px;
  overflow-x: hidden;
  overflow-y: auto;
}

.GenResponse {
  width: 70vw;
  height: 28vh;
  margin: 0 auto;
  padding: 10px;
  text-align: left;
  border-radius: 4px;
  overflow-x: hidden;
  overflow-y: auto;
}

.el-form {
  margin-top: 10px;
}

.el-form-item {
  margin-bottom: 0;
  margin-left: 10px;
}
</style>
