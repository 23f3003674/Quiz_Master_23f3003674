export default{
    template:`
    <div class ="row border">
        <div class ="col-7 border">
            <h2> Welcome {{userData.username}}</h2>
        </div>
        <div class ="col-5 border" style="text-align:right;">
            <router-link to="/User_Dashboard" class="btn btn-outline-primary">Dashboard</router-link>
            <router-link to="/login" class="btn btn-outline-danger">Logout</router-link>
        </div>
        <div class ="border" style="height:700px;">
            
            <div class="container text-center">
                <div>
                    <h2>Quiz Scores</h2>
                </div>
                <B><div class="row text-center">
                    <div class="col">
                        Id
                    </div>
                    <div class="col">
                        Quiz Id
                    </div>
                    <div class="col">
                        Subject
                    </div>
                    <div class="col">
                        Chapter
                    </div>
                    <div class="col">
                        Quiz Date-Time 
                    </div>
                    <div class="col">
                        SCORE 
                    </div>
                </div></B>
            </div>
            <div v-for="s in scores" class="text-center">
                <div class="row">
                    <div class="col">
                        {{s.id}}
                    </div>
                    <div class="col">
                        {{s.quiz_id}}
                    </div>
                    <div class="col">
                        {{s.subject}}
                    </div>
                    <div class="col">
                        {{s.chapter}} min
                    </div>
                    <div class="col">
                        {{s.time_of_attempt}}
                    </div>
                    <div class="col">
                        {{s.score}}
                    </div>
                </div>
            </div>
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
                this.scores = data;
                console.log(data)
        })
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
            this.getscore();
        });


        
    }
}