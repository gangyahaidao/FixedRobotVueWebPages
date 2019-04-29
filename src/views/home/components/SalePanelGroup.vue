<template>
  <el-row class="panel-group" :gutter="40" v-loading="upListLoading">
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class='card-panel'>
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon icon-class="money" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">总收入</div>
          <count-to class="card-panel-num" :startVal="0" :endVal="upPanelDataObj.totalSaleMoney" :duration="1000" :decimals=2 style="border-right: 1px solid #444;padding-right: 5px;"></count-to> <!-- 显示保持两位小数 -->
          <count-to class="card-panel-num" :startVal="0" :endVal="upPanelDataObj.totalSaleCoin" :duration="1000" style="padding-left:10px;"></count-to>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-shoppingCard">
          <svg-icon icon-class="shoppingCard" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">总销量数</div>
          <count-to class="card-panel-num" :startVal="0" :endVal="upPanelDataObj.totalSaleCount" :duration="1000"></count-to>
        </div>
        <div class="card-panel-description  week">
          <div class="card-panel-text">今天销售数</div>
          <count-to class="card-panel-num" :startVal="0" :endVal="upPanelDataObj.todaySaleCount" :duration="1000"></count-to>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="people" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">累计服务人次</div>
          <count-to class="card-panel-num" :startVal="0" :endVal="upPanelDataObj.totalServeCount" :duration="1000"></count-to>
        </div>
        <div class="card-panel-description month">
          <div class="card-panel-text">今天服务人次</div>
          <count-to class="card-panel-num" :startVal="0" :endVal="upPanelDataObj.todayServeCount" :duration="1000"></count-to>
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
    upPanelDataObj: {
      type: Object
    },
    upListLoading: {
      type: Boolean,
      default: true
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
  margin-top: 18px;
  .card-panel-col{
    margin-bottom: 22px;
  }
  .week,.month{
    float:left;
    padding-right: 15px;
    border-right: 1px solid #444;
  }
  .card-panel {
    height: 108px;
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
      color: #67C23A;
    }
    .icon-money {
      color: #f4516c;
    }
    .icon-shoppingCard {
      color: #34bfa3
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
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
      margin: 26px;
      text-align: center;
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
    }
  }
}
</style>
