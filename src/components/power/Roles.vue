<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card class="box-card">
        <!-- 添加角色按钮 -->
        <el-row>
          <el-button type="primary" @click="dialogVisible = true">添加角色</el-button>
        </el-row>
        <!-- 角色表格 -->
        <el-table border stripe :data="roleslist">
          <el-table-column  type="expand">
            <template slot-scope="scope">
              <el-row :class="['dbbottom', i1 === 0 ? 'dbtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                <!-- 渲染一级权限 -->
                <el-col :span='5'>
                  <el-tag closable
                    @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 渲染二级和三级权限 -->
                <el-col :span='19'>
                  <!-- 通过for循环嵌套渲染二级权限 -->
                  <el-row :class="[i2 === 0 ? '' : 'dbtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                    <el-col :span="6">
                      <el-tag type="success" closable
                        @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag type="warning"
                        v-for="(item3) in item2.children"
                        :key="item3.id"
                        closable
                        @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
              <!-- <pre>
                {{scope.row}}
              </pre> -->
            </template>
          </el-table-column>
          <!-- 索引 -->
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="roleName" label="角色名称"></el-table-column>
          <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
          <el-table-column label="操作" width="350px">
            <template slot-scope="scope">
              <el-button size="mini" icon="iconfont icon-bianji2" type="primary"  @click="editDialog(scope.row.id)">编辑</el-button>
              <el-button size="mini" icon="iconfont icon-shanchu" type="danger" @click="removeRoles(scope.row.id)">删除</el-button>
              <el-button class="fenpei" size="mini" type="warning" icon="el-icon-s-tools" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <!-- 添加角色对话框 -->
      <el-dialog title="添加角色" :visible.sync="dialogVisible" width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
       <!-- 编辑角色对话框 -->
       <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoles(editForm.id)">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限对话框 -->
      <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
        <!-- 树形控件 -->
        <el-tree :data="rightslist"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
          ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      roleslist: [],
      dialogVisible: false, // 隐藏添加角色对话框
      editDialogVisible: false, // 隐藏编辑对话框
      setRightDialogVisible: false, // 隐藏分配权限对话框
      // 添加角色数据
      addForm: {
        roleDesc: '',
        roleName: ''
      },
      // 添加角色数据规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      editForm: {}, // 编辑对象数据
      // 编辑角色数据规则
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      rightslist: [], // 分配权限数据
      // 树形控件的树形绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [], // 默认选中的节点id值数组，树形控件默认勾选的对象
      roleId: '' // 当前即将分配权限的角色ID
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色数据
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.roleslist = res.data
    },
    // 监听添加角色对话框关闭后清楚数据
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加角色
    addRoles () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.addForm = res.data
        this.$message.success('角色添加成功')
        // 关闭对话框
        this.dialogVisible = false
        // 更新角色数据
        this.getRolesList()
      })
    },
    // 编辑角色对话框关闭后清楚数据
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑角色数据对话框
    async editDialog (id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 编辑角色数据
    async editRoles (id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, { roleDesc: this.editForm.roleDesc, roleName: this.editForm.roleName })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('角色修改成功')
        // 隐藏对话框
        this.editDialogVisible = false
        // 更新角色数据
        this.getRolesList()
      })
    },
    // 删除角色
    async removeRoles (id) {
      const result = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'cancel') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${id}`)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('角色删除成功')
      // 更新角色数据
      this.getRolesList()
    },
    // 根据id删除对应的角色权限
    async removeRightById (role, rightId) {
      // 弹框提示用户是否确认删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('删除权限成功')
      // 如果重新更新角色数据 this.getRolesList()，那么数据会重新加载一遍，从而下拉菜单会收缩
      // 只更新下拉数据
      role.children = res.data
    },
    // 展示分配权限对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightslist = res.data
      // console.log(this.rightslist)
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      // 显示分配权限对话框
      this.setRightDialogVisible = true
    },
    // 通过递归形式，获取角色下所有三级权限的id，并保存在defKeys 数组中
    getLeafKeys (node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item =>
        this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框关闭后清楚数据
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      // 将获取到的id，用，字符串拼接起来
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('分配权限成功')
      // 刷新数据类别
      this.getRolesList()
      // 隐藏对话框
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
    margin-top:20px;
}
.fenpei {
    height: 33px;
    padding-bottom: 5px;
    padding-left: 20px;
}
.el-table {
    margin-top:20px;
}
.el-tag {
    margin: 7px;
}
.dbtop {
    border-top:1px solid #eee
}
.dbbottom {
    border-bottom:1px solid #eee
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>
