<template>
    <el-table :data="floorgoodslist" v-loading="listLoading" border fit highlight-current-row style="width: 100%" size="small">

      <el-table-column align="center" :label="$t('robots.floorName')" width="80"> <!-- 显示名称 -->
        <template slot-scope="scope">
          <span>{{scope.row.goodsFloor | goodsFloorFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="150px" :label="$t('robots.floorGoodsName')">
        <template slot-scope="scope">
          <el-select class="filter-item" v-model="scope.row.goodsSerialId" :placeholder="scope.row.goodsName" @change="currentSelectFunc">
              <el-option v-for="item in goodsList" :key="item.id" :label="item.name" :value="item.id"> <!-- 从另外的函数加载当前商品列表 -->
              </el-option>
            </el-select>
        </template>
      </el-table-column>

      <el-table-column align="center" width="100" label="满装数量">
        <template slot-scope="scope">
          <el-input v-model="scope.row.totalCount"></el-input>
        </template>
      </el-table-column>

      <template v-if="dialogStatus === 'update'"> <!-- 只有处于更新信息的时候才显示此三列数据 -->
        <el-table-column align="center" width="100" :label="$t('robots.currentCount')">
          <template slot-scope="scope">
            <template v-if="scope.row.currentCount === 0">
              <el-tag type="danger">{{scope.row.currentCount}}</el-tag>
            </template>
            <template v-else>
              <el-tag type="success">{{scope.row.currentCount}}</el-tag>
            </template>
          </template>
        </el-table-column>

        <el-table-column align="center" width="100" label="库存剩余">
          <template slot-scope="scope">
            <el-tag :type="scope.row.stockLeftCount === 0 ? 'danger' : ''">{{scope.row.stockLeftCount}}</el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" width="100" label="准备补货量">
          <template slot-scope="scope">
            <el-select v-model="scope.row.addGoodsCount" placeholder="请选择">
              <el-option
                v-for="item in numOptions"
                :key="item.value"
                :label="item.value"
                :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
      </template>
    </el-table>

</template>

<script>
import { fetchListAll } from '@/api/goodslist'
import { getToken } from '@/utils/auth'

export default {
  name: 'floorgoodstable',
  data() {
    return {
      goodsList: null,
      listLoading: true,
      numOptions: [{
        value: 1
      }, {
        value: 2
      }, {
        value: 3
      }, {
        value: 4
      }, {
        value: 5
      }, {
        value: 6
      }, {
        value: 7
      }, {
        value: 8
      }, {
        value: 9
      }, {
        value: 10
      }, {
        value: 11
      }, {
        value: 12
      }, {
        value: 13
      }, {
        value: 14
      }, {
        value: 15
      }, {
        value: 16
      }]
    }
  },
  filters: {
    goodsFloorFilter(name) {
      const map = {
        goodsFloor1: '一层',
        goodsFloor2: '二层',
        goodsFloor3: '三层'
      }
      return map[name]
    }
  },
  created() {
    this.getList() // 加载当前所有的商品列表
    // console.log('--get floorgoodslist = ' + JSON.stringify(this.floorgoodslist))
  },
  methods: {
    getList() {
      this.listLoading = true
      const token = getToken()
      fetchListAll(token).then(response => {
        this.goodsList = response.data.items // 设置接收的商品列表，信息只包含商品id和商品名字
        this.listLoading = false
      })
    },
    cancelEdit(row) {
      row.title = row.originalTitle
      row.edit = false
      this.$message({
        message: '取消修改',
        type: 'warning'
      })
    },
    confirmEdit(row) {
      row.edit = false
      row.originalTitle = row.title
      this.$message({
        message: '修改成功',
        type: 'success'
      })
    },
    currentSelectFunc(selectVal) {
      console.log('selected-value = ' + selectVal)
    }
  },
  props: {
    floorgoodslist: { // 定义接收父组件传递过来的vip信息列表变量
      type: Array,
      required: true
    },
    dialogStatus: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
