<template>
  <div :class="className" :id="id" :style="{height:height,width:width}" v-loading="listLoading"></div>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'
import { getRobotSaleData } from '@/api/datareport'

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
    },
    floorName: {
      type: String,
      default: 'floor1'
    }
  },
  data() {
    return {
      listLoading: true,
      chart: null,
      robotMachineId: '3',
      goodsNameArr: [], // 存储显示商品的名字 [xxx, xxx, '总和']
      dayTotalGoodsArr: [], // 一天总的商品数量
      goodsSaleValueArrs: [], // 存储各个商品销售数量的数组，这是数组的数组
      xAxisDataArr: [] // x轴显示的日期
    }
  },
  mounted() {
    this.getCharDataByFloorAndMachineId()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    refreshChartData(val) { // 父页面点击不同机器人重新加载不同的数据
      this.robotMachineId = val
      this.getCharDataByFloorAndMachineId()
    },
    getCharDataByFloorAndMachineId() { // 根据楼层和机器人编号获取售卖商品信息
      getRobotSaleData(this.floorName, this.robotMachineId, 4).then(response => {
        if (response.data.code === 0) {
          this.goodsNameArr = response.data.goodsNameArr
          this.dayTotalGoodsArr = response.data.dayTotalCountArr
          this.xAxisDataArr = response.data.xAxisArrayData
          this.goodsSaleValueArrs = response.data.everyGoodsCountArr
          // console.log(JSON.stringify(this.xAxisDataArr))
          // console.log(JSON.stringify(this.goodsSaleValueArrs))
          this.listLoading = false
          this.initChart()
        } else {
          this.listLoading = false
          this.$notify({
            message: response.data.message,
            type: 'error',
            duration: 2000
          })
        }
      })
    },
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.setOption({
        backgroundColor: '#344b58',
        title: {
          text: '前一个月机器人商品售卖曲线',
          x: '20',
          top: '20',
          textStyle: {
            color: '#fff',
            fontSize: '22'
          },
          subtextStyle: {
            color: '#90979c',
            fontSize: '16'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            textStyle: {
              color: '#fff'
            }
          }
        },
        grid: { // xy坐标轴
          borderWidth: 0,
          top: 110,
          bottom: 45,
          textStyle: {
            color: '#fff'
          }
        },
        legend: { // 顶部显示曲线颜色表示的含义
          x: '40%',
          top: '8%',
          textStyle: {
            color: '#90979c'
          },
          data: this.goodsNameArr
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          axisLine: {
            lineStyle: {
              color: '#90979c'
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitArea: {
            show: false
          },
          axisLabel: {
            interval: 0

          },
          data: this.xAxisDataArr
        }],
        yAxis: [{
          type: 'value',
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#90979c'
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            interval: 0
          },
          splitArea: {
            show: false
          }
        }],
        series: [{
          name: this.goodsNameArr[0],
          type: 'bar',
          stack: 'total',
          barMaxWidth: 35,
          barGap: '10%',
          itemStyle: {
            normal: {
              color: 'rgba(255,144,128,1)',
              label: {
                show: true,
                textStyle: {
                  color: '#fff'
                },
                position: 'insideTop',
                formatter(p) {
                  return p.value > 0 ? p.value : ''
                }
              }
            }
          },
          data: this.goodsSaleValueArrs[0]
        },

        {
          name: this.goodsNameArr[1],
          type: 'bar',
          stack: 'total',
          itemStyle: {
            normal: {
              color: 'rgba(0,191,183,1)',
              barBorderRadius: 0,
              label: {
                show: true,
                position: 'insideTop',
                formatter(p) {
                  return p.value > 0 ? p.value : ''
                }
              }
            }
          },
          data: this.goodsSaleValueArrs[1]
        }, {
          name: this.goodsNameArr[2],
          type: 'line',
          stack: 'total',
          symbolSize: 10,
          symbol: 'circle',
          itemStyle: {
            normal: {
              color: 'rgba(252,230,48,1)',
              barBorderRadius: 0,
              label: {
                show: true,
                position: 'top',
                formatter(p) {
                  return p.value > 0 ? p.value : ''
                }
              }
            }
          },
          data: this.dayTotalGoodsArr
        }
        ]
      })
    }
  }
}
</script>
