from celery import shared_task
from .models import User,Quiz,Score,Chapter
import datetime
import csv
from .utils import format_report
from .mail import send_email
import requests

@shared_task(ignore_results = False, name="download_csv_report")
def csv_report():
    scores = Score.query.all()
    csv_file_name = f"score_user_{datetime.datetime.now().strftime("%f")}" #score_user_123456.csv
    with open(f'static/{csv_file_name}','w',newline="") as csvfile:
        sr_no = 1
        score_csv = csv.writer(csvfile, delimiter= ',')
        score_csv.writerow(['Sr No.', 'Score Id', 'Score', 'Time_of_attempt', 'Quiz_id', 'User_id'])
        for s in scores:
            this_score =[sr_no, s.id, s.score, s.time_of_attempt,s.quiz_id, s.user_id]
            score_csv.writerow(this_score)
            sr_no += 1



    return csv_file_name

@shared_task(ignore_results = False, name="monthly_report")
def monthly_report():
    users = User.query.all()
    for user in users[1:]:
        user_data = {}
        user_data["username"] = user.username
        user_data["email"] = user.email
        user_scores = []
        for s in user.scores:
            quiz = Quiz.query.get(s.quiz_id)
            chapter_name = quiz.bearer.name if quiz and quiz.bearer else "Chapter Removed"
            chap = Chapter.query.filter_by(name=chapter_name).first()
            subject_name = chap.bearer.name if chap and chap.bearer else "Subject Removed"
            total_ques = len(quiz.questions)  
            this_score = {}
            this_score["id"] = s.id
            this_score["score"] = s.score
            this_score["max_score"] = total_ques
            this_score["quiz_id"] = s.quiz_id
            this_score["user_id"] = s.user_id
            this_score["time_of_attempt"] = s.time_of_attempt
            this_score["subject"] = subject_name
            this_score["chapter"] = chapter_name
            user_scores.append(this_score) 
        user_data['user_scores'] = user_scores
        message = format_report('templates/mail_details.html', user_data)
        send_email(user.email, subject = "montly Score report", message = message)

    return "Monthly report sent"

@shared_task(ignore_results = False, name="quiz_update")
def quiz_report():
    text = f"Hi Users, a quiz is added/updated. Please check the app at http://127.0.0.1:5000"
    response = requests.post("https://chat.googleapis.com/v1/spaces/AAQADUvyGkU/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=4WqEs51mVzusQxk36lpzbrEPc8nPDAlv2bSrX6dDFak", headers = {'content-type':'application/json'}, json= {"text":text})
    return "Quiz status is sent"