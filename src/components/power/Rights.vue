<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 权限列表区域 -->
    <el-card class="box-card">
      <el-table border  stripe :data="rightslist" height="340">
          <el-table-column type="index" width="50" label="#" align="center"></el-table-column>
        <el-table-column prop="authName" label="权限名称" align="center"></el-table-column>
        <el-table-column prop="path" label="路径" align="center"></el-table-column>
        <el-table-column prop="level" label="权限等级" align="center">
          <!-- 作用域插槽-->
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level == 0">一级</el-tag>
            <el-tag v-if="scope.row.level == 1" type="success">二级</el-tag>
            <el-tag v-if="scope.row.level == 2" type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  queryInfo: {
    type: 'list'
  },
  data () {
    return {
      rightslist: []
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    // 获取权限列表数据
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/list')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightslist = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
    margin-top:20px;
}
</style>
