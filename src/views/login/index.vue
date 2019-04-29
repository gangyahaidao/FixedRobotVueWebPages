<template>
  <div class="login-container">

    <el-form class="login-form" autoComplete="on" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left">

      <div class="title-container">
        <h3 class="title">{{$t('login.title')}}</h3>
        <lang-select class="set-language"></lang-select>
      </div>

      <el-form-item prop="username">
        <span class="svg-container svg-container_login">
          <svg-icon icon-class="user" />
        </span>
        <el-input name="username" type="text" v-model="loginForm.username" autoComplete="on" :placeholder="$t('login.username')"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input name="password" :type="passwordType" @keyup.enter.native="handleLogin" v-model="loginForm.password" autoComplete="on"
          :placeholder="$t('login.password')" />
        <span class="show-pwd" @click="showPwd">
          <svg-icon icon-class="eye" />
        </span>
      </el-form-item>

      <el-button type="primary" style="width:100%;margin-bottom:30px;" :loading="loading" @click.native.prevent="handleLogin">{{$t('login.logIn')}}</el-button>

      <div class="tips"> <!-- 机器人管理系统用户注册 -->
        <span>还没有账号？</span>
        <span class="link-type" style="margin-left:-16px" @click='handleRegister()'>点击注册</span>
      </div>
    </el-form>

    <el-dialog title="用户注册" :visible.sync="dialogFormVisible" append-to-body width="33%">
      <el-form :rules="rules" ref="regForm" :model="regForm" label-position="left" label-width="80px" style='width: 400px; margin-left:40px;'>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="regForm.username"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="regForm.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="regForm.checkPass" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('login.cancel')}}</el-button>
        <el-button type="primary" :loading="regloading" @click="createUser('regForm')">{{$t('login.register')}}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { isvalidUsername } from '@/utils/validate'
import LangSelect from '@/components/LangSelect'
import { registerUser } from '@/api/login'

export default {
  components: { LangSelect },
  name: 'login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!isvalidUsername(value)) {
        callback(new Error('用户名格式错误，请使用全名拼音小写'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能少于六位数'))
      } else {
        callback()
      }
    }
    var validatePass = (rule, value, callback) => {
      if (value.trim().length < 6) {
        callback(new Error('请输入至少六位密码'))
      } else {
        if (this.regForm.checkPass !== '') {
          this.$refs.regForm.validateField('checkPass')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value.trim().length < 6) {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.regForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      dialogFormVisible: false,
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      loading: false,
      regloading: false,
      regForm: {
        username: '',
        password: '',
        checkPass: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, validator: validatePass, trigger: 'blur' }],
        checkPass: [{ required: true, validator: validatePass2, trigger: 'blur' }]
      }
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('LoginByUsername', this.loginForm).then(() => {
            this.loading = false
            this.$router.push({ path: '/' })
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    handleRegister() {
      this.dialogFormVisible = true
    },
    createUser(formName) { // 访问的url地址需要在request.js中加入过滤白名单，否则会进行拦截刷新页面
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.regloading = true
          registerUser(this.regForm).then(response => {
            console.log(JSON.stringify(response.data))
            if (response.data.code === 0) {
              this.regloading = false
              this.dialogFormVisible = false
              this.$message({
                message: response.data.message,
                type: 'success'
              })
            } else {
              this.regloading = false
              this.$message({
                message: response.data.message,
                type: 'error'
              })
            }
          })
        } else {
          console.log('error reg submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
$bg:#2d3a4b;
$light_gray:#eee;

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: #fff !important;
      }
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: $bg;
  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 520px;
    padding: 35px 35px 15px 35px;
    margin: 120px auto;
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
    &_login {
      font-size: 20px;
    }
  }
  .title-container {
    position: relative;
    .title {
      font-size: 26px;
      font-weight: 400;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
    .set-language {
      color: #fff;
      position: absolute;
      top: 5px;
      right: 0px;
    }
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .thirdparty-button {
    position: absolute;
    right: 35px;
    bottom: 28px;
  }
}
</style>
