export default{
    template:`
    <div>
        <div class ="row border">
            <div class ="col-7">
                <h2> Welcome {{userData.username}}</h2>
            </div>
            <div style="text-align:right;" class ="col-5">
                <button @click="csvExport" class ="btn btn-outline-secondary">Download CSV</button>
                <button class="btn btn-outline-success" @click ="showpanel ={ type: 'create-subject'}">Add Subject</button>
                <router-link to="/Admin_Quiz_dashboard" class="btn btn-outline-primary">Quiz</router-link>
                <router-link to="/Users" class="btn btn-outline-warning">Users</router-link>
                <router-link to="/" class="btn btn-outline-danger">Logout</router-link>
    
            </div>
            <div class ="col-7 border" style="height:700px; overflow-y:auto;">
                <div v-if="searched && searchresult.length">
                    <h4>Search Results:</h4>
                    <ul>
                        <li v-for="item in searchresult" :key="item.id">{{ item.name || item.chapter_name || 'Unnamed result' }}</li>
                    </ul>
                </div>

                <div style="text-align:center;">
                    <h2>Subjects & Chapters</h2>
                </div>
                <div v-for ="sub in subjects" :key="sub.id" class="card mb-3">
                    <div class="card-header bg-info text-white d-flex justify-content-between">
                        <div>
                            <h5><b>{{sub.name}}</b></h5>
                            <small>{{sub.description}}</small>
                        </div>
                        <div>
                            <button class="btn btn-warning btn-sm" @click="editsubject(sub)">Edit</button>
                            <button class="btn btn-danger btn-sm" @click="deletesubject(sub)">Delete</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <h6>Chapters</h6>
                        <ul class="list-group mb-2">
                            <div v-if="sub.chapters.length === 0" class="text-muted">
                                No Chapter !!!
                            </div>
                            <li v-for="chap in sub.chapters" :key="chap.id"  class="list-group-item d-flex justify-content-between">
                                <div>
                                    <strong>{{chap.name}}</strong><br>
                                    <small>{{chap.description}}</small>
                                </div>
                                <div>
                                    <button class="btn btn-outline-warning" @click="editchapter(chap, sub.id)">Edit</button>
                                    <button class="btn btn-outline-danger" @click="deletechapter(chap)">Delete</button>
                                </div>
                            </li>
                        </ul>
                        <button class = "btn btn-outline-success" @click="showpanel ={ type: 'create-chapter', subject_id: sub.id}">Add chapter</button>
                    </div>
                </div>
            </div>
            <div class ="col-5 border" style = "height:700px;">
                <div v-if="showpanel">
                    <h4 class="mb-3">{{paneltitle}}</h4>
                    <div v-if ="['create-subject','edit-subject'].includes(showpanel.type)">
                        <input v-model="newsubject.name" class ="form-control mb-2" placeholder="subject name" />
                        <input v-model="newsubject.description" class ="form-control mb-3" placeholder="subject description" />
                        <button class="btn btn-outline-success" @click ="submitsubject">{{showpanel.type ==='create-subject' ? 'Create':'Update'}}</button>
                    </div>
                    <div v-if ="['create-chapter','edit-chapter'].includes(showpanel.type)">
                        <input v-model="newchapter[showpanel.subject_id] && newchapter[showpanel.subject_id].name" class ="form-control mb-2" placeholder="chapter name" @focus="initchapter(showpanel.subject_id)"/>
                        <input v-model="newchapter[showpanel.subject_id] && newchapter[showpanel.subject_id].description" class ="form-control mb-3" placeholder="chapter description" />
                        <button class="btn btn-outline-success" @click ="submitchapter">{{showpanel.type ==='create-chapter' ? 'Create':'Update'}}</button>
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
            newsubject:{name:"",description:""},
            newchapter:{},
            showpanel: null,
            searchtype:"",
            searchquery:"",
            searchresult:"",
            searched:false

            }
        }, 
        
    computed:{
        paneltitle(){
            switch(this.showpanel?.type){
                case 'create-subject' : return 'Create New Subject';
                case 'edit-subject' : return 'Edit Subject';
                case 'create-chapter' : return 'Create New Chapter';
                case 'edit-chapter' : return 'Edit Chapter';
                default: return '';
            }
        }
    },

    methods:{
        initchapter(subjectid){
            if(!this.newchapter[subjectid]){
                this.$set(this.newchapter, subjectid,{name:"",description:""});
            }
        },

        fetchsubject(){
            fetch('/api/subject/get',{
                method:"GET",
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                }
            })
            .then(response => {
                if (!response.ok) {return [];}
                return response.json();
            })
            .then(data => this.subjects = Array.isArray(data) ? data : [])
            .catch(err => {
                console.error('Fetch subject failed:', err);
                this.subjects = [];
            })

        },

        createsubject(){
            fetch('/api/subject/create',{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.newsubject)
            })
            .then(() => {
                this.newsubject = {name: "", description:""};
                this.showpanel = null;
                setTimeout(() => this.fetchsubject(), 30);
            })
        },

        editsubject(subject){
            this.newsubject = {name: subject.name , description: subject.description};
            this.showpanel = { type: 'edit-subject', subject_id: subject.id};
        },
        
        submitsubject(){
            if(this.showpanel.type === 'create-subject'){
                this.createsubject();
            } else if (this.showpanel.type === 'edit-subject'){
                fetch(`/api/subject/update/${this.showpanel.subject_id}`,{
                    method:"PUT",
                    headers:{
                        "Content-Type":"application/json",
                        "Authentication-Token":localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.newsubject)
                }).then(() => {
                    this.newsubject = {name :"", description:""};
                    this.showpanel = null;
                    this.fetchsubject();
                });
            }
        },

        deletesubject(subject){
            fetch(`/api/subject/delete/${subject.id}`,{
                method:"DELETE",
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                }, 
            }).then(() => this.fetchsubject());
        },

        createchapter(subjectid){
            const chapterdata = this.newchapter[subjectid];
            if(!chapterdata || !chapterdata.name || !chapterdata.description) return;
            fetch('/api/chapter/create',{
                method: "POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                },
                body: JSON.stringify({
                    name: chapterdata.name, 
                    description: chapterdata.description,
                    subject_id: subjectid
                })
            }).then(() => {
                this.newchapter[subjectid] = {name:"", description:""};
                this.fetchsubject();
            });

        },

        editchapter(chapter,subjectid){
            this.initchapter(subjectid);
            this.newchapter[subjectid] = {name: chapter.name, description: chapter.description};
            this.showpanel = {type: 'edit-chapter', chapter_id: chapter.id , subject_id: subjectid};
        },

        submitchapter(){
            const subjectid = this.showpanel.subject_id;
            const chapterdata = this.newchapter[subjectid];

            if(!chapterdata || !chapterdata.name || !chapterdata.description) return;
            if(this.showpanel.type ==='create-chapter'){
                fetch('/api/chapter/create',{
                    method: "POST",
                    headers:{
                        "Content-Type":"application/json",
                        "Authentication-Token":localStorage.getItem("auth_token")
                },
                body: JSON.stringify({
                    name: chapterdata.name,
                    description: chapterdata.description,
                    subject_id: subjectid
            })
            }).then(() => {
                this.newchapter[subjectid] = {name: "", description:""};
                this.showpanel = null;
                this.fetchsubject();
            })
            }
            else if(this.showpanel.type ==='edit-chapter'){

                fetch(`/api/chapter/update/${this.showpanel.chapter_id}`,{
                    method:"PUT",
                    headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token")
                },
                body: JSON.stringify({
                    name: chapterdata.name,
                    description: chapterdata.description,
                    subject_id: subjectid
                })
                }).then(() => {
                    this.newchapter[subjectid] = {name: "", description:""};
                    this.showpanel = null;
                    this.fetchsubject();
                });
            }

        },

        deletechapter(chapter){
            fetch(`/api/chapter/delete/${chapter.id}`,{
                method:"DELETE",
                headers:{
                "Content-Type":"application/json",
                "Authentication-Token":localStorage.getItem("auth_token")}
            }).then(() => this.fetchsubject());
        },
        csvExport(){
            fetch('/api/export')
            .then(response => response.json())
            .then(data => {
                window.location.href =`/api/csv_result/${data.id}`
            })
        }

        // search(){
        //     fetch('/api/search',{
        //         method: "POST",
        //         headers:{
        //             "Content-Type":"application/json",
        //             "Authentication-Token":localStorage.getItem("auth_token")
        //         },
        //         body: JSON.stringify({
        //             type: this.searchtype,
        //             query: this.searchquery
        //         })
        //     }).then(response => response.json())
        //     .then(data => {
        //         this.searchresult = data;
        //         this.searched = true;
        //     })
        // }
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


        this.fetchsubject()

        
    }
}