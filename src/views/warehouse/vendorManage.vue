<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('vendors.add')}}</el-button> <!-- 添加按钮 -->
    </div>

    <!-- Note that row-key is necessary to get a correct row order. -->
    <el-table :data="list" row-key="id"  v-loading="listLoading" border fit highlight-current-row style="width: 100%">

      <el-table-column align="center" :label="$t('vendors.id')" width="65"> <!-- 序号 -->
        <template slot-scope="scope">
          <span>{{scope.row.vendorId}}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="250px" :label="$t('vendors.name')"> <!-- 供应商名称 -->
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" :label="$t('vendors.linkname')"> <!-- 联系人姓名 -->
        <template slot-scope="scope">
          <span>{{scope.row.linkname}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('vendors.linknum')" width="145"> <!-- 联系人电话号码 -->
        <template slot-scope="scope">
          <span>{{scope.row.linknum}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('vendors.actions')" width="230" class-name="small-padding fixed-width"> <!-- 进行操作的按钮列 -->
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{$t('vendors.edit')}}</el-button> <!-- 编辑 -->
          <el-button type="error" size="mini" @click="handleDelete(scope.row.vendorId)">{{$t('vendors.delete')}}</el-button> <!-- 删除 -->
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible"> <!-- "添加"和"编辑"按钮弹出的界面模板 -->
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="100px" style='width: 400px; margin-left:50px;'>
        <el-form-item :label="$t('vendors.name')" prop="name"> <!-- 供应商名称 -->
          <el-input v-model="temp.name"></el-input>
        </el-form-item>

        <el-form-item :label="$t('vendors.linkname')" prop="linkname"> <!-- 联系人姓名 -->
          <el-input v-model="temp.linkname"></el-input>
        </el-form-item>

        <el-form-item :label="$t('vendors.linknum')" prop="linknum"> <!-- 联系人号码 -->
          <el-input v-model="temp.linknum"></el-input>
        </el-form-item>

        <el-form-item :label="$t('vendors.introduction')">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 5}" placeholder="供应商描述：如供应哪些货物等" v-model="temp.introduction">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('vendors.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('vendors.confirm')}}</el-button> <!-- 根据dialogStatus的值来绑定按钮不同功能 -->
        <el-button v-else type="primary" @click="updateData">{{$t('vendors.updateInfo')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchVendorList, updateVendor, createVendor, deleteVendor } from '@/api/vendors'
import Sortable from 'sortablejs'
import { getToken } from '@/utils/auth'
import user from '@/store/modules/user'

export default {
  name: 'dragTable',
  data() {
    return {
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      },
      sortable: null,
      temp: {
        vendorId: undefined,
        introduction: '',
        name: '',
        linkname: '',
        linknum: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加供应商'
      },
      rules: {
        name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
        linkname: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
        linknum: [{ required: true, message: '请输入联系人电话', trigger: 'blur' }]
      }
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      const token = getToken()
      fetchVendorList(token).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
        this.$nextTick(() => {
          this.setSort()
        })
      })
    },
    setSort() {
      const el = document.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
          // to avoid Firefox bug
          // Detail see : https://github.com/RubaXa/Sortable/issues/1012
        },
        onEnd: evt => {
          const targetRow = this.list.splice(evt.oldIndex, 1)[0]
          this.list.splice(evt.newIndex, 0, targetRow)
        }
      })
    },
    resetTemp() {
      this.temp = {
        vendorId: undefined,
        introduction: '',
        name: '',
        linkname: '',
        linknum: ''
      }
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
          this.temp.vendorId = this.total + 1
          this.temp.userName = user.state.name
          createVendor(this.temp).then(() => {
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
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.userName = user.state.name
          updateVendor(tempData).then(() => {
            for (const v of this.list) {
              if (v.vendorId === this.temp.vendorId) {
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
    handleDelete(vendorId) {
      deleteVendor(vendorId).then(response => {
        if (response.data.code === 0) {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.list.indexOf(vendorId)
          this.list.splice(index, 1)
        } else {
          this.$notify({
            title: '失败',
            message: '删除失败: ' + response.data.message,
            type: 'error',
            duration: 2000
          })
        }
      })
    }
  }
}
</script>

<style>
.sortable-ghost{
  opacity: .8;
  color: #fff!important;
  background: #42b983!important;
}
</style>

<style scoped>
.icon-star{
  margin-right:2px;
}
.drag-handler{
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.show-d{
  margin-top: 15px;
}
</style>
