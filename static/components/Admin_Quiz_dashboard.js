export default{
    template:`
    <div>
        <div class="row border">

            <div class="col-7">
                <h2>Welcome {{ userData.username }}</h2>
            </div>
            <div class="col-5">
                <div style="text-align:right;" class="d-flex">
                    <input v-model="searchquery" class="form-control" placeholder="Search" />
                    <button class="btn btn-outline-primary btn-sm" @click="quizsearch">Search</button>
                    <button class="btn btn-outline-success btn-sm" @click="showpanel = { type: 'create-quiz' }">Add Quiz</button>
                    <router-link to="/Admin_Dashboard" class="btn btn-outline-secondary btn-sm">Dashboard</router-link>
                    <router-link to="/" class="btn btn-outline-danger btn-sm">Logout</router-link>
                </div>
            </div>
            <div class="col-7 border" style="height:700px; overflow-y:auto;">
                <div style="text-align:center;">
                    <h2 v-if="!searched">All Quizzes</h2>
                    <h2 v-else>Searched Quizzes</h2>
                </div>
                <div v-if="quizzes.length === 0" class="text-muted text-center">
                    No quizzes available!!!
                </div>
                <div v-for="quiz in quizzes" :key="quiz.id" class="card mb-3">
                
                    <div class="card-header bg-info text-white d-flex justify-content-between">
                        <div>
                        <b>Subject: {{quiz.subject_name}} | Chapter: {{quiz.chapter_name}} </b>
                            <div>
                                {{quiz.remarks}}
                            </div>
                        </div>
                        <div>
                            <button class="btn btn-warning btn-sm" @click="editquiz(quiz)">Edit</button>
                            <button class="btn btn-danger btn-sm" @click="deletequiz(quiz.id)">Delete</button>
                        </div>
                    </div>

                    <div class="card-body">
                        <p><strong>Date:</strong> {{quiz.date}}</p>
                        <p><strong>Duration:</strong> {{quiz.time}} minutes</p>
                        <p><strong>Total Questions:</strong> {{quiz.questions.length}}</p>
                        <ul class="list-group mb-2">
                        <div v-if="quiz.questions.length === 0" class="text-muted">
                            No questions !!!
                        </div>
                        <li v-for="q in quiz.questions" :key="q.id" class="list-group-item d-flex justify-content-between">
                            <div>
                                {{q.question}}
                            </div>
                            <div>
                                <button class="btn btn-outline-warning btn-sm" @click="showEditQuestion(q, quiz.id)">Edit</button>
                                <button class="btn btn-outline-danger btn-sm" @click="deletequestion(q.id)">Delete</button>
                            </div>
                        </li>
                        </ul>
                        <button class="btn btn-outline-success btn-sm" @click="showCreateQuestion(quiz.id)">Add Question</button>
                    </div>
                </div>
            </div>

            <div class="col-5 border" style="height:700px;">
                <div v-if="showpanel">
                    <h4 class="mb-3" style="text-align:center;">{{paneltitle}}</h4>

                    <div v-if="['create-quiz','edit-quiz'].includes(showpanel.type)">
                        <input v-model="newquiz.remarks" class="form-control mb-2" placeholder="Quiz Remarks" />
                        <select v-model="newquiz.chapter_id" class="form-control mb-2">
                            <option disabled value="">Select Chapter</option>
                            <optgroup v-for="sub in subjects" :key="sub.id" :label="sub.name">
                            <option v-for="chap in sub.chapters" :key="chap.id" :value="chap.id">
                                {{chap.name}}
                            </option>
                            </optgroup>
                        </select>
                        <input v-model="newquiz.date" type="date" class="form-control mb-2" />
                        <input v-model.number="newquiz.time" type="number" class="form-control mb-3" placeholder="Duration (minutes)" min="1" />
                        <button class="btn btn-outline-success" @click="submitquiz">{{ showpanel.type === 'create-quiz' ? 'Create' : 'Update' }}</button>
                    </div>

                    <div v-if="['create-question','edit-question'].includes(showpanel.type) && newquestion[showpanel.quiz_id]">
                        <input v-model="newquestion[showpanel.quiz_id].question" class="form-control mb-2" placeholder="Question Text" />
                        <input v-model="newquestion[showpanel.quiz_id].A" class="form-control mb-2" placeholder="Option A" />
                        <input v-model="newquestion[showpanel.quiz_id].B" class="form-control mb-2" placeholder="Option B" />
                        <input v-model="newquestion[showpanel.quiz_id].C" class="form-control mb-2" placeholder="Option C" />
                        <input v-model="newquestion[showpanel.quiz_id].D" class="form-control mb-2" placeholder="Option D" />
                        <input v-model="newquestion[showpanel.quiz_id].answer" class="form-control mb-3" placeholder="Correct Answer (A/B/C/D)" />
                        <button class="btn btn-outline-success" @click="submitquestion">{{ showpanel.type === 'create-question' ? 'Create' : 'Update' }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div> 
    `,
   data: function(){
    return{
        userData:"",
        subjects:[],
        quizzes:[],
        newquiz:{remarks:"",chapter_id:"",date:"",time:1},
        newquestion:{},
        showpanel:null,
        searchquery:"",
        searchresult:"",
        searched:false
    }
   },
   computed:{
    paneltitle(){
        switch(this.showpanel?.type){
            case 'create-quiz': return 'Create New Quiz';
            case 'edit-quiz': return 'Edit Quiz';
            case 'create-question': return 'Create New Question';
            case 'edit-question': return 'Edit Question';
            default:return "";
        }
    }
   },
   
   methods:{
    initquestion(quizId){
        if(!this.newquestion[quizId]){
            this.$set(this.newquestion, quizId, {question:"",A:"",B:"",C:"",D:"",answer:""});

        }
    },

    fetchsubjects(){
        fetch('/api/subject/get',{
            method:"GET",
            headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                }
        }).then(response => response.json())
        .then(data => this.subjects = data)
        .catch(err => {
            console.error("Subject fetch error:", err);
            this.subjects = [];
        });

    },

    fetchquizzes(){
        fetch('/api/quiz/get',{
           method:"GET",
            headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                }
        }).then(response => {
                if (!response.ok) throw new Error("Quiz fetch failed");
                return response.json();
            })
            .then(data => {
                this.quizzes = Array.isArray(data) ? data : [];
            })
            .catch(err => {
                console.error("Quiz fetch error", err);
                this.quizzes = [];

            })
    },


    createquiz(){
        fetch('/api/quiz/create',{
            method:"POST",
            headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
            },
            body: JSON.stringify(this.newquiz)
        }).then(() => {
            this.newquiz ={remarks:"",chapter_id:"",date:"",time:1};
            this.showpanel= null;
            setTimeout(() => this.fetchquizzes(), 10);
        });
        
    },

    editquiz(quiz){
        this.newquiz ={remarks: quiz.remarks, chapter_id: quiz.chapter_id, date: quiz.date, time: quiz.time};
        this.showpanel={ type:'edit-quiz', quiz_id: quiz.id};
    },

    submitquiz(){
        if(this.showpanel.type === 'create-quiz'){
            this.createquiz();
        }else if(this.showpanel.type ==='edit-quiz'){
            fetch(`/api/quiz/update/${this.showpanel.quiz_id}`,{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                },
            body: JSON.stringify(this.newquiz)
            }).then(() => {
                this.newquiz = {remarks:"",chapter_id:"",date:"",time:1};
                this.showpanel =  null;
                this.fetchquizzes();
            });
        }
    },

    deletequiz(quizid){
        fetch(`/api/quiz/delete/${quizid}`,{
            method:"DELETE",
            headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
            }
        }).then(() => this.fetchquizzes());
    },

    showCreateQuestion(quizId){
        this.initquestion(quizId);
        this.showpanel = {
            type: 'create-question',
            quiz_id: quizId
        };
    },

    createquestion(quizid){
        const qdata = this.newquestion[quizid];
        if(!qdata || !qdata.question || !qdata.answer) return;

        fetch('/api/question/create',{
            method:"POST",
            headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
            },
            body: JSON.stringify({question: qdata.question,A: qdata.A,B: qdata.B,C: qdata.C,D: qdata.D,answer: qdata.answer,quiz_id: quizid})
        }).then(() => {
            this.newquestion[quizid] = {question:"",A:"",B:"",C:"",D:"",answer:""};
            this.fetchquizzes();
            this.showpanel = null;
        });
    },

    showEditQuestion(question, quizId){
        this.$set(this.newquestion, quizId,{question: question.question, A:question.A, B: question.B, C: question.C, D: question.D, answer: question.answer});
        this.showpanel = {type: 'edit-question', quiz_id: quizId, question_id: question.id};
    },


    submitquestion(){
        const quizid = this.showpanel.quiz_id;
        const qdata = this.newquestion[quizid];
        const qid = this.showpanel.question_id;
        if(!qdata || !qdata.question || !qdata.answer) return;
        if(this.showpanel.type ==='create-question'){
            this.createquestion(quizid);
            this.showpanel=null;
        }else if(this.showpanel.type === 'edit-question'){
            fetch(`/api/question/update/${qid}`,{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                },
                body: JSON.stringify({question: qdata.question,A: qdata.A,B: qdata.B,C: qdata.C,D: qdata.D,answer: qdata.answer,quiz_id: quizid})
            }).then(() =>{
                this.newquestion[quizid] = {question:"",A:"",B:"",C:"",D:"",answer:""};
                this.showpanel = null;
                this.fetchquizzes();
            });
        }
    },

    deletequestion(questionid){
        fetch(`/api/question/delete/${questionid}`,{
            method:"DELETE",
            headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
            }
        }).then(() => {this.fetchquizzes();})
    },

    quizsearch(){
        const query = this.searchquery.trim();
        if(!query){
            this.searched = false;
            this.quizzes = [];
            this.fetchquizzes();
            return;
        }
        fetch('/api/quizsearch/post',{
            method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")},
                body: JSON.stringify({query}),
        }).then(response => {
            if(!response.ok)
                return [];
            return response.json();
        }).then(data => {
            this.quizzes = Array.isArray(data) ? data : [];
            this.searched = true;
        }).catch(err => {
        console.error('Search quiz failed:', err);
        this.quizzes = [];
        this.searched = true;
        });
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


        this.fetchsubjects();
        this.fetchquizzes();

        
    }
}