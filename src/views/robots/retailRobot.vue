<template>
  <div class="app-container">
    <el-container>
      <el-row :gutter="20" style="margin-left:0 !important;">
        <el-col  :xs="12" :sm="12" :lg="14" class="mains">
          <el-form :model="infoObj" class="demo-form-inline" v-loading="listLoading0">
            <el-form-item>
              <el-col :xs="12" :sm="12" :lg="6">
                <el-tag class="tag" type="warning">机器人全场编号：{{infoObj.machineId}}</el-tag>
              </el-col>
              <el-col :xs="12" :sm="12" :lg="6">
                <el-tag class="tag" type="warning">名称：{{infoObj.name}}</el-tag>
              </el-col>
              <el-col :xs="12" :sm="12" :lg="6">
                <el-tag class="tag" type="warning">服务楼层：{{infoObj.floorName | floorFilter}}</el-tag>
              </el-col>
            </el-form-item>
            <el-form-item label="货柜状态">
              <el-tag :type="infoObj.isRobotOutOfStore ? 'danger' : 'primary'">{{infoObj.isRobotOutOfStore | containerStatusFilter}}</el-tag>
            </el-form-item>
            <el-form-item label="当前电量">
              <el-col :span="10">
                <el-progress :text-inside="true" :stroke-width="18" :percentage="infoObj.batteryPercent" color="rgba(142, 113, 199, 1)" style="margin-top:10px"></el-progress>
              </el-col>
            </el-form-item>
            <el-form-item label="当前对话">
              <el-select v-model="infoObj.talkId" placeholder="请选择对话">
                <el-option v-for="item in talkGroupList" :key="item.groupId" :label="item.name" :value="item.groupId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="当前路径">
              <el-select v-model="infoObj.pathId" placeholder="选择路径">
                <el-option v-for="item in pathList" :key="item.pathId" :label="item.name" :value="item.pathId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="当前广告">
              <el-select v-model="infoObj.adId" placeholder="选择广告">
                <el-option v-for="item in adList" :key="item.id" :label="item.adTemplateName" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="操作">
              <el-button type="success" style="margin-left: 28px" @click="updateRobotBindInfo">更新设置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col  :xs="12" :sm="12" :lg="10">
          <div class="grid-content bg-purple-light">
            <panel-groups :robotPanelObj="robotPanelObj"></panel-groups> <!-- 加载显示收入销量等数据 -->
          </div>
        </el-col>

        <el-col   :xs="12" :sm="12" :lg="24" class="filter-container">
          <!-- <el-input @keyup.enter.native="handleSearchGoods" style="width: 200px;" class="filter-item" placeholder="搜索货柜商品"/>
          <el-button class="filter-item" type="primary" icon="el-icon-search">搜索</el-button> -->
          <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="jumpToTidyGoods">整理货柜</el-button>
          <!-- <el-button class="filter-item" type="warning" icon="el-icon-edit">增加货柜</el-button> -->
        </el-col>
        <el-table :data="infoObj.goodsList" row-key="id"  v-loading="listLoading" border fit highlight-current-row style="width: 100%; margin-top:15px;">
          <el-table-column align="center" label="序号" width="50"> <!-- 序号 -->
            <template slot-scope="scope">
              <span>{{scope.row.orderId}}</span>
            </template>
          </el-table-column>

          <el-table-column width="150px" align="center" label="货道层">
            <template slot-scope="scope">
              <span>{{scope.row.containerFloorName | goodsFloorFilter}}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="200px" align="center" label="商品名称">
            <template slot-scope="scope">
              <span>{{scope.row.goodsName}}</span>
            </template>
          </el-table-column>

          <el-table-column width="150px" align="center" label="图片">
            <template slot-scope="scope">
              <img :src="scope.row.goodsPicUrl" style="width: 50px;height: 50px;">
            </template>
          </el-table-column>

          <el-table-column width="120px" align="center" label="单价(元)">
            <template slot-scope="scope">
              <span>{{scope.row.goodsPrice}}</span>
            </template>
          </el-table-column>

          <el-table-column width="150px" align="center" label="层剩余量(个)">
            <template slot-scope="scope">
              <span>{{scope.row.currentCount}}</span>
            </template>
          </el-table-column>

          <el-table-column width="120px" align="center" label="层满载数">
            <template slot-scope="scope">
              <span>{{scope.row.totalCount}}</span>
            </template>
          </el-table-column>

          <el-table-column align="center" label="操作" width="230" class-name="small-padding fixed-width"> <!-- 进行操作的按钮列 -->
            <template slot-scope="scope">
              <el-button type="primary" @click="addGoodsContainerCount(scope.$index, scope.row.containerFloorId, scope.row.containerFloorName, scope.row.goodsName, scope.row.currentCount, scope.row.totalCount)">补货</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>

      <el-dialog :title="dialogTitle" :visible.sync="dialogAddGoodsVisible" width='20%'>
        <el-form :model="addGoodsForm">
          <el-form-item label="层满载数量" label-width="100px">
            <el-input v-model="goodsTotalCount"></el-input>
          </el-form-item>
          <el-form-item label="补货前库存量" label-width="100px">
            <el-input v-model="goodsRepertory"></el-input>
          </el-form-item>
          <el-form-item label="准备补充量" label-width="100px">
            <el-input v-model="addGoodsForm.goodsAddCount"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogAddGoodsVisible = false">取 消</el-button>
          <el-button type="primary" @click="updateContainerGoodsRepertory">确 定</el-button>
        </div>
      </el-dialog>
    </el-container>
  </div>
</template>

<script>
import PanelGroups from './components/PanelGroup'
import { getToken } from '@/utils/auth'
import { getTalkGroupNamesList, getPathNamesList, getRobotDetailInfoByMachineId, updateRobotContainerRepertory, updateRobotRetailBindInfo } from '@/api/robots'
import { getAdTemplateList } from '@/api/ad'

const map0 = {
  floor1: '一楼',
  floor2: '二楼',
  floor3: '三楼',
  floor4: '四楼'
}
const map = {
  goodsFloor1: '一层',
  goodsFloor2: '二层',
  goodsFloor3: '三层',
  goodsFloor4: '四层',
  goodsFloor5: '五层'
}
export default {
  components: { PanelGroups },

  data() {
    return {
      listLoading0: true,
      listLoading: true,
      machineId: null,
      talkGroupList: null, // 对话组列表
      pathList: null, // 路径列表
      adList: null, // 广告列表
      infoObj: {
        machindId: null,
        name: null,
        floorName: null,
        isRobotOutOfStore: null,
        batteryPercent: 0,
        talkId: null,
        pathId: null,
        adId: null,
        goodsList: null // 商品列表
      },
      robotPanelObj: { // 机器人Panel面板显示的信息
        totalRunPathCount: 0,
        totalServePeopleCount: 0,
        totalSaleCount: 0,
        totalSaleMoney: 0.0,
        totalSaleCoin: 0
      },
      dialogTitle: null, // 补货相关变量
      changeListIndex: null,
      dialogAddGoodsVisible: false,
      goodsTotalCount: null, // 当前层满载数量
      goodsRepertory: null, // 补货前数量
      addGoodsForm: {
        token: null,
        machineId: null,
        containerFloorId: null,
        goodsAddCount: null // 本次补货增加的数量
      }
    }
  },
  filters: {
    goodsFloorFilter(name) {
      return map[name]
    },
    floorFilter(name) {
      return map0[name]
    },
    containerStatusFilter(val) {
      if (val === true) {
        return '缺货'
      } else {
        return '正常'
      }
    }
  },
  mounted() {
    this.machineId = this.$route.name.substr(1) // 去除第一个字符
    this.getTalkGroupList()
    this.getPathList()
    this.getAdList() // 获取广告模板列表
    this.getRobotDetailInfo()
  },
  methods: {
    getTalkGroupList() {
      getTalkGroupNamesList(getToken()).then(response => {
        if (response.data.code === 0) {
          this.talkGroupList = response.data.talkGroupList
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    getPathList() {
      getPathNamesList(this.machineId).then(response => {
        if (response.data.code === 0) {
          this.pathList = response.data.pathList
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    getAdList() {
      getAdTemplateList().then(response => {
        if (response.data.code === 0) {
          this.adList = response.data.items
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    getRobotDetailInfo() {
      getRobotDetailInfoByMachineId(this.machineId).then(response => {
        if (response.data.code === 0) {
          this.infoObj = response.data.infoObj
          if (this.infoObj.talkId === 0) { // 避免还没设置对话组id出现无效的值
            this.infoObj.talkId = null
          }
          if (this.infoObj.adId === 0) {
            this.infoObj.adId = null
          }
          this.robotPanelObj = response.data.robotPanelObj
          this.listLoading0 = false
          this.listLoading = false
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    handleSearchGoods() { // 按名字查找商品

    },
    jumpToTidyGoods() { // 跳转到货柜整理界面
      this.$router.push({ path: '/robots/robots' + this.machineId + '/tidyGoods' + this.machineId })
    },
    addGoodsContainerCount(rowIndex, containerFloorId, containerFloorName, goodsName, currentCount, totalCount) {
      this.changeListIndex = rowIndex
      this.dialogTitle = map[containerFloorName] + ' - ' + goodsName
      this.goodsTotalCount = totalCount
      this.addGoodsForm.containerFloorId = containerFloorId
      this.goodsRepertory = currentCount
      if ((this.goodsTotalCount - this.goodsRepertory) > 0) {
        this.addGoodsForm.goodsAddCount = this.goodsTotalCount - this.goodsRepertory
      } else {
        this.addGoodsForm.goodsAddCount = null
      }
      this.dialogAddGoodsVisible = true
    },
    updateContainerGoodsRepertory() { // 提交补货数据
      this.addGoodsForm.token = getToken()
      this.addGoodsForm.machineId = this.machineId
      updateRobotContainerRepertory(this.addGoodsForm).then(response => {
        if (response.data.code === 0) {
          this.infoObj.goodsList[this.changeListIndex].currentCount = parseInt(this.infoObj.goodsList[this.changeListIndex].currentCount) + parseInt(this.addGoodsForm.goodsAddCount) // 更新表格中剩余库存量的值
          this.dialogAddGoodsVisible = false
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
    updateRobotBindInfo() { // 更新机器人绑定的对话以及路径信息等
      this.listLoading0 = true
      updateRobotRetailBindInfo(this.infoObj).then(response => {
        if (response.data.code === 0) {
          this.listLoading0 = false
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

  <style>
    .app-container{
      background-color: #f0f2f5;
    }
    .tag{
       margin-right: 15px;
       font-size: 16px;
       height: 35px;
       line-height: 35px;;
    }
    .mains{
      background-color: #fbfbfb;
      padding: -10px 20px;
      border: 1px solid #ebeef5;
      float:left;
    }
    .demo-form-inline{
      margin-top: 20px;
    }
    .filter-container{
      margin-top: 20px;
    }

  </style>
