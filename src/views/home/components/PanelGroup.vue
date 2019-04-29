<template>
  <el-row class="panel-group" :gutter="40" v-loading="downListLoading">
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class='card-panel' style="background:#FFCC66;">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="money" class-name="card-panel-icon" />
        </div>
        <div class="sales">今日销售额</div>
        <div class="card-panel-description">
          <div class="card-panel-text">金额：</div>
          <count-to class="card-panel-num" :startVal="0" :endVal="downPanelDataObj.todaySaleMoney" :duration="1500" :decimals=2></count-to> <!-- 显示保持两位小数 -->
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">金币：</div>
          <count-to class="card-panel-num" :startVal="0" :endVal="downPanelDataObj.todaySaleCoin" :duration="1500"></count-to> <!-- 显示保持整数 -->
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class="card-panel"  style="background:#9999FF;">
        <div class="card-panel-icon-wrapper icon-success">
          <svg-icon icon-class="star" class-name="card-panel-icon" />
        </div>
        <div class="sales">本周销售额</div>
        <div class="card-panel-description">
          <div class="card-panel-text">金额：</div>
          <count-to class="card-panel-num" :startVal="0" :endVal="downPanelDataObj.weekSaleMoney" :duration="1500" :decimals=2></count-to>
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">金币：</div>
          <count-to class="card-panel-num" :startVal="0" :endVal="downPanelDataObj.weekSaleCoin" :duration="1500"></count-to>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class="card-panel"  style="background:#669999;">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="sales">本月销售额</div>
        <div class="card-panel-description">
          <div class="card-panel-text">金额：</div>
          <count-to class="card-panel-num" :startVal="0" :endVal="downPanelDataObj.monthSaleMoney" :duration="1500" :decimals=2></count-to>
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">金币：</div>
          <count-to class="card-panel-num" :startVal="0" :endVal="downPanelDataObj.monthSaleCoin" :duration="1500"></count-to> <!-- 显示保持两位小数 -->
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
    downPanelDataObj: {
      type: Object
    },
    downListLoading: {
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
    margin-bottom: 20px;
  }
  .sales{
        text-align: center;
        font-size: 20px;
        clear: both;
        margin: 10px auto;
      }
  .card-panel {
    height: 188px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #fff;
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
        background: #40c9c6;
      }
      .icon-money {
        background: #f4516c;
      }
      .icon-shoppingCard {
        background: #34bfa3
      }
      .icon-success{
         background: #40c9c6;
      }
    }
    .icon-people {
      color: #ffffff;
    }
    .icon-message {
      color: #ffffff;
    }
    .icon-money {
      color: #f4516c;
    }
    .icon-shoppingCard {
      color: #34bfa3
    }
    .card-panel-icon-wrapper {
      padding: 16px 45%;
      text-align: center;
      transition: all 0.38s ease-out;
      border-radius: 6px;
      height: 80px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      float: left;
      font-weight: bold;
      margin: 20px 0;
      margin-left: 0px;
      width: 50%;
      font-weight: normal;
      padding: 0 15px;
      text-align: center;
      .card-panel-text {
        color: #fff;
        font-size:18px;
        padding: 0 12px;
        float:left;
        width: 50%;
        text-align:right;
      }
      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}
</style>
