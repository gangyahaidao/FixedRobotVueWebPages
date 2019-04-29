<template >
  <div class="dashboard-editor-container">
     <h3 class="ranking">路径监控</h3>
    <el-radio-group v-model="labelPosition" size="medium" class="menu">
        <el-radio-button label="right">1F</el-radio-button>
        <el-radio-button label="top">2F</el-radio-button>
        <el-radio-button label="top">3F</el-radio-button>
    </el-radio-group>
  </div>
</template>


<script>
  export default {
    data() {
      return {
        activeName2: 'first'
      }
    },
    methods: {
      handleClick(tab, event) {
        console.log(tab, event)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding:5px 32px;
  background-color: rgb(240, 242, 245);
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}
</style>
