export default{
    template:`
    <div class ="row border">
        <div class ="col-7">
            <h2> Welcome {{userData.username}}</h2>
        </div>
        <div class ="col-5 d-flex" style="text-align:right;">
            <input v-model="searchquery" class="form-control" placeholder="Search" />
            <button class="btn btn-outline-success btn-sm" @click="usersearch">Search</button>
            <router-link to="/Admin_Dashboard" class="btn btn-outline-primary btn-sm">Dashboard</router-link>
            <router-link to="/" class="btn btn-outline-danger btn-sm">Logout</router-link>
        </div>
        <div class ="border" style="height:700px; text-align:center; overflow-y:auto;">
            <div style="text-align:center;">
                <h2 v-if="!searched">ALL USERS</h2>
                <h2 v-else>Searched User</h2>
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
            users:[],
            searchquery:"",
            searchresult:"",
            searched:false
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
        },

        usersearch() {
            const query = this.searchquery.trim();
            if (!query) {
                this.searched = false;
                this.users = [];
                this.getusers();
                return;
            }
            fetch('/api/adminusersearch/post', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify({query})
            }).then(response => {
                if (!response.ok) return [];
                return response.json();
            }).then(data => {
                this.users = Array.isArray(data) ? data : [];
                this.searched = true;
            }).catch(err => {
                console.error('Search user failed:', err);
                this.users = [];
                this.searched = true;});
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