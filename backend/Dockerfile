FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev \
    libjpeg-dev \
    libzbar0 \
    libaio1t64 \
    unzip \
    wget \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/instant_client \
    && cd /app/instant_client \
    && wget https://download.oracle.com/otn_software/linux/instantclient/2340000/instantclient-basiclite-linux.x64-23.4.0.24.05.zip \
    && unzip instantclient-basiclite-linux.x64-23.4.0.24.05.zip \
    && rm instantclient-basiclite-linux.x64-23.4.0.24.05.zip \
    && echo /app/instant_client/instantclient_23_4 > /etc/ld.so.conf.d/oracle-instantclient.conf \
    && ldconfig

ENV PYTHONPATH=/app
ENV LD_LIBRARY_PATH=/app/instant_client/instantclient_23_4

EXPOSE 5000

CMD ["python", "main.py"]
