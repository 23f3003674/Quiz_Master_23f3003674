export default{
    template:`
    <div class ="row border">
        <div class ="col-7">
            <h2> Welcome {{userData.username}}</h2>
        </div>
        <div class ="col-5" style="text-align:right;">
            <router-link to="/Admin_Dashboard" class="btn btn-outline-primary">Dashboard</router-link>
            <router-link to="/" class="btn btn-outline-danger">Logout</router-link>
        </div>
        <div class ="border" style="height:700px; text-align:center; overflow-y:auto;">
            <div>
                <h2>All Users</h2>
            </div>
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">User Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Date OF Bith</th>
                        <th scope="col">Qualification</th>
                        <th scope="col">Action</th>
                    </tr>
            </thead>
            <tbody>
                    <tr v-for="s in users" v-if="s.id !== 1" class="text-center">

                        <th scope="row">{{s.id}}</th>
                        <td>{{s.username}}</td>
                        <td>{{s.email}}</td>
                        <td>{{s.dob}}</td>
                        <td>{{s.qualification}}</td>
                        <td>
                            <button @click="deleteuser(s.id)" class="btn btn-outline-danger">Delete User</button>
                        </td>
                    </tr>
            </tbody>
            </table>
        </div>
    </div>`,
    data: function(){
        return{
            userData:"",
            users:[]
        }
    },
    methods:{
        getusers(){
            const apiUrl = '/api/userview/get'

            fetch(apiUrl,{
                method:'GET',
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                }
            })
            .then(response => response.json())
            .then(data => {
                this.users = data
        })
        },

        deleteuser(user_id){
            const apiUrl = `/api/userdelete/delete/${user_id}`

            fetch(apiUrl,{
                method:'DELETE',
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                }
            })
            .then(() => this.getusers());
        }
        
        

        
    },
    mounted(){
        fetch('/api/user',{
            method: 'GET',
            headers:{
                "Content-Type":"application/json",
                "Authentication-Token":localStorage.getItem("auth_token")
            }
        })
        .then(response => response.json())
        .then(data => {
            this.userData = data;
            this.getusers();
        });


        
    }
}