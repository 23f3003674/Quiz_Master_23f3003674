from flask_restful import Api, Resource,reqparse
from .models import *
from flask_security import auth_required, roles_required,roles_accepted, current_user

api = Api()

def roles_list(roles):
    role_list =[]
    for role in roles:
        role_list.append(role.name)
    return role_list

parser = reqparse.RequestParser()
parser.add_argument('name')
parser.add_argument('description')


class SubjectApi(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self):
        subjects = []
        subject_json = []
        if "admin" in current_user.roles:
            subjects = Subject.query.all()
        else:
            subjects = current_user.subjects
        for subject in subjects:
            this_subject = {}
            this_subject["id"] = subject.id
            this_subject["name"] = subject.name
            this_subject["description"] = subject.description
            this_subject["chapters"] = subject.chapters
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