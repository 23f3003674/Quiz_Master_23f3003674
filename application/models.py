from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime
from sqlalchemy import DateTime
# usermixin is used for methods/ api that can be applied in model

class User(db.Model, UserMixin):
    # required for flask security
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String, unique= True, nullable = False)
    username = db.Column(db.String, unique= True, nullable = False)
    password = db.Column(db.String, nullable = False)
    fs_uniquifier = db.Column(db.String, unique = True)
    active = db.Column(db.Boolean, nullable = False)
    roles = db.relationship('Role', backref = 'bearer', secondary = 'user_roles')
    subjects = db.relationship('Subject', backref = 'bearer', secondary = 'user_subject')

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique = True, nullable =False)
    description = db.Column(db.String)

class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class UserSubject(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'))

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique= True, nullable = False) 
    description = db.Column(db.String)
    chapters = db.relationship('Chapter', backref ='bearer')

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique= True, nullable = False) 
    description = db.Column(db.String)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable = False)
    quizzes = db.relationship('Quiz', backref ='bearer')


class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique= True, nullable = False) 
    remarks = db.Column(db.String)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable = False)
    date = db.Column(db.DateTime)
    time = db.Column(db.Time)
    questions = db.relationship('Question', backref ='bearer')


class Question(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    question = db.Column(db.String, nullable = False)
    A = db.Column(db.String, nullable = False)
    B = db.Column(db.String, nullable = False)
    answer = db.Column(db.String, nullable = False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable = False)

class Score(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    score = db.Column(db.Integer)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable = False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    time_of_attempt = db.Column(db.DateTime)