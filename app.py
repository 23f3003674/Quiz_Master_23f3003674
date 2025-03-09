from flask import Flask
from application.database import db
from application.models import User, Role
from application.config import LocalDevelopmentConfig
from flask_security import SQLAlchemyUserDatastore, hash_password, Security, datastore

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    datastore = SQLAlchemyUserDatastore(db,User,Role)
    app.security = Security(app,datastore)
    app.app_context().push()
    return app


app = create_app()

with app.app_context():
    db.create_all()

    app.security.datastore.find_or_create_role(name='admin', description ='super_user')
    app.security.datastore.find_or_create_role(name='user', description ='genral_user')
    db.session.commit()

    if not app.security.datastore.find_user(email = "admin@gmail.com"):
        app.security.datastore.create_user(email = "admin@gmail.com",
                                          username ="admin",
                                          password = hash_password("admin"),
                                          roles = ["admin"])
        
    if not app.security.datastore.find_user(email = "user1@admin.com"):
        app.security.datastore.create_user(email = "user1@admin.com",
                                          username ="user01",
                                          password = hash_password("1234"),
                                          roles = ["user"])
    db.session.commit()

from application.routes import *

if __name__ =="__main__":
    app.run()   