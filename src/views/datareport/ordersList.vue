<template >
    <div class="dashboard-editor-container">
    <div class="filter-container">
      <span class="robots">机器人</span>
      <el-select v-model="listQuery.machineId" placeholder="请选择机器人">
        <el-option v-for="item in robotOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <span class="status">出货状态</span>
      <el-select v-model="listQuery.outStatus" placeholder="订单状态" v-loading="listLoading">
        <el-option v-for="item in orderStatusOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-date-picker v-model="listQuery.timePickerRangeArr" type="daterange" range-separator="至" start-placeholder="起始日期" end-placeholder="结束日期"></el-date-picker>
      <el-button type="primary" @click="startQuery">查询</el-button>
    </div>
    <el-table :key='tableKey' :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%;min-height:1000px;">
      <el-table-column align="center" :label="$t('goods.id')" width="85">
        <template slot-scope="scope">
          <span>{{scope.row.orderId}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="机器人名称"> <!-- 商品名称 -->
        <template slot-scope="scope">
          <span>{{scope.row.robotName}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="120px" align="center" label="商品名称">
        <template slot-scope="scope">
          <span>{{scope.row.goodsNames}}</span>
        </template>
      </el-table-column>
      <el-table-column width="220px" align="center" label="昵称">
        <template slot-scope="scope">
          <span>{{scope.row.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column width="100px" align="center" label="购买数量">
        <template slot-scope="scope">
          <span>{{scope.row.buyCount}}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="支付方式">
        <template slot-scope="scope">
          <span>{{scope.row.payType}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" label="实际支付(元)">
        <template slot-scope="scope">
          <span>{{scope.row.totalMoney}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="出货状态" width="150">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.outStatus === '出货正常'">{{scope.row.outStatus}}</el-tag>
          <el-tag type="danger" v-else>{{scope.row.outStatus}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="支付时间" width="200"> <!-- 商品销量，点击销量数字显示购买列表 -->
        <template slot-scope="scope">
          <span>{{scope.row.payDate}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page" :page-sizes="[10,20,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

  </div>
</template>

<script>
import { getRobotNameList } from '@/api/robots'
import { getUserConsumerOrderList } from '@/api/log'

export default {
  name: 'OrderTableList',
  data() {
    return {
      listLoading: true,
      robotOptions: null, // 从服务器获取机器人列表
      list: null,
      tableKey: 0,
      orderStatusOption: [
        {
          label: '全部状态',
          value: 'all'
        },
        {
          label: '出货正常',
          value: 'outOK'
        },
        {
          label: '出货异常',
          value: 'outError'
        }
      ],
      total: 0,
      listQuery: { // 此变量专门用于传递到后台按加载条件加载商品列表，其中undefined字段不会被送到后台
        page: 1,
        limit: 20,
        machineId: undefined, // 机器人编号
        timePickerRangeArr: [], // 要查询的日期时间段
        outStatus: undefined // 出货状态 "all"  "outOK" "outError"
      }
    }
  },

  created() {
    this.getRobotList()
    this.startQuery()
  },
  methods: {
    getRobotList() {
      getRobotNameList(undefined).then(response => {
        if (response.data.code === 0) {
          this.robotOptions = response.data.robotNameList
        }
      })
    },
    changeSelectOrderStatus(val) {
      this.getSaleStatisticsData()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    startQuery() {
      this.listLoading = true
      getUserConsumerOrderList(this.listQuery).then(response => {
        if (response.data.code === 0) {
          this.list = response.data.items
          this.total = response.data.total
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
.chart-container{
  position: relative;
  width:100%;
  height: calc(100vh - 84px);
  float:left;
}
.table{
  width:100%;
  float:right;
      cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    -webkit-box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);
    padding: 20px;
    text-align: center;
}
.el-table th>.cell{
  text-align: center;
}
.ranking{
    text-align: left;
    font-weight: bold;
    font-size: 18px;
}
.status{
  margin-left: 25px;
}
</style>
