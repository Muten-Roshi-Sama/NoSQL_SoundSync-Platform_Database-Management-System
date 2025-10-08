FROM python:3.11-slim

WORKDIR /usr/src/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# system deps (if needed for audio libs later)
RUN apt-get update && apt-get install -y build-essential ffmpeg --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /usr/src/app/requirements.txt
RUN pip install --no-cache-dir -r /usr/src/app/requirements.txt

COPY ./app /usr/src/app/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
