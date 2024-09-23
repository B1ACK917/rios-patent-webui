<template>
  <div class="ask-page">
    <el-form :inline="true" ref="form">
      <h2>Upload File to Database</h2>
      <div class="row disp">
        <input
          type="file"
          multiple="multiple"
          ref="file"
          class="uploadFile"
          @change="handleFileUpload()"
        />
        <el-button :loading="submitClicked" @click="submitFile()"
          >Submit</el-button
        >
      </div>

      <br />

      <h2>Query Database</h2>
      <div class="row disp">
        <el-input
          class="userInput"
          cols="10"
          rows="2"
          type="textarea"
          placeholder="Input text"
          v-model="inText"
          style="width: 500px"
        >
        </el-input>
        <el-button class="askBtn" :loading="askClicked" @click="ask"
          >Ask</el-button
        >
      </div>

      <h2>Queried Data</h2>
      <div>
        <el-table
          class="documentTable"
          stripe
          style="width: 400px"
          :data="resSeqs"
          @row-click="showData"
          row-key="index"
        >
          <el-table-column type="index" width="70" label="Rank" />
          <el-table-column prop="source" label="Returned Documents" />
        </el-table>
      </div>

      <div class="modal" v-if="showAsk">
        <div class="modal-content" ref="modalRef">
          <div class="modal-header">
            <h1>Result</h1>
          </div>
          <div class="modal-content">
            <textarea v-model="outText"></textarea>
          </div>
          <div class="modal-footer">
            <button class="close-button" @click="closePopup">Close</button>
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import axios from 'axios'
import * as r_const from '@/router/consts'

export default {
  name: 'AskPage',
  data() {
    return {
      inText: '',
      outText: '',
      resSeqs: [],
      showAsk: false,
      files: '',
      askClicked: false,
      submitClicked: false,
    }
  },
  methods: {
    handleFileUpload() {
      this.files = this.$refs.file.files
    },
    async submitFile() {
      this.submitClicked = true
      let formData = new FormData()
      for (var j = 0; j < this.files.length; j++) {
        formData.append('file', this.files[j])
      }
      let names = []
      for (var i = 0; i < this.files.length; i++) {
        names.push(this.files[i].name)
      }
      await axios.post(
        r_const.queryUpload,
        formData,
        { params: { fname: names } },
        { withCredentials: true },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      this.submitClicked = false
    },
    showData(index) {
      this.outText = index['text']
      this.showAsk = true
      document.addEventListener('mouseup', this.closeModalOnClickOutside)
    },
    closePopup() {
      this.showAsk = false
      document.removeEventListener('mouseup', this.closeModalOnClickOutside)
    },
    closeModalOnClickOutside(event) {
      const modal = this.$refs.modalRef
      if (!modal.contains(event.target)) {
        this.closePopup()
      }
    },

    async ask() {
      this.askClicked = true
      this.outText = ' '
      const response = await axios.get(r_const.queryAsk, {
        params: { text: this.inText },
      })
      this.resSeqs = []
      for (let i = 0; i < response.data.results['metadata'].length; i++) {
        const newObj = {}
        newObj['source'] = response.data.results['metadata'][i]['source']
        newObj['text'] = response.data.results['text'][i]
        this.resSeqs.push(newObj)
      }
      this.askClicked = false
    },
  }, // end methods
} // end default
</script>

<style scoped>
.ask-page {
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

askBtn {
  border: none;
  background: #27afd8;
  cursor: pointer;
}

textarea {
  height: 400px;
  width: 100%;
}

.userInput {
  float: left;
  padding-right: 10px;
  text-align: left;
  border-radius: 4px;
  overflow-x: hidden;
  overflow-y: auto;
  display: inline;
}

.documentTable {
  margin: 0 auto;
  float: left;
  text-align: left;
  border-radius: 4px;
  overflow-x: hidden;
  overflow-y: auto;
  display: inline;
  font-size: 15px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  position: relative;
  overflow-y: auto;
  max-height: 700px;
}

.modal-header {
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
}

.modal-footer {
  padding-top: 10px;
  border-top: 1px solid #ccc;
  display: flex;
  justify-content: flex-end;
}

.disp {
  display: inline;
}

.table {
  margin: 0 auto;
  float: left;
}

.row:after {
  content: '';
  display: table;
  clear: both;
}
</style>
