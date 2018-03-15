FROM maven:3.5

ENV BASE_DIR /bpmns

RUN curl -sL https://deb.nodesource.com/setup_6.x | bash - \
    && apt-get install -y nodejs \
    && apt-get install -y npm \
    && apt-get install -y build-essential

ADD . ${BASE_DIR}

RUN cd ${BASE_DIR}/WebInterface \
    && npm install \
    && npm install -g grunt-cli \
    && grunt deploy \
    && cd ${BASE_DIR}/BackEnd \
    && mvn package
    
EXPOSE 8080

WORKDIR ${BASE_DIR}

ENTRYPOINT ["java", "-jar", "./BackEnd/target/BpmnMonitor.jar"]

CMD ["-p", "8080"]