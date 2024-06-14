<template>
    <div class="translator-page">
        <el-form :inline="true" ref="form">
            <div>
              <el-input class="userLogin" type="text" placeholder="Username" v-model="user">
              </el-input>
              <el-form-item>
                  <el-button type="primary" icon="el-icon-switchbutton"
                             :loading="login_clicked"
                             @click="loginExec" id="loginBtn">Login</el-button>

                  <el-button type="primary" icon="el-icon-switchbutton"
                             :loading="logout_clicked"
                             @click="logoutExec" id="logoutBtn">Logout</el-button>
              </el-form-item>
            </div>
            Source Language
            <el-form-item>
                <el-select v-model="in_lang">
                    <el-option v-for="item in languages" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            Target Language
            <el-form-item>
                <el-select v-model="out_lang">
                    <el-option v-for="item in languages" :key="item.value" :label="item.value" :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" icon="el-icon-upload" 
                           :loading="save_clicked"
                           @click="saveExec" id="saveBtn">Save</el-button>

                <el-button type="primary" icon="el-icon-download"
                           :loading="load_clicked"
                           @click="loadExec" id="loadBtn">Load</el-button>

                <el-button type="primary" icon="el-icon-refresh"
                           :loading="retrain_clicked"
                            @click="retrain" id="retrainBtn">Retrain</el-button>

                <el-button type="primary" @click="openPopup" id="keywordDictButton">Keyword Dict</el-button>

            </el-form-item>
        </el-form>
        <div class="row">
              <el-input class="userInput" cols="15" rows="15"  type="textarea"  placeholder="Input text" v-model="in_text" style="width: 500px">
              </el-input>

              <el-input class="userOutput" cols="15" rows="15"  type="textarea" placeholder="Output text" v-model="out_text" style="width: 500px">
              </el-input>
	</div>

        <el-form :inline="true" ref="form">
            <el-form-item>
                <el-button type="primary" icon="el-icon-chat-dot-round"
                           :loading="translate_clicked"
                           @click="translate" id="translateBtn">Translate</el-button>
            </el-form-item>
        </el-form>
        <br>
        <br>
        <br>
        <div class="container">
          <div class="form-group row">
            <label class="col-md-4 col-form-label text-md-right"><font size="+2"><b>Translate docx/pdf</b></font></label>
            <br>
            <div class="col-md-6">
              <div class="custom-file">
                <input type="file" class="custom-file-input" id="customFile" 
                    ref="file" @change="handleFileObject()">
              </div>
            </div>
          </div>
          <br>
          <div class="form-group row mb-0">
            <div class="col-md-6 offset-md-4">
              <el-button type="primary" :loading="submit_clicked" @click="submit" id="submitButton">Submit</el-button>
              <el-button type="primary" :loading="submit_clicked" @click="showTranslatedDocx" id="showTranslatedButton">Show Translated Docx</el-button>
            </div>
          </div>
        </div>

        <div class="modal" v-if="showTranslated">
          <div class="showDoc-content" ref="docRef">
            <button class="close-x" @click="closeTranslatedDocx"> X</button>
            <div class="modal-header">
              <h1>Keyword Translated Docx</h1>
            </div>
            <div class="modal-body">
              <p> Please see your translated text below: </p>

              <table border="1">
              <tbody> 
              <tr v-for="(input,k) in translated_seqs" :key="k">
                  <td>{{ input.in }}</td>
                  <td>{{ input.out }}</td>
              </tr>
              </tbody>
              </table>

            </div>
            <div class="modal-footer">
              <button class="close-button" @click="closeTranslatedDocx">Close</button>
            </div>
          </div>
        </div>
       

        <div class="modal" v-if="showPopup">
          <div class="modal-content" ref="modalRef">
            <button class="close-x" @click="closePopup"> X</button>
            <div class="modal-header">
              <h1>Keyword Mapping Dictionary</h1>
            </div>
            <div class="modal-body">
              <p> Please define your keyword pairings here </p>
              <div v-for="(input,k) in keywords" :key="k">
                  <input type="text" class="form-control" v-model="input.Keyword1">
                  <input type="text" class="form-control" v-model="input.Keyword2">
              </div>
              <button class="keyword_btn" @click="addKeywords">Add Pairing</button>
            </div>
            <div class="modal-footer">
              <button class="close-button" @click="closePopup">Close</button>
              <button class="save-button" @click="saveKeyword">Save</button>
              <div class="custom-file">
                <input type="file" class="custom-file-input" id="customKeywordFile" 
                    ref="xlsxFile" @change="handleXLSXObject()">
              </div>
              <button @click.prevent="keywordUpload" type="keywordUpload" class="btn btn-primary" style="background: #42b983">
                Upload Keyword
              </button>
            </div>
          </div>
        </div>

    </div>
</template>
  
<script>
import axios from 'axios';
import * as r_const from '@/router/consts'
//import exportFromJSON from "export-from-json";
import * as XLSX from "xlsx";

export default {
    name: "TranslatorPage",
    data() {
        return {
            languages: [
                {
                    value: 'English',
                },
                {
                    value: 'Chinese',
                },
            ],
            keywords: [
              {
                  Keyword1: '',
                  Keyword2: ''
              }
            ],
            translated_seqs: [],
            in_lang: 'Chinese',
            out_lang: 'English',
            cookie: 'sessionid=abc',
            translator: '',
            user: '',
            in_text: '',
            out_text: '',
            login_clicked: false,
            logout_clicked: false,
            load_clicked: false,
            save_clicked: false,
            retrain_clicked: false,
            translate_clicked: false,
            submit_clicked: false,
            save_path: './new_saved_model',
            load_path: './new_saved_model',
            showPopup: false,
            showTranslated: false,
            docx: null,
            xlsx: null,
        };
    },
    methods: {
        async loginExec() {
          try {
            this.login_clicked = true;
            await axios.get(r_const.queryTranslatorLogin,
                           {params: {cookie: 'sessionid='+this.user}},
                           {withCredentials: true});
            this.login_clicked = false;
          } catch (err) {
            this.login_clicked = false;
            console.error(err)
          }
        },
        async logoutExec() {
          try {
            this.logout_clicked = true;
            await axios.get(r_const.queryTranslatorLogout,
                           {params: {cookie: 'sessionid='+this.user}},
                           {withCredentials: true});
            this.logout_clicked = false;
          } catch (err) {
            this.logout_clicked = false;
            console.error(err)
          }
        },
        async translate() {
          try {
            this.translate_clicked = true;
            this.out_text = " ";
            const response = await axios.get(r_const.queryTranslateText,
                                            {params: {text: this.in_text,
                                                      in_lang: this.in_lang,
                                                      out_lang: this.out_lang,
                                                      cookie: 'sessionid='+this.user}},
                                            {withCredentials: true});
            this.out_text = response.data.results;
            this.translate_clicked = false;
          } catch (err) {
            this.translate_clicked = false;
            console.error(err)
          }
        },
        async retrain() {
          try {
            this.retrain_clicked = true;
            var src_retrain = "";
            var tgt_retrain = "";
            this.keywords.forEach(_ => {
                src_retrain = src_retrain +  _['Keyword1'] + ", ";
                tgt_retrain = tgt_retrain +  _['Keyword2'] + ", ";
            });
            src_retrain = src_retrain.slice(0, -2);
            tgt_retrain = tgt_retrain.slice(0, -2);
            await axios.get(r_const.queryRetrainModel,
                            {params: {src_text: src_retrain,
                                      tgt_text: tgt_retrain,
                                      in_lang: this.in_lang,
                                      out_lang: this.out_lang,
                                      cookie: 'sessionid='+this.user}});
            this.retrain_clicked = false;
          } catch (err) {
            this.retrain_clicked = false;
            console.error(err)
          }
        },
        async saveExec() {
          try {
            this.save_clicked = true;
            await axios.get(r_const.querySaveModel,
                            {params: {path: this.save_path,
                                      cookie: 'sessionid='+this.user}},
                            {withCredentials: true});  
            this.save_clicked = false;
          } catch (err) {
            this.save_clicked = false;
            console.error(err)
          }
        },
        async loadExec() {
          try {
            this.load_clicked = true;
            await axios.get(r_const.queryLoadModel,
                           {params: {path: this.load_path,
                                     cookie: 'sessionid='+this.user}},
                           {withCredentials: true});  
            this.load_clicked = false;
          } catch (err) {
            this.load_clicked = false;
            console.error(err)
          }
        },
        handleFileObject() {
          this.docx = this.$refs.file.files[0]
        },
        async submit() {
          this.submit_clicked = true;
          var formData = new FormData();
          formData.append('file', this.docx);
          await axios.post(r_const.queryTranslateFile, formData, 
          { params: {in_lang: this.in_lang,
                     out_lang: this.out_lang,
                     cookie: 'sessionid='+this.user}},
          {withCredentials: true},
          { headers: {
              'Content-Type': "multipart/form-data; charset=utf-8; boundary=" + Math.random().toString().substr(2)
            }
          }).then((response) => {
            // looping over each element in response.data (each converted bytesIO string)
            var idx=0;
            this.translated_seqs = [];
            for (let i=0; i < response.data['results_in'].length; i++) {
              const newObj = {};
              newObj['in'] = response.data['results_in'][i];
              newObj['out'] = response.data['results_out'][i];
              this.translated_seqs.push(newObj) 
            }
            response.data['results_files'].forEach((element) => {

              // decode string to blob 
              const byteCharacters = atob(element);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              var url = window.URL.createObjectURL(new Blob([byteArray]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', this.user+'_translated.docx');
              if ((idx%2)==0) {
                link.setAttribute('download', this.user+'_translated.xlsx');
                this.translated_xlsx = XLSX.read(element);
                idx = idx + 1;
              }
              document.body.appendChild(link);
              link.click();
              this.submit_clicked=false;
            });
          });
        },
        handleXLSXObject() {
          this.xlsx = this.$refs.xlsxFile.files[0]
        },
        keywordUpload() {
          const fileToSheet = (file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              /* Parse data */
              const bstr = e.target.result;
              const wb = XLSX.read(bstr, { type: 'binary' });
              /* Get first worksheet */
              const wsname = wb.SheetNames[0];
              const ws = wb.Sheets[wsname];
              /* Convert array of arrays */
              var data =  XLSX.utils.sheet_to_row_object_array(ws);
              const excellist = [];
              for (var j=0; j < data.length; j++) {
                excellist.push(data[j])
              }
              const newKeywords = [];
              excellist.forEach(_ => {
                const newObj = {};
                Object.keys(_).forEach(key => {
                  newObj[key] = _[key];
                });
                newKeywords.push(newObj);
              });
              this.keywords = newKeywords;
            }
            reader.readAsBinaryString(file);
          }
          fileToSheet(this.xlsx);
        },
        addKeywords() {
            const newKeyword = {
              Keyword1: '',
              Keyword2: '', 
            }
            this.keywords.push(newKeyword);
        },
        saveKeyword() {
          const fileName = this.user + '_keywords.xlsx';
          var wb = XLSX.utils.book_new();
          var ws = XLSX.utils.json_to_sheet(this.keywords);
          XLSX.utils.book_append_sheet(wb, ws, "Keywords");
          XLSX.writeFile(wb, fileName);
        },
        showTranslatedDocx() {
          this.showTranslated = true;
          document.addEventListener('mouseup', this.closeDocOnClickOutside);
        },
        closeTranslatedDocx() {
          this.showTranslated = false;
          document.removeEventListener('mouseup', this.closeDocOnClickOutside);
        },
        closeDocOnClickOutside(event) {
            const modal = this.$refs.docRef;
            if (!modal.contains(event.target)) {
                this.closeTranslatedDocx();
            }
        },
        openPopup() {
            this.showPopup = true;
            document.addEventListener('mouseup', this.closeModalOnClickOutside);
        },
        closePopup() {
            this.showPopup = false;
            document.removeEventListener('mouseup', this.closeModalOnClickOutside);
        },
        closeModalOnClickOutside(event) {
            const modal = this.$refs.modalRef;
            if (!modal.contains(event.target)) {
                this.closePopup();
            }
        }

    }, //end methods
}; //end default

</script>
  
<style scoped>
.translator-page {
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

.userLogin {
    width: 6vw;
    height: 6vh;
    margin: 0 auto;
    padding: 5px;
    text-align: left;
    border-radius: 4px;
    overflow-x: hidden;
    overflow-y: auto;
}

.userInput {
    margin: 0 auto;
    padding: 10px;
    text-align: left;
    border-radius: 4px;
    overflow-x: hidden;
    overflow-y: auto;
}

.userOutput {
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
    max-width: 500px;
    width: 80 %;
    position: relative;
    overflow-y:auto;
    max-height: 700px;
}

.modal-header {
    padding-bottom: 10px;
    border-bottom: 1px solid #ccc;
}

.modal-body {
    padding: 10px 0;
}

.modal-footer {
    padding-top: 10px;
    border-top: 1px solid #ccc;
    display: flex;
    justify-content: flex-end;
}

.showDoc-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    width: 80 %;
    position: relative;
    overflow-y:auto;
    max-height: 700px;
}

.close-x {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 5px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #555;
}

.close-x:hover {
    color: #ff0000;
    /* Change to your desired hover color */
}

.close-button,
.save-button {
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.close-button {
    background-color: #f44336;
    color: white;
}

.save-button {
    background-color: #4CAF50;
    color: white;
    margin-left: 10px;
}

.close-button:hover {
    background-color: #d32f2f;
}

.save-button:hover {
    background-color: #45a049;
}

tbody td {
  padding: 30px;
}

tbody tr:nth-child(odd) {
  background-color: #4C8BF5;
  color: #fff;
}

.column {
  float: left;
  width: 50%;
}

.row:after {
  content: "";
  display: table;
  clear: both;
}


</style>
  
