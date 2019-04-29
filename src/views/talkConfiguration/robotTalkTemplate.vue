<template>
  <div class="app-container">
    <el-container class="model">
      <el-header style="margin-bottom:-20px">
        <h3>男女通用称呼： <span>{{</span>GeneralCall<span>}}</span></h3>
        <h3>感应男性/女性称呼： <span>{{</span>GenderName<span>}}</span></h3>
        <h3>时间变量： <span>{{</span>TimeName<span>}}</span></h3>
        <h3>天气变量： <span>{{</span>Weather<span>}}</span></h3>
        <h3>商品名称变量： <span>{{</span>GoodsName<span>}}</span></h3>
      </el-header>
    </el-container>
    <el-container class="model">
      <el-header style="margin-bottom:-20px">
        <h3>男女通用称呼</h3>
      </el-header>
      <el-main>
        <el-input placeholder="添加模板数据" class="todoinput" @keyup.enter.native="addCommon" v-model="newtodoCommon.content"></el-input>
        <el-row v-for="(item, index) in todolistCommon" :key="item.content" class="list-row">
          <el-col :xs="2" :sm="1" :md="1" :lg="1" :xl="1" class="check" :class="{ red: !todolistCommon[index].done, 'green': todolistCommon[index].done }">
            <el-checkbox size="mini" v-model="item.done"></el-checkbox>
          </el-col>
          <el-col :xs="20" :sm="22" :md="22" :lg="22" :xl="22">
            <input type="text" v-model="item.content" class="ipcont" :class="{done: todolistCommon[index].done}">
          </el-col>
          <el-col :xs="2" :sm="1" :md="1" :lg="1" :xl="1" class="close">
            <i class="el-icon-close" @click="delCommon(index)"></i>
          </el-col>
        </el-row>
        <el-row>
          <el-tag>已添加数量：{{ todolistCommon.length }}</el-tag>
        </el-row>
      </el-main>
    </el-container>

    <el-container class="model">
      <el-header style="margin-bottom:-20px">
        <h3>感应到男性模板</h3>
      </el-header>
      <el-main>
        <el-input placeholder="添加模板数据" class="todoinput" @keyup.enter.native="addMale" v-model="newtodoMale.content"></el-input>
        <el-row v-for="(item, index) in todolistMale" :key="item.content" class="list-row">
          <el-col :xs="2" :sm="1" :md="1" :lg="1" :xl="1" class="check" :class="{ red: !todolistMale[index].done, 'green': todolistMale[index].done }">
            <el-checkbox size="mini" v-model="item.done"></el-checkbox>
          </el-col>
          <el-col :xs="20" :sm="22" :md="22" :lg="22" :xl="22">
            <input type="text" v-model="item.content" class="ipcont" :class="{done: todolistMale[index].done}">
          </el-col>
          <el-col :xs="2" :sm="1" :md="1" :lg="1" :xl="1" class="close">
            <i class="el-icon-close" @click="delMale(index)"></i>
          </el-col>
        </el-row>
        <el-row>
          <el-tag>已添加数量：{{ todolistMale.length }}</el-tag>
        </el-row>
      </el-main>
    </el-container>

    <el-container class="model">
      <el-header style="margin-bottom:-20px">
        <h3>感应到女性模板</h3>
      </el-header>
      <el-main>
        <el-input placeholder="添加模板数据" class="todoinput" @keyup.enter.native="addFemale" v-model="newtodoFemale.content"></el-input>
        <el-row v-for="(item, index) in todolistFemale" :key="item.content" class="list-row">
          <el-col :xs="2" :sm="1" :md="1" :lg="1" :xl="1" class="check" :class="{ red: !todolistFemale[index].done, 'green': todolistFemale[index].done }">
            <el-checkbox size="mini" v-model="item.done"></el-checkbox>
          </el-col>
          <el-col :xs="20" :sm="22" :md="22" :lg="22" :xl="22">
            <input type="text" v-model="item.content" class="ipcont" :class="{done: todolistFemale[index].done}">
          </el-col>
          <el-col :xs="2" :sm="1" :md="1" :lg="1" :xl="1" class="close">
            <i class="el-icon-close" @click="delFemale(index)"></i>
          </el-col>
        </el-row>
        <el-row>
          <el-tag>已添加数量：{{ todolistFemale.length }}</el-tag>
        </el-row>
      </el-main>
    </el-container>

    <el-container class="model">
      <el-header style="margin-bottom:-20px">
        <h3>无法判断性别模板</h3>
      </el-header>
      <el-main>
        <el-input placeholder="添加模板数据" class="todoinput" @keyup.enter.native="addNoSex" v-model="newtodoNoSex.content"></el-input>
        <el-row v-for="(item, index) in todolistNoSex" :key="item.content" class="list-row">
          <el-col :xs="2" :sm="1" :md="1" :lg="1" :xl="1" class="check" :class="{ red: !todolistNoSex[index].done, 'green': todolistNoSex[index].done }">
            <el-checkbox size="mini" v-model="item.done"></el-checkbox>
          </el-col>
          <el-col :xs="20" :sm="22" :md="22" :lg="22" :xl="22">
            <input type="text" v-model="item.content" class="ipcont" :class="{done: todolistNoSex[index].done}">
          </el-col>
          <el-col :xs="2" :sm="1" :md="1" :lg="1" :xl="1" class="close">
            <i class="el-icon-close" @click="delNoSex(index)"></i>
          </el-col>
        </el-row>
        <el-row>
          <el-tag>已添加数量：{{ todolistNoSex.length }}</el-tag>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { addTemplateTalk, deleteTemplateTalk, getRobotTemplateLists } from '@/api/robots'

export default {
  data() {
    return {
      newtodoCommon: {
        content: '',
        done: false,
        orderId: null
      },
      newtodoMale: {
        content: '',
        done: false,
        orderId: null
      },
      newtodoFemale: {
        content: '',
        done: false,
        orderId: null
      },
      newtodoNoSex: {
        content: '',
        done: false,
        orderId: null
      },
      todolistCommon: [],
      todolistMale: [],
      todolistFemale: [],
      todolistNoSex: []
    }
  },
  created() {
    this.getRobotTemplateLists()
  },
  methods: {
    addRobotTemplateTalk(type, newtodo) { // 参数type: common male female nosex
      addTemplateTalk(type, newtodo).then(response => {
        if (response.data.code === 0) {
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
    delRobotTemplateTalk(type, newtodo) {
      deleteTemplateTalk(type, newtodo).then(response => {
        if (response.data.code === 0) {
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
    getRobotTemplateLists() {
      getRobotTemplateLists().then(response => {
        if (response.data.code === 0) {
          this.todolistCommon = response.data.todolistCommon
          this.todolistMale = response.data.todolistMale
          this.todolistFemale = response.data.todolistFemale
          this.todolistNoSex = response.data.todolistNoSex
        }
      })
    },
    addCommon() {
      if (this.newtodoCommon.content) {
        this.newtodoCommon.orderId = this.todolistCommon.length + 1
        this.todolistCommon.push(this.newtodoCommon)
        this.addRobotTemplateTalk('common', this.newtodoCommon) // 添加到数据库
        this.newtodoCommon = { content: '', done: false, orderId: null }
      }
    },
    addMale() {
      if (this.newtodoMale.content) {
        this.newtodoMale.orderId = this.todolistMale.length + 1
        this.todolistMale.push(this.newtodoMale)
        this.addRobotTemplateTalk('male', this.newtodoMale) // 添加到数据库
        this.newtodoMale = { content: '', done: false }
      }
    },
    addFemale() {
      if (this.newtodoFemale.content) {
        this.newtodoFemale.orderId = this.todolistFemale.length + 1
        this.todolistFemale.push(this.newtodoFemale)
        this.addRobotTemplateTalk('female', this.newtodoFemale) // 添加到数据库
        this.newtodoFemale = { content: '', done: false }
      }
    },
    addNoSex() {
      if (this.newtodoNoSex.content) {
        this.newtodoNoSex.orderId = this.todolistNoSex.length + 1
        this.todolistNoSex.push(this.newtodoNoSex)
        this.addRobotTemplateTalk('nosex', this.newtodoNoSex) // 添加到数据库
        this.newtodoNoSex = { content: '', done: false }
      }
    },
    delCommon(index) {
      this.delRobotTemplateTalk('common', this.todolistCommon[index])
      this.todolistCommon.splice(index, 1)
    },
    delMale(index) {
      this.delRobotTemplateTalk('male', this.todolistMale[index])
      this.todolistMale.splice(index, 1)
    },
    delFemale(index) {
      this.delRobotTemplateTalk('female', this.todolistFemale[index])
      this.todolistFemale.splice(index, 1)
    },
    delNoSex(index) {
      this.delRobotTemplateTalk('nosex', this.todolistNoSex[index])
      this.todolistNoSex.splice(index, 1)
    }
  }
}
</script>

  <style>

    .el-header {
      text-align: left;
    }

    .todoinput {
      margin-bottom: 10px;
      margin-top: -20px
    }

    .list-row {
      height: 40px;
      background-color: #fbfbfb;
      margin-bottom: 5px;
    }

    .check {
      text-align: center;
      line-height: 40px;
    }

    .red {
      border-left: #ef5f65 2px solid;
    }

    .green {
      border-left: #B9E1DC 2px solid;
    }

    .ipcont {
      width: 90%;
      margin-top: 8px;
      border: 0;
      line-height: 24px;
      background-color: transparent;
      font-size: 16px;
      color: #756C83;
    }

    .close {
      text-align: center;
      line-height: 40px;
    }

    .el-icon-close {
      cursor: pointer;
    }

    .el-icon-close:hover {
      color: #ef5f65;
    }

    .done {
      text-decoration: line-through;
    }
    .model{
      background: #fff;
      border: 1px solid #dcdfe6;
      box-shadow: 0 2px 4px 0 rgba(0,0,0,.12), 0 0 6px 0 rgba(0,0,0,.04);
      margin-bottom: 15px;
      width: 48%;
      margin-right: 25px;
      float: left;
      height: 450px;
    }
  </style>
