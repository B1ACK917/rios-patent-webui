<template>
  <div class="search-page">
    <div class="search-container">
      <!-- <div class="search-header">
          <img src="./assets/favicon.png" alt="Logo" />
        </div> -->
      <search-box
        @showRecommendation="showRecommendation"
        @setLoading="setLoading"></search-box>
    </div>
    <div v-loading="recommendLoading">
      <div class="recommendations">
        <br />
        <el-button
          type="primary"
          :icon="ElIconUpload"
          @click="saveExec"
          id="saveBtn">Save Feedback</el-button>
        <div class="recommendation-list">
          <recommendation-item
            v-for="(item, index) in recommendations"
            :key="item.pubNum"
            :title="item.title"
            :pubNum="item.pubNum"
            :abstract="item.abstract"
            :index="index"></recommendation-item>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { Upload as ElIconUpload } from '@element-plus/icons-vue'
import {shallowRef} from "vue";
import SearchBox from './components/SearchBox.vue'
import RecommendationItem from './components/RecommendationItem.vue'

export default {
  data() {
    return {
      recommendations: [],
      recommendation_feedback: [],
      recommendLoading: false,
      ElIconUpload: shallowRef(ElIconUpload),
    }
  },
  name: 'SearchPage',
  components: {
    'search-box': SearchBox,
    'recommendation-item': RecommendationItem,
    ElIconUpload,
  },
  methods: {
    async setLoading(status) {
      this.recommendLoading = status
    },
    async saveExec() {
      let recitem_index = 3
      var recommendation_items = document.getElementsByClassName(
        'recommendation-item '
      )
      for (let i = 0; i < recommendation_items.length; i++) {
        let feedback = recommendation_items[i].children[recitem_index].children
        let title = recommendation_items[i].children[0].children[0].innerHTML
        let pubNum =
          recommendation_items[i].children[1].innerHTML.split(': ')[1]
        let abstract = recommendation_items[i].children[2].innerHTML
        for (let j = 0; j < feedback.length; j++) {
          if (feedback[j].checked) {
            let sentiment = feedback[j].value
            this.recommendation_feedback.push({
              title,
              pubNum,
              abstract,
              sentiment,
            })
          }
        }
      }
      console.log(this.recommendation_feedback[0].sentiment)
    },
    async showRecommendation(items) {
      this.recommendations = []
      for (let i = 0; i < items.length; i++) {
        let pubNum = items[i].publication_number
        let title = items[i].title
        let abstract = items[i].abstract
        this.recommendations.push({
          title,
          pubNum,
          abstract,
        })
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
  width: 800px;
  margin-top: 20px;
}
</style>
