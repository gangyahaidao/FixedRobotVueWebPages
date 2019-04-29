<template>
  <div class='chart-container'>
    <el-select v-model="floorName" @change="changeFloorName" placeholder="请选择楼层">
      <el-option-group v-for="group in floorOptions" :key="group.label" :label="group.label">
        <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-option-group>
    </el-select>
    <el-select v-model="robotMachineId" @change="changeRobotId" placeholder="请选择楼层机器人">
      <el-option v-for="item in robotOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
    <chart height='100%' width='100%' :floorName='floorName' :robotMachineId='robotMachineId' ref='robotSaleChart' style="margin-top:15px; margin-bottom:20px"></chart>
  </div>
</template>

<script>
import Chart from '@/components/Charts/robotGoodsStatistics'
import TransactionTable from './components/TransactionTable'
import { getRobotNameList } from '@/api/robots'

export default {
  name: 'robotStatistics',
  components: {
    Chart,
    TransactionTable
  },
  data() {
    return {
      floorOptions: [{
        options: [{
          value: 'floor1',
          label: '商场一层'
        }]
      }, {
        options: [{
          value: 'floor2',
          label: '商场二层'
        }]
      }, {
        options: [{
          value: 'floor3',
          label: '商场三层'
        }]
      }],
      floorName: '', // 当前要查询的楼层
      robotMachineId: '',
      robotOptions: null // 从服务器获取机器人列表
    }
  },
  created() {
    this.getRobotList()
  },
  methods: {
    getRobotList() {
      getRobotNameList(this.floorName).then(response => {
        if (response.data.code === 0) {
          this.robotOptions = response.data.robotNameList
        }
      })
    },
    changeFloorName() {
      this.getRobotList()
    },
    changeRobotId() {
      this.$refs.robotSaleChart.refreshChartData(this.robotMachineId)
    }
  }
}
</script>

<style scoped>
.chart-container{
  position: relative;
  padding: 20px;
  width: 100%;
  height:85vh;
}
</style>

