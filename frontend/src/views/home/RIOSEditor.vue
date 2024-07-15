<template>
  <div class="myEditor" v-loading="loading">
    <el-form :inline="true">
      <el-form-item>
        <el-select
          v-model="theme"
          size="small"
          style="width:120px"
          @change="themeChange"
          placeholder="主题">
          <el-option
            v-for="item in themeOption"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="language"
          size="small"
          style="width:120px"
          filterable
          @change="languageChange"
          placeholder="语言">
          <el-option
            v-for="item in languageOption"
            :key="item.id"
            :label="item.id"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="success"
          :icon="ElIconCheck"
          circle
          size="small"
          @click="submitTask"></el-button>
      </el-form-item>
    </el-form>
    <div id="container"></div>
  </div>
</template>

<script>
/* eslint-disable */
import { Check as ElIconCheck } from '@element-plus/icons-vue'
import {shallowRef} from "vue";
import * as monaco from 'monaco-editor'
import * as r_const from '@/router/consts'
import * as utils_func from '@/utils/func'
import axios from 'axios'
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

export default {
  components : {
    ElIconCheck
  },
  data() {
    return {
      themeOption: [
        {
          value: 'vs',
          label: '默认',
        },
        {
          value: 'hc-black',
          label: '高亮',
        },
        {
          value: 'vs-dark',
          label: '深色',
        },
      ],
      languageOption: [],
      theme: 'vs',
      language: 'scala',
      loading: false,
      queryID: null,
      ElIconCheck: shallowRef(ElIconCheck),
    }
  },
  name: 'RIOSEditor',
  mounted() {
    const self = this
    self.initEditor()
    self.languageOption = monaco.languages.getLanguages()
  },
  methods: {
    initEditor() {
      const self = this
      const domEditor = document.getElementById('container')
      self.monacoEditor = monaco.editor.create(domEditor, {
        theme: self.theme,
        readOnly: false,
        automaticLayout: true,
      })
      monaco.editor.setModelLanguage(this.monacoEditor.getModel(), 'scala')
    },
    themeChange(val) {
      monaco.editor.setTheme(val)
    },
    languageChange(val) {
      monaco.editor.setModelLanguage(this.monacoEditor.getModel(), val)
    },
    setContent(contentVar) {
      const model = this.monacoEditor.getModel()
      const contentCur = model.getValue()
      if (contentCur.length != 0) {
        this.$confirm(
          'This will clear the code being edited. Continue?',
          'Warning',
          {
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Decline',
            type: 'warning',
          }
        )
          .then(() => {
            model.setValue(contentVar)
          })
          .catch(() => {})
      } else {
        model.setValue(contentVar)
      }
    },
    async submitTask() {
      this.$emit(
        'openNotification',
        'info',
        'Tip',
        'Packaging may takes a while'
      )
      this.loading = true
      const executeCode = this.monacoEditor.getModel().getValue()
      const response = await axios.get(r_const.querySubmitTask, {
        params: { executeCode: executeCode },
      })
      var serverRes = response.data
      // console.log(serverRes);
      this.loading = false
      var taskPkgFlag = serverRes.success
      var taskData = serverRes.data
      if (taskPkgFlag) {
        this.$emit(
          'openNotification',
          'success',
          'Maven Response',
          'Package Succeed. Task Executing'
        )
        this.runTask(taskData.codeID)
        this.$emit('setResponseLoading')
      } else {
        // this.$emit("openNotification", "error", "Maven Response", "Package Failed.");
        this.$emit(
          'openNotification',
          'error',
          'Error Code ' + serverRes.error_code + '!',
          serverRes.error_message
        )
        this.$emit('setOutput', taskData.output)
      }
    },
    async runTask(codeID) {
      var queryID = utils_func.GenNonDuplicateID(24)
      await axios.get(r_const.queryRunTask, {
        params: {
          queryID: queryID,
          codeID: codeID,
        },
      })
      this.queryID = queryID
      this.queryTaskStatus()
    },
    async queryTaskStatus() {
      const response = await axios.get(r_const.queryTaskStatus, {
        params: { queryID: this.queryID },
      })
      var nodeRes = response.data
      var serverRes = nodeRes.data
      // console.log(serverRes)
      if (nodeRes.status) {
        var taskData = serverRes.data
        var taskExecFlag = serverRes.success
        if (taskExecFlag) {
          this.$emit(
            'openNotification',
            'success',
            'Server Response',
            'Task Executed Successfully'
          )
          this.$emit('setOutput', taskData.output)
          if (taskData.hasData) {
            this.taskID = taskData.taskID
            await sleep(1000)
            this.getTaskData()
          }
        } else {
          // this.$emit("openNotification", "error", "Server Response", "Task Failed");
          this.$emit(
            'openNotification',
            'error',
            'Error Code ' + serverRes.error_code + '!',
            serverRes.error_message
          )
          this.$emit('setOutput', taskData.output)
        }
      } else {
        setTimeout(this.queryTaskStatus, r_const.queryTaskStatusGap)
      }
    },
    async getTaskData() {
      const response = await axios.get(r_const.queryGetTaskData, {
        params: { taskID: this.taskID },
      })
      var serverRes = response.data
      // console.log(serverRes)
      if (serverRes.success) {
        this.$emit('setTable', serverRes.data, this.taskID)
      } else {
        // this.$emit("openNotification", "error", "Server Response", "JSON Parse Failed");
        this.$emit(
          'openNotification',
          'error',
          'Error Code ' + serverRes.error_code + '!',
          serverRes.error_message
        )
      }
    },
  },
}
</script>

<style scoped>
#container {
  width: 70vw;
  height: 70vh;
  text-align: left;
}

.el-form-item {
  margin-bottom: 0;
  margin-left: 10px;
}

.myEditor {
  border: 2px solid #d4d3d3e6;
  border-radius: 5px;
}
</style>
