<template>
  <div class="search-page">

     <el-form class="patent-header" :inline="true">
         <el-form-item>
         <div class="patent-header-text"> 专利推荐系统 </div>
         </el-form-item>
         <el-form-item>
            <el-dropdown @command="handleCommand" :disabled="disableDropdown">
              <el-button class="dropdown" type="primary">
                {{searchType}}<el-icon class="el-icon--right"><ElArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{action: 'invalidation'}">专利无效推荐</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'defense'}">防专利侵权推荐</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'general'}">专利通用推荐</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
         </el-form-item>
     </el-form>

    <el-container>
      <el-header class="header-tabs">
      <b>搜索方式: </b>
        <el-tabs class="demo-tabs" :stretch="true" @tab-click="handleTabClick">

          <el-tab-pane label="作用">

            <div class="search-container">
              <invalid-box v-if="showInvalid"
                @showRecommendation="showRecommendation"
                @setLoading="setLoading"></invalid-box>
              <gen-box v-if="showGeneral"
                @showRecommendation="showRecommendation"
                @setLoading="setLoading"></gen-box>
              <id-box v-if="showInfringement"
                @showRecommendation="showRecommendation"
                @setLoading="setLoading"></id-box>
                <br />
            </div>
          </el-tab-pane>

          <el-tab-pane label="专利标签">
            <div class="search-container">
              <label-box  v-if="showLabels"
                @showRecommendation="showRecommendation"
                @setLoading="setLoading"></label-box>
                <br />
            </div>
          </el-tab-pane>

          <el-tab-pane label="专门知识">
            <div class="search-container">
              <ek-box v-if="showEK" 
                @showRecommendation="showRecommendation"
                @setLoading="setLoading"></ek-box>
                <br />
            </div>
          </el-tab-pane>

          <el-tab-pane label="RPC">
            <div class="search-container">
              <rpc-box v-if="showRPC"
                @showRecommendation="showRecommendation"
                @setLoading="setLoading"></rpc-box>
                <br />
            </div>

          </el-tab-pane>
        </el-tabs>
      </el-header>
    </el-container>
      
    <div v-loading="recommendLoading" v-if="showFeedback" class="feedbackContainer">
      <h3><b> {{ query }}</b></h3>

      <el-button
        class="feedback-btn"
        v-if="showFeedback"
        type="primary"
        :loading="feedback_clicked"
        @click="saveExec"
        id="saveBtn">保存反馈</el-button>

      <div class="recommendations">
        <div class="recommendation-list">
          <recommendation-item
            v-for="(item, index) in slicedRecommendations"
            :key="item.pubNum"
            :pubNum="item.pubNum"
            :proposition="item.proposition"
            :problem="item.problem"
            :result="item.result"
            :tags="item.tags"
            :index="index"></recommendation-item>
            <!---:title="item.title"
            :abstract="item.abstract" --->
        </div>
      </div>
      <div class="pageCtrls">
        <button @click="prevPage" class = "pageCtrl"> 上 </button>
        <button  v-for="n in this.totalRecs" class="link" @click="nextNRecs(n)" :key="n"> <u> {{n}} </u> </button>
        <button @click="nextPage" class = "pageCtrl"> 下 </button>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { Upload as ElIconUpload } from '@element-plus/icons-vue'
import { ArrowDown as ElArrowDown} from '@element-plus/icons-vue'
import {shallowRef} from "vue";
import InvalidBox from './components/InvalidBox.vue';
import IDBox from './components/IDBox.vue';
import GeneralBox from './components/GeneralBox.vue';
import LabelBox from './components/LabelsBox.vue';
import EKBox from './components/EKBox.vue';
import RPCBox from './components/RPCBox.vue';
import RecommendationItem from './components/RecommendationItem.vue'
const delay = ms => new Promise(res => setTimeout(res, ms));

export default {
  data() {
    return {
      perPage : 10,
      currPage: 1, 
      totalRecs: 0,
      disableDropdown: false,
      showInvalid: true,
      showGeneral: false,
      showInfringement: false,
      showFeedback: false,
      showLabels: false,
      showEK: false,
      showRPC: false,
      feedback_clicked: false,
      searchType: "专利无效推荐",
      query: "",
      recommendations: [],
      slicedRecommendations: [],
      functionBackup: [],
      labelsBackup: [],
      ekBackup: [],
      rpcBackup: [],
      recommendation_feedback: [],
      recommendLoading: false,
      ElIconUpload: shallowRef(ElIconUpload),
    }
  },
  name: 'SearchPage',
  components: {
    'invalid-box': InvalidBox,
    'gen-box': GeneralBox,
    'id-box': IDBox,
    'label-box': LabelBox,
    'ek-box': EKBox,
    'rpc-box': RPCBox,
    'recommendation-item': RecommendationItem,
    ElIconUpload,
    ElArrowDown,
  },
  methods: {
    changeDropdownColor(color) {
      let dropdown = document.getElementsByClassName("dropdown")[0];
      console.log(dropdown);
      if (color == "blue") {
        dropdown.style.backgroundColor = "#0078d7";
      } else if (color == "gray") {
        dropdown.style.backgroundColor = "gray";
      }
    },
    handleTabClick(tab, event) {
      if (tab.props.label=="作用") {
        this.recommendations = this.functionBackup;
        this.slicedRecommendations = this.recommendations.slice(0, this.perPage);
        this.showInfringement=false;
        this.showFeedback = false;
        this.showLabels = false;
        this.showEK = false;
        this.showRPC = false;
        if (this.searchType == "专利无效推荐") {
          this.showInvalid = true;
        } else if (this.searchType == "专利通用推荐") {
          this.showGeneral = true;
        } else if (this.searchType == "防专利侵权推荐") {
          this.showInfringement = true; 
        }
        this.disableDropdown = false;
        this.changeDropdownColor("blue");
      } else if (tab.props.label=="专利标签") {
        this.recommendations = this.labelsBackup;
        this.slicedRecommendations = this.recommendations.slice(0, this.perPage);
        this.showInvalid=false;
        this.showGeneral=false;
        this.showInfringement=false;
        this.showFeedback = false;
        this.showLabels = true;
        this.showEK = false;
        this.showRPC = false;
        this.disableDropdown = true;
        this.changeDropdownColor("gray");
      } else if (tab.props.label=="专门知识") {
        this.recommendations = this.ekBackup;
        this.slicedRecommendations = this.recommendations.slice(0, this.perPage);
        this.showInvalid=false;
        this.showGeneral=false;
        this.showInfringement=false;
        this.showFeedback = false;
        this.showLabels = false;
        this.showEK = true;
        this.showRPC = false;
        this.disableDropdown = true;
        this.changeDropdownColor("gray");
      } else if (tab.props.label=="RPC") {
        this.recommendations = this.rpcBackup;
        this.slicedRecommendations = this.recommendations.slice(0, this.perPage);
        this.showInvalid=false;
        this.showGeneral=false;
        this.showInfringement=false;
        this.showFeedback = false;
        this.showLabels = false;
        this.showEK = false;
        this.showRPC = true;
        this.disableDropdown = true;
        this.changeDropdownColor("gray");
      }
    },
    async setLoading(status) {
      this.recommendLoading = status
    },
    handleCommand (command) {
      if (command.action === 'invalidation') {
        this.recommendations = [];
        this.slicedRecommendations = [];
        this.searchType = "专利无效推荐"
        this.showInvalid=true;
        this.showGeneral=false;
        this.showInfringement=false;
        this.showFeedback = false;
      }
      else if (command.action === 'defense') {
        this.recommendations = [];
        this.slicedRecommendations = [];
        this.searchType = "防专利侵权推荐"
        this.showInvalid=false;
        this.showGeneral=false;
        this.showInfringement=true;
        this.showFeedback = false;
      }
      else if (command.action === 'general') {
        this.searchType = "专利通用推荐"
        this.recommendations = [];
        this.slicedRecommendations = [];
        this.showInvalid=false;
        this.showGeneral=true;
        this.showInfringement=false;
        this.showFeedback = false;
      }
    },
    async saveExec() {
      this.feedback_clicked = true;
      await delay(1000);

      let recitem_index = 1
      var recommendation_items = document.getElementsByClassName(
        'recommendation-item'
      )
      for (let i = 0; i < recommendation_items.length; i++) {
        let feedback = recommendation_items[i].children[1].children
        let pubNum =
          recommendation_items[i].children[0].children[0].textContent;
        for (let j = 0; j < feedback.length; j++) {
          if (feedback[j].checked) {
            let sentiment = feedback[j].value
            this.recommendation_feedback.push({
              pubNum,
              sentiment,
            })
          }
        }
      }
      console.log(recommendation_items);
      this.feedback_clicked = false;
    },
    async showRecommendation(items, query) {
      this.recommendations = []
      this.slicedRecommendations = [];
      this.query=query;
      this.showInvalid=false;
      this.showGeneral=false;
      this.showInfringement=false;
      this.showLabels = false;
      this.showRPC = false;
      this.showEK = false;
      for (let i = 0; i < items.length; i++) {
        let pubNum = items[i].publication_number;
        let proposition = items[i].method;
        let problem = items[i].problem;
        let result = items[i].effect;
        let tags = "当前没有标签。。。";
        this.recommendations.push({
          pubNum,
          proposition,
          problem,
          result,
          tags
        })
      }
      if (this.showInvalid || this.showGeneral || this.showInfringement) {
        this.functionBackup = this.recommendations; 
      } else if (this.showLabels) {
        this.labelsBackup = this.recommendations;
      } else if (this.showEK) {
        this.ekBackup = this.recommendations;
      } else if (this.showRPC) {
        this.rpcBackup = this.recommendations;
      }
      this.slicedRecommendations = this.recommendations.slice(0, this.perPage);
      this.showFeedback = true;
      this.totalRecs = Math.ceil(this.recommendations.length/this.perPage);
      //for (let i = 0; i < items.length; i++) {
      //  let pubNum = items[i].publication_number
      //  let title = items[i].title
      //  let abstract = items[i].abstract
      //  this.recommendations.push({
      //    title,
      //    pubNum,
      //    abstract,
      //  })
      //}
    },
    nextNRecs(n) {
      this.currPage = n;
      this.slicedRecommendations = this.recommendations.slice((n-1)*this.perPage, n*this.perPage);
    },
    nextPage() {
      if (this.currPage < this.totalRecs) {
        this.currPage++;
        this.slicedRecommendations = this.recommendations.slice((this.currPage-1)*this.perPage,
                                                                this.currPage*this.perPage);
      }
    },
    prevPage() {
      if (this.currPage > 1) {
        this.currPage--;
        this.slicedRecommendations = this.recommendations.slice((this.currPage-1)*this.perPage,
                                                                this.currPage*this.perPage);
      }
    }
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

.search-header {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 80px;
  margin-bottom: 20px;
  margin-top: 20px;
}

.search-header img {
  max-width: 100%;
  max-height: 100%;
}

.recommendations {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 40px;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  margin-top: 20px;
}

.demo-tabs > .el-tabs__content {
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.el-tabs--right .el-tabs__content,
.el-tabs--left .el-tabs__content {
  height: 100%;
}

.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

.row:after {
  content: '';
  display: table;
  clear: both;
}

.feedback-btn {
  text-align:center;
  width: 10%;
  height:35px;
  background-color: #0078d7;
  color: white;
  font-weight: bold;
}

.dropdown {
  text-align:center;
  background-color: #0078d7;
  color: white;
  font-weight: bold;
}

.feedback-btn:hover {
  background-color: #00539b;
}

.feedback-btn:active {
  background-color: #004b8c;
}

.patent-header {
  margin-top:2%;
}

.patent-header-text {
  text-align:center;
  font-size: 30px;
}

.patent-container {
  width:100%;
}

button.link {
  background:none;
  font-size: 20px;
  border:none;
  color: #0078d7;

}

.pageCtrls{
  display:inline;

}

.pageCtrl {
  display:inline;
  background-color: #0078d7;
  color: white;
  border: none;
  font-size: 20px;
}


.header-tabs {
  text-align:center;
  align-items: center;
  float:center;
  min-width:555px; /* based on searchbox sizes */
}

.feedbackContainer {
  align-items: center;
  float:center;
  display: flex;
  flex-direction: column;

}


</style>
