<template>
    <el-container class="home_box">
            <!-- 页面头部 -->
            <el-header>
                <div class="logo">
                    <img src="../assets/geyu.jpg" alt="">
                    <h1>xx公司电商后台管理系统</h1>
                </div>
            </el-header>
            <!-- 主体区域 -->
            <el-container>
                <!-- 侧边栏 -->
                <el-aside :width=" isCollapse ? '70px' : '200px'">
                    <div class="toggle-button" @click="toggleCollapse">|||</div>
                    <el-menu background-color="#545c64" text-color="#fff" active-text-color="#a1afc9" unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true">
                        <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
                            <template slot="title">
                                <i :class="iconsObj[item.id]"></i>
                                <span>{{item.authName}}</span>
                            </template>
                            <!-- 二级菜单 -->
                            <el-menu-item :index="subItem.path" v-for="subItem in item.children" :key="subItem.id">
                                    <template slot="title">
                                        <i :class="iconsSub[subItem.id]"></i>
                                        <span>{{subItem.authName}}</span>
                                    </template>
                            </el-menu-item>
                        </el-submenu>
                        <el-menu-item index="2"  @click="logout">
                            <i class="el-icon-switch-button"></i>
                            <span class="out" slot="title">退出登陆</span>
                        </el-menu-item>
                    </el-menu>
                </el-aside>
                <!-- 右侧内容区域 -->
                <el-main>
                  <router-view></router-view>
                </el-main>
            </el-container>
    </el-container>
</template>

<script>
export default {
  data () {
    return {
      menulist: [], // 侧边栏的菜单数据
      iconsObj: {
        125: 'iconfont icon-yonghuguanli',
        103: 'iconfont icon-quanxian',
        101: 'iconfont icon-shangpinguanli',
        102: 'iconfont icon-dingdanguanlicopy',
        145: 'iconfont icon-dianpu'
      },
      iconsSub: {
        110: 'iconfont icon-list',
        111: 'iconfont icon-jiaoseliebiao',
        112: 'iconfont icon-quanxianliebiao',
        104: 'iconfont icon-shangpinliebiao',
        115: 'iconfont icon-canshu',
        121: 'iconfont icon-shangpinfenlei',
        107: 'iconfont icon-gouwuche-copy',
        146: 'iconfont icon-shujubaobiao'
      },
      isCollapse: false
    }
  },
  created () {
    this.getMenuList()
  },
  methods: {
    logout () {
      // 销毁本地的token值,返回登陆界面
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取菜单列表
    async getMenuList () {
      // get menus
      const { data: res } = await this.$http.get('menus')
      //  console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取列表菜单失败')
      this.menulist = res.data
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
.home_box {
    height: 100%;
}
.el-header {
    background-color:#252a34;
    display: flex;
    justify-content: space-between;
    align-items: 50%;
    >div {
        display: flex;
        align-items: center;
        h1 {
            color:#f2f4f7;
            margin-left:300px;
        }
        img {
            width: 55px;
            height: 55px;
            margin-left: 15px;
            border-radius: 50%;
        }
    }
}

.el-aside {
    background-color:#252a34;
    .el-menu {
        border:none;
        width: 100%;
        .el-menu-item {
            .el-icon-switch-button {
                margin-left: 5px;
            }
        }
    }
}

.toggle-button {
  background-color: #474a4d;
  color: #fff;
  text-align: center;
  font-size: 10px;
  cursor: pointer;
  line-height: 24px;
  letter-spacing: 0.2em;
}

.el-main {
    background-color: #cbf1f5;
}
</style>
