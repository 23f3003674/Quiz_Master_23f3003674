from flask import current_app as app,jsonify,request
from flask_security import auth_required, roles_required, current_user,hash_password
from application.database import *


@app.route('/admin')
@auth_required('token') # authentication
@roles_required('admin') # RBAC/ authorization
def admin_home():
    return "<h1> this is admin homepage </h1>"


@app.route('/user')
@auth_required('token')
@roles_required('user')
def user_home():
    user = current_user
    return jsonify({
            'username': user.username,
            'email': user.email,
            'password': user.password
    })


@app.route('/api/register',methods=['POST'])
def create_user():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email = credentials["email"]):
        app.security.datastore.create_user(email = credentials["email"],
                                          username =credentials["username"],
                                          password = hash_password(credentials["password"]),
                                          roles = ["user"])
        db.session.commit()
        return jsonify({
            "message":"User Created Successfully"
        }), 201
    return jsonify({
        "message":"User already exists!!!"
    }), 400