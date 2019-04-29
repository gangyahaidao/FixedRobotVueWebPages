<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">新增机器人</el-button>
    </div>
    <!-- 加载已创建的机器人列表 -->
    <el-table :key='tableKey' :data="robotsList" v-loading="listLoading" border fit highlight-current-row style="width: 100%;min-height:1080px;">
      <el-table-column align="center" label="序号" width="50">
        <template slot-scope="scope">
          <span>{{scope.row.orderId}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="全场编号" width="100"> <!-- 机器人编号 -->
        <template slot-scope="scope">
          <span>{{scope.row.machineId}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" label="机器人名称" align="center"> <!-- 机器人名称以及楼层 -->
        <template slot-scope="scope">
          <span class="link-type" @click="handleEdit(scope.row, scope.$index)">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" label="服务楼层" align="center"> <!-- 机器人名称以及楼层 -->
        <template slot-scope="scope">
          <span>{{scope.row.floorName | floorFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column width="300px" label="货柜层数" align="center"> <!-- 机器人名称以及楼层 -->
        <template slot-scope="scope">
          <span>{{scope.row.checkedContainerFloors}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" label="添加时间"> <!-- 商品保质期 -->
        <template slot-scope="scope">
          <span>{{scope.row.date | parseDateObj}}</span> <!-- 使用过滤器，商品保质期只显示年-月-日 -->
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="300" class-name="small-padding fixed-width"> <!-- 对商品进行编辑操作的按钮 -->
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row, scope.$index)">编辑</el-button> <!-- 编辑 -->
          <el-button size="mini" type="danger" @click="handleDeleteRobot(scope.row.machineId, scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible"> <!-- "添加"和"编辑"按钮弹出的界面模板 -->
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="100px" style='width: 450px; margin-left:50px;'>
        <el-form-item label="机器人编号" prop="type"> <!-- 选择新商品类型 -->
          <el-input v-model="temp.machineId" placeholder="请输入全场编号"></el-input>
        </el-form-item>
        <el-form-item label="服务楼层" prop="vendorId"> <!-- 选择商品的供应商名字 -->
          <el-select class="filter-item" v-model="temp.floorName" placeholder="请选择"> <!-- 选择之后的值存储在temp.vendorId -->
            <el-option v-for="item in floorOptions" :key="item.key" :label="item.floorName" :value="item.key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="机器人名称" prop="vendorId"> <!-- 选择商品的供应商名字 -->
          <el-input v-model="temp.name" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="货柜层数" prop="vendorId"> <!-- 选择商品的供应商名字 -->
            <el-checkbox-group v-model="temp.checkedContainerFloors" @change="handleCheckedChange">
              <el-checkbox label="一层"></el-checkbox>
              <el-checkbox label="二层"></el-checkbox>
              <el-checkbox label="三层"></el-checkbox>
              <el-checkbox label="四层"></el-checkbox>
            </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">创建</el-button> <!-- 根据dialogStatus的值来绑定按钮不同功能 -->
        <el-button v-else type="primary" @click="updateData">更新</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'
import { listEmptyRobots, createEmptyRobot, updateEmptyRobot, deleteEmptyRobot } from '@/api/robots'
import { getToken } from '@/utils/auth'

const floorOptions = [
  { key: 'floor1', floorName: '一楼' },
  { key: 'floor2', floorName: '二楼' },
  { key: 'floor3', floorName: '三楼' },
  { key: 'floor4', floorName: '四楼' }
]
const calendarTypeKeyValue = floorOptions.reduce((acc, cur) => { // 被过滤函数使用
  acc[cur.key] = cur.floorName
  return acc
}, {})

export default {
  name: 'CreateRobot',
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      robotsList: null,
      listLoading: true,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建机器人'
      },
      temp: {
        machineId: '',
        name: '',
        floorName: '',
        checkedContainerFloors: ['一层', '二层', '三层']
      },
      floorOptions: [
        { key: 'floor1', floorName: '一楼' },
        { key: 'floor2', floorName: '二楼' },
        { key: 'floor3', floorName: '三楼' }
      ]
    }
  },
  filters: {
    floorFilter(type) {
      return calendarTypeKeyValue[type]
    },
    parseDateObj(date) {
      return parseTime(date, '{y}-{m}-{d} {h}:{i}:{s}')
    }
  },
  created() { // Vue实例被创建之后执行代码
    this.getList()
  },
  methods: {
    getList() {
      listEmptyRobots(getToken()).then(response => {
        if (response.data.code === 0) {
          this.robotsList = response.data.items
          this.listLoading = false
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    handleCheckedChange(val) {
      console.log('--temp.checkedContainerFloors = ' + this.temp.checkedContainerFloors)
    },
    resetTemp() {
      this.temp = {
        machineId: '',
        name: '',
        floorName: '',
        checkedContainerFloors: ['一层', '二层', '三层']
      }
    },
    handleCreate() { // 新增机器人
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleEdit(row, index) { // 编辑按钮，弹出编辑框框
      this.temp = Object.assign({}, row) // 复制copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() { // 更新机器人数据
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateEmptyRobot(this.temp).then(response => {
            if (response.data.code === 0) {
              for (const v of this.robotsList) {
                if (v.id === this.temp.id) {
                  const index = this.robotsList.indexOf(v)
                  this.robotsList.splice(index, 1, this.temp)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
              this.$router.go(0) // 更新机器人信息之后页面需要重新刷新
            } else {
              this.$notify({
                title: '失败',
                message: '更新失败',
                type: 'error',
                duration: 2000
              })
            }
          })
        }
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createEmptyRobot(this.temp).then(response => {
            if (response.data.code === 0) {
              this.robotsList.unshift(this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              // 刷新页面更新路由
              this.$router.go(0)
            } else {
              this.$message({
                message: response.data.message,
                type: 'error'
              })
            }
          })
        }
      })
    },
    handleDeleteRobot(machineId, index) { // 删除按钮
      deleteEmptyRobot(machineId).then(response => {
        if (response.data.code === 0) {
          this.robotsList.splice(index, 1)
          this.$router.go(0) // 刷新页面更新路由
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
    }
  }
}
</script>
