from pathlib import Path
from dotenv import load_dotenv
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS').split(',')


# Application definition

INSTALLED_APPS = [
    'daphne',
	'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
	'pong',
] 

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_AGE = 172800  # 48 hours
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_SAVE_EVERY_REQUEST = True

CSRF_COOKIE_NAME = 'csrftoken'
CSRF_COOKIE_PATH = '/'
CSRF_COOKIE_DOMAIN = None
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_HTTPONLY = False

SESSION_COOKIE_NAME = 'sessionid'
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_HTTPONLY = True

SECURE_HSTS_SECONDS = 3600  # Adjust as needed
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

ASGI_APPLICATION = 'transcendence.asgi.application'

CHANNEL_LAYERS = {
	"default": {
		"BACKEND": "channels.layers.InMemoryChannelLayer"
	},
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
	# 'whitenoise.middleware.WhiteNoiseMiddleware',
	# 'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'transcendence.urls'

CORS_ALLOW_ALL_ORIGINS = True

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media/')

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

WSGI_APPLICATION = 'transcendence.wsgi.application'

import os
from django.conf import settings

LOGGING = {
	'version': 1,
	'disable_existing_loggers': False,
	'handlers': {
		'console': {
			'class': 'logging.StreamHandler',
		},
	},
	'root': {
		'handlers': ['console'],
		'level': 'INFO',
	},
	'loggers': {
		'django': {
			'handlers': ['console'],
			'level': 'INFO',
			'propagate': True,
		},
		'django.request': {
			'handlers': ['console'],
			'level': 'INFO',
			'propagate': False,
		},
		# Add this block to log CSRF failures
		'django.security.csrf': {
			'handlers': ['console'],
			'level': 'DEBUG',  # Set to DEBUG to capture more detailed output
			'propagate': False,
		},
	},
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'transcend_db'),
        'USER': os.getenv('DB_USER', 'db_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'He11oWorld'),
        'HOST': os.getenv('DB_HOST', 'db'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_USER_MODEL = 'pong.CustomUser'

AUTHENTICATION_BACKENDS = [
    'pong.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]


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


#42 Login

FORTY_TWO_CLIENT_ID = os.getenv('FORTY_TWO_CLIENT_ID')
FORTY_TWO_CLIENT_SECRET = os.getenv('FORTY_TWO_CLIENT_SECRET')

#Github Login

GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Paris'

USE_I18N = True

USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
