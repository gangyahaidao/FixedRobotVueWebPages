<!-- 用于显示金额与销量统计折线图 -->
<template>
  <div :class="className" :id="id" :style="{height:height,width:width}" v-loading="listLoading"></div>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'
import { getSaleChartList } from '@/api/datareport'

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
      listLoading: true,
      chart: null,
      xAxisArrayData: [],
      yAxisFeeRatio: [],
      yAxisIntegralRatio: [],
      yAxisNumPeopleRatio: []
    }
  },
  mounted() {
    this.getSaleChartListData() // 获取折线图的数据
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    getSaleChartListData() { // 获取当前天前指定星期数的数据
      getSaleChartList(4).then(response => {
        this.xAxisArrayData = response.data.xAxisArrayData
        this.yAxisFeeRatio = response.data.yAxisFeeRatio
        this.yAxisIntegralRatio = response.data.yAxisIntegralRatio
        this.yAxisNumPeopleRatio = response.data.yAxisNumPeopleRatio
        this.listLoading = false
        this.initChart()
      })
    },
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))

      this.chart.setOption({
        backgroundColor: '#394056',
        title: {
          top: 20,
          text: '前一个月支付人数统计',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
            color: '#F1F1F3'
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
          data: ['微信', '积分', '购买人数'],
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
              color: '#57617B'
            }
          },
          data: this.xAxisArrayData // 最大是两周14天的数据，不够则按实际显示
        }],
        yAxis: [{
          type: 'value',
          name: '(个)',
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#57617B'
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
              color: '#57617B'
            }
          }
        }],
        series: [{
          name: '微信',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          showSymbol: false,
          lineStyle: {
            normal: {
              width: 1
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(137, 189, 27, 0.3)'
              }, {
                offset: 0.8,
                color: 'rgba(137, 189, 27, 0)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            }
          },
          itemStyle: {
            normal: {
              color: 'rgb(137,189,27)',
              borderColor: 'rgba(137,189,2,0.27)',
              borderWidth: 12

            }
          },
          data: this.yAxisFeeRatio
        }, {
          name: '积分',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          showSymbol: false,
          lineStyle: {
            normal: {
              width: 1
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(0, 136, 212, 0.3)'
              }, {
                offset: 0.8,
                color: 'rgba(0, 136, 212, 0)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            }
          },
          itemStyle: {
            normal: {
              color: 'rgb(0,136,212)',
              borderColor: 'rgba(0,136,212,0.2)',
              borderWidth: 12

            }
          },
          data: this.yAxisIntegralRatio
        }, {
          name: '购买人数',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          showSymbol: false,
          lineStyle: {
            normal: {
              width: 1
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(219, 50, 51, 0.3)'
              }, {
                offset: 0.8,
                color: 'rgba(219, 50, 51, 0)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            }
          },
          itemStyle: {
            normal: {
              color: 'rgb(219,50,51)',
              borderColor: 'rgba(219,50,51,0.2)',
              borderWidth: 12
            }
          },
          data: this.yAxisNumPeopleRatio
        }]
      })
    }
  }
}
</script>
