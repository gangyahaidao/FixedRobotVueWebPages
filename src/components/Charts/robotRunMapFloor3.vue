<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'
import { getRobotMapData, getPathData, getPosAndSpeed, sendGoalName } from '@/api/robots'
import { getToken } from '@/utils/auth'
import $ from 'jquery'

var option = null
// var planePath = 'path://M-244.396,44.399c0,0,0.47-2.931-2.427-6.512c2.819-8.221,3.21-15.709,3.21-15.709s5.795,1.383,5.795,7.325C-237.818,39.679-244.396,44.399-244.396,44.399z M-260.371,40.827c0,0-3.881-12.946-3.881-18.319c0-2.416,0.262-4.566,0.669-6.517h17.684c0.411,1.952,0.675,4.104,0.675,6.519c0,5.291-3.87,18.317-3.87,18.317H-260.371z M-254.745,18.951c-1.99,0-3.603,1.676-3.603,3.744c0,2.068,1.612,3.744,3.603,3.744c1.988,0,3.602-1.676,3.602-3.744S-252.757,18.951-254.745,18.951z M-255.521,2.228v-5.098h1.402v4.969c1.603,1.213,5.941,5.069,7.901,12.5h-17.05C-261.373,7.373-257.245,3.558-255.521,2.228zM-265.07,44.399c0,0-6.577-4.721-6.577-14.896c0-5.942,5.794-7.325,5.794-7.325s0.393,7.488,3.211,15.708C-265.539,41.469-265.07,44.399-265.07,44.399z M-252.36,45.15l-1.176-1.22L-254.789,48l-1.487-4.069l-1.019,2.116l-1.488-3.826h8.067L-252.36,45.15z'
// var planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z'
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
          this.lineDataArr = jsonObj.lineDataArr // 不需要转换
          var coordData = jsonObj.geoCoordMap // 进行转换
          this.geoCoordMap = []
          this.visualMapData = []
          for (var key in coordData) { // 重新生成geoCoordMap
            this.geoCoordMap.push({
              name: key,
              value: coordData[key]
            })
            this.visualMapData.push({
              name: key,
              value: coordData[key][2]
            })
          }
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
          option.series[6].data[0].value = response.data.carOneSpeed // 设置速度
          option.series[8].data[0].value = response.data.carOneSpeed
          option.series[10].data[0].value = response.data.carOneSpeed

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
      var max = 480
      var min = 9
      var maxSize4Pin = 100
      var minSize4Pin = 20

      var convertPathData = function(data) { // 遍历坐标生成路径数组
        var lines = []
        for (var key in data) {
          lines.push(data[key]) // 将坐标拼接成一个数组
        }
        return lines
      }
      var series = [{ // 系列列表。每个系列通过 type 决定自己的图表类型
        name: 'show_scatter', // 固定的散点图
        type: 'scatter',
        coordinateSystem: 'geo',
        data: this.geoCoordMap,
        symbol: 'circle',
        symbolSize: function(val) {
          return val[2] / 10
        },
        label: {
          normal: {
            formatter: '{b}',
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
        symbolSize: function(val) {
          var a = (maxSize4Pin - minSize4Pin) / (max - min)
          var b = minSize4Pin - a * min
          b = maxSize4Pin - a * max
          return a * val[2] + b
        },
        label: {
          normal: {
            show: false,
            textStyle: {
              color: '#fff',
              fontSize: 9
            }
          }
        },
        itemStyle: {
          normal: {
            color: '#F62157' // 标志颜色
          }
        },
        zlevel: 1,
        data: this.geoCoordMap
      },
      { // 带有涟漪特效的点
        name: 'carPoint',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: [{
          name: '一楼小车1',
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
        { name: '机器人1速度', value: 220, unit: 'mm/s', pos: ['14%', '14%'], batteryPos: ['5%', '17%'], batteryUnit: 'V', batteryValue: 24 }
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
                  '{value} ' + (item.unit || ''),
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
                  '{value} ' + (item.batteryUnit || '')
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
          x: 'center',
          textStyle: {
            color: '#000'
          }
        },
        tooltip: { // 点击地图上的图标提示框显示的内容
          trigger: 'item',
          formatter: function(params) {
            if (typeof (params.value)[2] === 'undefined') {
              return params.name
            } else {
              return params.name
            }
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
        toolbox: { // 加载工具栏--显示数据视图、保存为图片
          show: true,
          feature: {
            myTool: { // 自定义工具栏按钮
              show: true,
              title: '添加导航点',
              icon: 'path://M30.9,53.2C16.8,53.2,5.3,41.7,5.3,27.6S16.8,2,30.9,2C45,2,56.4,13.5,56.4,27.6S45,53.2,30.9,53.2z M30.9,3.5C17.6,3.5,6.8,14.4,6.8,27.6c0,13.3,10.8,24.1,24.101,24.1C44.2,51.7,55,40.9,55,27.6C54.9,14.4,44.1,3.5,30.9,3.5z M36.9,35.8c0,0.601-0.4,1-0.9,1h-1.3c-0.5,0-0.9-0.399-0.9-1V19.5c0-0.6,0.4-1,0.9-1H36c0.5,0,0.9,0.4,0.9,1V35.8z M27.8,35.8 c0,0.601-0.4,1-0.9,1h-1.3c-0.5,0-0.9-0.399-0.9-1V19.5c0-0.6,0.4-1,0.9-1H27c0.5,0,0.9,0.4,0.9,1L27.8,35.8L27.8,35.8z',
              onclick: function() {
                alert('click custome btn')
              }
            },
            dataView: { readOnly: false },
            restore: {},
            saveAsImage: {}
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
      var style_ul = 'padding:0px;margin:0px;border: 1px solid #ccc;background-color: #fff;position: absolute;left: 0px;top: 0px;z-index: 2;display: none;'
      var style_li = 'list-style:none;padding: 5px; cursor: pointer; padding: 5px 20px;margin:0px;'
      var style_li_hover = style_li + 'background-color: #00A0E9; color: #fff;'
      var menubox = $("<div class='echartboxMenu' style='" + style_ul + "'><ul style='margin:0px;padding:0px;'></ul></div>").appendTo($(document.body))
      $(document).click(function() { // 点击页面隐藏菜单栏
        option.tooltip.show = true // 重新开启提示框
        menubox.hide()
      })
      this.chart.getDom().oncontextmenu = menubox[0].oncontextmenu = function() { // 屏蔽网页默认的鼠标右键菜单
        return false
      }
      var showMenu = function(menus) {
        var menulistbox = $('ul', menubox).empty()
        $(menus).each(function(i, item) {
          var li = $("<li style='" + style_li + "'>" + item.name + '</li>').mouseenter(function() {
            $(this).attr('style', style_li_hover)
          }).mouseleave(function() {
            $(this).attr('style', style_li)
          }).click(function() {
            item['fn'].call(this)
            option.tooltip.show = true // 重新开启提示框
            menubox.hide()
          })
          menulistbox.append(li)
        })
        menubox.css({
          'left': event.x,
          'top': event.y
        }).show()
      }
      this.chart.on('mousedown', function(e) {
        if (e.event.event.button === 2) {
          // 关闭组件的提示框
          option.tooltip.show = false
          showMenu([
            {
              'name': '菜单1',
              'fn': function() {
                alert('触发-菜单1' + e.data)
              }
            }, {
              'name': '菜单2',
              'fn': function() {
                alert('触发-菜单2' + e.data)
              }
            }
          ])
        }
      })

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
