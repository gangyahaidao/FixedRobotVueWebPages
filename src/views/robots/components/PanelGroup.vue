<template>
  <el-row class="panel-group">
    <el-col :xs="12" :sm="12" :lg="24" class="card-panel-col">
      <div class='card-panel'>
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="user" class-name="card-panel-icon" />
        </div>
        <div class="card-name">
          <span class="card-panel-text">累计行程</span>
        </div>
        <div class="card-panel-description">
          <count-to class="card-panel-num" :startVal="0" :endVal="robotPanelObj.totalRunPathCount" :duration="1000" :decimals=2></count-to> <!-- 显示保持两位小数 -->
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="24" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="guide" class-name="card-panel-icon" />
        </div>
        <div class="card-name">
          <span class="card-panel-text">累计服务人次</span>
        </div>
        <div class="card-panel-description">
          <count-to class="card-panel-num" :startVal="0" :endVal="robotPanelObj.totalServePeopleCount" :duration="1000"></count-to>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="24" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-name">
          <span class="card-panel-text">累计销量</span>
        </div>
        <div class="card-panel-description">
          <count-to class="card-panel-num" :startVal="0" :endVal="robotPanelObj.totalSaleCount" :duration="1000"></count-to>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="24" class="card-panel-col">
      <div class='card-panel run'>
        <div class="card-panel-icon-wrapper icon-people run">
          <svg-icon icon-class="money" class-name="card-panel-icon" />
        </div>
        <div class="card-name">
          <span class="card-panel-text">累计销售金额</span>
        </div>
        <div class="card-panel-description">
          <count-to class="card-panel-num" :startVal="0" :endVal="robotPanelObj.totalSaleMoney" :duration="1000" :decimals=2></count-to> <!-- 显示保持两位小数 -->
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="24" class="card-panel-col" style="margin-bottom:0px;">
      <div class="card-panel run">
        <div class="card-panel-icon-wrapper icon-message run">
          <svg-icon icon-class="star" class-name="card-panel-icon" />
        </div>
        <div class="card-name">
          <span class="card-panel-text">累计销售金币额</span>
        </div>
        <div class="card-panel-description">
          <count-to class="card-panel-num" :startVal="0" :endVal="robotPanelObj.totalSaleCoin" :duration="1000"></count-to>
        </div>
      </div>
    </el-col>
  </el-row>

</template>

<script>
import CountTo from 'vue-count-to'

export default {
  components: {
    CountTo
  },
  props: {
    robotPanelObj: {
      type: Object
    }
  },
  data() {
    return {

    }
  },
  methods: {

  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.panel-group {
  background: #fff;
  margin-left: 10px;
  .card-panel-col{
    margin-bottom:15px;
  }
  .card-panel {
    height: 73px;
    line-height: 73px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .icon-people {
         background: #40c9c6;
      }
      .icon-message {
        background: #36a3f7;
      }
      .icon-money {
        background: #f4516c;
      }
      .icon-shoppingCard {
        background: #34bfa3
      }
    }
    .icon-people {
      color: #40c9c6;
    }
    .icon-message {
      color: #36a3f7;
    }
    .icon-money {
      color: #f4516c;
    }
    .icon-shoppingCard {
      color: #34bfa3
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 0;
      padding: 10px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      float: right;
      font-weight: bold;
      margin:5px 26px;
      margin-left: 0px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
      .card-panel-icon-wrapper{
        float:left !important;
      }
      .card-panel-num {
        font-size: 20px;
      }
      .card-panel-text{
         padding: 26px;
         font-size: 18px;
      }
      .run{
        padding: 16px 40%;
        text-align: center;
        -webkit-transition: all 0.38s ease-out;
        transition: all 0.38s ease-out;
        border-radius: 6px;
        height: 80px;
      }
    }
      .card-name{
        width: 200px;
        font-size: 18px;
        margin-left:35px;
        float:left;
      }
  }
}
</style>
