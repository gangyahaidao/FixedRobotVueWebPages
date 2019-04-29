<template>
  <div class="chart-container" @mousedown="getMouseEnterPos">
    <div class="absolutecss-create-path">
      <el-form label-position="left" label-width="100px">
        <el-form-item label="查看路线">
          <el-select v-model="selectPathId" placeholder="请选择创建的路线" @change="loadSelectPathData">
            <el-option v-for="item in pathLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="绑定机器人">
          <el-select v-model="machineId" placeholder="请选择绑定路线的机器人">
            <el-option v-for="item in robotOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-button type="warning" @click="bindRobotWithPath">绑定路线</el-button>
        </el-form-item>
      </el-form>

      <hr style="border:3 double #987cb9" width="100%" color=#987cb9 size=3/>
      <el-row>
        <el-switch v-model="isInNodeCreateMode" active-text="开启节点创建模式" inactive-text="关闭"></el-switch>
        <el-button type="success" @click="createNewPos">提交节点</el-button>
      </el-row>
      <hr style="border:3 double #987cb9" width="100%" color=#987cb9 size=3/>
      <el-row>
        <el-button type="primary" @click="createNewPath">新建路径</el-button>
      </el-row>
      <el-row>
        <span>路线名称</span>
        <el-input v-model="pathTaskObj.name" style="width:60%;margin-left:4%;margin-top:10px" placeholder="请输入"></el-input>
      </el-row>
      <el-row>
        <span>起始点</span>
        <el-select v-model="pathTaskObj.startPosName" style="width:60%;margin-left:8%;margin-top:10px" placeholder="请选择">
          <el-option
            v-for="item in goalNameArr"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-row>
      <el-row>
        <span>暂停时间</span>
        <el-select v-model="pathTaskObj.loopStaySec" placeholder="一圈停留时间" style="width:60%;margin-left:4%;margin-top:10px">
          <el-option v-for="item in stayTimeArr" :label="item.label" :key="item.label" :value="item.value"></el-option>
        </el-select>
      </el-row>
      <el-row>
        <el-select v-model="newPathItem.posName" placeholder="路径点" style="width:45%;margin-top:10px">
          <el-option
            v-for="item in goalNameArr"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="newPathItem.staySec" placeholder="暂停时间" style="width:45%">
          <el-option v-for="item in stayTimeArr" :label="item.label" :key="item.label" :value="item.value"></el-option>
        </el-select>
        <el-button type="danger" icon="el-icon-plus" size="mini" style="margin-top:10px" @click="addPosObj">添加</el-button>
        <el-button v-if="selectPathId === null" type="success" icon="el-icon-check" size="mini" style="margin-top:10px;margin-bottom:10px" @click="savePathListToServer">保存</el-button>
        <el-button v-else type="warning" icon="el-icon-upload2" size="mini" style="margin-top:10px;margin-bottom:10px" @click="updatePathListToServer">更新</el-button>
      </el-row>
      <template>
        <el-table :data="pathTaskObj.pathDataList" style="width: 98%;height: 1080px" stripe>
          <el-table-column fixed prop="posName" label="地点名称" min-width="100"></el-table-column>
          <el-table-column prop="staySec" label="停留时间(S)" width="120"></el-table-column>
          <el-table-column fixed="right" label="操作" width="80">
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="deletePosRow(scope.$index, pathTaskObj.pathDataList)"
                type="text"
                size="small">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </div>

    <div :id='id' style="height:100%;width:100%"></div>

    <el-dialog title="创建节点" :visible.sync="dialogVisible" width="30%">
      <el-form>
        <el-form-item label="节点名称" label-width="70px">
          <el-input ref="inputPosName" v-model="currentNewPosName" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="clickOKCreateNewPos">确 定</el-button>
        <el-button type="dander" @click="clickOKCreateNewPosDone">确定并结束创建</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import echarts from 'echarts'
import { getPathByFloorName, saveNewPath, updateNewPath, getRobotNameList, bindPathIdToRobot, saveFloorPosNames, getFloorPosNameArr } from '@/api/robots'

var option = null
var lastClickPos = null
var planePath = 'path://M268.601,18.375c0,0,14.496,0,18.005,0 		c31.325,0,59.155,0,59.155,0c6.701,0,12.14,5.238,12.14,11.695v17.872c-24.507,0-44.374,19.859-44.374,44.351 		c0,24.492,19.86,44.351,44.374,44.351V335.99c-24.507,0.006-44.374,19.857-44.374,44.357c0,24.484,19.86,44.344,44.374,44.352 		v25.26c0,6.457-5.431,11.695-12.14,11.695H200.158c-12.013,0-19.527-7.781-19.527-19.084c0,0,0-351.215,0-365.378 		s18.736-42.622,44.1-53.734C238.303,17.658,268.601,18.375,268.601,18.375z M202.818,387.729v39.918 		c0,6.531,5.29,11.828,11.821,11.828h35.426c6.531,0,11.814-5.297,11.814-11.828v-39.918H202.818z M202.818,321.199v51.746h59.053 		v-51.746H202.818z M202.818,254.904v51.518h59.053v-51.518H202.818z M202.818,188.413v51.517h59.053v-51.517H202.818z 		 M202.818,121.882v51.746h59.053v-51.746H202.818z M289.658,121.904c-3.037,0-5.497,3.311-5.497,7.396 		c0,4.086,2.46,7.389,5.497,7.389h10.978c3.037,0,5.497-3.303,5.497-7.389c0-4.085-2.46-7.396-5.497-7.396H289.658z M237.38,43.472 		c-20.229,4.766-34.562,30.897-34.562,38.145c0,17.754,0,25.475,0,25.475h59.053l0.03-66.094 		C261.901,40.998,253.641,39.653,237.38,43.472z M328.326,380.348c0-16.328,13.247-29.568,29.59-29.568 		c16.335,0,29.582,13.24,29.582,29.568c0,16.334-13.247,29.566-29.582,29.566C341.573,409.914,328.326,396.682,328.326,380.348z 		 M328.326,92.286c0-16.328,13.247-29.567,29.59-29.567c16.335,0,29.582,13.239,29.582,29.567c0,16.335-13.247,29.574-29.582,29.574 		C341.573,121.86,328.326,108.621,328.326,92.286z  '

export default {
  name: 'robotRunMap',
  data() {
    return {
      isInNodeCreateMode: false,
      dialogVisible: false, // 创建节点的弹框
      currentNewPosName: '',
      currentClickPosValue: [],
      newPosDataArr: [], // 用于存储新创建的点

      floorName: 'floor3', // 一层
      chart: null,
      id: 'mychart',
      interval2: null,
      pathLists: null, // 存储从服务器获取的已经创建的路径列表
      selectPathId: null, // 选择的路线
      machineId: null, // 选择绑定路线的机器人
      lineDataArr: [], // 路径数组
      geoCoordMap: null, // 地图上位置点的数组
      visualMapData: null, // 配合visualMap渲染地图
      robotOptions: null, // 从服务器获取机器人列表
      goalNameArr: [],
      stayTimeArr: [{
        label: '不停留', value: 0 },
      { label: '30秒', value: 30 },
      { label: '一分钟', value: 60 },
      { label: '二分钟', value: 120 },
      { label: '三分钟', value: 180 },
      { label: '五分钟', value: 300 },
      { label: '十分钟', value: 600 }
      ],
      stayPosName: '', // 选择的停留点
      stayMins: 0, // 停留的时间秒
      newPathItem: {
        posName: '',
        staySec: 0
      },
      pathTaskObj: {
        pathId: null,
        name: '', // 新建路径名称
        startPosName: '', // 设置路径的起始点，这样可以控制机器人到达起始点时停止
        loopStaySec: 0, // 一圈的停留时间
        floorName: 'floor3', // 路线所属楼层的名字
        pathDataList: [] // 存储新创建的路径点对象
      }
    }
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  created() {
    this.getPathByFloorNames() // 获取已经创建的路径列表
    this.getRobotList() // 获取本楼层后台服务器拼凑的机器人信息列表
    this.getPosNameArr() // 加载该楼层创建的节点名称列表，加载完数据之后调用this.initChart()渲染界面
  },
  mounted() {
    if (this.$route.query.pathId !== undefined) {
      this.interval2 = setInterval(() => { // 定时器函数，模拟小车速度，清除定时器：clearInterval(this.interval)
        if (this.chart != null) {
          clearInterval(this.interval2)
          this.loadSelectPathData(this.$route.query.pathId) // 加载指定编号的路径
          this.selectPathId = this.$route.query.pathId
          for (var index in this.robotOptions) { // 设置路线所属的机器人
            if (this.$route.query.pathId === this.robotOptions[index].pathId) {
              this.machineId = this.robotOptions[index].value
            }
          }
        }
      }, 300)
    }
  },
  methods: {
    getMouseEnterPos(event) {
      if (this.dialogVisible) { // 如果有弹出框，则不响应点击事件，否则会影响原来点击的坐标值
        return
      }
      // console.log('offsetX = ' + event.offsetX + ', offsetY = ' + event.offsetY)
      if (this.isInNodeCreateMode) {
        this.dialogVisible = true // 弹出编辑框框
        this.currentClickPosValue = [event.offsetX, event.offsetY]
      }
    },
    clickOKCreateNewPos() {
      var pos = { name: this.currentNewPosName, value: this.currentClickPosValue }
      this.newPosDataArr.push(pos)
      this.chart.setOption(option, true)

      this.currentNewPosName = ''
      this.currentClickPosValue = []
      this.dialogVisible = false
    },
    clickOKCreateNewPosDone() {
      this.isInNodeCreateMode = false // 结束创建节点模式，避免不能点击提交按钮
      var pos = { name: this.currentNewPosName, value: this.currentClickPosValue }
      this.newPosDataArr.push(pos)
      this.chart.setOption(option, true)

      this.currentNewPosName = ''
      this.currentClickPosValue = []
      this.dialogVisible = false
    },
    getRobotList() {
      getRobotNameList(this.floorName).then(response => {
        if (response.data.code === 0) {
          this.robotOptions = response.data.robotNameList
        }
      })
    },
    addPosObj() { // 添加一个导航路径点
      if (this.newPathItem.posName === '') {
        this.$message({
          message: '请选择一个路径点',
          type: 'warning'
        })
        return
      }
      this.pathTaskObj.pathDataList.push(this.newPathItem)
      for (var key in this.geoCoordMap) { // 将新添加的点增加到路径显示数组中
        if (this.newPathItem.posName === this.geoCoordMap[key].name) {
          if (lastClickPos == null) {
            lastClickPos = this.geoCoordMap[key].value
          }
          var pathPos = { // 动态添加路线
            coords: [lastClickPos, this.geoCoordMap[key].value]
          }
          lastClickPos = this.geoCoordMap[key].value
          this.lineDataArr.push(pathPos)
          this.chart.setOption(option, true)
        }
      }
      this.chart.setOption(option, true)
      this.newPathItem = { posName: '', staySec: 0 } // 需要进行重新赋值操作，否则会出现数组中的所有数据都指向同一个对象
    },
    savePathListToServer() { // 将路径数据保存到服务器
      saveNewPath(this.pathTaskObj).then(response => {
        if (response.data.code === 0) {
          this.$message({
            message: response.data.message,
            type: 'success'
          })
          // this.getPathByFloorNames() // 重新加载已经创建的路径列表
          // 跳转到路径列表页面
          this.$router.push({ path: '/robotMonitor/floor3/pathList' })
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    updatePathListToServer() { // 更新数据到服务器
      updateNewPath(this.pathTaskObj).then(response => {
        if (response.data.code === 0) {
          this.$message({
            message: response.data.message,
            type: 'success'
          })
          this.getPathByFloorNames() // 重新加载已经创建的路径列表
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    deletePosRow(index, rows) {
      rows.splice(index, 1)
    },
    getPathByFloorNames() { // 加载该楼层的所有路线对象
      getPathByFloorName(this.floorName).then(response => {
        if (response.data.code === 0) {
          this.pathLists = response.data.pathLists
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    loadSelectPathData(val) { // 加载选中的路径信息
      for (var index in this.pathLists) { // 遍历获取的本层路径对象数组
        var pathObj = this.pathLists[index]
        if (pathObj.id === val) { // 数据表的主键，是整型
          this.pathTaskObj.pathId = pathObj.id
          this.pathTaskObj.name = pathObj.name
          this.pathTaskObj.startPosName = pathObj.startPosName
          this.pathTaskObj.loopStaySec = pathObj.loopStaySec
          this.pathTaskObj.floorName = pathObj.floorName

          this.pathTaskObj.pathDataList = JSON.parse(pathObj.jsonPathStr) // [{"posName":"实验室","staySec":30}, ....]
          this.lastClickPos = null // 清空上一个地点的值
          for (var index2 in this.pathTaskObj.pathDataList) { // 将路径渲染到地图上
            var pathObj2 = this.pathTaskObj.pathDataList[index2]
            for (var key in this.geoCoordMap) {
              if (pathObj2.posName === this.geoCoordMap[key].name) {
                if (lastClickPos == null) {
                  lastClickPos = this.geoCoordMap[key].value
                }
                var pathPos = { // 动态添加路线
                  coords: [lastClickPos, this.geoCoordMap[key].value]
                }
                lastClickPos = this.geoCoordMap[key].value
                this.lineDataArr.push(pathPos)
              }
            }
          }
        }
      }
      this.chart.setOption(option, true)
    },
    createNewPath() { // 创建一条新的路径
      this.selectPathId = null // 切换按钮为保存功能
      this.newPathItem.posName = ''
      this.newPathItem.staySec = 0

      this.pathTaskObj.pathId = null
      this.pathTaskObj.name = ''
      this.pathTaskObj.startPosName = ''
      this.pathTaskObj.loopStaySec = 0
      this.pathTaskObj.pathDataList = []

      this.lineDataArr.splice(0, this.lineDataArr.length) // 清空原来的数据
      this.chart.setOption(option, true)
    },
    createNewPos() { // 创建一串新的节点对象
      saveFloorPosNames(this.newPosDataArr, 'floor3').then(response => {
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
    getPosNameArr() { // 获取楼层节点名称列表
      getFloorPosNameArr('floor3').then(response => {
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
        this.initChart() // 不管是否有节点最后都进行界面渲染
      })
    },
    bindRobotWithPath() { // 将选中的路线与机器人绑定
      if (this.selectPathId == null) {
        this.$message({
          message: '请选择需要绑定的路线',
          type: 'error'
        })
        return
      } else if (this.machineId == null) {
        this.$message({
          message: '请选择需要绑定的机器人',
          type: 'error'
        })
        return
      }
      bindPathIdToRobot(this.machineId, this.selectPathId).then(response => {
        if (response.data.code === 0) {
          this.$message({
            message: response.data.message,
            type: 'success'
          })
          this.getPathByFloorNames() // 重新加载已经创建的路径列表
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    /*
    ************************************************************************************************************************************
    *****************************************************echarts显示相关设置函数*********************************************************
    ************************************************************************************************************************************
    */
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.showLoading()
      var mapName = 'pathMap'
      var series = [{ // 系列列表。每个系列通过 type 决定自己的图表类型
        name: 'show_scatter', // 固定的散点图小圆点
        type: 'scatter',
        coordinateSystem: 'geo',
        data: this.geoCoordMap,
        symbol: 'circle',
        symbolSize: 20,
        itemStyle: {
          normal: {
            color: '#48D1CC',
            shadowColor: 'rgba(0,0,139, 0.8)',
            shadowBlur: 15,
            shadowOffsetX: 3,
            shadowOffsetY: 3,
            opacity: 1.0
          }
        }
      },
      { // 地图主要用于地理区域数据的可视化，配合 visualMap 组件使用
        type: 'map',
        map: mapName,
        geoIndex: 0,
        draggable: false,
        aspectScale: 0.75, // 长宽比
        showLegendSymbol: false, // 存在legend时显示
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: false,
            textStyle: {
              color: '#fff'
            }
          }
        },
        roam: true,
        itemStyle: {
          normal: {
            areaColor: '#031525',
            borderColor: '#389BB7'
          },
          emphasis: {
            areaColor: '#389BB7',
            borderWidth: 0
          }
        },
        animation: false,
        data: []
      },
      {
        name: 'Popo', // 热气球点
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'pin',
        symbolSize: 50,
        label: {
          normal: {
            show: true,
            formatter: '{b}', // {"name":"实验室","value":[112,28]}  0~2
            textStyle: {
              color: '#fff',
              fontSize: 10
            }
          },
          emphasis: {
            show: true
          }
        },
        itemStyle: {
          normal: {
            color: '#F62157' // 标志颜色 F62157
          }
        },
        zlevel: 1,
        data: this.geoCoordMap
      },
      { // 地图中小车行走节点带涟漪特效的点，在series中下标为3
        name: 'posPoint',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: this.newPosDataArr,
        symbolSize: 22,
        showEffectOn: 'emphasis', // 只有在鼠标移到此对象上时才显示涟漪特效
        rippleEffect: {
          brushType: 'fill'
        },
        hoverAnimation: true,
        label: {
          normal: {
            formatter: '{b}',
            position: 'top',
            show: true
          }
        },
        itemStyle: {
          normal: {
            color: '#8B008B',
            shadowBlur: 10,
            shadowColor: '#00CED1'
          }
        },
        zlevel: 3
      }, {
        name: 'show_path',
        type: 'lines', // 显示路径
        data: this.lineDataArr,
        // data: [],
        effect: {
          show: true,
          period: 10,
          trailLength: 0,
          symbol: planePath,
          symbolSize: 16

        },
        coordinateSystem: 'geo',
        polyline: true,
        zlevel: 2, // 用于canvas分层
        lineStyle: {
          normal: {
            color: 'rgba(18,89,147, 1)',
            opacity: 0.8,
            width: 3,
            shadowColor: 'rgba(0, 0, 0, 0.9)',
            shadowBlur: 5
          }
        }
      }]
      /** *****************************************全局相关设置*************************************** */
      option = {
        // backgroundColor: '#efefef', // #efefef
        title: {
          text: '商场一楼  路径规划',
          subtext: '用于新建并修改一楼机器人的运行路径',
          x: 'center',
          textStyle: {
            color: '#000'
          }
        },
        tooltip: { // 点击地图上的图标提示框显示的内容
          trigger: 'item',
          formatter: function(params) {
            return params.name
          }
        },
        visualMap: { // 视觉映射，主要是将地图进行渲染
          show: false,
          min: 0,
          max: 500,
          left: 'left',
          top: 'bottom',
          text: ['高', '低'], // 文本，默认为数值文本
          calculable: true,
          seriesIndex: [1],
          inRange: {
            color: ['#20B2AA', '#9370DB'] // 修改地图区域以及路线的颜色 颜色参考网址：http://xh.5156edu.com/page/z1015m9220j18754.html
          }
        },
        geo: { // 地理坐标系组件，用于在地理坐标系上绘制散点图
          show: true,
          map: mapName,
          left: '8%', // 地图数据整体平移，距离左边的百分比
          roam: true, // 是否开启鼠标缩放和平移漫游
          label: {
            normal: {
              show: false
            },
            emphasis: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              areaColor: '#031525',
              borderColor: '#3B5077'
            },
            emphasis: {
              areaColor: '#2B91B7'
            }
          }
        },
        graphic: [
          {
            type: 'image',
            id: 'logo',
            left: 30,
            top: 60,
            z: -10,
            bounding: 'all',
            scale: [0.3, 0.3],
            style: {
              image: 'http://www.g58mall.com:8080/group1/M00/00/77/eBivnFwfU5GABJKcAAZUBtjKAv4493.png',
              opacity: 1
            }
          }
        ],
        series: series
      }

      this.chart.setOption(option, true)
      this.chart.hideLoading()
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
.absolutecss-create-path{
  position:absolute;
  width:25%;
  height:100%;
  right: 30px;
  top:5%;
  z-index:999;
  overflow:auto;/**菜单列表可以滚动*/
}
</style>

