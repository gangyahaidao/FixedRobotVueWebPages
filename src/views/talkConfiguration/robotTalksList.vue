<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="searchStr" style="width: 200px;" class="filter-item" placeholder="搜索对话" @keyup.enter.native="handleSearch"/>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleSearch">搜索</el-button> <!-- 按条件搜索 -->
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">添加对话</el-button> <!-- 添加按钮 -->
    </div>

    <!-- 加载显示商品列表 -->
    <el-table :key='tableKey' :data="talkDataList" v-loading="listLoading" border fit highlight-current-row style="width: 100%;min-height:600px;">
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.orderId}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="模板名称">
        <template slot-scope="scope">
          <span class="link-type" @click="handleJumpToTalkGroup(scope.row.id)">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" label="适配楼层">
        <template slot-scope="scope">
          <el-select class="filter-item" v-model="scope.row.floorName" placeholder="请选择"> <!-- 机器人所在楼层 -->
            <el-option v-for="item in floorOptions" :key="item.key" :label="item.floorName" :value="item.key"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column width="380px" align="center" label="有效期">
        <template slot-scope="scope">
          <el-date-picker
            v-model="scope.row.validTimeArrObj"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="添加时间">
        <template slot-scope="scope">
          <span>{{scope.row.date | parseDateObj}}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="设为全场默认" width="120"> <!-- 是否设置为全场默认对话 -->
        <template slot-scope="scope">
          <el-switch v-model="scope.row.isDefaultTalk" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('goods.actions')" width="230" class-name="small-padding fixed-width"> <!-- 对商品进行编辑操作的按钮 -->
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">更新</el-button> <!-- 编辑 -->
          <el-button size="mini" type="danger" @click="deleteTalkGroup(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import { getTalkGroupList, updateGroupRowTalk, deleteTalkGroupById } from '@/api/robots'
import { parseTime } from '@/utils'
import waves from '@/directive/waves' // 水波纹指令

const floorOptions = [
  { key: 'floor1', floorName: '一楼' },
  { key: 'floor2', floorName: '二楼' },
  { key: 'floor3', floorName: '三楼' },
  { key: 'floor4', floorName: '四楼' }
]
export default {
  name: 'RobotTalkList',
  directives: {
    waves
  },
  data() {
    return {
      listLoading: true,
      tableKey: 0,
      floorOptions,
      talkDataList: null,
      searchStr: null // 搜索字符串
    }
  },
  created() { // Vue实例被创建之后执行代码
    this.getList()
  },
  filters: {
    parseDateObj(date) {
      return parseTime(date, '{y}-{m}-{d} {h}:{i}')
    }
  },
  methods: {
    handleSearch() {
      this.getList()
    },
    getList() { // 获取对话组列表
      getTalkGroupList(this.searchStr).then(response => {
        if (response.data.code === 0) {
          this.talkDataList = response.data.talkDataList
          this.listLoading = false
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    handleUpdate(row) { // 更新对话组信息
      updateGroupRowTalk(row).then(response => {
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
    deleteTalkGroup(id) { // 删除对话组
      deleteTalkGroupById(id).then(response => {
        if (response.data.code === 0) {
          // 删除数据列表中id为要删除的对象
          for (const v of this.talkDataList) {
            if (v.id === id) {
              const index = this.talkDataList.indexOf(v)
              this.talkDataList.splice(index, 1)
              break
            }
          }
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
    handleCreate() { // 添加对话按钮，跳转到新建对话组页面
      this.$router.push({ path: '/talkConfiguration/createRobotTalk' })
    },
    handleJumpToTalkGroup(id) { // 点击跳转到对话组详情页面
      this.$router.push({ path: '/talkConfiguration/createRobotTalk', query: { groupId: id }})
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.app-container {
    padding: 10px 20px;
}
</style>
