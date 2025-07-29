export default{
    template:`
    <div class ="row border">
        <div class ="col-7">
            <h2> Welcome {{userData.username}}</h2>
        </div>
        <div class ="col-5" style="text-align:right;">
            <router-link to="/User_Dashboard" class="btn btn-outline-primary">Dashboard</router-link>
            <router-link to="/" class="btn btn-outline-danger">Logout</router-link>
        </div>
        <div class ="border" style="height:700px; text-align:center; overflow-y:auto;">
            <div>
                <h2>Quiz Scores</h2>
            </div>
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Quiz Id</th>
                        <th scope="col">Subject</th>
                        <th scope="col">Chapter</th>
                        <th scope="col">Attempt At Date-Time</th>
                        <th scope="col">Score</th>
                    </tr>
            </thead>
            <tbody>
                    <tr v-for="s in scores" class="text-center">
                        <th scope="row">{{s.id}}</th>
                        <td>{{s.quiz_id}}</td>
                        <td>{{s.subject}}</td>
                        <td>{{s.chapter}}</td>
                        <td>{{s.time_of_attempt}}</td>
                        <td>{{s.score}}/{{s.total_ques}}</td>
                    </tr>
            </tbody>
            </table>
        </div>
    </div>`,
    data: function(){
        return{
            userData:"",
            scores:[]
        }
    },
    methods:{
        getscore(){
            const user_id = this.userData.id;
            const apiUrl = `/api/scoreview/get/${user_id}`

            fetch(apiUrl,{
                method:'GET',
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                }
            })
            .then(response => response.json())
            .then(data => {
                this.scores = data
        })
        },

        
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
            this.getscore();
        });


        
    }
}