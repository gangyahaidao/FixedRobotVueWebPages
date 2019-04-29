<!-- 用于显示金额与销量统计折线图 -->
<template>
  <div :class="className" :id="id" :style="{height:height,width:width}" v-loading="listLoading"></div>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'
import { getRobotSellWeekDataByFloorName } from '@/api/homepage'

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
      floorName: 'all',
      listLoading: false,
      chart: null,
      xAxisArrayData: [],
      robotNamesList: [], // 机器人名字列表
      yAxisArrayObjData: [] // 机器人销售数量数组
    }
  },
  mounted() {
    // this.getRobotSellCountListData() // 获取折线图的数据
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    refreshChartData(val) {
      this.floorName = val
      this.getRobotSellCountListData() // 更新图表数据
    },
    getRobotSellCountListData() { // 获取当前天前指定星期数的数据
      getRobotSellWeekDataByFloorName(this.floorName).then(response => {
        if (response.data.code === 0) {
          this.robotNamesList = response.data.robotNamesList
          this.xAxisArrayData = response.data.xAxisDataList
          this.yAxisArrayObjData = response.data.robotWeekListData
          this.listLoading = false
          this.initChart()
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      var colorArr = [{
        color1: 'rgba(0, 136, 212, 0.3)',
        color2: 'rgba(0, 136, 212, 0)',
        color3: 'rgb(0,136,212)'
      }, {
        color1: 'rgba(137, 189, 27, 0.3)',
        color2: 'rgba(137, 189, 27, 0)',
        color3: 'rgb(137,189,27)'
      }, {
        color1: 'rgba(0, 136, 212, 0.3)',
        color2: 'rgba(0, 136, 212, 0)',
        color3: 'rgb(0, 136, 212)'
      }, {
        color1: 'rgba(196, 204, 211, 0.3)',
        color2: 'rgba(196, 204, 211, 0)',
        color3: 'rgb(196, 204, 211)'
      }, {
        color1: 'rgba(84, 101, 112, 0.3)',
        color2: 'rgba(84, 101, 112, 0)',
        color3: 'rgb(84, 101, 112)'
      }, {
        color1: 'rgba(110, 112, 116, 0.3)',
        color2: 'rgba(110, 112, 116, 0)',
        color3: 'rgb(110, 112, 116)'
      }]
      var series = []
      // 根据机器人数量填充曲线数据
      var index = 0
      this.yAxisArrayObjData.forEach(function(item) {
        series.push({
          name: item.robotName,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          showSymbol: true,
          lineStyle: {
            normal: {
              width: 1
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: colorArr[index].color1 // 用于显示曲线下方阴影的颜色和透明度，从上到下
              }, {
                offset: 0.8, // 阴影的高度
                color: colorArr[index].color2 // 从下到上渐变色
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            }
          },
          itemStyle: {
            normal: {
              color: colorArr[index].color3, // 曲线的颜色
              borderColor: colorArr[index++].color1, // 曲线上标记点的渲染色和透明度
              borderWidth: 12
            }
          },
          data: item.robotWeekData
        })
      })

      this.chart.setOption({
        backgroundColor: '#394056',
        title: {
          top: 20,
          text: '本周机器人销售数量',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
            color: '#FDF6EC'
          },
          left: '1%'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: '#57617B'
            }
          }
        },
        legend: {
          top: 20,
          icon: 'rect',
          itemWidth: 14,
          itemHeight: 5,
          itemGap: 13,
          data: this.robotNamesList,
          right: '4%',
          textStyle: {
            fontSize: 12,
            color: '#F1F1F3'
          }
        },
        grid: {
          top: 100,
          left: '3%',
          right: '4%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#F1F1F3'
            }
          },
          data: this.xAxisArrayData // 最大是两周14天的数据，不够则按实际显示
        }],
        yAxis: [{
          type: 'value',
          name: '(个)',
          minInterval: 1, // 设置最小的间隔值
          axisTick: { // 显示刻度线
            show: true
          },
          axisLine: {
            lineStyle: {
              color: '#F1F1F3'
            }
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              fontSize: 14
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(241, 241, 243, 0.1)'
            },
            show: true // 是否显示中间的格子线
          }
        }],
        series: series
      })
    }
  }
}
</script>
