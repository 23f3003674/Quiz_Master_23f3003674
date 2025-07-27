from flask_restful import Api, Resource,reqparse
from .models import *
from flask_security import auth_required, roles_required,roles_accepted, current_user
from datetime import datetime,timedelta
from flask import jsonify,request
from .utils import roles_list
from pytz import timezone
from .tasks import quiz_report
from .cache_setup import cache



api = Api()

parser = reqparse.RequestParser()
parser.add_argument('name')
parser.add_argument('description')
parser.add_argument('subject_id')
parser.add_argument('chapter_id')
parser.add_argument('remarks')
parser.add_argument('date', type=str, required=False)
parser.add_argument('time', type=str, required=False)
parser.add_argument('question', location='json')
parser.add_argument('answer', location='json')
parser.add_argument('A', location='json')
parser.add_argument('B', location='json')
parser.add_argument('C', location='json')
parser.add_argument('D', location='json')
parser.add_argument('quiz_id', location='json')
parser.add_argument('score',location='json')
parser.add_argument('user_id')
parser.add_argument('query',location='json')
parser.add_argument('type',location='json')


class SubjectApi(Resource):
    # @cache.cached(timeout=300, key_prefix='subjects_data')
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
                {'id': chapter.id, 'name': chapter.name, 'description':chapter.description} for chapter in subject.chapters
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
    @cache.cached(timeout=5, key_prefix='chapters_data')
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
    @cache.cached(timeout=5, key_prefix='quizzes_data')
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self):
        quizzes = []
        quiz_json = []
        quizzes = Quiz.query.all()
        for quiz in quizzes:
            chapter = Chapter.query.get(quiz.chapter_id)
            subject = Subject.query.get(chapter.subject_id)
            this_quiz = {}
            this_quiz["id"] = quiz.id
            this_quiz["time"] = quiz.time
            this_quiz["date"] = quiz.date.strftime('%Y-%m-%d') if quiz.date else None
            this_quiz["remarks"] = quiz.remarks
            this_quiz["chapter_id"] = quiz.chapter_id
            this_quiz["chapter_name"] = chapter.name
            this_quiz["subject_name"] = subject.name
            this_quiz["questions"] = [
                {'id': question.id, 'question': question.question,'A':question.A, 'B':question.B, 'C': question.C, 'D': question.D, 'answer':question.answer} for question in quiz.questions
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
        args = parser.parse_args()
        date_value = datetime.strptime(args.get('date'), '%Y-%m-%d') if args.get('date') else datetime.now()
        time_value = int(args.get('time')) if args.get('time') else 1

        try:
            args = parser.parse_args()
            quiz = Quiz(remarks = args["remarks"],
                              chapter_id = args['chapter_id'],
                              date = date_value,
                              time = time_value
                              )
            db.session.add(quiz)
            db.session.commit()
            result = quiz_report.delay()
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
        args = parser.parse_args()
        date_value = datetime.strptime(args.get('date'), '%Y-%m-%d') if args.get('date') else datetime.now()
        time_value = int(args.get('time')) if args.get('time') else 1
        args = parser.parse_args()
        quiz = Quiz.query.get(quiz_id)
        quiz.remarks = args['remarks']
        quiz.chapter_id = args['chapter_id']
        quiz.date = date_value
        quiz.time = time_value
        db.session.commit()
        result = quiz_report.delay()
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
    @cache.cached(timeout=5, key_prefix='questions_data')
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
    @roles_accepted('user','admin')    
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
            result = quiz_report.delay()
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
        result = quiz_report.delay()
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

api.add_resource(QuestionApi, '/api/question/get','/api/question/create','/api/question/update/<int:question_id>','/api/question/delete/<int:question_id>')

class QuizviewApi(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self,quiz_id):
        quiz = Quiz.query.get(quiz_id)
        chapter_name = quiz.bearer.name
        subject_name = quiz.bearer.bearer.name
        this_quiz = {}
        this_quiz["id"] = quiz.id
        this_quiz["remarks"] = quiz.remarks
        this_quiz["chapter_name"] = chapter_name
        this_quiz["subject_name"] = subject_name
        this_quiz["questions"] = [
                {'id': question.id, 'name': question.question} for question in quiz.questions
            ]
        this_quiz["date"] = quiz.date.strftime('%Y-%m-%d') if quiz.date else None
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
        user_id = current_user.id
        current_time = datetime.now(timezone("Asia/Kolkata"))
        try:
            args = parser.parse_args()
            score = Score(score = args["score"],
                          quiz_id = quiz_id,
                          user_id = user_id,
                          time_of_attempt = current_time)
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

class ScoreviewApi(Resource):
    @cache.cached(timeout=5, key_prefix='score_data')
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self,user_id):
        scores = Score.query.filter_by(user_id=user_id).all()
        all_scores =[]
        for score in scores:
            quiz_id = score.quiz_id
            quiz = Quiz.query.get(quiz_id)
            chapter_name = quiz.bearer.name if quiz and quiz.bearer else "Chapter Removed"
            chap = Chapter.query.filter_by(name=chapter_name).first()
            subject_name = chap.bearer.name if chap and chap.bearer else "Subject Removed"
            all_scores.append({
                'id':score.id,
                'quiz_id':score.quiz_id,
                'user_id':score.user_id,
                'score':score.score,
                'time_of_attempt':score.time_of_attempt.strftime('%Y-%m-%d %H:%M'),
                'chapter':chapter_name,
                'subject': subject_name
            })
        return all_scores
api.add_resource(ScoreviewApi, '/api/scoreview/get/<int:user_id>')

class UsersviewApi(Resource):
    @cache.cached(timeout=5, key_prefix='subjects_data')
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self):
        users = User.query.all()
        all_users =[]
        for user in users:
            all_users.append({
                'id':user.id,
                'username':user.username,
                'email':user.email,
                'dob':user.dob,
                'qualification': user.qualification
            })   
        return all_users
api.add_resource(UsersviewApi, '/api/userview/get')

class UsersdeleteApi(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def delete(self,user_id):
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return{
                "message":"User deleted!!"
            }
        else:
            return{
                "message":"error"
            },400
api.add_resource(UsersdeleteApi,'/api/userdelete/delete/<int:user_id>')