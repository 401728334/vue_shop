<template>
    <div class="login_box">
        <div class="login_form">
            <div class="logo">
                <img src="../assets/geyu.jpg" alt="">
            </div>
            <!-- 登陆表单 -->
        <el-form ref="loginFormRef" label-width="60px" :model="loginForm" class="demo-ruleForm" :rules="loginRules">
            <el-form-item label="账号" prop="username">
               <el-input placeholder="请输入账号" clearable prefix-icon="el-icon-user-solid" v-model="loginForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input placeholder="请输入密码"  show-password  prefix-icon="el-icon-lock" v-model="loginForm.password"  @keyup.enter.native="login"></el-input>
            </el-form-item>
            <el-form-item class="botton">
                <el-button type="primary" plain @click="login">登陆</el-button>
                <el-button type="info" plain class="info" @click="resetLoginForm">重置</el-button>
            </el-form-item>
        </el-form>
        </div>
    </div>
</template>

<script lang="ts">
export default {
  data () {
    return {
      // 登陆表单的数据绑定对象
      loginForm: {
        username: '',
        password: ''
      },
      // 表单验证对象的规则
      loginRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在 3 到 18 个字符', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 重置表单
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    // 登陆处理
    login () {
      this.$refs.loginFormRef.validate(async (valid) => {
        // console.log(valid)
        if (!valid) return
        // 发送请求axios
        const { data: res } = await this.$http.post('login', this.loginForm)
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message({
            message: '登录失败',
            type: 'error'
          })
        }
        this.$message.success('登录成功')
        // 1 把token保存起来
        window.sessionStorage.setItem('token', res.data.token)
        // 2 跳转主页
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
    .login_box{
        height:100%;
        background-color: aquamarine;
    }
    .login_form{
        width:450px;
        height:300px;
        background-color:aliceblue;
        border-radius:4px;
        position:absolute;
        left:50%;
        top:50%;
        transform:translate(-50%,-50%);
    }
    .login_form .logo{
        width:140px;
        height:140px;
        border-radius:50% ;
        position: absolute;
        left:50%;
        transform: translate(-50%,-50%);
        img{
            width: 100%;
            height: 100%;
            border-radius:50% ;
            box-shadow: 1px 2px 5px #898989;
        }
    }
    .demo-ruleForm{
        position: absolute;
        bottom:0;
        padding:0;
        left:70px;
        .botton{
            .info{
            left: 135px;
            position: absolute;
            }
        }
    }
</style>
