export default{
    template:`
    <div Class ="row border">
        <div Class = "col" style="height:750px;">
            <div Class ="border mx-auto mt-5 " style="height:450px;width:250px;">
                <div class="text-center">
                    <h2 class="text-center">Register Now</h2>
                    <div>
                        <label for ="email">Enter Email:</label>
                        <input type ="text" id="email" v-model="formData.email">
                    </div>
                    <div>
                        <label for ="pass">Enter Password:</label>
                        <input type ="password" id="pass" v-model="formData.password">
                    </div>
                    <div>
                        <label for ="name">Enter Name:</label>
                        <input type ="text" id="name" v-model="formData.username">
                    </div>
                    <div>
                        <label for ="qual">Enter Qualification:</label>
                        <input type ="text" id="qual" v-model="formData.qualification">
                    </div>
                    <div>
                        <label for ="dob">Enter Date of Birth:</label>
                        <input type ="text" id="dob" v-model="formData.dob">
                    </div>
                    <div 
                        <button class="btn btn-primary" @click="registerUser">Register</button>
                        <button><router-link to='/login'>Existing User?</router-link></button>
                    </div>

                </div>
            </div>
        </div>
    </div>
    `,

    data: function(){
        return{
            formData:{
                email:"",
                password:"",
                username:"",
                qualification:"",
                dob:""
            }

        }
    },
    methods:{
        registerUser: function(){
            fetch('/api/register',{
                method:'POST',
                headers:{
                    "Content-Type":'application/json'
                },
                body: JSON.stringify(this.formData)  // content goes to backend in form of json string for request body.
            })
            .then(response => response.json())
            .then(data=>{
                alert(data.message)
                this.$router.push('/login')
            })
        }
    }
}