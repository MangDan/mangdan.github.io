---
title:  "[Spring Boot] HikariCP와 JPA로 Oracle DB 연동하기 - 1탄"
date:   2019-05-02 17:58
---

Spring Boot에서 Hikari Connection Pool과 JPA를 통해 Oracle DB와 연동하는 부분을 간략히 살펴보도록 하겠습니다.
첫 번째로 Oracle DB 연동을 위한 Hikari Connection Pool 설정을 먼저 알아봅니다.

> 본 블로그의 모든 포스트는 **macOS** 환경에서 테스트 및 작성되었습니다.  

# Dependency 추가

먼저 HikariCP와 Spring JPA를 사용하기 위해 다음과 같이 pom.xml에 Dependency를 추가합니다.

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
</dependency>

```

Oracle JDBC의 경우는 현재 Public Maven Repository에서 11.2.0.3 버전까지는 지원합니다.  
그 이상의 버전을 사용할 경우는 Maven Local Repository로 구성하면 됩니다.  

> Maven Local Repository 구성은 구글링해보시면 많이 나와있으니 여기서는 따로 다루지 않겠습니다.  
> 참고로 Oracle 공식 홈페이지에서는 11.2.0.3 이상 버전의 jdbc driver를 구성하기 위해 Oracle에서 자체 제공하는 레파지토리를 제공하는것 같은데, 테스트해보지는 못했습니다.

Oracle JDBC Driver 11.2.0.3 Dependency 추가
```
<dependency>
    <groupId>com.oracle</groupId>
    <artifactId>ojdbc6</artifactId>
    <version>11.2.0.3</version>
</dependency>
```

# Oracle Profile
oracle 이라는 profile을 가지는 설정파일을 별도로 구성했습니다. 파일 내용은 다음과 같습니다.

application-oracle.properties
```
spring.datasource.url=jdbc:oracle:thin:@{db-ip}:{db-port}:{sid}
spring.datasource.username={username}
spring.datasource.password={password}
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
```

다음에는 Spring JPA와 Oracle 연동하는 부분에 대해서 포스트합니다.