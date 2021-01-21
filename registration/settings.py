import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = os.environ['SEKRIT_KEY']
SECRET_KEY = ')+3$bvzw&^5v1q@u#!#)qi1x^ip7!g%@y(-1a(ex!z4@p(l(n4'
# with open('/home/larmo/keys/reg-rbac/sekrit_key.txt') as f:
#     SECRET_KEY = f.read().strip()

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['0.0.0.0','localhost','127.0.0.1','poochie','registration-rbac.com','www.registration-rbac.com']


# Application definition

INSTALLED_APPS = [
    'clc_reg',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'registration.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'registration.wsgi.application'


# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         # 'NAME': 'clc_app',
#         # 'USER': 'clc_user',             # docker
#         # 'PASSWORD': '5LfYEGbJ',         # clc_user:docker
#         # 'HOST': '127.0.0.1',            # docker
#         'NAME': 'clc_reg',            # AWS
#         'USER': 'awsuser',            # AWS
#         'PASSWORD': 'Mu6Yx7Hk',       # awsuser:AWS
#         'HOST': 'mydbinstance.c89twqehrakl.us-west-2.rds.amazonaws.com', # AWS
#         'PORT': '5432',
#     }
# }

# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static'),] # new

LOGIN_URL = '/register_login/?message=login_required'

# Dreamhost Settings
EMAIL_HOST = 'smtp.dreamhost.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'postmaster@registration-rbac.com'
# EMAIL_HOST_PASSWORD = os.environ['DH_EMAIL_HOST_PASSWORD']
EMAIL_HOST_PASSWORD = '*ftpz6V6'
# with open('/home/larmo/keys/reg-rbac/dh_email_key.txt') as f:
#     EMAIL_HOST_PASSWORD = f.read().strip()
DEFAULT_FROM_EMAIL = 'Librarian <postmaster@registration-rbac.com>'
