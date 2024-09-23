<template>
  <el-container style="height: 80vh">
    <el-header class="rios-header">
      <div>
        Patent Box
        <img src="@/assets/cereblogo.png" alt="Logo" width="77" height="71"/>
      </div>
    </el-header>

    <el-container class='patent-container'>
      <!--- <el-tabs
        v-model="editableTabsValue"
        type="card"
        @tab-remove="removeTab"> --->

        <!--- <el-tab-pane label="Patent Search" name="search"> --->
            <r-search></r-search>
        <!--- </el-tab-pane> --->

      <!---   <el-tab-pane label="Spark Executor" name="executor">
          <r-editor
            ref="childEditor"
            @openNotification="openNotification"
            @setOutput="setOutput"
            @setResponseLoading="setResponseLoading"
            @setTable="setTable"></r-editor>
        </el-tab-pane>
        <el-tab-pane label="Spark Response" name="response">
          <r-response ref="responseTab"></r-response>
        </el-tab-pane>
        <el-tab-pane label="RIOS SQLChat" name="sqlgen">
          <r-sqlgen
            @openNotification="openNotification"
            @setTable="setTable"
            @clearTable="clearTable"></r-sqlgen>
        </el-tab-pane>
        <el-tab-pane label="Execution Result" name="result">
          <r-table ref="resultTab"></r-table>
        </el-tab-pane>
        <el-tab-pane label="RIOS Translator" name="translator">
          <r-translator></r-translator>
        </el-tab-pane>
        <el-tab-pane label="RIOS Collect" name="collect">
          <r-collect></r-collect>
        </el-tab-pane> 
        <el-tab-pane label="RIOS FileManager" name="filemanager">
          <r-filemanage></r-filemanage>
        </el-tab-pane> 
      </el-tabs> --->
    </el-container>
  </el-container>
</template>

<script>
/* eslint-disable */
import {
  Message as ElIconMessage,
  Menu as ElIconMenu,
  CopyDocument as ElIconCopyDocument,
} from '@element-plus/icons-vue'

import RIOSEditor from './home/RIOSEditor.vue'
import RIOSTable from './home/RIOSTable.vue'
import RIOSResponse from './home/RIOSResponse.vue'
import SearchPage from './recommend/SearchPage.vue'
import SQLGenPage from './home/RIOSText2sql.vue'
import RIOSTranslator from './home/RIOSTranslator.vue'
//import RIOSCollect from './home/RIOSCollect.vue'
import FileManager from './file_manager/FileManager.vue'
import * as r_const from '@/router/consts'
import axios from 'axios'

export default {
  components: {
    'r-search': SearchPage,
    'r-editor': RIOSEditor,
    //'r-table': RIOSTable,
    //'r-response': RIOSResponse,
    //'r-sqlgen': SQLGenPage,
    //'r-translator': RIOSTranslator,
    //'r-collect': RIOSCollect,
    //'r-filemanage': FileManager,
    ElIconMessage,
    ElIconMenu,
    ElIconCopyDocument,
  },
  data() {
    return {
      lang: 'EN',
      editableTabsValue: 'search',
      tabIndex: 1,
      tableList: {
        grantedPatents: {
          queryName: 'csv',
          tables: [],
        },
        briefSum: {
          queryName: 'g_brf_sum_text',
          tables: [],
        },
        claim: {
          queryName: 'g_claims',
          tables: [],
        },
        detailDesc: {
          queryName: 'g_detail_desc_text',
          tables: [],
        },
        drawDesc: {
          queryName: 'g_draw_desc_text',
          tables: [],
        },
      },
    }
  },
  methods: {
    toggleLanguage() {
      if (this.lang == "EN") {
        this.lang = "CN";
      } else {
        this.lang = "EN";
      }
    },
    addTab() {
      let newTabName = ++this.tabIndex + ''
      this.editableTabs.push({
        title: 'New Tab',
        name: newTabName,
        content: 'New Tab content',
      })
      this.editableTabsValue = newTabName
    },
    removeTab(targetName) {
      let tabs = this.editableTabs
      let activeName = this.editableTabsValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }
      this.editableTabsValue = activeName
      this.editableTabs = tabs.filter((tab) => tab.name !== targetName)
    },
    goTo() {
      this.$router.push('/SearchPage')
    },
    openNotification(typeVar, titleVar, contentVar) {
      this.$notify({
        title: titleVar,
        message: contentVar,
        type: typeVar,
      })
    },
    async loadTemplate(templateFilename) {
      const response = await axios.get(r_const.queryLoadTemplate, {
        params: { filename: templateFilename },
      })
      this.$refs.childEditor.setContent(response.data)
    },
    setOutput(serverOutput) {
      this.$refs.responseTab.setResponse(serverOutput)
    },
    setTable(serverTable, taskID) {
      this.$refs.resultTab.setTable(serverTable, taskID)
    },
    clearTable() {
      this.$refs.resultTab.clearTable()
    },
    setResponseLoading() {
      this.$refs.responseTab.setLoading()
    },
    async refreshTableList() {
      for (const [key, value] of Object.entries(this.tableList)) {
        const response = await axios.get(r_const.queryLoadHDFSList, {
          params: { tableType: value['queryName'] },
        })
        this.tableList[key]['tables'].length = 0
        response.data.tableList.forEach((item) => {
          item.tableName = item.tableName.substring(2)
          this.tableList[key]['tables'].push(item)
        })
      }
    },
    async maintaining() {
      this.$alert('Maintaining...', 'Error', {
        confirmButtonText: 'OK',
      })
    },
    copyFilePath(tablePath) {
      var input = document.createElement('input')
      input.value = tablePath
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      this.openNotification('success', 'Success', 'Path copied')
      document.body.removeChild(input)
    },
  },
  mounted() {
    //this.refreshTableList()
    // this.maintaining()
  },
}
</script>

<style>
.sidebar {
  width: 300px;
  height: 80vh;
}

.block {
  border: 1px solid #d4d3d3e6;
}

.rios-header {
  font-size: 50px;
  margin: 20px;
}

.el-aside {
  display: contents;
}

.el-menu {
  min-width: 240px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input{
  display: none;
}

.slider {
  position:absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s
}

input:checked + .slider {
  background-color: #ccc;
}

input:focus + .slider{
  box-shadow: 0 0 1px #ccc;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

#menu-container {
  max-height: 80vh;
  overflow: auto;
}

.patent-container {
    /* remember to set a width 
    position: absolute;
    left: 11%;
    top: 15%;*/
    margin-left:10%;
    margin-top:10px;
}


</style>
