from application.database import *
from flask import current_app as app,jsonify,request,render_template
from flask_security import auth_required, roles_required, current_user,hash_password,login_user
from werkzeug.security import check_password_hash,generate_password_hash

@app.route('/',methods = ['GET'])
def home():
    return render_template("index.html")

@app.route('/api/admin')
@auth_required('token') # authentication
@roles_required('admin') # RBAC/ authorization
def admin_home():
    return jsonify({
        "message":"this is admin homepage"
    })


@app.route('/api/user')
@auth_required('token')
@roles_required('user')
def user_home():
    user = current_user
    return jsonify({
            'username': user.username,
            'email': user.email,
            'password': user.password,
            'id':user.id
    })

@app.route('/api/login', methods = ['POST'])
def user_login():
    credentials = request.get_json()
    email = credentials['email']
    password = credentials['password']

    if not email:
        return jsonify({
            "message": "Email is required!!"
        }),400
    user = app.security.datastore.find_user(email = email)
    if user:
        if check_password_hash(user.password, password):
            # if current_user is None:
            #     login_user(user)
            #     return jsonify({
            #         "message":"Already logged in!!"
            #     }),400
            login_user(user)
            return jsonify({
                "id": user.id,
                "username": user.username,
                "Authentication-Token": user.get_auth_token()
            })
        else:
            return jsonify({
                "message":"Incorrect password!!"
            }),400
    else:
        return jsonify({
            "message":"User not found!!"
        }),404


@app.route('/api/register',methods=['POST'])
def create_user():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email = credentials["email"]):
        app.security.datastore.create_user(email = credentials["email"],
                                          username =credentials["username"],
                                          password = generate_password_hash(credentials["password"]),
                                          qualification = credentials["qualification"],
                                          dob = credentials["dob"],
                                          roles = ["user"])
        db.session.commit()
        return jsonify({
            "message":"User Created Successfully"
        }), 201
    return jsonify({
        "message":"User already exists!!!"
    }), 400

