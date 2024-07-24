<template>
  <div class="search-page">
    <h2>Upload File to Database</h2>
    <div class="row disp">
      <input
        type="file"
        multiple="multiple"
        ref="file"
        class="uploadFile"
        @change="handleFileUpload()"
      />
      <el-button :loading="submitClicked" @click="submitFile()">Submit</el-button>
      <div id="progressBar" v-if="showProgress">
        <div id="bar"></div>
      </div>
    </div>

    <br />

    <h2>Search</h2>
    <div class="row disp">
      <el-input
        class="userInput"
        cols="10"
        rows="2"
        placeholder="Search..."
        v-model="query"
        style="width: 200px"
        @keyup.enter.native="getFile()"/>
      <div class="search-type-buttons" id="search-type-buttons">
        <input
          type="radio"
          :name="'search-type'"
          value="Text"
          checked="true"/> Text
        <input type="radio" :name="'search-type'" value="Semantics" />Semantics
      </div>
      <el-button class="askBtn" :loading="askClicked" @click="getFile">Search</el-button>
    </div>

    <br />

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
        <el-table-column prop="fname" label="Returned Documents" />
      </el-table>
    </div>

    <div class="modal" v-if="showFile">
      <div class="modal-content" ref="modalRef">
        <div class="modal-header">
          <h1>File</h1>
        </div>
        <div class="modal-content">
          <video width="400" height="400" controls v-if="showVideo">
            <source :src="'data:video/mp4;base64,' + vidsrc" type="video/mp4" />
          </video>

          <img
            v-bind:src="'data:image/jpeg;base64,' + imgsrc"
            v-if="showImage"/>

          <div class="pdfwrapper" v-if="showPDF" width="100%">
            <!-- <button @click="page = page > 1 ? page - 1: page"> Prev </button> 
            <span> {{page}}  / {{ numPages }} </span>
            <el-button @click="page = page < numPages ? page + 1: page"> Next </button> -->
            Coordinates:[<span id="coords"></span>]
            <el-button id="clear" @click="clear()">clear</el-button>
            <br>
            Annotation Content: <input placeholder="Content" id="content" type="text" />
            Annotation Author: <input placeholder="Author" id="author" type="text" />
            <br>
            <el-button id="addSquareAnnotation" @click="addSquareAnnotation()" :disabled="squareClicked">Square Annotation</el-button>
            <el-button id="addTextAnnotation"  @click="addTextAnnotation()" :disabled="textClicked">Text Annotation</el-button>
            <!--<button id="addHighlightAnnotation" type="button" @click="addHighlightAnnotation">Highlight Annotation</button> -->

            <el-button id="download" @click="download()">Download</el-button>

            <div id="viewerContainer">
              <div id="viewer"></div>
            </div>
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
/* eslint-disable */
import axios from 'axios'
import {markRaw} from 'vue'
import * as r_const from '@/router/consts'
import * as pdfjs from 'pdfjs-dist/build/pdf'
import * as pdfjsViewer from 'pdfjs-dist/web/pdf_viewer'
import 'pdfjs-dist/web/pdf_viewer.css'

pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.mjs'
import {AnnotationFactory} from 'annotpdf';

const delay = ms => new Promise(res => setTimeout(res, ms));
let pdfViewer = undefined;
let pdfFactory = undefined;

export default {
  name: 'FileSearchBox',
  data() {
    return {
      query: '',
      files: '',
      submitClicked: false,
      askClicked: false,
      pdfsrc: undefined,
      imgsrc: '',
      vidsrc: '',
      page: 1,
      numPages: 1,
      showFile: false,
      showVideo: false,
      showImage: false,
      showPDF: false,
      resSeqs: [],
      coordinates: [],
      doSquare: false,
      doText: false,
      squareClicked: false,
      textClicked: false,
      first_pdf: true,
      fname : "",
      showProgress: false,
      progressValue: 0,
    }
  },
  methods: {
    updateCoordinates() {
      let _str = this.coordinates.map((x) => Math.round(x)).join(",")
      document.getElementById("coords").innerHTML = _str
    },
    clear() {
      this.coordinates = []
      this.updateCoordinates()
    },
    download() {
      pdfFactory.download(this.fname.split(".pdf")[0] + "_annotated.pdf");
    },
    getParameters() {
      let content = document.getElementById("content").value
      let author = document.getElementById("author").value
      let x = this.coordinates[0]
      let y = this.coordinates[1]

      return [x, y, content, author]
    },
    selectionCoordinates() {
      let rec = window.getSelection().getRangeAt(0).getBoundingClientRect()
      let ost = this.computePageOffset()
      let x_1 = rec.x - ost.left
      let y_1 = rec.y - ost.top
      let x_2 = x_1 + rec.width
      let y_2 = y_1 + rec.height

      let x_1_y_1 = pdfViewer._pages[pdfViewer.currentPageNumber - 1].viewport.convertToPdfPoint(x_1, y_1)
      x_1 = x_1_y_1[0]
      y_1 = x_1_y_1[1]
      let x_2_y_2 = pdfViewer._pages[pdfViewer.currentPageNumber - 1].viewport.convertToPdfPoint(x_2, y_2)
      x_2 = x_2_y_2[0]
      y_2 = x_2_y_2[1]
      return [x_1, y_1, x_2, y_2]
    },
    addSquareAnnotation() {
      if(!this.doSquare) {
        this.coordinates = []
        this.doSquare = true
        this.squareClicked = true
      }
    },
    addTextAnnotation() {
      if(!this.doText) {
        this.coordinates = []
        this.doText = true
        this.textClicked = true
      }
    },
    // Different logic because it involves highlighting text
    addHighlightAnnotation() {
      let parameters = this.getParameters()
      pdfFactory.createHighlightAnnotation(pdfViewer.currentPageNumber - 1, this.selectionCoordinates(), parameters[2], parameters[3], {r:255, g:255, b:224, opacity:0.3})
      this.coordinates = []
      this.updatePdf()
      this.updateCoordinates()
    },
    createTextAnnotation() {
      this.doText = false;
      this.textClicked = false
      let parameters = this.getParameters()
      pdfFactory.createTextAnnotation(pdfViewer.currentPageNumber - 1, [parameters[0], parameters[1], parameters[0] + 22, parameters[1] + 22], parameters[2], parameters[3])
      this.coordinates = [];
      this.updatePdf();
      this.updateCoordinates();
    },
    createSquareAnnotation() {
      if (this.coordinates.length == 4) {
        this.doSquare = false
        this.squareClicked = false
        let parameters = this.getParameters()
        pdfFactory.createSquareAnnotation(pdfViewer.currentPageNumber - 1, this.coordinates.slice(), parameters[2], parameters[3], {r:255,g:255,b:0}, {r:255,g:255,b:0}, {opacity:0.3})
        this.coordinates = [];
        this.updatePdf();
        this.updateCoordinates();
      }
    },
    computePageOffset() {
      let pages = document.getElementsByClassName("page");
      for (let i = 0; i < pages.length; ++i){
        let pageNum = (pages[i].getAttribute("aria-label"));
        if ((pdfViewer.currentPageNumber).toString() === pageNum.substring(6, pageNum.length-1)) {
          var rect = pages[i].getBoundingClientRect()
          var bodyElt = document.body;
          return {
            top: rect.top + bodyElt .scrollTop,
            left: rect.left + bodyElt .scrollLeft
          }
        }
      }
    },
    updatePdf() {
      try {
        let ext_pdf = pdfFactory.write();
      } catch (e) {
        console.log(e);
      }
      let ext_pdf = pdfFactory.write()
      this.setupPdf(ext_pdf);
    },
    shapeHandler(event) {
      let ost = this.computePageOffset()
      let x = event.pageX - ost.left
      let y = event.pageY - ost.top

      let x_y = pdfViewer._pages[pdfViewer.currentPageNumber - 1].viewport.convertToPdfPoint(x, y)
      x = x_y[0]
      y = x_y[1]

      this.coordinates.push(x)
      this.coordinates.push(y)

      this.updateCoordinates()

      if (this.doSquare) {
        this.createSquareAnnotation();
      }
      else if (this.doText) {
        this.createTextAnnotation();
      }
    },
    async setupPdf(fdata) {
      await delay(1000);
      let pdfContainer = document.getElementById('viewerContainer')
      pdfContainer.innerHTML = "<div id=\"viewer\"></div> "
      let eventBus = new pdfjsViewer.EventBus();
      pdfViewer = new pdfjsViewer.PDFViewer({
        container : pdfContainer,
        eventBus: eventBus,
      })
      if (this.first_pdf) {
        pdfContainer.addEventListener("mouseup", this.shapeHandler, false);
        pdfContainer.addEventListener("mousedown", this.shapeHandler, false);
        //pdfContainer.addEventListener('click', (evt) => {
      }
      let loadingTask = pdfjs.getDocument({
        data : fdata
      })
      await loadingTask.promise.then((pdfDocument) => {
        if (this.first_pdf) {
          pdfFactory = undefined;
          pdfDocument.getData().then((data) => {
            pdfFactory = new AnnotationFactory(data)
            this.first_pdf = false;
          })
        }
        pdfViewer.setDocument(pdfDocument);
      })
    },
    handleFileUpload() {
      this.files = this.$refs.file.files
    },
    setProgressBar(value, text) {
      var elem = document.getElementById("bar");
      elem.style.width = value + "%";
    },
    async submitFile() {
      this.submitClicked = true;
      this.showProgress = true;
      await delay(1000);
      this.setProgressBar(0, "");
      let formData = new FormData()
      for (var j = 0; j < this.files.length; j++) {
        formData.append('file', this.files[j])
      }
      let names = []
      for (var i = 0; i < this.files.length; i++) {
        names.push(this.files[i].name)
      }
      this.setProgressBar(10, "Reading files...");
      await axios.post(
        r_const.queryScalarUpload,
        formData,
        { params: { fname: names } },
        { withCredentials: true },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      this.setProgressBar(60, "Files can be searched by text.");
      await axios.get(
        r_const.queryVectorUpload,
        { params: { fname: names } },
        { withCredentials: true }
      )
      this.setProgressBar(100, "Files can be searched by semantics.");
      this.submitClicked = false
    },
    async getFile() {
      // Get file type
      var searchButtons = document.getElementsByClassName('search-type-buttons')
      var radios = searchButtons[0].children
      var searchType = ''
      for (let i = 0; i < radios.length; ++i) {
        if (radios[i].checked) {
          searchType = radios[i].value
        }
      }

      // Query backend
      var response = null
      if (searchType == 'Semantics') {
        response = await axios.get(r_const.queryVectorSearch, {
          params: { text: this.query },
        })
      } else {
        response = await axios.get(r_const.queryFilename, {
          params: { text: this.query },
        })
      }

      // Push results to table display
      this.resSeqs = []
      for (let i = 0; i < response.data.fname.length; i++) {
        const newObj = {}
        newObj['fname'] = response.data.fname[i]['fname']
        this.resSeqs.push(newObj)
      }
    },
    async showData(index) {
      const fname = index['fname']
      this.fname = fname;
      const response = await axios.get(r_const.queryFiledata, {
        params: { text: fname },
      })
      const fdata = response.data.fdata

      if (fname.includes('.pdf') || fname.includes('.xlsx')) {
        this.showPDF = true
        window.onload = this.setupPdf(atob(fdata));
      } else if (fname.includes('.mp4')) {
        this.vidsrc = fdata
        this.showVideo = true
      } else {
        this.imgsrc = fdata
        this.showImage = true
      }
      this.showFile = true

      document.addEventListener('mouseup', this.closeModalOnClickOutside)
    },
    closePopup() {
      this.showFile = false
      this.showVideo = false
      this.showImage = false
      this.showPDF = false
      this.first_pdf = true;
      document.removeEventListener('mouseup', this.closeModalOnClickOutside)
    },
    closeModalOnClickOutside(event) {
      const modal = this.$refs.modalRef;
      if (!modal.contains(event.target)) {
        this.closePopup()
      }
    },
  },
}
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

input[type='text'] {
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
  overflow-y: auto;
  height: 80%;
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

.wrapper {
  overflow-y: auto;
}

.row:after {
  content: '';
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
  float: left;
  padding-right: 10px;
  text-align: left;
  border-radius: 4px;
  overflow-x: hidden;
  overflow-y: auto;
  display: inline;
}

.search-type-buttons {
  display: inline;
  margin-top: 5px;
}

#viewerContainer {
  overflow: auto;
  position: absolute;
  width: 100%;
}

#progressBar {
  width:100%;
  background-color: #d3d3d3;
}

#bar {
  width: 1%;
  height: 30px;
  background-color: #1fd655;
}

</style>
