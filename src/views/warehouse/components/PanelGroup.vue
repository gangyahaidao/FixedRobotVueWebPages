<template>
  <el-row class="panel-group" :gutter="40" v-loading="listLoading">
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class='card-panel'>
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="money" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">总库存</div> <!-- 计算所有商品的当前库存总量 -->
          <count-to class="card-panel-num" :startVal="0" :endVal="totalRepertory" :duration="1000"></count-to>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="component" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">累计进货</div> <!-- 查找GoodsReplenishLog表中累加currentReplenishCount字段的值 -->
          <count-to class="card-panel-num" :startVal="0" :endVal="grandTotalStock" :duration="1000"></count-to>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="excel" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">累计出货</div> <!-- 查询所有订单统计销售数量 -->
          <count-to class="card-panel-num" :startVal="0" :endVal="grandTotalShipment" :duration="1000"></count-to>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { getGoodsReplenishDataList } from '@/api/datareport'

export default {
  components: {
    CountTo
  },
  created() {
    // this.getGoodsReplenishData() // 获取仓库补货相关数据
  },
  data() {
    return {
      listLoading: false,
      totalRepertory: 0,
      grandTotalStock: 0,
      grandTotalShipment: 0
    }
  },
  methods: {
    getGoodsReplenishData() {
      getGoodsReplenishDataList().then(response => {
        if (response.data.code === 0) {
          this.listLoading = false
          this.totalRepertory = response.data.totalRepertory
          this.grandTotalStock = response.data.grandTotalStock
          this.grandTotalShipment = response.data.grandTotalShipment
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.panel-group {
  margin-top: 10px;
  .card-panel-col{
    margin-bottom: 22px;
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
      margin-left: 0px;
      text-align: center;
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
