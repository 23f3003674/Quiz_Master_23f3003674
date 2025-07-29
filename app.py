from flask import Flask
from application.database import db
from application.models import User, Role
from application.config import LocalDevelopmentConfig
from flask_security import SQLAlchemyUserDatastore, hash_password, Security, datastore
from application.resources import api
from werkzeug.security import generate_password_hash
from application.celery_init import celery_init_app
from celery.schedules import crontab
from application.cache_setup import cache


def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    app.config['CACHE_TYPE'] = 'RedisCache'
    app.config['CACHE_DEFAULT_TIMEOUT'] = 300
    cache.init_app(app)
    db.init_app(app)
    api.init_app(app)
    datastore = SQLAlchemyUserDatastore(db,User,Role)
    app.security = Security(app,datastore)
    app.app_context().push()
    return app


app = create_app()

celery = celery_init_app(app)

celery.autodiscover_tasks()


with app.app_context():
    db.create_all()

    app.security.datastore.find_or_create_role(name='admin', description ='super_user')
    app.security.datastore.find_or_create_role(name='user', description ='genral_user')
    db.session.commit()

    if not app.security.datastore.find_user(email = "admin@gmail.com"):
        app.security.datastore.create_user(email = "admin@gmail.com",
                                          username ="admin",
                                          password = generate_password_hash("admin"),
                                          roles = ["admin"])
        
    db.session.commit()

from application.routes import *

@celery.on_after_finalize.connect 
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute = '*/2'),
        monthly_report.s(),
    )

if __name__ =="__main__":
    app.run()   