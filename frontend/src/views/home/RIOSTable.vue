<template>
  <div id="tableContainer">
    <el-form :inline="true" ref="form">
      <el-form-item>
        <a href="http://localhost:23457/downloadTaskData?taskID=test" id="dl">
          <el-button
            type="success"
            :icon="ElIconDownload"
            circle
            size="small"></el-button>
        </a>
      </el-form-item>
    </el-form>
    <el-table
      class="tableBox"
      :data="tableData"
      align="center"
      border
      style="width: 80vw"
      highlight-current-row>
      <el-table-column
        align="center"
        v-for="(item, index) in headData"
        :key="index"
        :label="item.tableTitle">
        <template slot-scope="scope">
          <span>{{ scope.row[index] && scope.row[index].value }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
/* eslint-disable */
import { Download as ElIconDownload } from '@element-plus/icons-vue'
import {shallowRef} from "vue";
import * as r_const from '@/router/consts'
import axios from 'axios'

export default {
  components: {
    ElIconDownload,
  },
  data() {
    return {
      centerDialogVisible: true,
      headData: [],
      tableData: [],
      taskID: null,
      ElIconDownload: shallowRef(ElIconDownload),
    }
  },
  name: 'RIOSTable',
  mounted() {},
  methods: {
    clearTable() {
      this.headData.splice(0)
      this.tableData.splice(0)
      var href = r_const.queryDownloadTaskData + `?taskID=0`
      document.getElementById('dl').setAttribute('href', href)
    },
    setTable(tableVar, taskID) {
      try {
        var headData = []
        var tableData = []
        for (const [key, value] of Object.entries(tableVar[0])) {
          headData.push({ tableTitle: key })
          value
        }
        tableVar.forEach((element) => {
          var row = []
          for (const [key, value] of Object.entries(element)) {
            row.push({ value: value })
            key
          }
          tableData.push(row)
        })

        this.headData.length = 0
        headData.forEach((item) => {
          this.headData.push(item)
        })
        this.tableData.length = 0
        tableData.forEach((item) => {
          this.tableData.push(item)
        })
        this.taskID = taskID
        var href = r_const.queryDownloadTaskData + `?taskID=${taskID}`
        document.getElementById('dl').setAttribute('href', href)
      } catch (error) {
        console.log('Parse table failed.')
      }
    },
    async downloadTable() {
      await axios.get(r_const.queryDownloadTaskData, {
        // params: { taskID: this.taskID }
        params: { taskID: 'test' },
      })
    },
  },
}
</script>

<style scoped>
#tableContainer {
  width: 70vw;
  height: 72vh;
  margin: 0 auto;
  padding: 10px;
  text-align: left;
  border-radius: 4px;
  overflow-x: hidden;
  overflow-y: auto;
}

.el-form {
  display: flex;
  justify-content: flex-end;
}
</style>
