FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p data
EXPOSE 5003
CMD ["gunicorn", "-b", "0.0.0.0:5003", "-w", "2", "app:app"]
