<template>
  <div class="chart-container">
    <div :id='id' style="height:100%;width:100%;"></div>
  </div>
</template>

<script>
import echarts from 'echarts'
import { getPosAndSpeed, sendGoalName, getFloorPosNameArr, getCarPathByMachineId } from '@/api/robots'
import { getToken } from '@/utils/auth'

var option = null
var series = null
var lastClickPos = null
var planePath = 'path://M268.601,18.375c0,0,14.496,0,18.005,0 		c31.325,0,59.155,0,59.155,0c6.701,0,12.14,5.238,12.14,11.695v17.872c-24.507,0-44.374,19.859-44.374,44.351 		c0,24.492,19.86,44.351,44.374,44.351V335.99c-24.507,0.006-44.374,19.857-44.374,44.357c0,24.484,19.86,44.344,44.374,44.352 		v25.26c0,6.457-5.431,11.695-12.14,11.695H200.158c-12.013,0-19.527-7.781-19.527-19.084c0,0,0-351.215,0-365.378 		s18.736-42.622,44.1-53.734C238.303,17.658,268.601,18.375,268.601,18.375z M202.818,387.729v39.918 		c0,6.531,5.29,11.828,11.821,11.828h35.426c6.531,0,11.814-5.297,11.814-11.828v-39.918H202.818z M202.818,321.199v51.746h59.053 		v-51.746H202.818z M202.818,254.904v51.518h59.053v-51.518H202.818z M202.818,188.413v51.517h59.053v-51.517H202.818z 		 M202.818,121.882v51.746h59.053v-51.746H202.818z M289.658,121.904c-3.037,0-5.497,3.311-5.497,7.396 		c0,4.086,2.46,7.389,5.497,7.389h10.978c3.037,0,5.497-3.303,5.497-7.389c0-4.085-2.46-7.396-5.497-7.396H289.658z M237.38,43.472 		c-20.229,4.766-34.562,30.897-34.562,38.145c0,17.754,0,25.475,0,25.475h59.053l0.03-66.094 		C261.901,40.998,253.641,39.653,237.38,43.472z M328.326,380.348c0-16.328,13.247-29.568,29.59-29.568 		c16.335,0,29.582,13.24,29.582,29.568c0,16.334-13.247,29.566-29.582,29.566C341.573,409.914,328.326,396.682,328.326,380.348z 		 M328.326,92.286c0-16.328,13.247-29.567,29.59-29.567c16.335,0,29.582,13.239,29.582,29.567c0,16.335-13.247,29.574-29.582,29.574 		C341.573,121.86,328.326,108.621,328.326,92.286z  '

export default {
  name: 'robotRunMap',
  data() {
    return {
      mapName: 'mallMap',
      floorName: 'floor3', // 一层
      chart: null,
      id: 'mychart',
      lineDataArr: [],
      interval: null, // 定时器对象
      geoCoordMap: [], // 地图上位置点的数组
      currentCar3Pos: [50, 50] // 当前楼层三号机器人的位置点
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
    this.getPosNameArr() // 加载该楼层创建的节点名称列表，加载完数据之后调用this.initChart()渲染界面
  },
  methods: {
    getPosNameArr() { // 获取楼层节点名称列表
      getFloorPosNameArr('floor3').then(response => {
        if (response.data.code === 0) {
          this.geoCoordMap = response.data.posNameArr
          for (var index in this.geoCoordMap) { // 生成创建路线的地点选择列表 this.goalNameArr
            this.geoCoordMap[index].value[0] *= (0.35 / 0.3) // 节点坐标值乘以一个背景图缩放系数
            this.geoCoordMap[index].value[1] *= (0.35 / 0.3)
          }
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
        this.initChart() // 不管是否有节点最后都进行界面渲染
        this.getCarRunPathByMachineId('3')
      })
    },
    getCarRunPathByMachineId(machineId) { // 根据机器人编号获取绑定的路径信息
      getCarPathByMachineId(machineId).then(response => {
        if (response.data.code === 0) {
          var pathList = response.data.jsonPathArr // 服务器已经将数据转换成了json对象
          for (var index in pathList) {
            for (var key in this.geoCoordMap) {
              if (pathList[index].posName === this.geoCoordMap[key].name) {
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
          this.chart.setOption(option, true)
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
    getCurrentPosAndSpeed() { // 定时获取当前小车的运行位置和速度
      const token = getToken()
      getPosAndSpeed(token, '3').then(response => {
        if (response.data.code === 0) {
          option.series[6].data[0].value = response.data.carOneSpeed // 设置速度 一个循环中会添加3个，5 6 7 。。。
          option.series[7].data[0].value = response.data.batteryValue // 设置电池电压

          var carOneStartPosName = response.data.carOneStartPosName // 路段起始位置的名称
          var carOneEndPosName = response.data.carOneEndPosName // 路段结束位置的名称
          var carOneStartPosArr = []
          var carOneEndPosArr = []
          for (var i = 0; i < this.geoCoordMap.length; i++) {
            if (this.geoCoordMap[i].name === carOneStartPosName) {
              carOneStartPosArr = this.geoCoordMap[i].value // 获取地点的坐标 [x, y]
            }
            if (this.geoCoordMap[i].name === carOneEndPosName) {
              carOneEndPosArr = this.geoCoordMap[i].value
            }
          }
          // console.log('--startPosName = ' + carOneStartPosName + ', carOneEndPosName = ' + carOneEndPosName + ', percent = ' + response.data.carOnePosPercent)
          if (response.data.carOnePosPercent >= 95) { // 当机器人成功到达某点时界面给出提示
            this.$notify({
              title: '成功',
              message: '机器人成功到达地点 - ' + carOneEndPosName,
              duration: 2000,
              type: 'success'
            })
          }
          var carOnePosPercent = response.data.carOnePosPercent * 0.01 // 从此位置计算当前路段顺时针的百分比

          var carOneStartPixelArr = carOneStartPosArr
          var carOneEndPixelArr = carOneEndPosArr
          var deltaX = carOneStartPixelArr[0] - carOneEndPixelArr[0]
          var deltaY = carOneStartPixelArr[1] - carOneEndPixelArr[1]
          var dis = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
          var k = deltaY / deltaX
          // console.log('dis = ' + dis + '  k = ' + k)
          var result = (dis * carOnePosPercent) / Math.sqrt((1 + k * k))
          var targetX1 = carOneStartPixelArr[0] + result
          var targetX2 = carOneStartPixelArr[0] - result
          // console.log('x1 = ' + targetX1 + ', x2 = ' + targetX2)
          var targetY = 0
          var targetX = 0
          if ((targetX1 >= carOneStartPixelArr[0] && targetX1 <= carOneEndPixelArr[0]) || (targetX1 >= carOneEndPixelArr[0] && targetX1 <= carOneStartPixelArr[0])) { // 如果x在x1和x2之间
            targetX = targetX1
            targetY = carOneStartPixelArr[1] + k * (targetX1 - carOneStartPixelArr[0])
          } else if ((targetX2 >= carOneStartPixelArr[0] && targetX2 <= carOneEndPixelArr[0]) || (targetX2 >= carOneEndPixelArr[0] && targetX2 <= carOneStartPixelArr[0])) {
            targetX = targetX2
            targetY = carOneStartPixelArr[1] + k * (targetX2 - carOneStartPixelArr[0])
          }
          option.series[3].data[0].value = [targetX, targetY]
          this.chart.setOption(option, true)
        } else {
          this.$notify.error({
            title: '提醒',
            message: response.data.message,
            duration: 5000
          })
          clearInterval(this.interval) // 取消定时器，避免跳转到其他页面一不停地请求服务器
        }
      })
    },
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.showLoading()
      series = [{ // 系列列表。每个系列通过 type 决定自己的图表类型
        name: 'show_scatter', // 固定的散点图小圆点，热气球下面的圆点样式
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
        map: this.mapName,
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
            show: true, // 显示气球上面的内容
            formatter: '{b}', // {"name":"实验室","value":[112.40386962890624,28.016226126405627,250]}  0~2
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
      { // 小车当前位置的涟漪特效的点，在series中下标为3
        name: 'carPoint',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: [{
          name: '三楼3号',
          value: this.currentCar3Pos // 需要程序动态更新此值
        }],
        symbolSize: 25,
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke'
        },
        hoverAnimation: true,
        label: {
          normal: {
            formatter: '{b}',
            position: 'inside',
            show: true
          }
        },
        itemStyle: {
          normal: {
            color: '#0000FF',
            shadowBlur: 10,
            shadowColor: '#9400D3'
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
      // 向series中添加仪表盘
      var highlight = '#551A8B'
      var speedData = [ // 现在只有一个小车
        { name: '机器人3速度', value: 0, pos: ['86%', '14%'], batteryPos: ['95%', '17%'], batteryValue: 20 }
      ]
      var changeSpeedArr = function(speedData) {
        // pre_series = series // 复制series变量
        speedData.forEach(function(item) {
          series.push(
            { // 正中间圆盘的外围刻度  series中下标为5
              type: 'gauge',
              center: item.pos, // 外圈的中心点
              radius: '22%', // 外圈的半径
              splitNumber: 10,
              min: 0,
              max: 500,
              startAngle: 225,
              endAngle: -45,
              axisLine: {
                show: true,
                lineStyle: {
                  width: 2,
                  shadowBlur: 0,
                  color: [
                    [1, highlight]
                  ]
                }
              },
              axisTick: {
                show: true,
                lineStyle: {
                  color: highlight,
                  width: 1
                },
                length: 5,
                splitNumber: 10
              },
              splitLine: {
                show: true,
                length: 14,
                lineStyle: {
                  color: highlight
                }
              },
              axisLabel: {
                distance: 6,
                textStyle: {
                  color: highlight,
                  fontSize: '10'
                }
              },
              pointer: {
                show: 0
              },
              detail: {
                show: 0
              }
            },
            { // 正中间圆盘的内侧指针、数值显示
              name: item.name,
              type: 'gauge',
              center: item.pos,
              radius: '13%',
              startAngle: 225,
              endAngle: -45,
              min: 0,
              max: 500,
              axisLine: {
                show: true,
                lineStyle: {
                  width: 16,
                  color: [
                    [1, 'rgba(255,255,255,.1)']
                  ]
                }
              },
              axisTick: {
                show: 0
              },
              splitLine: {
                show: 0
              },
              axisLabel: {
                show: 0
              },
              pointer: {
                show: true,
                length: '105%'
              },
              detail: {
                show: true,
                offsetCenter: [0, '100%'],
                textStyle: {
                  fontSize: 12,
                  color: '#8B008B'
                },
                formatter: [
                  '{value} ' + 'mm/s',
                  '{name|' + item.name + '}'
                ].join('\n'),
                rich: {
                  name: {
                    fontSize: 12,
                    lineHeight: 30,
                    color: '#483D8B'
                  }
                }
              },
              itemStyle: {
                normal: {
                  color: highlight
                }
              },
              data: [{
                value: item.value
              }]
            }, {
              name: '电池电压',
              type: 'gauge',
              center: item.batteryPos, // 默认全局居中
              radius: '16%',
              min: 20,
              max: 26,
              startAngle: 135,
              splitNumber: 6,
              axisLine: { // 坐标轴线
                lineStyle: { // 属性lineStyle控制线条样式
                  width: 4
                }
              },
              axisTick: { // 坐标轴小标记
                length: 6, // 属性length控制线长
                lineStyle: { // 属性lineStyle控制线条样式
                  color: 'auto'
                }
              },
              splitLine: { // 分隔线
                length: 10, // 属性length控制线长
                lineStyle: { // 属性lineStyle（详见lineStyle）控制线条样式
                  color: 'auto'
                }
              },
              pointer: {
                width: 3
              },
              title: {
                offsetCenter: [0, '-30%'], // x, y，单位px
                fontWeight: 'bolder',
                fontSize: 10
              },
              detail: {
                textStyle: {
                  fontSize: 12,
                  color: 'auto'
                },
                formatter: [
                  '{value} ' + 'V'
                ].join('\n')
              },
              data: [{ value: item.batteryValue, name: '电压V' }]
            }
          )
        })
      }
      changeSpeedArr(speedData) // 添加仪表盘UI
      /** *****************************************全局相关设置*************************************** */
      option = {
        title: {
          text: '商场一楼  机器人运行图',
          subtext: '显示并控制当前楼层机器人的运动',
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
          map: this.mapName,
          // left: '1%', // 地图数据整体平移，距离左边的百分比
          roam: false, // 是否开启鼠标缩放和平移漫游
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
            scale: [0.35, 0.35],
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
      // echarts绑定鼠标点击事件
      this.chart.on('click', function(param) { // 鼠标点击组件事件
        // console.log(param.name)
        if (param.name !== '') {
          sendGoalName(getToken(), param.name, '3').then(response => {
            alert(response.data.message)
          })
        }
      })
      this.getCurrentPosAndSpeed()
      this.interval = setInterval(() => { // 定时器函数，模拟小车速度，清除定时器：clearInterval(this.interval)
        this.getCurrentPosAndSpeed()
      }, 2000)
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
  width:42%;
  height:100%;
  right:10px;
  top:25%;
  z-index:999;
  overflow:auto;/**右边菜单列表可以滚动*/
}
</style>

