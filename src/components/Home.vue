<template>
    <div>
          <el-button type="info" @click="logout">系统退出</el-button>
    </div>
</template>

<script>
export default {
  methods: {
    logout () {
      // 销毁本地的token值,返回登陆界面
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
