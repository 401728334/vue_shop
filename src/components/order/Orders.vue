<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getOrderlist">
            <el-button slot="append" icon="el-icon-search" @click="getOrderlist"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表区域 -->
      <el-table :data="orderlist"  border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
        <el-table-column label="是否付款" width="80px">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status == 0">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" width="80px">
          <template slot-scope="scope">
            {{scope.row.is_send}}
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="200px">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template>
            <el-tooltip content="修改" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" class="bianji" @click="showEditDialog"></el-button>
            </el-tooltip>
            <el-tooltip content="物流" placement="top" :enterable="false">
              <el-button type="success" icon="el-icon-location" size="mini" class="weizhi" @click="showProgressDialog"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="EditDialogVisible" width="50%" @close="EditDialogClosed">
      <el-form :model="EditForm" :rules="EditFormRules" ref="EditFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="editress1">
          <el-cascader
            v-model="EditForm.editress1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="editress2">
          <el-input v-model="EditForm.editress2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="EditDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%" @close="EditDialogClosed">
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data () {
    return {
      // 订单数据列表
      orderlist: [],
      // 订单列表条件
      queryInfo: {
        query: '', // 查询参数
        pagenum: 1, // 查询页码
        pagesize: 5 // 页码显示条数
      },
      // 数据总数
      total: 0,
      // 修改地址对话框
      EditDialogVisible: false,
      // 修改地址数据
      EditForm: {
        editress1: [],
        editress2: ''
      },
      // 表单验证规则
      EditFormRules: {
        editress1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        editress2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 导入省级县信息
      cityData,
      // 物流进度对话框
      progressVisible: false,
      // 物流进度信息
      progressInfo: []
    }
  },
  created () {
    this.getOrderlist()
  },
  methods: {
    // 更新订单数据列表
    async getOrderlist () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('订单数据列表获取失败')
      this.orderlist = res.data.goods
      this.total = res.data.total
    },
    // 监听页码一页总数
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderlist()
    },
    // 监听页码值
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderlist()
    },
    // 展示修改地址对话框
    showEditDialog () {
      this.EditDialogVisible = true
    },
    // 关闭修改地址对话框
    EditDialogClosed () {
      this.$refs.EditFormRef.resetFields()
    },
    // 展示物流地址对话框
    showProgressDialog () {
      // const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      // console.log(res)
      // if (res.meta.status !== 200) return this.$message.error('获取物流信息失败')
      // this.progressInfo = res.data
      // this.progressVisible = true
      // console.log(this.progressInfo)
      return this.$message.info('物流信息API接口过期')
    }
  }
}
</script>

<style lang="less" scoped>
  .el-card {
    margin: 20px 0px;
  }
  .bianji {
    width: 50px;
    height: 30px;
  }
  .weizhi {
    width: 50px;
    height: 30px;
  }
  .el-table {
    margin: 20px 0px;
  }
  .el-cascader {
    width: 100%;
  }
</style>
