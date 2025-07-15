from flask_restful import Api, Resource,reqparse
from .models import *
from flask_security import auth_required, roles_required,roles_accepted, current_user
from datetime import datetime,timedelta
from flask import jsonify
api = Api()

def roles_list(roles):
    role_list =[]
    for role in roles:
        role_list.append(role.name)
    return role_list

parser = reqparse.RequestParser()
parser.add_argument('name')
parser.add_argument('description')
parser.add_argument('subject_id')
parser.add_argument('chapter_id')
parser.add_argument('remarks')
parser.add_argument('date')
parser.add_argument('time')
parser.add_argument('question')
parser.add_argument('answer')
parser.add_argument('A')
parser.add_argument('B')
parser.add_argument('C')
parser.add_argument('D')
parser.add_argument('quiz_id')
parser.add_argument('score')
parser.add_argument('user_id')


class SubjectApi(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self):
        subjects = []
        subject_json = []
        if "admin" in current_user.roles:
            subjects = Subject.query.all()
        
        for subject in subjects:
            this_subject = {}
            this_subject["id"] = subject.id
            this_subject["name"] = subject.name
            this_subject["description"] = subject.description
            this_subject["chapters"] = [
                {'id': chapter.id, 'name': chapter.name} for chapter in subject.chapters
            ]
            subject_json.append(this_subject)

        if subject_json:
            return subject_json
        return{
            "message": "No Subjects Found!!"
        }, 404
    
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        try:
            args = parser.parse_args()
            subject = Subject(name = args["name"],
                              description = args["description"])
            db.session.add(subject)
            db.session.commit()
            return{
                "message":"Subject added successfully!!"
            }
        except:
            return{
                "message":"Some fields are missing!!"
            },400
        
    @auth_required('token')
    @roles_required('admin')    
    def put(self, subject_id):
        args = parser.parse_args()
        subject = Subject.query.get(subject_id)
        subject.name = args['name']
        subject.description = args['description']
        db.session.commit()
        return{
            "message":"Subject Updated Successfully!"
        }
    @auth_required('token')
    @roles_required('admin') 
    def delete(self,subject_id):
        subject = Subject.query.get(subject_id)
        if subject:
            db.session.delete(subject)
            db.session.commit()
            return{
                "message":"Subject Deleted Successfully!!"
            }
        else:
            return{
                "message":"Subject Not Found!!"
            },404    

api.add_resource(SubjectApi, '/api/subject/get','/api/subject/create','/api/subject/update/<int:subject_id>','/api/subject/delete/<int:subject_id>')


class ChapterApi(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self):
        chapters = []
        chapter_json = []
        if "admin" in current_user.roles:
            chapters = Chapter.query.all()
        
        for chapter in chapters:
            this_chapter = {}
            this_chapter["id"] = chapter.id
            this_chapter["name"] = chapter.name
            this_chapter["description"] = chapter.description
            this_chapter["subject_id"] = chapter.subject_id
            this_chapter["quizzes"] = [
                {'id': quiz.id} for quiz in chapter.quizzes
            ]
            chapter_json.append(this_chapter)

        if chapter_json:
            return chapter_json
        return{
            "message": "No Chapters Found!!"
        }, 404
    
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        try:
            args = parser.parse_args()
            chapter = Chapter(name = args["name"],
                              description = args["description"],
                              subject_id = args['subject_id'])
            db.session.add(chapter)
            db.session.commit()
            return{
                "message":"Chapter added successfully!!"
            }
        except:
            return{
                "message":"Some fields are missing!!"
            },400
        
    @auth_required('token')
    @roles_required('admin')    
    def put(self, chapter_id):
        args = parser.parse_args()
        chapter = Chapter.query.get(chapter_id)
        chapter.name = args['name']
        chapter.description = args['description']
        chapter.subject_id = args['subject_id']
        db.session.commit()
        return{
            "message":"Chapter Updated Successfully!"
        }
    @auth_required('token')
    @roles_required('admin') 
    def delete(self,chapter_id):
        chapter = Chapter.query.get(chapter_id)
        if chapter:
            db.session.delete(chapter)
            db.session.commit()
            return{
                "message":"Chapter Deleted Successfully!!"
            }
        else:
            return{
                "message":"Chapter Not Found!!"
            },404    

api.add_resource(ChapterApi, '/api/chapter/get','/api/chapter/create','/api/chapter/update/<int:chapter_id>','/api/chapter/delete/<int:chapter_id>')

class QuizApi(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self):
        quizzes = []
        quiz_json = []
        quizzes = Quiz.query.all()
        for quiz in quizzes:
            this_quiz = {}
            this_quiz["id"] = quiz.id
            this_quiz["time"] = quiz.time
            this_quiz["date"] = quiz.date
            this_quiz["remarks"] = quiz.remarks
            this_quiz["chapter_id"] = quiz.chapter_id
            [
                {'id': question.id, 'name': question.question} for question in quiz.questions
            ]
            quiz_json.append(this_quiz)

        if quiz_json:
            return quiz_json
        return{
            "message": "No Quizzes Found!!"
        }, 404
    
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        # args = parser.parse_args()
        # date_value = datetime.strptime((args['date']), '%Y-%m-%d') if 'date' in args['date'] else datetime.now()
        # time_value = datetime.strptime((args['time']), '%H:%M:%S').time() if 'time' in args['time'] else datetime.now().time()
        try:
            args = parser.parse_args()
            quiz = Quiz(#name = args["name"],
                              remarks = args["remarks"],
                              chapter_id = args['chapter_id'],
                              #date = date_value,
                              #time = time_value
                              )
            db.session.add(quiz)
            db.session.commit()
            return{
                "message":"Quiz added successfully!!"
            }
        except:
            return{
                "message":"Some fields are missing!!"
            },400
        
    @auth_required('token')
    @roles_required('admin')    
    def put(self, quiz_id):
        # args = parser.parse_args()
        # date_value = datetime.strptime((args['date']), '%Y-%m-%d') if 'date' in args['date'] else datetime.now()
        # time_value = datetime.strptime((args['time']), '%H:%M:%S').time() if 'time' in args['time'] else datetime.now().time()
        args = parser.parse_args()
        quiz = Quiz.query.get(quiz_id)
        #quiz.name = args['name']
        quiz.remarks = args['remarks']
        quiz.chapter_id = args['chapter_id']
        #quiz.date = date_value,
        #quiz.time = time_value
        db.session.commit()
        return{
            "message":"Quiz Updated Successfully!"
        }
    @auth_required('token')
    @roles_required('admin') 
    def delete(self,quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if quiz:
            db.session.delete(quiz)
            db.session.commit()
            return{
                "message":"Quiz Deleted Successfully!!"
            }
        else:
            return{
                "message":"Quiz Not Found!!"
            },404    

api.add_resource(QuizApi, '/api/quiz/get','/api/quiz/create','/api/quiz/update/<int:quiz_id>','/api/quiz/delete/<int:quiz_id>')



class QuestionApi(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self):
        questions = []
        question_json = []
        if "admin" in current_user.roles:
            questions = Question.query.all()
        else:
            questions = current_user.questions
        for question in questions:
            this_question = {}
            this_question["id"] = question.id
            this_question["question"] = question.question
            this_question["A"] = question.A
            this_question["B"] = question.B
            this_question["C"] = question.C
            this_question["D"] = question.D
            this_question["answer"] = question.answer
            this_question["quiz_id"] = question.quiz_id
            question_json.append(this_question)

        if question_json:
            return question_json
        return{
            "message": "No Questions Found!!"
        }, 404
    
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        try:
            args = parser.parse_args()
            question = Question(question = args["question"],
                                A = args["A"],
                                B = args["B"],
                                C = args["C"],
                                D = args["D"],
                                answer = args["answer"],
                                quiz_id = args["quiz_id"]
                                )
            db.session.add(question)
            db.session.commit()
            return{
                "message":"Question added successfully!!"
            }
        except:
            return{
                "message":"Some fields are missing!!"
            },400
        
    @auth_required('token')
    @roles_required('admin')    
    def put(self, question_id):
        args = parser.parse_args()
        question = Question.query.get(question_id)
        question.question = args['question']
        question.A = args['A']
        question.B = args['B']
        question.C = args['C']
        question.D = args['D']
        question.answer = args['answer']
        question.quiz_id = args['quiz_id']
        db.session.commit()
        return{
            "message":"Question Updated Successfully!"
        }
    @auth_required('token')
    @roles_required('admin') 
    def delete(self,question_id):
        question = Question.query.get(question_id)
        if question:
            db.session.delete(question)
            db.session.commit()
            return{
                "message":"Question Deleted Successfully!!"
            }
        else:
            return{
                "message":"Question Not Found!!"
            },404    

api.add_resource(QuestionApi, '/api/question/get','/api/question/create','/api/question/update/<int:question_id>','/api/question/delete/<int:quiz_id>')

class QuizviewApi(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self,quiz_id):
        quiz = Quiz.query.get(quiz_id)
        chapter_name = quiz.bearer.name
        chap = Chapter.query.filter_by(name=chapter_name).first()
        subject_name = chap.bearer.name
        this_quiz = {}
        this_quiz["id"] = quiz.id
        this_quiz["remarks"] = quiz.remarks
        this_quiz["chapter_name"] = chapter_name
        this_quiz["subject_name"] = subject_name
        this_quiz["questions"] = [
                {'id': question.id, 'name': question.question} for question in quiz.questions
            ]
        this_quiz["date"] = quiz.date
        this_quiz["time"] = quiz.time
        return this_quiz
    
api.add_resource(QuizviewApi, '/api/quizview/get/<int:quiz_id>')

class QuizattemptApi(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self,quiz_id):
        questions = []
        question_json = []
        quiz = Quiz.query.filter_by(id=quiz_id).first()
        questions = quiz.questions
        duration = quiz.time
        for question in questions:
            this_question = {}
            this_question["id"] = question.id
            this_question["question"] = question.question
            this_question["A"] = question.A
            this_question["B"] = question.B
            this_question["C"] = question.C
            this_question["D"] = question.D
            this_question["answer"] = question.answer
            this_question["quiz_id"] = question.quiz_id
            question_json.append(this_question)

        if question_json:
            return {"questions": question_json,"duration":duration}
        return{
            "message": "No Questions Found!!"
        }, 404
        return questions
    
api.add_resource(QuizattemptApi, '/api/quizattempt/get/<int:quiz_id>')

class ScoreApi(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def post(self,quiz_id):
        quiz_id = quiz_id
        user_id = current_user.id
        try:
            args = parser.parse_args()
            score = Score(score = args["score"],
                          quiz_id = quiz_id,
                          user_id = user_id,
                          time_of_attempt = datetime.utcnow())
            db.session.add(score)
            db.session.commit()
            return{
                "message":"Score Updated!!"
            }
        except:
            return{
                "message":"error"
            },400

api.add_resource(ScoreApi, '/api/score/post/<int:quiz_id>')
