import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Navbar from './components/Navbar.js'
import Footer from './components/Footer.js'
import User_Dashboard from './components/User_Dashboard.js'
import Admin_Dashboard from './components/Admin_Dashboard.js'
import Scores from './components/Scores.js'
import Admin_Quiz_dashboard from './components/Admin_Quiz_dashboard.js'
import Users from './components/Users.js'



const routes =[
    {path: '/',component: Home},
    {path: '/login',component: Login},
    {path: '/register',component: Register},
    {path: '/User_Dashboard',component: User_Dashboard},
    {path: '/Admin_Dashboard',component: Admin_Dashboard},
    {path: '/scores/:id', name:'scores',component:Scores},
    {path: '/Admin_Quiz_dashboard',component: Admin_Quiz_dashboard},
    {path: '/Users', component: Users}

]

const router = new VueRouter({
    routes
})

const app = new Vue({
    el:"#app",
    router,
    template:`
    <div class = "container">
        <nav-bar></nav-bar>
        <router-view></router-view>
        <foot></foot>
    </div>
    `,
    data:{
        section:"Frontend"
    },
    components :{
        "nav-bar": Navbar,
        "foot": Footer,

    }
})