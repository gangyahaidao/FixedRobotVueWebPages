<template>
  <div class="app-container">
    <!-- 加载显示商品列表 -->
    <el-table :key='tableKey' :data="adTemplateList" v-loading="listLoading" border fit highlight-current-row style="width: 100%;min-height:600px;">
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.orderId}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="200px" align="center" label="广告模板名称">
        <template slot-scope="scope">
          <span class="link-type" @click="handleJumpToAdDetail(scope.row.id)">{{scope.row.adTemplateName}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" label="图片播放间隔">
        <template slot-scope="scope">
          <span>{{scope.row.picShowIntervalTime}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" label="播放顺序">
        <template slot-scope="scope">
          <span>{{scope.row.playOrder | playOrderFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="添加时间">
        <template slot-scope="scope">
          <span>{{scope.row.date | parseDateObj}}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="是否启用" width="120">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isEnabled" type="success">启用</el-tag>
          <el-tag v-else type="danger">未启用</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('goods.actions')" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleJumpToAdDetail(scope.row.id)">编辑</el-button> <!-- 编辑 -->
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import { getAdTemplateList } from '@/api/ad'
import { parseTime } from '@/utils'
import waves from '@/directive/waves' // 水波纹指令

export default {
  name: 'RobotTalkList',
  directives: {
    waves
  },
  data() {
    return {
      listLoading: true,
      tableKey: 0,
      adTemplateList: null
    }
  },
  created() { // Vue实例被创建之后执行代码
    this.getList()
  },
  filters: {
    parseDateObj(date) {
      return parseTime(date, '{y}-{m}-{d} {h}:{i}')
    },
    playOrderFilter(orderStr) {
      if (orderStr === 'ordered') {
        return '顺序播放'
      } else if (orderStr === 'random') {
        return '随机播放'
      }
    }
  },
  methods: {
    handleSearch() {
      this.getList()
    },
    getList() { // 获取对话组列表
      getAdTemplateList().then(response => {
        if (response.data.code === 0) {
          this.adTemplateList = response.data.items
          this.listLoading = false
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    handleJumpToAdDetail(id) { // 点击跳转到对话组详情页面
      this.$router.push({ path: '/adConfiguration/createAdTemplate', query: { templateId: id }})
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.app-container {
    padding: 10px 20px;
}
</style>
