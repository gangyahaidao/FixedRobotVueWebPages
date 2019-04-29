<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleSearch" style="width: 200px;" class="filter-item" placeholder="搜索商品名称" v-model="searchStr"></el-input>
      <el-date-picker v-model="listQuery.timePickerRangeArr" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleSearch">{{$t('goods.search')}}</el-button> <!-- 按条件搜索商品 -->
    </div>

    <!-- 加载仓库补货记录 -->
    <el-table :key='tableKey' :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%;min-height:700px;">
      <el-table-column align="center" label="序号" width="50">
        <template slot-scope="scope">
          <span>{{scope.row.orderId}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center"  label="商品名称" min-width="200">
        <template slot-scope="scope">
          <span>{{scope.row.goodsName}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" label="商品类型">
        <template slot-scope="scope">
          <span>{{scope.row.goodsType | typeFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" label="商品图像">
        <template slot-scope="scope">
          <img v-if="scope.row.goodsPicUrl.length > 0" :src="scope.row.goodsPicUrl" style="width: 30px;height: 30px"> <!-- 显示商品图片 -->
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="补货前库存">
        <template slot-scope="scope">
          <span>{{scope.row.beforeReplenishCount}}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="补货数量">
        <template slot-scope="scope">
          <span>{{scope.row.currentReplenishCount}}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="总数量">
        <template slot-scope="scope">
          <span>{{scope.row.afterReplenishCount}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="操作人">
        <template slot-scope="scope">
          <span>{{scope.row.replenishUserName}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" label="补货时间">
        <template slot-scope="scope">
          <span>{{scope.row.date | parseDateObj}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

  </div>
</template>

<script>
import { getReplenishLog } from '@/api/datareport'
import { parseTime } from '@/utils'
const calendarTypeOptions = [
  { key: 'Drink', display_name: '饮料' },
  { key: 'Water', display_name: '矿泉水' },
  { key: 'Snack', display_name: '休闲零食' }
]
// 将key值替换为display_name值
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  data() {
    return {
      searchStr: null,
      tableKey: 0,
      listLoading: true,
      list: null,
      total: 0,
      listQuery: { // 此变量专门用于传递到后台按加载条件加载商品列表，其中undefined字段不会被送到后台
        page: 1,
        limit: 20,
        searchStr: null,
        timePickerRangeArr: []
      }
    }
  },
  created() { // Vue实例被创建之后执行代码
    this.getList()
  },
  filters: {
    typeFilter(type) {
      return calendarTypeKeyValue[type] // 将type转换为对应的名字
    },
    parseDateObj(date) {
      return parseTime(date, '{y}-{m}-{d} {h}:{i}')
    }
  },
  methods: {
    handleSearch() {
      this.listQuery.searchStr = this.searchStr
      this.getList()
    },
    getList() {
      this.listQuery.searchStr = this.searchStr
      getReplenishLog(this.listQuery).then(response => {
        if (response.data.code === 0) {
          this.listLoading = false
          this.list = response.data.list
          this.total = response.data.total
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    handleSizeChange(val) { // 修改每页显示多少条触发
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) { // 跳转到指定的页触发
      this.listQuery.page = val
      this.getList()
    }
  }
}
</script>
