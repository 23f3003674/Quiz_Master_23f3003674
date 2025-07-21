export default{
    template:`
    <div Class ="row">
        
        <div Class = "col text-center" style="height:750px;">
                <img src="static/quiz.jpg" alt="Home">
        </div>
        <div Class = "col text-center">
            <router-link class= "btn btn-primary my-2" to="/login">Login</router-link>
            <router-link class= "btn btn-primary my-2" to="/register">Register</router-link>
        </div>
    </div>
    `
}