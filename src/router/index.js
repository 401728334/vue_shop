import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Categories from '../components/commodity/Categories.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/', redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: Welcome
        },
        {
          path: '/users',
          component: Users
        },
        {
          path: '/rights',
          component: Rights
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/categories',
          component: Categories
        }
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // 用户直接访问登陆页面，直接放行
  if (to.path === '/login') return next()
  // 判断是否登陆
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')// 没有登陆 强制跳转到登录页
  next()
})
export default router
