<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-row>
      <!-- 分类列表 -->
      <tree-table class='tree-table'
      :data='catelist'
      :columns="columns"
      :selection-type="false"
      :expand-type="false"
      show-index
      index-text="#"
      border
      :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isOK" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === 'false'"></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="iconfont icon-bianji2" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger"  icon="iconfont icon-shanchu" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[2,3,5,10]"
        :page-size="querInfo.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <!-- 添加分类对话框 -->
      <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <!-- options指定数据源 -->
            <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged"
              clearable
              ref="select">
            </el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑分类对话框 -->
      <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="活动名称" prop="cat_name">
            <el-input v-model="editForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询数据数据条件
      querInfo: {
        type: 3, // 三层数据
        pagenum: 1, // 一页
        pagesize: 10 // 显示五条数据
      },
      // 商品分类的数据列表
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table表格指定列的定义
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isOK' }, // template表示当前列定义为模板列，isOK模板名称
        { label: '排序', type: 'template', template: 'sort' },
        { label: '操作', type: 'template', template: 'opt' }
      ],
      // 添加分类对话框
      addCateDialogVisible: false,
      // 添加分类的表单数据
      addCateForm: {
        cat_name: '', // 将要添加的分类名称
        cat_pid: 0, // 父级分类的id
        cat_level: 0 // 分类的等级，默认为一级
      },
      // 添加分类表单的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类数据列表
      parentCateList: [],
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 编辑对话框
      editCateDialogVisible: false,
      // 编辑列表数据
      editForm: {
        cat_name: '',
        cat_id: 0
      },
      // 编辑表单验证规则
      editFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      cat_id: ''
    }
  },
  // 监听添加分类父级分类有没有选中值，选中了关闭下拉菜单
  watch: {
    selectedKeys () {
      if (this.$refs.select) {
        this.$refs.select.dropDownVisible = false
      }
    }
  },
  created () {
    this.getCatelis()
  },
  methods: {
    // 获取商品分类的数据
    async getCatelis () {
      const { data: res } = await this.$http.get('categories', { params: this.querInfo })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(this.res.msg)
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize一页多少条数据事件
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      // 刷新数据
      this.getCatelis()
    },
    // 监听pagenum几页事件
    handleCurrentChange (newPage) {
      this.querInfo.pagenum = newPage
      // 刷新数据
      this.getCatelis()
    },
    // 点击按钮展示添加分类对话框
    showAddCateDialog () {
      // 调用父级分类数据列表函数
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取添加分类父级分类的父级列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // console.log(res.data)
      this.parentCateList = res.data
    },
    // 添加分类父级分类值选中发生此函数
    parentCateChanged () {
      // console.log(this.selectedKeys)
      // 如果selectedKeys的length＞0则有选中父级分类，反正则没有任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return false
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮添加新的分类
    addCate () {
      // console.log(this.addCateForm)
      // 表单预验证，当验证听过才会往下执行
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('添加分类成功')
        // 刷新数据列表
        this.getCatelis()
        // 隐藏添加对话框
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框关闭的事件，清空数据
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 展示编辑对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`categories/${id}`)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm = res.data
      // 显示编辑对话框
      this.editCateDialogVisible = true
    },
    // 点击按钮修改商品分类明
    editCate () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}`, { cat_name: this.editForm.cat_name })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 更新分类数据列表
        this.getCatelis()
        // 隐藏编辑分类对话框
        this.editCateDialogVisible = false
        this.$message.success('分类修改成功！')
      })
    },
    // 编辑分类对话框关闭清楚数据
    editCateDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 根据id删除分类
    async removeCate (id) {
      const result = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`categories/${id}`)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('分类删除成功')
      // 刷新分类列表
      this.querInfo.pagenum = 1
      this.getCatelis()
    }
  }
}
</script>

<style lang="less" scoped>
  .el-card {
      margin-top: 20px;
  }
  .tree-table {
      margin-top: 20px;
  }
  i {
    color: lightgreen;
    transform: scale(1.5);
  }
  .el-cascader {
    width: 100%;
  }
</style>
