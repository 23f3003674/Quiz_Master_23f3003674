export default{
    template:`
    <div class ="row">
        <h2> Welcome {{userData.username}}</h2>
        <div class ="col-7 border" style="height:700px;">
            
            <div class="container text-center">
                <div>
                    <h2>ALL Quizzes</h2>
                </div>
                <div class="row text-center">
                    <div class="col">
                        Id
                    </div>
                    <div class="col">
                        Remarks
                    </div>
                    <div class="col">
                        Date
                    </div>
                    <div class="col">
                        Duration
                    </div>
                    <div class="col">
                        Action
                    </div>
                </div>
            </div>
            <div v-for="q in quiz" class="text-center">
                <div class="row">
                    <div class="col">
                        {{q.id}}
                    </div>
                    <div class="col">
                        {{q.remarks}}
                    </div>
                    <div class="col">
                        {{q.date}}
                    </div>
                    <div class="col">
                        {{q.time}} min
                    </div>
                    <div class="col">
                        <button @click="Quiz_detail(q.id)">view</button>
                        <button @click = "Question_attempt(q.id)">Start</button>
                    </div>
                </div>
            </div>
        </div>
        <div  class ="col-5 border" style = "height:700px;">
            <div v-if="showdetails && quizdata">
                <h3>Quiz Details</h3>
                <p><strong>Id:</strong> {{ quizdata.id }}</p>
                <p><strong>Remarks:</strong> {{ quizdata.remarks }}</p>
                <p><strong>Date:</strong> {{ quizdata.date }}</p>
                <p><strong>Duration:</strong> {{ quizdata.time }} min</p>
                <p><strong>No. of Ques:</strong>{{number_of_ques}}</p>
            </div>
            <div v-if="questions && !isQuizDone"><h2>Quiz Start</h2>
                
                    <p>Time Left: {{minutes}}:{{seconds}}</p>
                    <form @submit.prevent="submitAnswer">
                        <fieldset>
                            <legend>{{currentQuestion.question}}</legend>
                            <div v-for="opt in ['A','B','C','D']":key ="opt">
                                <input type="radio" :id="opt" name="option" :value="currentQuestion[opt]" v-model="selected" />
                                <label :for="opt">{{currentQuestion[opt]}}</label>
                            </div>
                            <button type="submit">submit</button>
                        </fieldset>
                    </form>
                
            </div>
            <div v-if="isQuizDone">
                <h2>Quiz completed, score:{{score}}</h2>
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
                this.activequiz = quizId;
                this.questions = data.questions;
                this.timeLeft = data.duration*60;
                this.currentIndex = 0;
                this.score = 0;
                this.isQuizDone = false;
                this.selected = null;
                clearInterval(this.timer);
                this.startTimer();
                this.showdetails= false;
                console.log(data)
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
            this.activequiz=null;
            this.saveScore();
        },
        saveScore(){
            if(!this.quizdata || !this.quizdata.id){
                alert("Currently this has no questions,Please Attempt another Quiz!!");
                return;
            }
            const apiUrl = `/api/score/post/${this.quizdata.id}`;
            const sc = {
                score: this.score,
                time_of_attempt: new Date().toISOString()
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
            .then(data => {console.log(data)})
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
        .then(data => {
            console.log(data)
            this.quiz = data})

        
    }
}