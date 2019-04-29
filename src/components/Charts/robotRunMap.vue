<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'
import { getRobotMapData, getPathData, getPosAndSpeed, sendGoalName } from '@/api/robots'
import { getToken } from '@/utils/auth'

var option = null
var planePath = 'path://M268.601,18.375c0,0,14.496,0,18.005,0 		c31.325,0,59.155,0,59.155,0c6.701,0,12.14,5.238,12.14,11.695v17.872c-24.507,0-44.374,19.859-44.374,44.351 		c0,24.492,19.86,44.351,44.374,44.351V335.99c-24.507,0.006-44.374,19.857-44.374,44.357c0,24.484,19.86,44.344,44.374,44.352 		v25.26c0,6.457-5.431,11.695-12.14,11.695H200.158c-12.013,0-19.527-7.781-19.527-19.084c0,0,0-351.215,0-365.378 		s18.736-42.622,44.1-53.734C238.303,17.658,268.601,18.375,268.601,18.375z M202.818,387.729v39.918 		c0,6.531,5.29,11.828,11.821,11.828h35.426c6.531,0,11.814-5.297,11.814-11.828v-39.918H202.818z M202.818,321.199v51.746h59.053 		v-51.746H202.818z M202.818,254.904v51.518h59.053v-51.518H202.818z M202.818,188.413v51.517h59.053v-51.517H202.818z 		 M202.818,121.882v51.746h59.053v-51.746H202.818z M289.658,121.904c-3.037,0-5.497,3.311-5.497,7.396 		c0,4.086,2.46,7.389,5.497,7.389h10.978c3.037,0,5.497-3.303,5.497-7.389c0-4.085-2.46-7.396-5.497-7.396H289.658z M237.38,43.472 		c-20.229,4.766-34.562,30.897-34.562,38.145c0,17.754,0,25.475,0,25.475h59.053l0.03-66.094 		C261.901,40.998,253.641,39.653,237.38,43.472z M328.326,380.348c0-16.328,13.247-29.568,29.59-29.568 		c16.335,0,29.582,13.24,29.582,29.568c0,16.334-13.247,29.566-29.582,29.566C341.573,409.914,328.326,396.682,328.326,380.348z 		 M328.326,92.286c0-16.328,13.247-29.567,29.59-29.567c16.335,0,29.582,13.239,29.582,29.567c0,16.335-13.247,29.574-29.582,29.574 		C341.573,121.86,328.326,108.621,328.326,92.286z  '
export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '200px'
    },
    height: {
      type: String,
      default: '200px'
    }
  },
  data() {
    return {
      chart: null,
      interval: null, // 定时器对象
      mapData: null, // 地图数据
      lineDataArr: null, // 路径数组
      geoCoordMap: null, // 地图上位置点的数组
      visualMapData: null // 配合visualMap渲染地图
    }
  },
  mounted() {
    this.getPathData() // 获取路径数组
    this.getMapData() // 获取地图数据
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    getMapData() { // 从服务器获取地图json数据和位置点数组和导航路径数组和位置点的波纹效果
      const token = getToken()
      getRobotMapData(token).then(response => {
        if (response.data.code === 0) {
          this.mapData = response.data.mapdata
          this.initChart()
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    getPathData() {
      const token = getToken()
      getPathData(token).then(response => {
        if (response.data.code === 0) {
          var fileContent = response.data.fileContent
          var jsonObj = JSON.parse(fileContent)
          this.lineDataArr = jsonObj.lineDataArr // 不需要转换，接下来替换从文件中读取，换成从数据库中读取
          var coordData = jsonObj.geoCoordMap // 进行转换
          this.geoCoordMap = []
          this.visualMapData = []
          for (var key in coordData) { // 重新生成geoCoordMap
            this.geoCoordMap.push({
              name: key,
              value: coordData[key], // {"name":"实验室","value":[112.40386962890624,28.016226126405627,250]}
              staySec: 0
            })
            this.visualMapData.push({
              name: key,
              value: coordData[key][2]
            })
          }
          // console.log(JSON.stringify(this.geoCoordMap))
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    getCurrentPosAndSpeed() { // 定时获取当前小车的运行位置和速度
      const token = getToken()
      getPosAndSpeed(token, '3').then(response => {
        if (response.data.code === 0) {
          // console.log('speeddata = ' + JSON.stringify(response.data))
          option.series[6].data[0].value = response.data.carOneSpeed // 设置速度 一个循环中会添加3个，5 6 7 。。。
          option.series[7].data[0].value = response.data.batteryValue // 设置电池电压

          var carOneStartPosName = response.data.carOneStartPosName // 路段起始位置的名称
          var carOneEndPosName = response.data.carOneEndPosName // 路段结束位置的名称
          var carOneStartPosArr = []
          var carOneEndPosArr = []
          for (var i = 0; i < this.geoCoordMap.length; i++) {
            if (this.geoCoordMap[i].name === carOneStartPosName) {
              carOneStartPosArr = this.geoCoordMap[i].value.slice(0, 2) // 截取部分数据start-(end-1)
            }
            if (this.geoCoordMap[i].name === carOneEndPosName) {
              carOneEndPosArr = this.geoCoordMap[i].value.slice(0, 2)
            }
          }
          var carOnePosPercent = response.data.carOnePosPercent * 0.01 // 从此位置计算当前路段顺时针的百分比

          var carOneStartPixelArr = this.chart.convertToPixel('geo', carOneStartPosArr) // (x1, y1)
          var carOneEndPixelArr = this.chart.convertToPixel('geo', carOneEndPosArr) // (x2, y2)

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
          var geoTarget = this.chart.convertFromPixel('geo', [targetX, targetY])
          option.series[3].data[0].value = geoTarget

          this.chart.setOption(option, true)
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
          // 取消定时器，避免跳转到其他页面一不停地请求服务器
          clearInterval(this.interval)
        }
      })
    },
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.showLoading()
      var mapName = 'mallMap'

      var convertPathData = function(data) { // 遍历坐标生成路径数组
        var lines = []
        // console.log('data = ' + JSON.stringify(data))
        for (var key in data) {
          lines.push(data[key]) // 将服务器发送过来的名称与坐标对象拼接成一个路径坐标数组
        }
        return lines
      }
      var series = [{ // 系列列表。每个系列通过 type 决定自己的图表类型
        name: 'show_scatter', // 固定的散点图小圆点
        type: 'scatter',
        coordinateSystem: 'geo',
        data: this.geoCoordMap,
        symbol: 'circle',
        symbolSize: 20,
        label: {
          normal: {
            formatter: '{b}', // 显示数据名
            position: 'right',
            show: true
          },
          emphasis: {
            show: true
          }
        },
        itemStyle: {
          normal: {
            color: '#48D1CC',
            shadowColor: 'rgba(0,0,139, 0.8)',
            shadowBlur: 15,
            shadowOffsetX: 3,
            shadowOffsetY: 3,
            opacity: 0.9
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
        data: this.visualMapData
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
            formatter: '{@[2]}', // {"name":"实验室","value":[112.40386962890624,28.016226126405627,250]}  0~2
            textStyle: {
              color: '#fff',
              fontSize: 9
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
      { // 带有涟漪特效的点，在series中下标为3
        name: 'carPoint',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: [{
          name: '一楼#3',
          value: [112.40386962890624, 28.016226126405627] // 需要程序动态更新此值
        }],
        symbolSize: 40,
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
            color: '#2F4F4F',
            shadowBlur: 10,
            shadowColor: '#05C3F9'
          }
        },
        zlevel: 3
      },
      {
        name: 'show_path',
        type: 'lines', // 显示路径
        data: [convertPathData(this.lineDataArr)],
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
            width: 5,
            shadowColor: 'rgba(0, 0, 0, 0.9)',
            shadowBlur: 5
          }
        },
        progressiveThreshold: 500,
        progressive: 200
      }]
      // 向series中添加仪表盘
      var highlight = '#551A8B'
      var speedData = [ // 现在只有一个小车
        { name: '机器人3速度', value: 220, pos: ['14%', '14%'], batteryPos: ['5%', '17%'], batteryValue: 24 }
      ]
      var changeSpeedArr = function(speedData) {
        // pre_series = series // 复制series变量
        speedData.forEach(function(item) {
          series.push(
            { // 正中间圆盘的外围刻度
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
              endAngle: 45,
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
      changeSpeedArr(speedData)

      /** ******************************************************************************************* */
      /** *****************************************全局相关设置*************************************** */
      /** ******************************************************************************************* */
      option = {
        backgroundColor: '#efefef',
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
          map: mapName,
          label: {
            normal: {
              show: false
            },
            emphasis: {
              show: false
            }
          },
          roam: true,
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
        series: series
      }

      echarts.registerMap(mapName, this.mapData)
      this.chart.setOption(option, true)
      this.chart.hideLoading()
      // echarts绑定鼠标点击事件
      this.chart.on('click', function(param) { // 鼠标点击组件事件
        console.log(param.name)
        if (param.name !== '') {
          sendGoalName(getToken(), param.name, '3').then(response => {
            alert(response.data.message)
          })
        }
      })

      this.interval = setInterval(() => { // 定时器函数，模拟小车速度，清除定时器：clearInterval(this.interval)
        this.getCurrentPosAndSpeed()
      }, 2000)
    }
  }
}
</script>
