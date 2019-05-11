---
title:  "[Spring Boot] Profiles"
date:   2019-05-02 17:20
tags: ["Microservice", "Spring Profile"]
---

Spring Boot의 Profile 설정을 간략하게 살펴보겠습니다.

> 본 블로그의 모든 포스트는 **macOS** 환경에서 테스트 및 작성되었습니다.  

### Spring Boot Profiles

Spring Boot에서는 애플리케이션에서 사용할 설정값들을 프로파일별로 관리할 수 있습니다.  
기본 설정 파일에 Profile alias를 추가하여 사용하게 되는데, 본 포스트에서는 간략하게 Spring Boot에서 설정 파일들을 어떻게 프로파일 단위로 관리하는지 알아보겠습니다.

### application.properties and application-{profile}.properties

설정 파일의 유형은 properties 외에 yaml도 지원합니다. JSON이나 HOCON style도 지원할까요? 확인해봐야 할 것 같습니다.  
Spring Boot 에서는 src/resources/application.properties 파일을 기본 설정 파일로 사용합니다.  
여기에 만약 파일명을 application-dev.properties 라는 파일을 추가하면, **dev**라는 Profile 명으로 로드가 가능합니다.

기본적으로는 다른 프로파일을 지정하더라도 application.properties는 1순위로 로드합니다. 
즉, Spring Boot에서 **dev**라는 이름의 Profile을 지정하더라도, 우선적으로 application.properties 파일을 로드한 후 application-dev.properties를 로드합니다. 만약, 2개 이상의 Profile을 지정해야 하는 경우라면 include를 사용하면 됩니다. (아래 참조)

### Profile 지정

Profile지정은 Default인 application.properties에서 지정하는 방법과 기동 시 아규먼트로 지정하는 방법 두가지가 있습니다. (현재 확인된 바로는...)  

application.properties에서 Profile 지정
```
spring.profiles.active=dev
```

애플리케이션 기동 시 지정
```
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

만일, 둘 다 지정할 경우에는 애플리케이션 기동 시 아규먼트로 지정한 Profile이 설정됩니다.

application.properties에 ***spring.profiles.active=dev*** 이지만, 기동 시 ***-Dspring-boot.run.profiles=prod*** 로 했다면 application-prod.properties 파일을 로드합니다.  
같은 키를 가질 경우 두번째 로드하는 파일에서 오버라이드 합니다.  
항상 application.properties가 1차적으로 로드가 되고, 프로파일로 지정된 application-dev.properties을 로드하기 때문에 두개의 파일이 같은 키를 가지고 있을 경우 두번째 로드한 application-dev.properties에 있는 키의 값을 읽습니다.

Include로 지정
```
spring.profiles.include=db
```

만일 application-dev.properties에서 include를 사용하면, 2개 이상을 로드할 수 있습니다.  
순서는 application.properties -> application-dev.properties -> application-db.properties이며, 세개의 파일에서 같은 키가 존재할 경우 맨 마지막 application-db.properties의 설정값을 읽게됩니다. (오버라이드)
