FROM python:3.11-slim-bookworm

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libzbar0 \
    libaio1 \
    unzip \
    wget \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app

# Instala as dependências do Python
# Copiamos o requirements da pasta local para a raiz do WORKDIR no container
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# Copia todo o conteúdo da pasta backend local para /app/backend no container
#COPY . ./backend    (testando sem a pasta backend, pois o PYTHONPATH já aponta para /app/backend, então não precisa criar uma subpasta, o caminho esta erado)
COPY . .

# Instala o Oracle Client
RUN mkdir -p /app/backend/instant_client \
    && cd /app/backend/instant_client \
    && wget https://download.oracle.com/otn_software/linux/instantclient/2340000/instantclient-basiclite-linux.x64-23.4.0.24.05.zip \
    && unzip instantclient-basiclite-linux.x64-23.4.0.24.05.zip \
    && rm instantclient-basiclite-linux.x64-23.4.0.24.05.zip \
    && echo /app/backend/instant_client/instantclient_23_4 > /etc/ld.so.conf.d/oracle-instantclient.conf \
    && ldconfig

# Define o PYTHONPATH para que o Python encontre os módulos na pasta backend
ENV PYTHONPATH=/app/backend
ENV LD_LIBRARY_PATH=/app/backend/instant_client/instantclient_23_4

EXPOSE 5000

# Roda o main.py de dentro da pasta backend
#CMD ["python", "backend/main.py"]        (alterei para rodar o main.py diretamente, sem a pasta backend, já que o PYTHONPATH aponta para /app/backend, ou seja, caminho estava errado)
CMD ["python", "main.py"]
