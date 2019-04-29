<template>
  <div class="dashboard-editor-container">
    <el-row>
      <el-tag>注意：默认根据最近两周的销售数据进行统计</el-tag>
    </el-row>
    <el-row :gutter="8">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <h3 class="lucky-user">微信幸运用户前十名:</h3>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <h3 class="lucky-goods">最受欢迎商品前十名</h3>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <h3 class="lucky-robot">机器人销售金额前十名</h3>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="8">
      <el-col v-loading="listLoading1" :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 8}" :xl="{span: 8}" style="padding-right:8px;margin-bottom:10px;">
        <transaction-table colum1='用户昵称' colum2='消费金额(元)' colum3='排名' :dataList='luckyUserForeTen' />
      </el-col>
      <el-col v-loading="listLoading2" :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 8}" :xl="{span: 8}" style="padding-right:8px;margin-bottom:10px;">
        <transaction-table colum1='商品名称' colum2='销售数量(个)' colum3='排名' :dataList='saleGoodsForeTen' />
      </el-col>
      <el-col v-loading="listLoading3" :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 8}" :xl="{span: 8}" style="padding-right:8px;margin-bottom:10px;">
        <transaction-table colum1='机器人名称' colum2='销售金额(元)' colum3='排名' :dataList='bestRobotRankList' />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import TransactionTable from './components/TransactionTable'
import { getWXUserRankList, getSellBestGoodsList, getRobotSellRankList } from '@/api/rankList'

export default {
  name: 'DashboardAdmin',
  components: {
    TransactionTable
  },
  data() {
    return {
      listLoading1: true,
      listLoading2: true,
      listLoading3: true,
      luckyUserForeTen: [],
      saleGoodsForeTen: [],
      bestRobotRankList: []
    }
  },
  created() {
    this.getRankList()
  },
  methods: {
    getRankList() {
      getWXUserRankList(2).then(response => { // 获取微信排行榜
        if (response.data.code === 0) {
          this.listLoading1 = false
          this.luckyUserForeTen = response.data.luckyUserForeTen
          getSellBestGoodsList(2).then(response => { // 获取商品销量排行榜
            if (response.data.code === 0) {
              this.listLoading2 = false
              this.saleGoodsForeTen = response.data.saleGoodsForeTen
              getRobotSellRankList(2).then(response => { // 获取机器人的销售额
                if (response.data.code === 0) {
                  this.listLoading3 = false
                  this.bestRobotRankList = response.data.bestRobotRankList
                }
              })
            }
          })
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding: 16px;
  background-color: rgb(240, 242, 245);
  .chart-wrapper {
    background: rgb(240, 242, 245);
    margin-bottom: 16px;
    .lucky-user {
      font-weight:400;
      color:#57a926;
    }
    .lucky-goods {
      font-weight:400;
      color:chocolate
    }
    .lucky-robot {
      font-weight:400;
      color:hotpink
    }
  }
}
</style>
