# Build the frontend source

FROM node:9 as frontend_builder

ENV BASE_DIR /bpmn_monitor

COPY . ${BASE_DIR}

WORKDIR ${BASE_DIR}/WebInterface

RUN npm install \
    && npm install -g grunt-cli \
    && grunt deploy
    
# ------------------------
# Build the backend source
    
FROM maven:3.5 as backend_builder

ENV BASE_DIR /bpmn_monitor

COPY --from=frontend_builder ${BASE_DIR}/BackEnd/ ${BASE_DIR}/

WORKDIR ${BASE_DIR}

RUN mvn package
    
# ------------------------
# Copy built backend to runtime environment
    
FROM java:8-jre-alpine

ENV BASE_DIR /bpmn_monitor

WORKDIR ${BASE_DIR}

COPY --from=backend_builder ${BASE_DIR}/target/BpmnMonitor.jar .

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "./BpmnMonitor.jar"]

CMD ["-p", "8080"]