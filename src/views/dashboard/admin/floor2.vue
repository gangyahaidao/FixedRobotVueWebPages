<template>
  <div class="chart-container">
    <div class="absolutecss">
      <el-switch @change="switchStatusChanged"
        style="display: block; margin-bottom: 10px"
        v-model="formObj.valueTurnOnLoop"
        active-color="#13ce66"
        inactive-color="#ff4949"
        active-text="开启循环"
        inactive-text="关闭循环">
      </el-switch>
      <el-form label-position="left" ref="formObj" :model="formObj" label-width="60px">
        <el-form-item label="起始点">
          <el-select v-model="formObj.startPosName" placeholder="请选择">
            <el-option
              v-for="item in goalNameArr"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="终点">
          <el-select v-model="formObj.endPosName" placeholder="请选择">
            <el-option
              v-for="item in goalNameArr"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="onSubmit">启动</el-button>
        </el-form-item>
      </el-form>
    </div>
    <chart height="100%" width="100%"/>
  </div>
</template>

<script>
import Chart from '@/components/Charts/robotRunMapFloor2'
import { updateRobotControlInfo, getControlInfoByMachineId } from '@/api/robots'

export default {
  name: 'robotRunMap',
  components: { Chart },
  data() {
    return {
      goalNameArr: [{
        label: '实验室', value: '实验室' },
      { label: '商会', value: '商会' },
      { label: '会议室', value: '会议室' },
      { label: '公司前台', value: '公司前台' },
      { label: '小蔡总办公室', value: '小蔡总办公室' },
      { label: '研发部办公区', value: '研发部办公区' },
      { label: '庄总办公室', value: '庄总办公室' },
      { label: '蔡总办公室', value: '蔡总办公室' },
      { label: '财务室', value: '财务室' },
      { label: '数据中心', value: '数据中心' },
      { label: '工程部', value: '工程部' },
      { label: '商管部', value: '商管部' },
      { label: '其他公司办公区域', value: '其他公司办公区域' }
      ],
      formObj: {
        machineId: '3', // 控制的机器人编号
        startPosName: '实验室',
        endPosName: '实验室',
        valueTurnOnLoop: false // 是否开启了零售机器人路径循环模式
      }
    }
  },
  mounted() {
    this.getControlInfo() // 获取设置的路径控制信息
  },
  methods: {
    switchStatusChanged(val) { // 模式状态发生改变 true / false
      console.log('valueTurnOnLoop = ' + this.formObj.valueTurnOnLoop)
    },
    onSubmit() { // 点击启动按钮，数据上传服务器
      updateRobotControlInfo(this.formObj.machineId, this.formObj.startPosName, this.formObj.endPosName, this.formObj.valueTurnOnLoop).then(response => {
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
    getControlInfo() { // 获取当前编号机器人的路径循环控制信息
      getControlInfoByMachineId(this.formObj.machineId).then(response => {
        if (response.data.code === 0) {
          // 更新控制显示数据
          this.formObj.valueTurnOnLoop = response.data.valueTurnOnLoop
          this.formObj.startPosName = response.data.startPosName
          this.formObj.endPosName = response.data.endPosName
        } else {
          this.formObj.valueTurnOnLoop = false
        }
      })
    }
  }
}
</script>

<style scoped>
.chart-container{
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
}
.absolutecss{
  position:absolute;
  width:250px;
  height:400px;
  right:10px;
  top:60px;
  z-index:999;
}
</style>

