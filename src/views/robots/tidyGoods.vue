<template>
  <div class="app-container">
    <el-container>
      <el-row :gutter="20" style="width:100%;margin-left:0 !important;"  class="main">
        <el-col  :xs="12" :sm="12" :lg="16">
          <el-form class="demo-form-inline">
            <el-form-item label="货柜层" class="item">
              <el-select v-model="selectContainerFloorId" placeholder="请选择货柜层" @change="changeContainerFloorId">
                <el-option v-for="item in containerFloorOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="货架商品"  class="item">
              <el-select v-model="selectGoodsId" placeholder="请选择上架商品" @change="changeSelectGoods">
                <el-option v-for="item in goodsList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="商品图片"  class="item">
              <img v-if="imageUrl" :src="imageUrl" class="avatar">
            </el-form-item>
            <el-form-item label="单价"  class="item">
              <el-input v-model="goodsPrice" :disabled="true" placeholder="商品价格(元)" style="width:30%"></el-input>
            </el-form-item>
            <el-form-item label="货架满载数量"  class="item">
              <el-input v-model="totalCount" :disabled="true" placeholder="当前层满载数量"  style="width:30%"></el-input>
            </el-form-item>
            <el-form-item label="货架当前数量"  class="item">
              <el-input v-model="currentLeftCount" :disabled="true" placeholder="当前层剩余数量"  style="width:30%"></el-input>
            </el-form-item>

            <el-form-item label="当前仓库总库存">
              <el-input v-model="totalLeftCount" :disabled="true" placeholder="商品总库存"  style="width:30%"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="success" style="margin-left: 120px" @click="updateContainerInfo">提交</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :xs="12" :sm="12" :lg="8"></el-col>
      </el-row>
    </el-container>
  </div>
</template>

<script>
import { getTidyRobotGoodsData, getRobotGoodsInfoByContainerFloorId, updateContainerGoodsData } from '@/api/robots'
import { fetchListAll } from '@/api/goodslist'
import { getToken } from '@/utils/auth'

export default {
  data() {
    return {
      listLoading: true,
      machineId: null,
      selectContainerFloorId: null, // 所选择的要显示的货柜层
      selectGoodsId: null, // 选择的商品id
      imageUrl: null, // 商品图片链接
      goodsPrice: 0, // 商品价格
      currentLeftCount: 0,
      totalCount: 0,
      totalLeftCount: 0, // 当前商品仓库总库存量
      containerFloorOptions: null, // 当前机器人的货柜层数列表
      goodsList: null, // 商品名称列表

      infoObj: { // 提交数据使用的结构
        machineId: null,
        selectContainerFloorId: null, // 所要修改的层id
        selectGoodsId: null, // 选择的商品
        currentLeftCount: 0, // 上架的初始数量
        totalCount: 0 // 每层商品满载总数
      }
    }
  },
  mounted() {
    this.machineId = this.$route.name.substr(1) // 去除第一个字符
    this.getGoodsNameList() // 获取商品名称列表
    this.getTidyRobotGoodsInfo() // 获取整理货柜页面的数据
  },
  methods: {
    changeContainerFloorId(val) { // 点击修改了当前要查看的货柜层
      this.getRobotGoodsInfoByContainerFloor()
    },
    changeSelectGoods(val) { // 查看不同的商品
      for (const v in this.goodsList) {
        if (this.goodsList[v].id === val) {
          this.imageUrl = this.goodsList[v].imageUrl
          this.goodsPrice = this.goodsList[v].goodsPrice
        }
      }
    },
    getTidyRobotGoodsInfo() { // 获取整理货柜页面的数据
      getTidyRobotGoodsData(this.machineId).then(response => {
        if (response.data.code === 0) {
          this.containerFloorOptions = response.data.containerFloorOptions
          this.selectContainerFloorId = this.containerFloorOptions[0].value // 默认选择列表第一个显示
          this.getRobotGoodsInfoByContainerFloor()
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    getRobotGoodsInfoByContainerFloor() { // 根据货道层去加载该层商品信息
      getRobotGoodsInfoByContainerFloorId(this.machineId, this.selectContainerFloorId).then(response => {
        if (response.data.code === 0) {
          this.selectGoodsId = response.data.selectGoodsId
          this.imageUrl = response.data.imageUrl
          this.goodsPrice = response.data.goodsPrice
          this.totalCount = response.data.totalCount
          this.currentLeftCount = response.data.currentLeftCount
          this.totalLeftCount = response.data.totalLeftCount
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    getGoodsNameList() {
      fetchListAll(getToken()).then(response => {
        if (response.data.code === 0) {
          this.goodsList = response.data.items // 设置接收的商品列表
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    updateContainerInfo() { // 提交修改数据
      this.infoObj.machineId = this.machineId
      this.infoObj.selectContainerFloorId = this.selectContainerFloorId
      this.infoObj.selectGoodsId = this.selectGoodsId
      this.infoObj.totalCount = this.totalCount
      this.infoObj.currentLeftCount = this.currentLeftCount
      updateContainerGoodsData(this.infoObj).then(response => {
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
    }
  }
}
</script>

  <style>
    .app-container{
      background-color: #f0f2f5;
      height: 1000px;
    }
    .tag{
       margin-right: 15px;
       font-size: 16px;
       height: 35px;
       line-height: 35px;;
    }
    .main{
      background-color: #fbfbfb;
      padding:0 20px;
      border: 1px solid #ebeef5;
      width: 100%;
      box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.05);
    }
    .demo-form-inline{
      margin-top: 20px;
    }
    .run{
    background: #fff;
    margin-top: 15px;
    }
    .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
    }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
   }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
   }
   .demo-form-inline label{
     width: 120px;
     text-align: left;
     float:left;
   }
   .el-select{
     width: 30%;
   }

  </style>
