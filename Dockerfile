FROM python:3.10-slim

# définir le dossier de travail
WORKDIR /app_django_soundsync

# installer dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copier le code
COPY . .

# exposer port
EXPOSE 8000

# commande par défaut
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
