<template>
  <div class="tab-container">
    <el-form :inline="true" :model="talkTitleNameForm" class="demo-form-inline">
      <el-form-item label="对话组名称">
        <el-input ref="talkTitleNameRef" v-model="talkTitleNameForm.name" style="width:300px" placeholder="请先输入对话组名字"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="createNewTalkObj">保存</el-button>
      </el-form-item>
    </el-form>

    <el-steps :active="currentIndex+1" style="margin-bottom:20px">
      <el-step title="步骤1：开始选货对话" icon="el-icon-bell"></el-step>
      <el-step title="步骤2：传送商品对话" icon="el-icon-bell"></el-step>
      <el-step title="步骤3：提示取货对话" icon="el-icon-bell"></el-step>
      <el-step title="步骤4：取货完成对话" icon="el-icon-bell"></el-step>
      <el-step title="步骤5：出货失败对话" icon="el-icon-bell"></el-step>
      <el-step title="步骤6：系统身份验证对话" icon="el-icon-star-on"></el-step>
      <el-step title="步骤7：系统选货对话" icon="el-icon-star-on"></el-step>
      <el-step title="步骤8：系统出货失败对话" icon="el-icon-star-on"></el-step>
    </el-steps>

    <!-- 上半部分设置 -->
    <tab-pane ref="tabpaneUp"></tab-pane> <!-- 点击tab修改activeName值，子组件根据传递的type值加载不同的内容 -->
    <div style="margin-top: 5px">
      <el-button type="primary" size="mini" @click="addNewUp">{{$t('robots.addFloor')}}</el-button>
    </div>

    <el-row style="margin-top:25px">
      <template v-if="currentIndex > 0">
        <el-col :span="12"><div><el-button type="warning" plain @click="preProcessClick" icon="el-icon-d-arrow-left">上一步</el-button></div></el-col>
      </template>
      <el-col :span="12" :push="10" v-if="currentIndex == 5"><div><el-button type="success" plain @click="doneProcessClick">完成<i class="el-icon-check el-icon--right"></i></el-button></div></el-col>
      <el-col :span="12" :push="10" v-else><div><el-button type="warning" plain @click="nextProcessClick">下一步<i class="el-icon-d-arrow-right el-icon--right"></i></el-button></div></el-col>
    </el-row>

  </div>
</template>

<script>
import tabPane from './components/tabPane'
import { createNewTalk, getTalkGroupById, getFloorPosNameArr } from '@/api/robots'

const tabMapOptions = [
  { label: '开始选货对话', key: 'D1', state1: '巡场无人状态对话', state2: '到达指定地点对话', extradata: 'reachgoal', tabPaneStateUp: 'freegoing', tabPaneStateLow: 'reachedgoal' },
  { label: '传送商品对话', key: 'D2', state1: '感应触发对话', state2: '感应超时对话', extradata: 'senseYes', tabPaneStateUp: 'senseYes', tabPaneStateLow: 'senseTimeout' },
  { label: '提示取货对话', key: 'D3', state1: '已经扫码对话', state2: '扫码购买超时对话', tabPaneStateUp: 'OK', tabPaneStateLow: 'ERROR' },
  { label: '取货完成对话', key: 'D4', state1: '支付成功对话', state2: '支付异常对话', tabPaneStateUp: 'OK', tabPaneStateLow: 'ERROR' },
  { label: '出货失败对话', key: 'D5', state1: '出货成功对话', state2: '出货失败对话', tabPaneStateUp: 'OK', tabPaneStateLow: 'ERROR' },
  { label: '系统身份验证对话', key: 'D6', state1: '取货成功对话', state2: '超时未取货对话', tabPaneStateUp: 'OK', tabPaneStateLow: 'ERROR' },
  { label: '系统选货对话', key: 'D7', state1: '取货成功对话', state2: '超时未取货对话', tabPaneStateUp: 'OK', tabPaneStateLow: 'ERROR' },
  { label: '系统出货失败对话', key: 'D8', state1: '取货成功对话', state2: '超时未取货对话', tabPaneStateUp: 'OK', tabPaneStateLow: 'ERROR' }
]
export default {
  name: 'tab',
  components: { tabPane },
  data() {
    return {
      talkTitleNameForm: {
        id: null, // 对话组的数据库id
        name: null // 对话组的名字
      },
      currentIndex: 0, // 点击下一步需要修改此两个变量
      item: null,
      timeIntervalName: null
    }
  },
  created() {
    this.item = tabMapOptions[this.currentIndex] // 新建初始页面显示自由行走对话
    // this.getPosNameArr()
  },
  mounted() {
    if (this.$route.query.groupId !== undefined) { // 根据groupId加载属于改groupId的对话
      getTalkGroupById(this.$route.query.groupId).then(response => {
        if (response.data.code === 0) {
          this.talkTitleNameForm.name = response.data.talkGroupName
          this.talkTitleNameForm.id = response.data.talkGroupId
          this.$refs.tabpaneUp.refreshTableData(this.talkTitleNameForm.id, this.item.key, this.timeIntervalName, this.item.tabPaneStateUp) // 刷新表格数据
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    }
  },
  methods: {
    getPosNameArr() { // 获取楼层节点名称列表
      getFloorPosNameArr(this.talkTitleNameForm.floorName).then(response => {
        if (response.data.code === 0) {
          this.geoCoordMap = response.data.posNameArr
          for (var index in this.geoCoordMap) { // 生成创建路线的地点选择列表 this.goalNameArr
            var obj = {
              name: this.geoCoordMap[index].name,
              value: this.geoCoordMap[index].name
            }
            this.goalNameArr.push(obj) // 将楼层节点添加到路线节点管理表格列表中
          }
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    createNewTalkObj() {
      if (this.talkTitleNameForm.name == null) {
        this.$message({
          message: '请先填写对话组名称',
          type: 'error'
        })
        this.$refs.talkTitleNameRef.focus()
      } else {
        createNewTalk(this.talkTitleNameForm.floorName, this.talkTitleNameForm.name).then(response => {
          if (response.data.code === 0) {
            this.talkTitleNameForm.id = response.data.newTalkObjId
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
    },
    preProcessClick() { // 点击上一步
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = 0
      }
      this.item = tabMapOptions[this.currentIndex]
      this.activeName = this.item.key

      this.$refs.tabpaneUp.refreshTableData(this.talkTitleNameForm.id, this.item.key, this.timeIntervalName, this.item.tabPaneStateUp) // 刷新表格数据
    },
    nextProcessClick() { // 点击下一步
      this.currentIndex++
      if (this.currentIndex > 5) { // 点击了完成，保存数据到服务器
        this.currentIndex = 5
      }
      this.item = tabMapOptions[this.currentIndex]
      this.activeName = this.item.key

      this.$refs.tabpaneUp.refreshTableData(this.talkTitleNameForm.id, this.item.key, this.timeIntervalName, this.item.tabPaneStateUp) // 刷新表格数据
    },
    doneProcessClick() { // 点击完成，跳转到对话组列表页面
      this.$router.push({ path: '/talkConfiguration/list' })
    },
    selectTimeIntervalChange(val) { // 时间段被修改，则重新加载定点对话列表
      this.$refs.tabpaneUp.changeTimeIntervalName(val)
      this.$refs.tabpaneLow.changeTimeIntervalName(val)
    },
    selectChangePathPosArr() { // 对话组所属楼层被更改，重新加载楼层所属的路径节点数组
      this.goalNameArr = []
      this.getPosNameArr()
    },
    addNewUp() { // 通知子组件增加一行，上半部分的添加
      if (this.talkTitleNameForm.id == null) {
        this.$message({
          message: '请先填写对话组名称',
          type: 'error'
        })
        this.$refs.talkTitleNameRef.focus()
      } else {
        this.$refs.tabpaneUp.addNew(this.talkTitleNameForm.id, this.item.key, this.timeIntervalName, this.item.tabPaneStateUp)
      }
    },
    handleSelectFilterUp(val) { // 人体检测select过滤函数
      this.$refs.tabpaneUp.refreshCurrentSelectName(val)
    },
    handleSelectFilterLow(val) { // 目标点名称
      this.$refs.tabpaneLow.refreshCurrentSelectName(val)
    }
  }
}
</script>

<style scoped>
  .tab-container{
    margin: 30px;
  }
</style>
