<template>
  <div class="dashboard-editor-container">
    <el-select v-model="floorName" @change="changeSelect" placeholder="请选择楼层">
      <el-option-group v-for="group in floorOptions" :key="group.label" :label="group.label">
        <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-option-group>
    </el-select>
    <el-select v-model="saleDuration" @change="changeSelect" placeholder="请选择时间段" v-loading="listLoading">
      <el-option v-for="item in saleTimeDuration" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
    <panel-group :saleMoney="saleMoney" :saleCount="saleCount" :scanPeopleCount="scanPeopleCount" :payPeopleCount="payPeopleCount"></panel-group> <!-- 加载显示收入销量等数据 -->

    <el-row :gutter="20">
      <el-col :xs="12" :sm="12" :lg="16">
        <div class="chart-container">
           <chart height="560px" width="100%"/>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="8" style="background: #fff;">
        <h3 class="ranking">本月商品销量排行榜</h3>
        <el-table :data="goodsSellCountList" row-key="id"  v-loading="listLoading2" border fit highlight-current-row height="500px">
          <el-table-column min-width="200px" align="center" label="商品名称">
            <template slot-scope="scope">
              <span>{{scope.row.name}}</span>
            </template>
          </el-table-column>
          <el-table-column width="180px" align="center" label="商品销量">
            <template slot-scope="scope">
              <span>{{scope.row.monthSellCount}}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

     <el-row class="sales"  :gutter="20">
       <h3 class="ranking">零售机器人</h3>
      <el-col :xs="12" :sm="12" :lg="16">
        <div class="chart-container">
           <robot-week-chart height='560px' width='100%'></robot-week-chart>
        </div>
      </el-col>
      <el-col  :xs="12" :sm="12" :lg="8">
          <div class="grid-content bg-purple-light">
            <panel-group-s :saleMoney="saleMoney" :saleCount="saleCount" :scanPeopleCount="scanPeopleCount" :payPeopleCount="payPeopleCount"></panel-group-s> <!-- 加载显示收入销量等数据 -->
          </div>
          
      <h3 style="padding-left: 10px;">同比增长率</h3>
        <div class="pull-right">
          <el-progress type="circle" :percentage="10"></el-progress>
          <br>
          <span>同比增长率</span>
        </div>
        <div class="pull-right">
          <el-progress type="circle" :percentage="10"></el-progress>
          <br>
          <span>同比增长率</span>
        </div>
        <div class="pull-right">
          <el-progress type="circle" :percentage="10"></el-progress>
          <br>
          <span>同比增长率</span>
        </div>
      </el-col>
     </el-row>
  </div>
</template>

<script>
import PanelGroupS from './components/PanelGroupS'
import PanelGroup from './components/PanelGroup'
import Chart from '@/components/Charts/saleStatistics'
import RobotWeekChart from './components/robotGoodsWeekChart'
import { getPanelStatisticsData, getGoodsSellCountInMonth } from '@/api/datareport'

export default {
  name: 'saleStatistic',
  components: {
    PanelGroupS,
    PanelGroup,
    Chart,
    RobotWeekChart
  },
  data() {
    return {
      listLoading: true,
      listLoading2: true,
      saleMoney: 0.0,
      saleCount: 0,
      scanPeopleCount: 0,
      payPeopleCount: 0,
      floorOptions: [{
        options: [{
          value: 'allFloors',
          label: '所有楼层'
        }]
      }, {
        options: [{
          value: 'floor1',
          label: '商场一层'
        }]
      }, {
        options: [{
          value: 'floor2',
          label: '商场二层'
        }]
      }, {
        options: [{
          value: 'floor3',
          label: '商场三层'
        }]
      }],
      floorName: 'allFloors', // 当前要查询的楼层
      saleDuration: 'currentDay', // 查询的时间段
      saleTimeDuration: [{
        value: 'currentDay',
        label: '今天'
      }, {
        value: 'foreWeek',
        label: '前一周'
      }, {
        value: 'foreMonth',
        label: '前一个月'
      }],
      goodsSellCountList: null
    }
  },
  created() {
    this.getSaleStatisticsData() // 获取金额销售数量等统计
    this.getMonthGoodsSellCount() // 获取本月商品销量排行榜
  },
  methods: {
    getSaleStatisticsData() { // 根据条件更新统计数据
      getPanelStatisticsData(this.floorName, this.saleDuration).then(response => {
        if (response.data.code === 0) {
          this.saleMoney = response.data.saleMoney
          this.saleCount = response.data.saleCount
          this.scanPeopleCount = response.data.scanPeopleCount
          this.payPeopleCount = response.data.payPeopleCount
          this.listLoading = false
        }
      })
    },
    changeSelect(val) {
      this.getSaleStatisticsData()
    },
    getMonthGoodsSellCount() {
      getGoodsSellCountInMonth().then(response => {
        if (response.data.code === 0) {
          this.goodsSellCountList = response.data.goodsSellCountList
          this.listLoading2 = false
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
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}
.chart-container{
  position: relative;
  width: 100%;
}
.sales{
  background: #fff;
  margin-top: 15px;
  padding: 0 15px;
}
.pull-left{
  height: 130px;
  background: #f00;
  vertical-align: middle;
  border-radius: 50%;
  padding-top: 50px;
  width: 130px;
  text-align: center;
  color: #ffffff;
}
.pull-right{
  text-align: center;
  width: 33%;
  float: left;
}
</style>
