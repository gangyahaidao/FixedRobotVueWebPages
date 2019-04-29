<template>
    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" size="medium">
      <el-table-column width="80px" align="center" :label="$t('robots.id')">
        <template slot-scope="scope">
          <span>{{scope.row.orderId}}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="60px" :label="$t('robots.message')">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input class="edit-input" size="small" v-model="scope.row.message"></el-input>
          </template>
          <span v-else>{{ scope.row.message }}</span>
        </template>
      </el-table-column>

      <el-table-column width="250px" :label="$t('robots.probability')">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input class="edit-input" size="small" v-model="scope.row.probability"></el-input>
          </template>
          <span v-else>{{ scope.row.probability }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('robots.actions')" width="250px">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-button type="warning" @click="cancelEdit(scope.row)" size="small">取消</el-button>
            <el-button type="success" @click="confirmEdit(scope.row)" size="small">确定</el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="changeActionsBtn(scope.row)" size="small" icon="el-icon-edit">{{$t('robots.edit')}}</el-button>
            <el-button type="danger" size="small" @click="deleteNew(scope.row.id)">{{$t('robots.deleteFloor')}}</el-button>
          </template>
        </template>
      </el-table-column>

    </el-table>
</template>

<script>

import { fetchDialogList, addDialog, updateDialog, deleteDialog } from '@/api/robots'

export default {
  name: 'tabtable',
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false, // 默认加载不显示转圈圈标识
      currentSelectName: '', // 当前选择的目标点或者感应人体的名称
      type: '', // 对话类型
      timeIntervalName: '', // 自由巡逻状态对话的时间段
      tabPaneState: '', // 对话的阶段
      groupId: null // 对话组id值
    }
  },
  created() {
    if (this.type === 'sensepeople') {
      this.currentSelectName = '感应到人'
    }
    this.getList()
  },
  methods: {
    refreshTableData(groupId, type, timeIntervalName, tabPaneState) { // 当点击上一步或者下一步的时候触发，重新加载
      this.list = []
      this.groupId = groupId
      this.type = type
      this.timeIntervalName = timeIntervalName
      this.tabPaneState = tabPaneState
      if (this.type === 'sensepeople') { // 避免在点击下一步跳转到感应触发时没有内容
        this.currentSelectName = '感应到人'
      }
      this.getList()
    },
    changeTimeIntervalName(val) { // 父页面点击修改时间段触发函数
      if (this.groupId == null) {
        return
      }
      this.list = []
      this.listLoading = true
      fetchDialogList(this.groupId, this.type, this.tabPaneState, val, this.currentSelectName).then(response => { // 根据父页面传递过来的tab类型字符串进行查找
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    getList() { // 获取指定条件的对话列表
      if (this.groupId == null) {
        return
      }
      this.listLoading = true
      fetchDialogList(this.groupId, this.type, this.tabPaneState, this.timeIntervalName, this.currentSelectName).then(response => { // 根据父页面传递过来的tab类型字符串进行查找
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    addNew(groupId, type, timeIntervalName, tabPaneState) { // 新增一列数据
      this.groupId = groupId
      this.type = type
      this.timeIntervalName = timeIntervalName
      this.tabPaneState = tabPaneState
      this.listLoading = true
      addDialog(this.groupId, this.total, this.type, this.tabPaneState, this.timeIntervalName, this.currentSelectName).then(response => { // 参数用于填充新对象的orderId属性
        if (response.data.code === 0) {
          this.total++
          this.list.push(response.data.item) // 将服务器返回的一条数据插入list对象
          this.listLoading = false
        }
      })
    },
    refreshCurrentSelectName(val) {
      this.currentSelectName = val
      this.getList()
    },
    deleteNew(id) { // 删除指定id的对话
      this.listLoading = true
      deleteDialog(id, this.type).then(response => {
        if (response.data.code === 0) {
          this.getList() // 重新加载列表
          this.listLoading = false
        }
      })
    },
    cancelEdit(row) { // 取消修改，将修改之前的值还原
      row.message = row.originalMessage
      row.probability = row.originalProbability
      row.edit = false
      this.$message({
        message: '取消修改',
        type: 'warning'
      })
    },
    confirmEdit(row) { // 确认修改
      row.edit = false
      row.originalMessage = row.message
      row.originalProbability = row.probability
      updateDialog(row).then(response => { // 将更新的数据上传服务器
        if (response.data.code === 0) {
          this.$message({
            message: '修改成功',
            type: 'success'
          })
        }
      })
    },
    changeActionsBtn(row) {
      row.edit = !row.edit
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
