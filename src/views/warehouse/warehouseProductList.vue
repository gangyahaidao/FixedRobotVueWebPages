<template>
  <div class="app-container">
    <panel-group></panel-group> <!-- 加载显示收入销量等数据 -->
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" :placeholder="$t('goods.titleSearchHolder')" v-model="listQuery.name"/>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('goods.search')}}</el-button> <!-- 按条件搜索商品 -->
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="success" icon="el-icon-edit">{{$t('goods.add')}}</el-button> <!-- 添加商品按钮 -->
    </div>

    <!-- 加载显示商品列表 -->
    <el-table :key='tableKey' :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%;min-height:800px;">
      <el-table-column align="center" label="序号" width="50">
        <template slot-scope="scope">
          <span>1</span>
        </template>
      </el-table-column>
      <el-table-column min-width="110px" align="center" label="商品名称">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.$index, scope.row)">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="图片"> <!-- 商品供应商 -->
        <template slot-scope="scope">
          <img v-if="scope.row.picUrl.length > 0" :src="scope.row.picUrl" style="width: 50px;height: 50px"> <!-- 显示商品图片 -->
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="进价(元)">
        <template slot-scope="scope">
          <span>{{scope.row.price}}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="当前库存量(个)">
        <template slot-scope="scope">
          <span>{{scope.row.repertoryCount}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center"  label="添加时间"> <!-- 商品添加人 -->
        <template slot-scope="scope">
          <span>{{scope.row.date | parseDateObj}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="补货" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="danger" size="mini" @click="addExtraGoods(scope.$index, scope.row.id, scope.row.name, scope.row.repertory)">补货</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="goodsName" :visible.sync="dialogAddGoodsVisible" width='20%'>
      <el-form :model="addGoodsForm">
        <el-form-item label="补货前库存量" label-width="100px">
          <el-input v-model="goodsRepertory"></el-input>
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
import PanelGroup from './components/PanelGroup'
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
  components: { PanelGroup, dropzone, viptable }, // 上传图像组件
  name: 'CComplexTable',
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
      list: null, // 存储商品信息列表
      vipitems: null, // 存储每个商品所对应的vip列表信息
      viplist: null, // 传递到编辑商品页面的用于显示vip表格信息
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
      goodsName: null,
      goodsRepertory: null,
      addGoodsForm: {
        token: null,
        addGoodsId: null, // 商品的id号
        goodsAddCount: null
      }
    }
  },
  filters: {
    statusFilter(status) { // 过滤商品状态所显示的颜色
      if (status === '上架') {
        return 'success'
      } else if (status === '下架') {
        return 'danger'
      }
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type] // 将type转换为对应的名字
    },
    parseDateObj(date) {
      return parseTime(date, '{y}-{m}-{d} {h}:{i}')
    }
  },
  created() { // Vue实例被创建之后执行代码
    this.getList()
  },
  methods: {
    addExtraGoods(index, id, name, repertory) { // 商品名字和库存剩余量
      this.changeListIndex = index
      this.addGoodsForm.addGoodsId = id
      this.goodsName = '补货商品 - ' + name
      this.goodsRepertory = repertory
      this.dialogAddGoodsVisible = true
    },
    updateGoodsRepertory() {
      this.addGoodsForm.token = getToken()
      updateRepertory(this.addGoodsForm).then(response => {
        if (response.data.code === 0) {
          this.list[this.changeListIndex].repertory = parseInt(this.list[this.changeListIndex].repertory) + parseInt(this.addGoodsForm.goodsAddCount) // 更新表格中剩余库存量的值
          this.dialogAddGoodsVisible = false
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
          this.list = response.data.items // 商品数据列表
          this.total = response.data.total // 总条数
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
      var temp = Object.assign({}, row) // 复制copy obj
      if (status === 'onsell') {
        row.status = '上架'
      } else if (status === 'offsell') {
        row.status = '下架'
      }
      temp.status = row.status
      this.updateRowStatus(temp)
    },
    handleCreate() { // 跳转到添加新商品页面
      this.$router.push({ path: '/warehouse/createGoods' })
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
    handleUpdate(index, row) { // 点击商品名称或者是编辑按钮时执行的函数，弹出框框
      this.temp = Object.assign({}, row) // copy obj
      this.temp.deadDate = new Date(this.temp.deadDate) // 将时间初始化为当前时间
      this.viplist = this.vipitems[index]
      this.temp.vipList = this.viplist
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
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.type{
  margin-right:15px;
  color: #909399;
}
</style>
