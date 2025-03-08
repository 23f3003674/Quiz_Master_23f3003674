from flask import current_app as app,jsonify
from flask_security import auth_required, roles_required, current_user

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


@app.route('/api/register')
