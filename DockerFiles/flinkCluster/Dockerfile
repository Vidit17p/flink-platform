FROM flink:1.18.1-java11

# INSTALLING JAVA AWSCLI
RUN apt-get update && \
    apt-get install -y openjdk-11-jdk && \ 
    apt-get install -y wget curl python3 python3-pip && \
    apt-get clean && \ 
    apt-get install unzip && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \ 
    ./aws/install 

# ADDING JAVA
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-arm64
ENV PATH=$JAVA_HOME/bin:$PATH

# INSTALLING PYTHON
ENV PYTHON_VERSION=3.10

RUN apt-get update && \
    apt-get install -y software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y python${PYTHON_VERSION} python${PYTHON_VERSION}-dev python3-pip && \
    rm /usr/bin/python3 && \
    ln -s /usr/bin/python${PYTHON_VERSION} /usr/bin/python3 && \
    python3 --version

# INSTALLING pyflink
RUN pip3 install apache-flink==1.18

# Adding extra JARs
COPY extra-jars/ /opt/flink/lib/

# ADDING S3 plugin
RUN mkdir ./plugins/s3-fs-presto/
RUN cp ./opt/flink-s3-fs-presto-1.18.1.jar ./plugins/s3-fs-presto/
RUN ln -s /usr/bin/python3 /usr/local/bin/python
