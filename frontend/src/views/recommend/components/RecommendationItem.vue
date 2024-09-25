<template>
  <el-container>
    <el-aside>
      <div class="sidebar">
        <button class="sidebarLinks" @click="openPopup('label', $event)">专利标签</button>
        <button class="sidebarLinks" @click="openPopup('expert', $event)">专门知识</button>
        <button class="sidebarLinks" @click="openPopup('rpc', $event)">RPC</button>
        <button class="sidebarLinks" @click="openPopup('other', $event)">此外</button>
      </div>
    </el-aside>

    <div class="modal" v-if="showPopup">
      <div class="modal-content" ref="modalRef">

        <div class="modal-header">
          <h1 v-if="showLabel">Labels</h1>
          <h1 v-if="showExpert">Expert</h1>
          <h1 v-if="showRPC">RPC</h1>
          <h1 v-if="showOther">Other</h1>
        </div>

        <div class="modal-body">
          <div v-if="showLabel">
            没有标签 <br>
            <input
             type="text"
             placeholder="输入标签"/>
          </div>

          <div v-if="showExpert">
            没有专门知识 <br>
            <input
             type="text"
             placeholder="输入专门知识"/>
          </div>

          <div v-if="showRPC">
            没有 RPCs <br>
            <input
             type="text"
             placeholder="输入RPCs"/>
          </div>

          <div v-if="showOther">
            没有戏外<br>
            <input
             type="text"
             placeholder="输入此外"/>
          </div>

        </div>

        <div class="modal-footer">
          <el-button class="close-button" @click="closePopup">关</el-button>
          <el-button class="save-button" @click="save">保存</el-button>
        </div>
      </div>
    </div>


    <div class="recommendation-item">

      <div class="patent-table">
        <div class="pubNum"><a :href="'https://patents.google.com/patent/' + pubNum.replaceAll('-', '') + '/en'" target="_blank" rel="noopener">{{ pubNum }}</a> <!--- <el-button class="translateBtn">�<el-button> --->  </div>
        <div class="field"> <div class="fieldname"> 方案：</div> <div class="patent-cell"> {{ proposition }} </div></div>
        <div class="field"> <div class="fieldname"> 问题：</div> <div class="patent-cell"> {{ problem }} </div></div>
        <div class="field"> <div class="fieldname"> 效果：</div><div class="patent-cell"> {{ result }} </div></div>
        <div class="field"> <div class="fieldname"> 标签：</div> <div class="patent-cell"> {{ tags }} </div></div>
      </div> 

      <div class="feedback-buttons" id="feedback-buttons">
          (不相似) <input type="radio" :name="'feedback' + index.toString()" value="0">0
          <input type="radio" :name="'feedback' + index.toString()" value="1">1
          <input type="radio" :name="'feedback' + index.toString()" value="2">2
          <input type="radio" :name="'feedback' + index.toString()" value="3">3
          <input type="radio" :name="'feedback' + index.toString()" value="4">4
          <input type="radio" :name="'feedback' + index.toString()" value="5">5 (相似)
      </div>

    </div>
  </el-container>
</template>

<script>

export default {
  name: 'RecommendationItem',
  props: {
    //title: {
    //  type: String,
    //  required: true
    //},
    //abstract: {
    //  type: String,
    //  required: true
    //},
    pubNum: {
      type: String,
      required: true
    },
    proposition: {
      type: String,
      required: true
    },
    problem: {
      type: String,
      required: true
    },
    result: {
      type: String,
      required: true
    },
    tags: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      showPopup : false,
      showLabel : false,
      showExpert : false,
      showRPC : false,
      showOther : false,
      mouseX: 0,
      mouseY: 0
    }
  },
  methods: {
    openPopup(type, event) {
      this.showPopup = true
      var bodyStyles = document.body.style;
      bodyStyles.setProperty('--button-left', event.clientX.toString() + "px");
      bodyStyles.setProperty('--button-top', (event.clientY-220).toString() + "px"); // Based on height of modal
      if (type == "label") {
        this.showLabel = true;
      } else if (type == "expert") {
        this.showExpert = true;
      } else if (type == "rpc") {
        this.showRPC = true;
      } else if (type == "other") {
        this.showOther = true;
      }
      document.addEventListener('mouseup', this.closeModalOnClickOutside)
      document.addEventListener('wheel', this.closeModalOnClickOutside)
    },
    closePopup() {
      this.showPopup = false;
      this.showLabel = false;
      this.showExpert = false;
      this.showRPC = false;
      this.showOther = false;
      document.removeEventListener('mouseup', this.closeModalOnClickOutside)
      document.removeEventListener('wheel', this.closeModalOnClickOutside)
    },
    closeModalOnClickOutside(event) {
      const modal = this.$refs.modalRef
      if (!modal.contains(event.target)) {
        this.closePopup()
      }
    },
    save() {
      console.log("saved");
    }
  }
}
</script>

<style scoped>

.recommendation-item {
  width: 100%;
  margin: 0 auto;
  /* 居中对齐 */
  margin-bottom: 20px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.sidebar {
  float:left;
  height: 100px;
  padding-top:5%;
  margin-right:5px;
}

.sidebar button {
  display: block;
  text-align:center;
  width: 100%;
  height:35px;
  margin-top: 10px;
  background-color: #0078d7;
  color: white;
  font-weight: bold;
  border: 1px;
}

.sidebar button:hover {
  background-color: #00539b;
}

.sidebar button:active {
  background-color: #004b8c;
}

.title {
  font-size: 20px;
}

.pubNum {
  margin-top: 5px;
  font-weight: bold;
  font-size: 20px;
}

.abstract {
  margin-top: 5px;
  font-size: 16px;
  line-height: 1.5em;
  overflow: hidden;
  white-space: normal;
  text-overflow: ellipsis;
  max-height: 4.5em;
}

.abstract:hover {
  text-overflow: inherit;
  overflow: visible;
  max-height: 100em;
}

.abstract-nohidden {
  margin-top: 5px;
  font-size: 16px;
  line-height: 1.5em;
}

.feedback-buttons{
  display: inline-block;
  margin-top: 5px;

}

.patent-table {
  text-align:center;
}

.field {
  padding-bottom: 7px;
  padding-top: 7px;
  display: flex;
  margin-top: 4px;
  margin-bottom: 4px;
  justify-content: space-between;
  border-bottom: solid;
  border-width: 1px;
}

.fieldname {
  text-align:left;
  font-size:16px;
  font-weight: bold;
  float: left;
}

.patent-cell {
 /* display: inline-block;*/
  overflow:hidden;
  text-overflow: ellipsis; 
  width: 90%;
  text-align:left;
  float: right;
  max-height: 4.5em;
  line-height: 1.5em;
}

.patent-cell:hover {
  text-overflow: inherit;
  overflow:visible;
  max-height: 100em;
}


:root {
  --button-top: 0;
  --button-left: 0;
}

.modal {
  position: absolute;
  top: var(--button-top);
  left: var(--button-left);
  align-items: center;
  justify-content: center;
  z-index: 9999;
  width: 400px;
  height: 200px;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  max-width: 500px;
  width: 80 %;
  position: relative;
  overflow-y: auto;
  max-height: 700px;
  border: 1px solid #ccc;
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

.translateBtn {
  margin-left: 10px;
  text-align:center;
  background-color: #0078d7;
  color: white;
  font-weight: bold;
  border: 1px;
}

</style>
