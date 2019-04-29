<template>
  <div class="app-container">
    <div style="margin-top:-20px;">
      <h3><img src="./images/horn.png"  style="width:32px; vertical-align: middle;">
        <el-alert style="width:320px;display:inline-block;vertical-align: middle;font-size:16px;" :title="alertTitle" type="warning" :closable="false"></el-alert>
      </h3>
      <el-radio-group v-model="whichFloor" v-for="item in floorOptions" :key="item.value" @change="changeFloorName">
        <el-radio-button :label="item.floorName"></el-radio-button>
      </el-radio-group>
      <!-- 总收入，今日销售数量|总销售数量，今天服务人次|累计服务人次 -->
      <sale-panel-group :upPanelDataObj="upPanelDataObj" :upListLoading="upListLoading"></sale-panel-group>

      <!-- 今日销售额，本周销售额，本月销售额(包括金币的统计) -->
      <panel-group :downPanelDataObj="downPanelDataObj" :downListLoading="downListLoading"></panel-group> <!-- 加载显示收入销量等数据 -->
    </div>

    <el-row>
      <el-col :xs="12" :sm="12" :lg="24">
        <div class="chart-container">
          <chart height="400px" width="100%" ref="robotSellCountChart"/>
        </div>
      </el-col>
    </el-row>
    <el-container class="run">
      <el-header>
        <h3 class="ranking">机器人状态</h3>
        <hr style="border:3 double #987cb9" width="100%" color=#987cb9 size=1/>
      </el-header>
      <el-main>
        <el-table :data="tableList" row-key="id"  v-loading="listLoading" border fit highlight-current-row height="600px">
          <el-table-column align="center" label="序号" width="50"> <!-- 序号 -->
            <template slot-scope="scope">
              <span>{{scope.row.orderId}}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="150px" align="center" label="机器人名称">
            <template slot-scope="scope">
              <span class="link-type" @click="jumpToRobotDetailsPage(scope.row.machineId)">{{scope.row.robotName}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" width="120px" label="绑定路径">
            <template slot-scope="scope">
              <span class="link-type" @click="handleJumpToMap(scope.row.floor, scope.row.pathId)">{{scope.row.pathName}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" width="120px" label="绑定对话">
            <template slot-scope="scope">
              <span class="link-type" @click="handleJumpToTalkGroup(scope.row.talkId)">{{scope.row.talkGroupName}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" width="120px" label="绑定广告">
            <template slot-scope="scope">
              <span class="link-type" @click="handleJumpToAdDetailPage(scope.row.adId)">{{scope.row.adTemplateName}}</span>
            </template>
          </el-table-column>
          <el-table-column width="220px" align="center" label="售卖商品">
            <template slot-scope="scope">
              <span>{{scope.row.goodsListStr}}</span>
            </template>
          </el-table-column>
          <el-table-column width="80px" align="center" label="电量">
            <template slot-scope="scope">
              <span>{{scope.row.batteryPercent}}</span>
            </template>
          </el-table-column>
          <el-table-column width="100px" align="center" label="货柜状态">
            <template slot-scope="scope">
              <el-tag :type="scope.row.isRobotOutOfStore | robotContainerStatusFilter">{{scope.row.isRobotOutOfStore}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="启动时间" width="200">
            <template slot-scope="scope">
              <el-time-select style="width:100px" placeholder="请选择" v-model="scope.row.startTime" size="mini"
                :picker-options="{
                  start: '08:30',
                  step: '00:15',
                  end: '22:30'
                }">
              </el-time-select>
            </template>
          </el-table-column>
          <el-table-column align="center" label="结束时间" width="200">
            <template slot-scope="scope">
              <el-time-select style="width:100px" placeholder="请选择" v-model="scope.row.endTime" size="mini"
                :picker-options="{
                  start: '08:30',
                  step: '00:15',
                  end: '22:30',
                  minTime: scope.row.startTime
                }">
              </el-time-select>
            </template>
          </el-table-column>
          <el-table-column align="center" class-name="status-col" label="状态" width="80"> <!-- 机器人状态 -->
            <template slot-scope="scope">
              <el-tag :type="scope.row.status | statusFilter">{{scope.row.status}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" width="180px" label="操作">
            <template slot-scope="scope">
              <el-button type="success" size="mini" :circle="false" @click="startEngineRobot(scope.row)">启动</el-button>
              <el-button type="danger" size="mini" :circle="false" @click="sendRobotStopLoopCmd(scope.row.machineId)">停止</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('vendors.actions')" width="130" class-name="small-padding fixed-width"> <!-- 进行操作的按钮列 -->
            <template slot-scope="scope">
              <el-button type="success" @click="jumpToRobotDetailsPage(scope.row.machineId)">机器人详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>

  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import SalePanelGroup from './components/SalePanelGroup'
import Chart from './components/RobotWeekLineChart'
import { getSaleMoneyByFloorName } from '@/api/homepage'
import { updateRobotControlInfo, sendRobotStopLoop, getRobotMonitorInfo } from '@/api/robots'

const floorOptionsConst = [
  { value: 'all', floorName: '全部楼层' },
  { value: 'floor1', floorName: '一楼' },
  { value: 'floor2', floorName: '二楼' },
  { value: 'floor3', floorName: '三楼' }
]
const ReplaceFloorName = floorOptionsConst.reduce((acc, cur) => {
  acc[cur.floorName] = cur.value // 根据floorName的值获取value的值
  return acc
}, {})

export default {
  components: { PanelGroup, Chart, SalePanelGroup },
  name: 'complexTable',
  data() {
    return {
      upListLoading: false,
      downListLoading: false,
      alertTitle: '',
      floorOptions: floorOptionsConst,
      whichFloor: '全部楼层',
      floorName: 'all', // 传递到图表页面的楼层变量
      tableList: null,
      listLoading: false,
      upPanelDataObj: { // 上面的Panel面板统计数据
        totalSaleMoney: 0.0, // 总销售金额，总销售数进行一次新的查询
        totalSaleCoin: 0, // 总销售金币
        totalSaleCount: 0, // 总的销售量
        totalServeCount: 0, // 总服务人次
        todayServeCount: 0, // 今天服务人次，与下面panel今天的订单数据一起统计
        todaySaleCount: 0 // 今天的销售量，与下面panel今天的订单数据一起进行统计
      },
      downPanelDataObj: { // 下面的panel面板数据
        todaySaleMoney: 0.0, // 今天的销售额，要进行一次新的查询
        todaySaleCoin: 0, // 今天的金币数
        weekSaleMoney: 0.0, // 本周销售额，要进行一次新的查询
        weekSaleCoin: 0, // 周金币
        monthSaleMoney: 0.0, // 本月销售额，要进行一次新的查询
        monthSaleCoin: 0 // 月金币
      }
    }
  },
  filters: {
    statusFilter(status) {
      if (status === '离线') {
        return 'danger'
      } else if (status === '运行中') {
        return 'success'
      }
    },
    robotContainerStatusFilter(status) {
      if (status === '货柜缺货') {
        return 'danger'
      } else if (status === '货柜正常') {
        return 'success'
      }
    }
  },
  created() {
    // this.getSaleInfoByFloorName()
    // this.getRobotsStatusTable()
  },
  methods: {
    handleJumpToMap(floor, id) { // 跳转到路线详情
      this.$router.push({ path: '/robotMonitor/' + floor + '/path', query: { pathId: id }})
    },
    handleJumpToTalkGroup(id) { // 跳转到对话组详情
      this.$router.push({ path: '/talkConfiguration/createRobotTalk', query: { groupId: id }})
    },
    handleJumpToAdDetailPage(id) { // 跳转到广告组详情
      this.$router.push({ path: '/adConfiguration/createAdTemplate', query: { templateId: id }})
    },
    jumpToRobotDetailsPage(mechineId) { // 跳转到机器人详情页面 /robots/robots3/retailRobot3
      this.$router.push({ path: '/robots/robots' + mechineId + '/retailRobot' + mechineId, query: { mechineId: mechineId }})
    },
    changeFloorName(val) { // 楼层改变时触发此函数
      this.floorName = ReplaceFloorName[this.whichFloor]
      this.tableList = null // 清空原来的表格机器人信息
      this.getRobotsStatusTable() // 根据楼层获取机器人表格信息
      this.$refs.robotSellCountChart.refreshChartData(this.floorName) // 触发图表页面的方法
      this.upListLoading = true
      this.downListLoading = true
      this.getSaleInfoByFloorName()
    },
    getSaleInfoByFloorName() { // 按照楼层加载销售额
      var floorname = ReplaceFloorName[this.whichFloor]
      getSaleMoneyByFloorName(floorname).then(response => {
        if (response.data.code === 0) {
          this.upPanelDataObj = response.data.upPanelDataObj
          this.upListLoading = false
          this.downPanelDataObj = response.data.downPanelDataObj
          this.downListLoading = false
          this.alertTitle = '今日累计出货：' + this.upPanelDataObj.todaySaleCount + '件   今日异常出货：0件'
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    sendRobotStopLoopCmd(machineId) {
      sendRobotStopLoop(machineId).then(response => {
        if (response.data.code === 0) {
          this.$message({
            message: response.data.message,
            type: 'success'
          })
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    startEngineRobot(row) { // 点击启动按钮，数据上传服务器
      var rowObj = Object.assign({}, row) // copy obj
      if (rowObj.startTime == null) {
        rowObj.startTime = ''
      }
      if (rowObj.endTime == null) {
        rowObj.endTime = ''
      }
      updateRobotControlInfo(rowObj).then(response => {
        if (response.data.code === 0) {
          this.$message({
            message: response.data.message,
            type: 'success'
          })
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    getRobotsStatusTable() {
      this.listLoading = true
      getRobotMonitorInfo(this.floorName).then(response => {
        if (response.data.code === 0) {
          this.tableList = response.data.robotDayRunTableList
          this.listLoading = false
        } else {
          this.listLoading = false
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
.app-container{
  background-color: #f0f2f5;
  height: 100%;
}
.run{
   background: #fff;
    margin-top: 15px;
}
.list-row{
    height: 60px;
    line-height: 60px;
    background-color: #fbfbfb;
    margin-bottom: 5px;
}
.robot-name{
  line-height: 35px;
  height: 35px;
  text-align: center;
  width: 90%;
  margin-right: 15px;
}
</style>
