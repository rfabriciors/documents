FROM  python:3
LABEL "vendor"="klv"
LABEL version="v1.1"
LABEL description="Aplicação de cálculo de idade com JavaScript e servidor python"
LABEL maintainer="rfabriciors@gmail.com"

RUN apt-get update -y && \
   apt-get install -y python python3-pip python-dev

RUN pip install Flask

WORKDIR /app

COPY . .

EXPOSE 5000

CMD [ "python", "./app.py"]