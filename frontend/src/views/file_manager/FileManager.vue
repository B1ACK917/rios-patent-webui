<template>
  <div class = "search-page">
    <h2>Upload File to Database</h2>
    <div class="row disp">
        <input type="file" multiple='multiple' ref="file" class="uploadFile" @change="handleFileUpload()"  />
        <el-button :loading="submitClicked" @click="submitFile()">Submit</el-button>
    </div>

    <br>

    <h2>Search</h2>
    <div class="row disp">
      <el-input class="userInput" cols="10" rows="2" placeholder="Search..." v-model="query" style="width: 500px" @keyup.enter.native="getFile()"/>
      <div class="search-type-buttons" id="search-type-buttons">
        <input type="radio" :name="'search-type'" value="Text" checked="true">Text
        <input type="radio" :name="'search-type'" value="Semantics">Semantics
      </div>
      <el-button class="askBtn" :loading="askClicked" @click="getFile">Search</el-button>
    </div>

    <br>

    <h2>Files</h2>
    <div>
    <el-table
       class="documentTable"
       stripe
       style="width: 400px"
       :data="resSeqs"
       @row-click="showData"
       row-key="index">
      <el-table-column type="index" width="70" label="Rank" />
      <el-table-column
        prop="fname"
        label="Returned Documents"/>
    </el-table>
    </div>

    <div class="modal" v-if="showFile">
      <div class="modal-content" ref="modalRef">
        <div class="modal-header">
          <h1>File</h1>
        </div>
        <div class="modal-content">

          <video width="400" height="400" controls v-if="showVideo">
            <source :src="'data:video/mp4;base64,' + vidsrc" type="video/mp4"/>
          </video>

          <img v-bind:src="'data:image/jpeg;base64,' + imgsrc" v-if="showImage">

          <div class="pdfwrapper" v-if="showPDF">
            <pdf
              v-for="i in numPages"
              :key="i"
              :src="pdfsrc"
              :page="i"
              style="height:40%">
            </pdf>
          </div>

        </div>
        <div class="modal-footer">
          <button class="close-button" @click="closePopup">Close</button>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import pdf from 'vue-pdf'
import axios from 'axios'
import * as r_const from '@/router/consts'

export default {
  name: 'FileSearchBox',
  components: {
    pdf,
  },
  data() {
    return {
      query: '',
      files : '',
      submitClicked: false,
      askClicked: false,
      pdfsrc: undefined,
      imgsrc: "",
      vidsrc: "",
      numPages: undefined, 
      showFile: false,
      showVideo: false,
      showImage: false,
      showPDF: false,
      resSeqs: []
    };
  },
  methods: {
    handleFileUpload() {
      this.files = this.$refs.file.files;
    },
    async submitFile() {
      this.submitClicked = true;
      let formData = new FormData();
      for (var j=0; j<this.files.length; j++) {
        formData.append('file', this.files[j]);
      }
      let names = [];
      for (var i=0; i<this.files.length; i++) {
        names.push(this.files[i].name);
      }
      var response = await axios.post(r_const.queryScalarUpload,
                      formData,
                      { params: {fname: names}},
                      {withCredentials: true},
                      {
                        headers: {
                             'Content-Type': 'multipart/form-data'
                        }
                      });
      response = await axios.get(r_const.queryVectorUpload,
                      {params: {fname: names}},
                      {withCredentials: true}
                      );
      console.log(response);
      this.submitClicked = false;
    },
    async getFile() {
      // Get file type
      var searchButtons = document.getElementsByClassName("search-type-buttons");
      var radios = searchButtons[0].children;
      var searchType = "";
      for (let i=0; i<radios.length; ++i){ 
        if (radios[i].checked) {
          searchType= radios[i].value;
        }
      }

      // Query backend
      var response = null;
      if (searchType == "Semantics") {
        response = await axios.get(r_const.queryVectorSearch,  {params:{text: this.query}});
      } else {
        response = await axios.get(r_const.queryFilename, {params:{text:this.query}});
      }
     
      // Push results to table display
      this.resSeqs = [];
      for (let i =0; i < response.data.fname.length; i++){ 
        const newObj = {};
        newObj['fname'] = response.data.fname[i]['fname'];
        this.resSeqs.push(newObj);
      }
    },
    async showData(index){
      const fname = index['fname'];
      const response = await axios.get(r_const.queryFiledata, {params:{text:fname}});
      const fdata = response.data.fdata;

      if (fname.includes(".pdf")){
        var loadingTask = pdf.createLoadingTask('data:application/pdf;base64,'+fdata);
        this.pdfsrc = loadingTask;
        this.pdfsrc.promise.then(pdf => {
          this.numPages = pdf.numPages;
        }); 
        this.showPDF = true;
      } else if (fname.includes(".mp4")) {
        this.vidsrc = fdata;
        this.showVideo = true;
      } else {
        this.imgsrc = fdata;
        this.showImage = true;
      }
      this.showFile = true;

      document.addEventListener('mouseup', this.closeModalOnClickOutside);

    },
    closePopup() {
        this.showFile = false;
        this.showVideo = false;
        this.showImage = false;
        this.showPDF = false;
        document.removeEventListener('mouseup', this.closeModalOnClickOutside);
    },
    closeModalOnClickOutside(event) {
        const modal = this.$refs.modalRef;
        if (!modal.contains(event.target)) {
            this.closePopup();
        }
    },
  },
};
</script>

<style scoped>

.search-page {
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


.search-box {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 500px;
  height: 50px;
  border: 2px solid #0078d7;
  border-radius: 5px;
  margin-top: 20px;
}

input[type="text"] {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 5px;
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
    overflow-y:auto;
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

.wrapper{
  overflow-y:auto;
}

.row:after {
  content: "";
  display: table;
  clear: both;
}

.disp {
  display: inline;
}

.table {
  margin: 0 auto;
  float: left;
}

.userInput {
    float:left;
    padding-right: 10px;
    text-align: left;
    border-radius: 4px;
    overflow-x: hidden;
    overflow-y: auto;
    display: inline;
}

.search-type-buttons{
  display: inline;
  margin-top: 5px;
}

</style>
