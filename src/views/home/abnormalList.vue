<template>
  <div class="app-container">
    <div class="filter-container">
      <el-radio-group v-model="labelPosition">
        <el-radio-button label="left"><el-badge is-dot>当前缺货异常机器人</el-badge></el-radio-button>
        <el-radio-button label="right"><el-badge is-dot>前一周出货异常</el-badge></el-radio-button>
      </el-radio-group>
    </div>

    <!-- 加载显示商品列表 -->
    <el-table :key='tableKey' :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%;min-height:1000px;">
      <el-table-column align="center" label="序号" width="80">
        <template slot-scope="scope">
          <span>{{scope.row.orderId}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="110px" label="机器人名称"> <!-- 机器人名称 -->
        <template slot-scope="scope">
          <span>{{scope.row.robotName}}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="货柜层数">
        <template slot-scope="scope">
          <span>{{scope.row.containerFloorName | goodsFloorFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="异常商品名字">
        <template slot-scope="scope">
          <span>{{scope.row.goodsName}}</span>
        </template>
      </el-table-column>
      <template v-if="labelPosition == 'left'">
        <el-table-column width="120px" align="center" label="异常原因">
          <template>
            <el-tag type="warning">缺货异常</el-tag>
          </template>
        </el-table-column>
      </template>
      <template v-else>
        <el-table-column width="120px" align="center" label="异常原因">
          <template>
            <el-tag type="danger">出货异常</el-tag>
          </template>
        </el-table-column>
      </template>
      <el-table-column width="200px" align="center" label="时间"> <!-- 异常时间 -->
        <template slot-scope="scope">
          <span>{{scope.row.date | parseDataObj}}</span> <!-- 使用过滤器，商品保质期只显示年-月-日 -->
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="150" class-name="small-padding fixed-width">
        <template>
          <el-button type="danger" size="mini">处理</el-button>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import { parseTime } from '@/utils'
import { getAbnormalShortageListFromRobot, getAbnormalShipListFromOrders } from '@/api/datareport'

export default {
  name: 'dragTable',
  data() {
    return {
      tableKey: 0,
      list: null,
      listLoading: false,
      labelPosition: 'left'
    }
  },
  filters: {
    goodsFloorFilter(name) {
      const map = {
        goodsFloor1: '一层',
        goodsFloor2: '二层',
        goodsFloor3: '三层',
        goodsFloor4: '四层',
        goodsFloor5: '五层'
      }
      return map[name]
    },
    parseDateObj(date) {
      return parseTime(date, '{y}-{m}-{d} {h}:{i}:{s}')
    }
  },
  watch: { // 使用侦听方法，而不用计算属性
    labelPosition: function() {
      if (this.labelPosition === 'left') {
        this.getAbnormalShortageList()
      } else if (this.labelPosition === 'right') {
        this.getAbnormalShipList()
      }
    }
  },
  created() {
    // this.getAbnormalShortageList()
  },
  methods: {
    getAbnormalShortageList() { // 获取缺货异常机器人信息，从机器人对象中查找
      this.listLoading = true
      getAbnormalShortageListFromRobot().then(response => {
        if (response.data.code === 0) {
          this.list = response.data.list
          this.listLoading = false
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    getAbnormalShipList() { // 获取出货异常列表，从订单对象中查找
      this.listLoading = true
      getAbnormalShipListFromOrders().then(response => {
        if (response.data.code === 0) {
          this.list = response.data.list
          this.listLoading = false
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

<style>
.sortable-ghost{
  opacity: .8;
  color: #fff!important;
  background: #42b983!important;
}
</style>

<style scoped>
.icon-star{
  margin-right:2px;
}
.drag-handler{
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.show-d{
  margin-top: 15px;
}
.list{
  margin-bottom:15px;
}
</style>
