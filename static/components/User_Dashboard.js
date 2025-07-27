export default{
    template:`
    <div class ="row border">
        
        <div class ="col-7">
            <h2> Welcome {{userData.username}}</h2>
        </div>
        <div style="text-align:right;" class ="col-5">
            <router-link v-if="userData && userData.id" :to="{name:'scores', params: {id: userData.id}}" class="btn btn-outline-primary">Scores</router-link>
            <router-link to="/" class="btn btn-outline-danger">Logout</router-link>
        </div>
        <div class ="col-7 border" style="text-align:center; height:700px;">
            <div>
                <h2>ALL Quizzes</h2>
            </div>
            <table class="table table-hover">
                <thead>
                    <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Chapter</th>
                    <th scope="col">Scheduled Date</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="q in quiz" class="text-center">
                    <th scope="row">{{q.id}}</th>
                    <td>{{q.chapter_name}}</td>
                    <td>{{q.date}}</td>
                    <td>{{q.time}} Min</td>
                    <td>
                        <button type="button" class="btn btn-outline-info sm" @click="Quiz_detail(q.id)">view</button>
                        <button v-if="quizdate(q.date)" type="button" class="btn btn-outline-success sm" @click = "Question_attempt(q.id)">Start</button>
                    </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class ="col-5 border" style = "height:700px;">
            <div v-if="showdetails && quizdata">
                <h3 style="text-align:center;">Quiz Details</h3>
                <p><strong>Id:</strong> {{ quizdata.id }}</p>
                <p><strong>Subject:</strong> {{ quizdata.subject_name }}</p>
                <p><strong>Chapter:</strong> {{ quizdata.chapter_name }}</p>
                <p><strong>Remarks:</strong> {{ quizdata.remarks }}</p>
                <p><strong>Scheduled Date:</strong> {{ quizdata.date }}</p>
                <p><strong>Duration:</strong> {{ quizdata.time }} min</p>
                <p><strong>No. of Ques:</strong>{{number_of_ques}}</p>
            </div>
            <div v-if="questions && !isQuizDone"><h2 style="text-align:center;">Quiz Started</h2>
                
                    <p style="text-align:right;">Time Left: {{minutes}}:{{seconds}}</p>
                    <form @submit.prevent="submitAnswer">
                        <fieldset>
                            <legend>{{currentQuestion.question}}</legend>
                            <div v-for="opt in ['A','B','C','D']":key ="opt">
                                <input type="radio" :id="opt" name="option" :value="currentQuestion[opt]" v-model="selected" />
                                <label :for="opt">{{currentQuestion[opt]}}</label>
                            </div>
                            <div style="text-align:right;">
                                <button type="submit" class="btn btn-outline-dark">submit</button>
                            </div>
                        </fieldset>
                    </form>
                
            </div>
            <div v-if="isQuizDone">
                <h2>Quiz completed, Your score is :{{score}}</h2>
            </div>
        </div>
    </div>
    `,
    data: function(){

        return{
            userData:"",
            quiz:null,
            quizdata:{},
            number_of_ques:"",
            questions:null,
            selected: null,
            score: 0,
            isQuizDone: false,
            timeLeft: 0,
            timer: null,
            activequiz:null,
            currentIndex:0,
            showdetails:false

            }
        },
    computed:{
        currentQuestion(){
            return this.questions && this.questions[this.currentIndex] ? this.questions[this.currentIndex] :{};

        },
        minutes(){
            return String(Math.floor(this.timeLeft / 60)).padStart(2, '0');
        },
        seconds(){
            return String(Math.floor(this.timeLeft %60)).padStart(2,'0');
        }

    },    

    methods:{
        Quiz_detail:function(quizId){
            if(this.questions && !this.isQuizDone){
                alert("You are currently attempting a Quiz!!");
                return;
            }
            const apiUrl = `/api/quizview/get/${quizId}`;
            fetch(apiUrl,{
                method:'GET',
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                }
    
            })
            .then(response => response.json())
            .then(data => {
                this.quizdata = data;
                this.number_of_ques= data.questions.length;
                this.showdetails = true;
            })

        },
        Question_attempt:function(quizId){
            if(this.activequiz !== null && !this.isQuizDone){
                alert("Please finish this Quiz First!!");
                return;
            }
            clearInterval(this.timer);
            this.questions = null;
            this.quizdata = {};
            this.score = 0;
            this.currentIndex = 0;
            this.selected = null;
            this.isQuizDone = false;
            

            const apiUrl=`/api/quizattempt/get/${quizId}`;
            fetch(apiUrl,{
                method:'GET',
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                }
            }).then(response => response.json())
            .then(data => {
                if(!data.questions || data.questions.length === 0){
                    alert("This quiz has no question. PLease select another Quiz!!");
                    return;
                }
                this.quizdata = data;
                this.activequiz = quizId;
                this.questions = data.questions;
                this.timeLeft = data.duration*60;
                this.currentIndex = 0;
                this.score = 0;
                this.isQuizDone = false;
                this.selected = null;
                clearInterval(this.timer);
                this.startTimer();
                this.showdetails= false
            })
        },
        submitAnswer(){
            if(!this.selected) return alert("Please select an option");
            if(this.selected === this.currentQuestion.answer){this.score++;}
            this.selected = null;

            if(this.currentIndex < this.questions.length-1){
                this.currentIndex++;
            } else{
                this.finishQuiz();
            }
        },
        startTimer(){
            clearInterval(this.timer);
            this.timer = setInterval(()=>{
                if(this.timeLeft>0){
                    this.timeLeft--;
                }else{
                    clearInterval(this.timer);
                    this.finishQuiz();
                }
            },1000);
        },
        finishQuiz(){
            clearInterval(this.timer);
            this.isQuizDone = true;
            this.saveScore();
            this.activequiz=null;
            this.showdetails = false;

        },
        saveScore(){
            const quizId = this.activequiz;

            if(!quizId || !this.questions?.length){
                alert("Currently this has no questions, Cannot submit score!!");
                return;
            }
            const apiUrl = `/api/score/post/${quizId}`;
            const sc = {
                score: this.score
            };
            fetch(apiUrl,{
                method: 'POST',
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                },
                body: JSON.stringify(sc)
            })
            .then(response => response.json())
            
        },

        quizdate(dateString){
            const today = new Date(Date.now() + 19800000).toISOString().split('T')[0];
            return dateString === today;
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
        .then(data=> this.userData =data)

        fetch('/api/quiz/get',{
            method:'GET',
            headers:{
                "Content-Type":"application/json",
                "Authentication-Token":localStorage.getItem("auth_token")
            }

        })
        .then(response => response.json())
        .then(data => {this.quiz = data})

        
    }
}