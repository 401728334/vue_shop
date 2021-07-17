<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="col_opt">
        <el-col>
          <span>选中商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateProps"
            @change="handelChanged"
            clearable>
          </el-cascader>
          <!-- tab页签区域 -->
          <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <!-- 添加动态参数的面板 -->
            <el-tab-pane label="动态参数" name="many">
              <!-- 添加参数按钮 -->
              <el-button type="primary" size="mini" :disabled="isButtonDisabled" @click="addDialogVisible = true">添加参数</el-button>
              <!-- 动态参数表格 -->
              <el-table :data="manyTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand"></el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button type="primary" icon="iconfont icon-bianji2" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                    <el-button type="danger"  icon="iconfont icon-shanchu" size="mini" @click="remove(scope.row.attr_id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <!-- 添加静态属性的面板 -->
            <el-tab-pane label="静态属性" name="only">
              <!-- 添加属性按钮 -->
              <el-button type="primary" size="mini" :disabled="isButtonDisabled" @click="addDialogVisible = true">添加属性</el-button>
              <!-- 静态属性表格 -->
              <el-table :data="onlyTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand"></el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button type="primary" icon="iconfont icon-bianji2" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                    <el-button type="danger"  icon="iconfont icon-shanchu" size="mini" @click="remove(scope.row.attr_id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
    <!-- 添加按钮对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 编辑按钮对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表数据
      catelist: [],
      // 级联选择框配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定的数组
      selectedCateKeys: [],
      // 被激活页签的名称，首个展示的页面
      activeName: 'many',
      // 动态参数表格数据
      manyTableData: [],
      // 静态属性表格数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 定义添加表单的验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 添加参数的表单数据对象
      editForm: {},
      // 定义编辑表单的验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    // 获取商品分类数据
    this.getCateList()
  },
  methods: {
    // 商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(this.res.msg)
      this.catelist = res.data
      // console.log(this.catelist)
    },
    // 级联选择框中值发送变化，会触发这个函数
    handelChanged () {
      this.getParamsDate()
    },
    // tab 页签点击事件的处理函数
    handleTabClick () {
      // console.log(this.activeName)
      this.getParamsDate()
    },
    // 获取参数的列表数据
    async getParamsDate () {
      // console.log(this.selectedCateKeys)
      // 判断选中的是否为三级分类
      if (this.selectedCateKeys.length === 1 || this.selectedCateKeys.length === 2) {
        this.selectedCateKeys = []
        return this.$message.error('您选中的不是三级分类')
      }
      // console.log(this.selectedCateKeys)
      // 根据所选分类的id，和当前所处的面板，获取对应的数据
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(this.res.msg)
      // console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听添加对话框的关闭
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name, attr_sel: this.activeName
        })
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('添加参数成功！')
        // 刷新数据列表
        this.getParamsDate()
        // 隐藏添加对话框
        this.addDialogVisible = false
      })
    },
    // 点击编辑按钮，展示编辑对话框
    async showEditDialog (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`,
        { params: { attr_sel: this.activeName } }
      )
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm = res.data
      // 显示编辑对话框
      this.editDialogVisible = true
    },
    // 监听编辑对话框的关闭
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击编辑按钮，修改参数
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('参数修改成功！')
        // 刷新数据列表
        this.getParamsDate()
        // 隐藏编辑对话框
        this.editDialogVisible = false
      })
    },
    // 点击删除按钮，删除参数
    async remove (attrId) {
      const result = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') return this.$message.info('已取消删除！')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('删除分类成功!')
      // 更新数据列表
      this.getParamsDate()
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isButtonDisabled () {
      if (this.selectedCateKeys.length !== 3) return true
      return false
    },
    // 当前选中的三级分类的id
    cateId () {
      if (this.selectedCateKeys.length === 3) return this.selectedCateKeys[2]
      return null
    },
    // 动态计算添加对话框标题的文本
    titleText () {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
  .el-card {
    margin-top: 20px;
  }
  .col_opt {
    margin: 20px 0px;
  }
  .el-tabs {
    margin-top: 20px;
  }
  .el-table {
    margin-top: 20px;
  }
</style>
