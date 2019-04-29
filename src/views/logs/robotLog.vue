<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" :placeholder="$t('log.keyWords')" v-model="listQuery.title">
      </el-input>
      <el-select clearable style="width: 130px" class="filter-item" v-model="listQuery.floorName" :placeholder="$t('log.floorName')">
        <el-option v-for="item in floorNameOptions" :key="item.key" :label="item.value" :value="item.key">
        </el-option>
      </el-select>
      <el-select @change='handleFilter' style="width: 140px" class="filter-item" v-model="listQuery.sort">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('log.search')}}</el-button>
      <el-button class="filter-item" type="primary" :loading="downloadLoading" v-waves icon="el-icon-download" @click="handleDownload">{{$t('log.export')}}</el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%;min-height:1000px;">
      <el-table-column align="center" :label="$t('log.id')" width="65"> <!-- 表格序号 -->
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" :label="$t('log.userName')"> <!-- 操作人姓名 -->
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.userName}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="180px" align="center" :label="$t('log.actionDescription')"> <!-- 进行的操作描述 -->
        <template slot-scope="scope">
          <span>{{scope.row.actionDescription}}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" :label="$t('log.date')"> <!-- 日志时间 -->
        <template slot-scope="scope">
          <span>{{scope.row.date | parseTime('{y}-{m}-{d} {h}:{i}:{s}')}}</span>
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
import { fetchListAll } from '@/api/log'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'
import { getToken } from '@/utils/auth'

export default {
  name: 'robotLogTable',
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      floorNameOptions: [
        { key: 'floor1', value: '一层' },
        { key: 'floor2', value: '二层' },
        { key: 'floor3', value: '三层' },
        { key: 'floor4', value: '四层' }
      ],
      sortOptions: [{ label: '增序', key: '+id' }, { label: '降序', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      downloadLoading: false
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      const token = getToken()
      fetchListAll(token, 'RobotsLog').then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
