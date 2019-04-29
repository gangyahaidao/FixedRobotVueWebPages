<template>
  <div class="app-container">
    <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="100px" style='width: 450px; margin-left:20px;'>
      <el-form-item :label="$t('goods.title')" prop="name"> <!-- 商品名称 -->
        <el-input v-model="temp.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('goods.uploadImage')"> <!-- 上传商品图片 -->
        <dropzone id="myVueDropzone2" url="http://www.g58mall.com/SellRobotSys/uploadfile/uploadOneFile" v-on:emitFileurl="onRecvFileurl" :defaultImg="temp.fileurl"/>
      </el-form-item>
      <el-form-item :label="$t('goods.price')" prop="price"> <!-- 商品价格 -->
        <el-input v-model="temp.price"></el-input>
      </el-form-item>
      <el-form-item :label="$t('goods.repertory')" prop="repertory"> <!-- 当前此商品仓库余量 -->
        <el-input v-model="temp.repertory"></el-input>
      </el-form-item>
      <el-form-item :label="$t('goods.introduction')">
        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5}" placeholder="商品备注" v-model="temp.introduction"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" style="margin-left:120px">
      <el-button type="success" @click="createData">保存</el-button> <!-- 根据dialogStatus的值来绑定按钮不同功能 -->
    </div>
  </div>
</template>

<script>
import { createGoods } from '@/api/goodslist'
import { fetchVendorList } from '@/api/vendors'
import waves from '@/directive/waves' // 水波纹指令
import user from '@/store/modules/user' // 导入user模块，获取用户信息
import dropzone from '@/components/DropZone'
import viptable from '@/views/tables/viptable'
import { getToken } from '@/utils/auth'

const calendarTypeOptions = [
  { key: 'Drink', display_name: '饮料' },
  { key: 'Water', display_name: '矿泉水' },
  { key: 'Snack', display_name: '休闲零食' }
]

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
      statusOptions: [
        { key: '上架', value: '上架售卖' },
        { key: '下架', value: '暂时下架' }
      ],
      viplist: [
        { 'vipName': 'VIP1', 'vipValue': 9.5, 'integral': 100, 'edit': false, 'originalVipValue': 9.5, 'originalIntegralValue': 100 },
        { 'vipName': 'VIP2', 'vipValue': 9.0, 'integral': 100, 'edit': false, 'originalVipValue': 9.0, 'originalIntegralValue': 100 },
        { 'vipName': 'VIP3', 'vipValue': 8.5, 'integral': 100, 'edit': false, 'originalVipValue': 8.5, 'originalIntegralValue': 100 },
        { 'vipName': 'VIP4', 'vipValue': 8.0, 'integral': 100, 'edit': false, 'originalVipValue': 8.0, 'originalIntegralValue': 100 },
        { 'vipName': 'VIP5', 'vipValue': 7.5, 'integral': 100, 'edit': false, 'originalVipValue': 7.5, 'originalIntegralValue': 100 }
      ],
      calendarTypeOptions,
      vendorOptions: [],
      temp: {
        fileurl: '',
        goodsId: undefined,
        goodsPopularity: 1,
        introduction: '',
        deadDate: new Date(),
        name: '',
        price: null,
        type: '',
        status: null, // 设置商品上架状态
        repertory: null, // 商品仓库余量
        vipList: this.viplist,
        vendorId: undefined, // 设置商品供应商
        vendorName: undefined
      },
      rules: {
        type: [{ required: true, message: '请选择商品类型', trigger: 'change' }],
        deadDate: [{ type: 'date', required: true, message: '请设置保质期', trigger: 'change' }],
        name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        status: [{ required: true, message: '请设置商品状态', trigger: 'change' }],
        price: [{ validator: checkPrice, trigger: 'blur' }],
        repertory: [{ required: true, message: '请设置商品仓库余量', trigger: 'blur' }],
        vendorId: [{ required: true, message: '请选择供应商', trigger: 'change' }]
      }
    }
  },
  created() { // Vue实例被创建之后执行代码
    // this.getVendorList() // 加载供货商列表，用于在创建商品时选择供货商
  },
  methods: {
    addExtraGoods(index, id, name, repertory) { // 商品名字和库存剩余量
      this.changeListIndex = index
      this.addGoodsId = id
      this.goodsName = '补货商品 - ' + name
      this.addGoodsForm.goodsRepertory = repertory
      this.dialogAddGoodsVisible = true
    },
    onRecvFileurl(fileurl) {
      this.temp.fileurl = fileurl // 将值赋值给表单对象
    },
    onChangeVipInfo(changedVipList) {
      this.temp.vipList = changedVipList // 将修改之后的值赋值给将要上传到服务器的对象
    },
    getVendorList() {
      const token = getToken()
      fetchVendorList(token).then(response => {
        this.vendorOptions = response.data.items
      })
    },
    handleCreate() {
      this.resetTemp()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() { // 点击新建商品确定按钮
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.addUserName = user.state.name // 获取操作用户
          for (const v of this.vendorOptions) {
            if (v.id === this.temp.vendorId) {
              this.temp.vendorName = v.name
            }
          }
          createGoods(this.temp).then(response => {
            if (response.data.code === 0) {
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              // 跳转到商品列表页面
              this.$router.push({ path: '/warehouse/warehouseProductList' })
            } else {
              this.$message({
                message: response.data.message,
                type: 'error'
              })
            }
          })
        }
      })
    }
  }
}
</script>
