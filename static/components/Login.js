export default{
    template:`
    <div Class ="row" style="height:700px;width:1300px;">
        <div Class = "col">
            <div class=" border mx-auto mt-5" style="height:400px;width:300px;">
                <h2 class="text-center">Login</h2>
                <h2 class="text-danger">{{message}}</h2>
                    <div class="mb-3">
                        <label for="email" class="form-label">Enter Email:</label>
                        <input type="email" class="form-control" id="email" v-model="formData.email" placeholder="name@example.com">
                    </div>
                    <div class="mb-3">
                        <label for="pass" class="form-label">Enter Password</label>
                        <input type="password" class="form-control" id="pass" v-model="formData.password">
                    </div>
                
                <div class ="text-center">
                    <button class="btn btn-primary" @click="loginUser">Login</button>
                    <button><router-link to='/register'>New User?</router-link></button>
                </div>

            </div>
        </div>
    </div>
    `,

    data: function(){
        return{
            formData:{
                email:"",
                password:""
            },
            message:""
        }
    },
    methods:{
        loginUser: function(){
            fetch('/api/login',{
                method:'POST',
                headers:{
                    "Content-Type":'application/json'
                },
                body: JSON.stringify(this.formData)  // content goes to backend in form of json string for request body.
            })
            .then(response => response.json())
            .then(data=> {
                if(Object.keys(data).includes("Authentication-Token")){
                    localStorage.setItem("auth_token", data["Authentication-Token"])
                    localStorage.setItem("id", data.id)
                    this.$router.push('/Dashboard')
                }
                else{
                    this.message = data.message
                }
                
                
            })
        }
    }
}