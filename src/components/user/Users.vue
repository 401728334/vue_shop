<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
     <el-card class="box-card">
        <!-- 搜索与添加区域 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getUsersList">
              <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
             <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>
        <!-- 用户列表区域 -->
        <el-table :data="userlist"  border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="姓名" prop="username"  align="center"></el-table-column>
          <el-table-column label="邮箱" prop="email" align="center"></el-table-column>
          <el-table-column label="电话" prop="mobile" align="center"></el-table-column>
          <el-table-column label="角色" prop="role_name" align="center"></el-table-column>
          <el-table-column label="状态" prop="mg_state" align="center">
              <!-- 作用域插槽，可以获取数据 -->
             <template slot-scope="scope">
                <el-switch v-model="scope.row.mg_state" active-color="#13ce66" @change="userStateChange(scope.row)">
                </el-switch>
             </template>
          </el-table-column>
          <el-table-column label="操作" width="250" align="center">
            <template slot-scope="scope">
              <el-tooltip content="编辑" placement="top" :enterable="false">
                <el-button type="primary" icon="iconfont icon-bianji2" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" :enterable="false">
                <el-button type="danger"  icon="iconfont icon-shanchu" size="mini" @click="removeUserById(scope.row.id)"></el-button>
              </el-tooltip>
              <el-tooltip content="角色分配" placement="top" :enterable="false">
                <el-button type="primary" icon="iconfont icon-xiugaijiaose" size="mini" @click="showSetRolesDialog(scope.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页区域 -->
         <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="1"
            :page-sizes="[1, 2, 3, 5,10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
         </el-pagination>
      </el-card>
      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="checkPassword">
            <el-input type="password" v-model="addForm.checkPassword"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户对话框 -->
      <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser(editForm.id)">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色对话框 -->
      <el-dialog
        title="分配角色"
        :visible.sync="setRolesDialogVisible"
        width="50%"
        @close="setRoleDialogClosed">
        <div>
          <p>当前的用户：{{userInfo.username}}</p>
          <p>当前的角色：{{userInfo.role_name}}</p>
          <p>分配新的角色：
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    // 验证密码是否一致
    var checkPass = (rule, value, cb) => {
      if (value === '') cb(new Error('请再次输入密码'))
      else if (value !== this.addForm.password) cb(new Error('两次输入密码不一致'))
      cb()
    }
    // 验证电子邮箱规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的电子邮箱'))
    }
    // 验证手机号规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1(3|4|5|6|7|8|9)\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 修改列表的表单数据
      editForm: {},
      // 获取用户列表定义的参数对象
      queryInfo: {
        query: '', // 查询用户的条件
        pagenum: 1, // 当前页码值
        pagesize: 2 // 每页显示的条目数
      },
      userlist: [],
      total: 0,
      dialogVisible: false, // 添加用户false隐藏对话框
      editDialogVisible: false, // 修改用户false隐藏对话框
      setRolesDialogVisible: false, // 分配角色对话框
      // 添加用户数据
      addForm: {
        username: '',
        password: '',
        checkPassword: '',
        email: '',
        mobile: ''
      },
      // 添加用户规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        checkPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: checkPass, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入电子邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户规则
      editFormRules: {
        email: [
          { required: true, message: '请输入电子邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色列表数据
      rolesList: [],
      // 保存以选中角色的id值,
      selectedRoleId: ''
    }
  },
  created () {
    this.getUsersList()
  },
  methods: {
    // 获取用户列表
    async getUsersList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 监听页码一页总数
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUsersList()
    },
    // 监听页码值
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUsersList()
    },
    // 监听用户状态改变
    async userStateChange (userInfo) {
      // users/:uid/state/:type
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('用户状态修改失败')
      }
      return this.$message.success('用户状态修改成功')
    },
    // 监听添加用户对话框关闭清楚数据
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 预验证通过 发送请求 提交post 路径users 参数
        const { data: res } = await this.$http.post('users', this.addForm)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('添加用户成功')
        // 隐藏添加框
        this.dialogVisible = false
        // 更新用户列表
        this.getUsersList()
      })
    },
    // 显示修改用户对话框
    async showEditDialog (id) {
      this.editDialogVisible = true
      // users/:id
      const { data: res } = await this.$http.get(`users/${id}`)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
    },
    // 监听修改用户对话框关闭
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户的逻辑
    editUser (id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        //  预验证通过 发送请求 修改put 路径users/:id 参数Id email mobile
        const { data: res } = await this.$http.put(`users/${this.editForm.id}`, { email: this.editForm.email, mobile: this.editForm.email.mobile })
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        // 隐藏添加框
        this.editDialogVisible = false
        // 更新用户列表
        this.getUsersList()
        this.$message.success('修改用户成功')
      })
    },
    // 删除用户
    async removeUserById (id) {
      const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'cancel') {
        return this.$message.info('已取消删除')
      }
      // 发送删除请求 删除delete 路径users/:id
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      // 更新用户列表
      this.queryInfo.pagenum = 1
      this.getUsersList()
    },
    // 展示分配角色对话框
    async showSetRolesDialog (userInfo) {
      this.userInfo = userInfo
      // 在展示对话框之前，获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      this.rolesList = res.data
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.setRolesDialogVisible = true
    },
    // 点击确定按钮分配角色
    async saveRoleInfo () {
      if (!this.selectedRoleId) return this.$message.error('请选择一个新的角色')
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('更新角色成功！')
      // 更新用户列表
      this.getUsersList()
      // 隐藏对话框
      this.setRolesDialogVisible = false
    },
    // 监听分配角色对话框关闭后清楚数据
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb {
    margin-bottom: 16px;
    font-size: 12px;
}

.el-card {
    box-shadow: 0px 1px 1px rgba(0,0,0,0.15);
    .el-table {
      border:1px solid #c9d6df;
      margin-top:15px;
    }
    .el-pagination {
       margin-top:15px;
    }
}
</style>
