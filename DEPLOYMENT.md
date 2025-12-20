# Deployment Instructions for PythonAnywhere

## Environment-Based Settings

This project uses environment variables to automatically configure settings for development vs production.

### How It Works

- **Local (development)**: `DEBUG=True`, no WhiteNoise, SQLite database
- **Production**: `DEBUG=False`, WhiteNoise enabled, static files configured

The environment is detected via the `DJANGO_ENV` environment variable.

---

## Setting Up PythonAnywhere

### 1. Set Environment Variable

In your PythonAnywhere **Web** tab, add this to the **WSGI configuration file**:

```python
# Near the top of the file, before importing Django settings
import os
os.environ['DJANGO_ENV'] = 'production'
```

Or set it in your **virtualenv postactivate hook**:

```bash
# In ~/.virtualenvs/<your-venv>/bin/postactivate
export DJANGO_ENV=production
```

### 2. Deploy Code Updates

After merging changes to master:

```bash
# SSH into PythonAnywhere or use the console
cd ~/registration-rbac  # or wherever your project lives

# Pull latest code
git pull origin master

# Activate virtual environment
source ~/.virtualenvs/<your-venv>/bin/activate

# Install/upgrade dependencies
pip install -r requirements.txt --upgrade

# Collect static files (if static files changed)
python manage.py collectstatic --noinput

# Reload the web app (via Web tab or command line if configured)
```

### 3. Verify Production Settings

After deploying, verify the environment is correct:

```bash
python manage.py shell
>>> from django.conf import settings
>>> print(f"DEBUG={settings.DEBUG}")  # Should be False
>>> print(f"IS_PRODUCTION={settings.IS_PRODUCTION}")  # Should be True
>>> exit()
```

---

## What Gets Auto-Configured in Production

When `DJANGO_ENV=production`:

- ✅ `DEBUG = False` (security)
- ✅ WhiteNoise middleware added for static file serving
- ✅ `STATIC_ROOT` set to `BASE_DIR/staticfiles`
- ✅ `STATICFILES_STORAGE` uses WhiteNoise's compressed storage

---

## Deploying Django Version Updates

When Dependabot (or manual updates) bump Django versions:

1. **Merge the PR** locally or on GitHub
2. **Pull changes** on PythonAnywhere: `git pull origin master`
3. **Update dependencies**: `pip install -r requirements.txt --upgrade`
4. **Reload web app** via the Web tab

No manual settings.py edits needed! 🎉

---

## Troubleshooting

### Settings Don't Match Production Behavior

Check if `DJANGO_ENV` is set:
```bash
echo $DJANGO_ENV  # Should output: production
```

### Static Files Not Loading

Run collectstatic:
```bash
python manage.py collectstatic --noinput
```

Then verify the static files path in PythonAnywhere Web tab matches `STATIC_ROOT`.

### Import Errors After Update

Ensure virtual environment is activated and dependencies installed:
```bash
source ~/.virtualenvs/<your-venv>/bin/activate
pip install -r requirements.txt
```
