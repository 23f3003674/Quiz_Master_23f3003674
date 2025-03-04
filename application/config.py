class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True

class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///quiz_masterv2.sqlite3"
    DEBUG = True

    # config for security
    SECRET_KEY = "this-is-my-secretkey"  # hash user creds in session
    SECURITY_PASSWORD_HASH ="bcrypt"  # mechanish for hashing the password
    SECURITY_PASSWORD_SALT = "this-is-password-salt"  # hash password
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"