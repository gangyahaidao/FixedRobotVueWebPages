<template>
    <el-table :data="viplist" v-loading="listLoading" border fit highlight-current-row style="width: 100%" size="small">

      <el-table-column align="center" :label="$t('goods.vipName')" width="90"> <!-- 显示vip等级名称 -->
        <template slot-scope="scope">
          <span>{{scope.row.vipName}}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="60px" :label="$t('goods.vipValue')">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input class="edit-input" size="small" v-model="scope.row.vipValue"></el-input>
          </template>
          <span v-else>{{ scope.row.vipValue }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="60px" :label="$t('goods.integral')">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input class="edit-input" size="small" v-model="scope.row.integral"></el-input>
          </template>
          <span v-else>{{ scope.row.integral }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('goods.vipActions')" :width="actionsWidth">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-button type="warning" @click="cancelEdit(scope.row)" size="small" icon="el-icon-circle-check-outline">Cancel</el-button>
            <el-button type="success" @click="confirmEdit(scope.row)" size="small" icon="el-icon-circle-check-outline">Ok</el-button>
          </template>
          <el-button v-else type="primary" @click="changeActionsBtn(scope.row)" size="small" icon="el-icon-edit">{{$t('goods.edit')}}</el-button>
        </template>
      </el-table-column>

    </el-table>
</template>

<script>

export default {
  name: 'viptable',
  data() {
    return {
      actionsWidth: 100,
      addedWidth: 200,
      listLoading: false // 默认加载不显示转圈圈标识
    }
  },
  methods: {
    cancelEdit(row) {
      row.vipValue = row.originalVipValue
      row.integral = row.originalIntegralValue
      this.actionsWidth = (this.actionsWidth === this.addedWidth) ? 150 : this.addedWidth
      row.edit = false
      this.$message({
        message: '取消修改',
        type: 'warning'
      })
    },
    confirmEdit(row) {
      row.edit = false
      row.originalVipValue = row.vipValue
      row.originalIntegralValue = row.integral
      this.actionsWidth = (this.actionsWidth === this.addedWidth) ? 150 : this.addedWidth
      // console.log('this.$emit = ' + JSON.stringify(this.viplist))
      this.$emit('onChangeVipInfo', this.viplist) // 有任何修改都将数据列表发送到父组件
      this.$message({
        message: '修改成功',
        type: 'success'
      })
    },
    changeActionsBtn(row) {
      this.actionsWidth = (this.actionsWidth === this.addedWidth) ? 150 : this.addedWidth
      row.edit = !row.edit
    }
  },
  props: {
    viplist: { // 定义接收父组件传递过来的vip信息列表变量
      type: Array,
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
