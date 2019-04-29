<template>
  <div class="app-container">
    <el-table :key='tableKey' :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%;height:100%;">
      <el-table-column align="center" label="序号" width="65"> <!-- 序号 -->
        <template slot-scope="scope">
          <span>{{scope.row.orderId}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" label="路径名称">
        <template slot-scope="scope">
          <span class="link-type" @click="handleJumpToMap(scope.row.id)">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="楼层名称" width="100">
        <template slot-scope="scope">
          <span>{{scope.row.floorName | floorFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="起始点">
        <template slot-scope="scope">
          <span>{{scope.row.startPosName}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="循环暂停时间(S)">
        <template slot-scope="scope">
          <span>{{scope.row.loopStaySec}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="路径列表">
        <template slot-scope="scope">
          <span>{{scope.row.jsonPathStr | pathNameFilter}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getPathByFloorName } from '@/api/robots'
import waves from '@/directive/waves' // 水波纹指令

const floorOptions = [
  { key: 'floor1', floorName: '一楼' },
  { key: 'floor2', floorName: '二楼' },
  { key: 'floor3', floorName: '三楼' }
]
const calendarTypeKeyValue = floorOptions.reduce((acc, cur) => { // 被过滤函数使用
  acc[cur.key] = cur.floorName
  return acc
}, {})

export default {
  name: 'floorPathList',
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      floorName: 'floor3',
      listLoading: true
    }
  },
  filters: {
    pathNameFilter(value) {
      var retValue = ''
      var jsonObj = JSON.parse(value)
      for (var index in jsonObj) {
        var obj = jsonObj[index]
        var posName = obj.posName
        retValue += posName + '，'
      }
      return retValue.substring(0, retValue.length - 1) // 删除最后一个分隔符号
    },
    floorFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  created() {
    this.getListAll()
  },
  methods: {
    getListAll() { // 加载所有机器人
      this.listLoading = true
      getPathByFloorName(this.floorName).then(response => { // 初始显示加载所有的机器人，然后再使用过滤条件
        this.list = response.data.pathLists
        this.listLoading = false
      })
    },
    handleJumpToMap(id) { // 传递id
      this.$router.push({ path: '/robotMonitor/floor3/path', query: { pathId: id }})
    }
  }
}
</script>
