<template>
  <div class="app-container">
    <div class="filter-container">
      <span class="type filter-item">商品类型</span>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" :placeholder="$t('goods.titleSearchHolder')" v-model="listQuery.name">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('goods.search')}}</el-button> <!-- 按条件搜索商品 -->
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('goods.add')}}</el-button> <!-- 添加商品按钮 -->
    </div>

    <!-- 加载显示商品列表 -->
    <el-table :key='tableKey' :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%;min-height:1000px;">
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.goodsId}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="商品类型">
        <template slot-scope="scope">
          <span>{{scope.row.vendorName}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="200px" align="center" label="描述">
        <template slot-scope="scope">
          <span>{{scope.row.vendorName}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="操作人"> <!-- 商品添加人 -->
        <template slot-scope="scope">
          <span>{{scope.row.addUserName}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('goods.actions')" width="230" class-name="small-padding fixed-width"> <!-- 对商品进行编辑操作的按钮 -->
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{$t('goods.edit')}}</el-button> <!-- 编辑 -->
          <el-button v-if="scope.row.status!='onsell'" size="mini" type="success" @click="handleModifyStatus(scope.row,'onsell')">{{$t('goods.offsell')}}
          </el-button>
          <el-button v-if="scope.row.status!='offsell'" size="mini" @click="handleModifyStatus(scope.row,'offsell')">{{$t('goods.onsell')}}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" style="margin-top: -6%;"> <!-- "添加"和"编辑"按钮弹出的界面模板 -->
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="100px" style='width: 450px; margin-left:50px;'>
        <el-form-item label="$t('goods.type')" prop="type"> <!-- 选择新商品类型 -->
          <el-select class="filter-item" v-model="temp.type" placeholder="请选择">
            <el-option v-for="item in  calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('goods.vendorId')" prop="vendorId"> <!-- 选择商品的供应商名字 -->
          <el-select class="filter-item" v-model="temp.vendorId" placeholder="请选择"> <!-- 选择之后的值存储在temp.vendorId -->
            <el-option v-for="item in vendorOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('goods.date')" prop="deadDate">
          <el-date-picker v-model="temp.deadDate" type="datetime" placeholder="商品保质期"></el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('goods.title')" prop="name"> <!-- 商品名称 -->
          <el-input v-model="temp.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('goods.uploadImage')"> <!-- 上传商品图片 -->
          <dropzone :id="temp.fileurl" v-if="hackReset" url="http://www.g58mall.com/SellRobotSys/uploadfile/uploadOneFile" v-on:emitFileurl="onRecvFileurl" :defaultImg="temp.fileurl"></dropzone> <!-- 添加默认属性会显示上一次加载的图片:defaultImg="temp.fileurl" -->
        </el-form-item>
        <el-form-item :label="$t('goods.price')" prop="price"> <!-- 商品价格 -->
          <el-input v-model="temp.price"></el-input>
        </el-form-item>
        <el-form-item :label="$t('goods.repertory')" prop="repertory"> <!-- 当前此商品仓库余量 -->
          <el-input v-model="temp.repertory"></el-input>
        </el-form-item>
        <el-form-item :label="$t('goods.status')" prop="status"> <!-- 设置商品状态 -->
          <el-select class="filter-item" v-model="temp.status" placeholder="请选择"> <!-- v-model的值需要与prop的值对应规则校验才起作用 -->
            <el-option v-for="item in statusOptions" :key="item.key" :label="item.value" :value="item.key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('goods.vipprice')" style='width: 780px;'> <!-- 加载VIP表格信息 -->
          <viptable :viplist='viplist' v-on:onChangeVipInfo='onChangeVipInfo'></viptable>
        </el-form-item>
        <el-form-item :label="$t('goods.introduction')">
          <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5}" placeholder="商品备注" v-model="temp.introduction"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('goods.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('goods.confirm')}}</el-button> <!-- 根据dialogStatus的值来绑定按钮不同功能 -->
        <el-button v-else type="primary" @click="updateData">{{$t('goods.updateInfo')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="goodsName" :visible.sync="dialogAddGoodsVisible" width='20%'>
      <el-form :model="addGoodsForm">
        <el-form-item label="补货前库存量" label-width="100px">
          <el-input v-model="addGoodsForm.goodsRepertory"></el-input>
        </el-form-item>
        <el-form-item label="准备补充量" label-width="100px">
          <el-input v-model="addGoodsForm.goodsAddCount"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddGoodsVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateGoodsRepertory">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, createGoods, updateGoods, updateRowInfo, updateRepertory } from '@/api/goodslist'
import { fetchVendorList } from '@/api/vendors'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'
import user from '@/store/modules/user' // 导入user模块，获取用户信息
import dropzone from '@/components/DropZone'
import viptable from '@/views/tables/viptable'
import { getToken } from '@/utils/auth'

const calendarTypeOptions = [
  { key: 'Drink', display_name: '饮料' },
  { key: 'Water', display_name: '矿泉水' },
  { key: 'Snack', display_name: '休闲零食' }
]

// 将key值替换为display_name值
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  components: { dropzone, viptable }, // 上传图像组件
  name: 'complexTable',
  directives: {
    waves
  },
  data() {
    var checkPrice = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入价格'))
      } else {
        var regu = /^[0-9]+\.?[0-9]*$/ // 进行价格数字校验
        if (!regu.test(value)) {
          callback(new Error('请输入正确价格'))
        }
        callback() // 调用callback不然表单校验不通过
      }
    }
    return {
      hackReset: true,
      tableKey: 0,
      list: null,
      viplist: [
        { 'vipName': 'VIP1', 'vipValue': 9.5, 'integral': 100, 'edit': false, 'originalVipValue': 9.5, 'originalIntegralValue': 100 },
        { 'vipName': 'VIP2', 'vipValue': 9.0, 'integral': 100, 'edit': false, 'originalVipValue': 9.0, 'originalIntegralValue': 100 },
        { 'vipName': 'VIP3', 'vipValue': 8.5, 'integral': 100, 'edit': false, 'originalVipValue': 8.5, 'originalIntegralValue': 100 },
        { 'vipName': 'VIP4', 'vipValue': 8.0, 'integral': 100, 'edit': false, 'originalVipValue': 8.0, 'originalIntegralValue': 100 },
        { 'vipName': 'VIP5', 'vipValue': 7.5, 'integral': 100, 'edit': false, 'originalVipValue': 7.5, 'originalIntegralValue': 100 }
      ],
      total: null,
      listLoading: true,
      listQuery: { // 此变量专门用于传递到后台按加载条件加载商品列表，其中undefined字段不会被送到后台
        page: 1, // 按页数加载列表
        limit: 20, // 默认一页20条数据
        name: undefined, // 按商品名字加载列表
        type: undefined, // 按类型加载列表
        sort: '+id' // 默认正序
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: '递增', key: '+id' }, { label: '递减', key: '-id' }],
      statusOptions: [
        { key: 'onsell', value: '上架售卖' },
        { key: 'offsell', value: '暂时下架' }
      ],
      vendorOptions: [],
      temp: {
        fileurl: '',
        goodsId: undefined,
        goodsPopularity: 1,
        introduction: '',
        deadDate: new Date(),
        name: '',
        price: 0.0,
        type: '',
        status: '', // 设置商品上架状态
        repertory: 0, // 商品仓库余量
        vipList: [],
        vendorId: undefined, // 设置商品供应商
        vendorName: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加商品'
      },
      rules: {
        type: [{ required: true, message: '请选择商品类型', trigger: 'change' }],
        deadDate: [{ type: 'date', required: true, message: '请设置保质期', trigger: 'change' }],
        name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        status: [{ required: true, message: '请设置商品状态', trigger: 'change' }],
        price: [{ validator: checkPrice, trigger: 'blur' }],
        repertory: [{ required: true, message: '请设置商品仓库余量', trigger: 'blur' }],
        vendorId: [{ required: true, message: '请选择供应商', trigger: 'change' }]
      },
      downloadLoading: false,
      dialogAddGoodsVisible: false,
      changeListIndex: null, // 修改的表格数组的下标
      addGoodsId: null, // 商品的uuid号
      goodsName: null,
      addGoodsForm: {
        goodsRepertory: 0,
        goodsAddCount: null
      }
    }
  },
  filters: {
    statusFilter(status) { // 过滤商品状态所显示的颜色
      const statusMap = {
        onsell: 'success',
        offsell: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type] // 将type转换为对应的名字
    }
  },
  created() { // Vue实例被创建之后执行代码
    this.getList()
    this.getVendorList() // 加载供货商列表，用于在创建商品时选择供货商
  },
  methods: {
    addExtraGoods(index, id, name, repertory) { // 商品名字和库存剩余量
      this.changeListIndex = index
      this.addGoodsId = id
      this.goodsName = '补货商品 - ' + name
      this.addGoodsForm.goodsRepertory = repertory
      this.dialogAddGoodsVisible = true
    },
    updateGoodsRepertory() {
      updateRepertory(this.addGoodsId, this.addGoodsForm.goodsAddCount).then(response => {
        if (response.data.code === 0) {
          this.dialogAddGoodsVisible = false
          this.list[this.changeListIndex].repertory = parseInt(this.list[this.changeListIndex].repertory) + parseInt(this.addGoodsForm.goodsAddCount) // 更新表格中剩余库存量的值
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
    onRecvFileurl(fileurl) {
      this.temp.fileurl = fileurl // 将值赋值给表单对象
    },
    onChangeVipInfo(changedVipList) {
      this.temp.vipList = changedVipList // 将修改之后的值赋值给将要上传到服务器的对象
    },
    getList() { // 加载设置为上架状态的商品列表
      this.listLoading = true // 显示转圈圈标识
      fetchList(this.listQuery).then(response => {
        if (response.data.code === 0) {
          this.list = response.data.items // 数据列表
          this.total = response.data.total // 总条数
          if (this.list.length > 0) {
            this.viplist = response.data.vipitems[0] // vip优惠信息
          }
          this.listLoading = false
        } else {
          this.$message({
            message: '请求数据失败',
            type: 'error'
          })
        }
      })
    },
    getVendorList() {
      const token = getToken()
      fetchVendorList(token).then(response => {
        this.vendorOptions = response.data.items
      })
    },
    updateRowStatus(row) { // 更新某一行商品的状态
      this.listLoading = true
      updateRowInfo(row).then(response => {
        if (response.data.code === 0) {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          this.listLoading = false
        } else {
          this.$message({
            message: '更新数据失败',
            type: 'error'
          })
        }
      })
    },
    handleFilter() { // 使用过滤条件搜索商品列表
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) { // 修改每页显示多少条
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) { // 跳转到指定页
      this.listQuery.page = val
      this.getList()
    },
    handleModifyStatus(row, status) {
      row.status = status
      this.updateRowStatus(row)
    },
    resetTemp() { // 创建一个商品时重置相关创建参数
      this.temp = {
        fileurl: '',
        goodsId: undefined,
        goodsPopularity: 1,
        introduction: '',
        deadDate: new Date(),
        name: '',
        price: 0.0,
        status: '', // 默认设置添加商品的状态
        type: '',
        repertory: 0, // 商品上架数量
        vipList: [],
        vendorId: undefined,
        vendorName: undefined
      }
      this.temp.vipList = this.viplist // 将vip信息赋值给temp变量的成员
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() { // 点击新建商品确定按钮
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.goodsId = this.total + 1 // mock a id
          this.temp.addUserName = user.state.name // 获取操作用户
          for (const v of this.vendorOptions) {
            if (v.id === this.temp.vendorId) {
              this.temp.vendorName = v.name
            }
          }
          createGoods(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) { // 点击商品名称或者是编辑按钮时执行的函数，弹出框框
      this.temp = Object.assign({}, row) // copy obj
      this.temp.deadDate = new Date(this.temp.deadDate) // 将时间初始化为当前时间
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.hackReset = false // 强制销毁并重新加载图片上传组件
      this.$nextTick(() => {
        this.hackReset = true
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.vipList = this.viplist // 将弹出框中的vip列表赋值传递到服务端进行更新
          this.temp.addUserName = user.state.name // 获取操作用户
          const tempData = Object.assign({}, this.temp)
          updateGoods(tempData).then(() => {
            for (const v of this.list) {
              if (v.goodsId === this.temp.goodsId) { // 从数组列表中删除原来的元素，添加更新之后的元素
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['deadDate', 'name', 'type', 'goodsPopularity', 'status']
        const filterVal = ['deadDate', 'name', 'type', 'goodsPopularity', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.type{
  margin-right:15px;
  color: #909399;
}
.el-dialog{
  width: 60% !important;
}
</style>