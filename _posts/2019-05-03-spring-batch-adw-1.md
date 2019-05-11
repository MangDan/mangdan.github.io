---
title:  "[Spring Boot] Spring REST Client, Batch를 사용해서 Oracle Autonomous Data Warehouse에 데이터 적재하기 - 1탄"
date:   2019-05-03 13:45
tags: ["Microservice", "Spring Boot", "Spring Batch", "Oracle ADW"]
---

얼마전에 Oracle Autonomous Data Warehouse에 특정 3개의 Open API (전국 부동산 실거래 정보)를 통해 가져온 데이터를 적재하는 작업을 진행했었는데 간단히 진행했던 작업들을 정리해봤습니다. 
첫 번째는 Spring Boot에서 ADW 연동 설정하는 부분입니다.

이 작업을 위해서 사용한 컴포넌트와 서비스입니다.
* Spring Boot
* Spring Batch
* Spring REST Client
* Hikari Connection Pool
* Oracle Autonomous Data Warehouse Cloud Service

> 본 블로그의 모든 포스트는 **macOS** 환경에서 테스트 및 작성되었습니다.  

### Oracle Autonomous Data Warehouse Wallet 
Oracle Autonomous Data Warehouse(이하 ADW)와 연동은 jks 와 wallet 두가지 방식이 있는데, 여기서는 wallet을 통해 연동하는 방법으로 진행했습니다.  
Oracle ADW wallet은 Oracle Cloud에서 ADW 인스턴스 생성 후 다운로드 받을 수 있습니다.  

> **Oracle ADW Wallet 다운로드**  
> https://docs.oracle.com/en/cloud/paas/autonomous-data-warehouse-cloud/user/connect-download-wallet.html#GUID-B06202D2-0597-41AA-9481-3B174F75D4B1

**다운로드 받은 zip 형태의 wallet 파일을 특정 경로에 압축 해제합니다.**

### Dependency 추가
Oracle Autonomous Data Warehouse(이하 ADW)와 JDBC 연동을 위해서는 다음 5개의 Oracle Library가 필요합니다.  
* ojdbc8
* ucp
* oraclepki
* osdt_core
* osdt_cert

> 라이브러리 다운로드는 아래 URL에서 다운로드 할 수 있습니다.  
> 
> **18c JDBC Driver & UCP**  
> https://www.oracle.com/technetwork/database/application-development/jdbc/downloads/jdbc-ucp-183-5013470.html
>
> **19c JDBC Driver & UCP**  
> https://www.oracle.com/technetwork/database/application-development/jdbc/downloads/jdbc-ucp-19c-5460552.html

WEB, JSON, REST, JPA, Hikari 관련 Dependency를 추가하고 위 5개의 라이브러리를 Local Maven Repository에 추가한 후 Dependency에 추가합니다.
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-json</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-rest</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-batch</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-tomcat</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.hibernate.validator</groupId>
        <artifactId>hibernate-validator</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>com.zaxxer</groupId>
        <artifactId>HikariCP</artifactId>
    </dependency>
    <dependency>
        <groupId>com.google.guava</groupId>
        <artifactId>guava</artifactId>
        <version>27.1-jre</version>
    </dependency>
    <dependency>
        <groupId>com.oracle</groupId>
        <artifactId>ojdbc8</artifactId>
        <version>18.3</version>
    </dependency>
    <dependency>
        <groupId>com.oracle</groupId>
        <artifactId>ucp</artifactId>
        <version>18.3</version>
    </dependency>
    <dependency>
        <groupId>com.oracle</groupId>
        <artifactId>oraclepki</artifactId>
        <version>18.3</version>
    </dependency>
    <dependency>
        <groupId>com.oracle</groupId>
        <artifactId>osdt_core</artifactId>
        <version>18.3</version>
    </dependency>
    <dependency>
        <groupId>com.oracle</groupId>
        <artifactId>osdt_cert</artifactId>
        <version>18.3</version>
    </dependency>
</dependencies>
```

### Oracle ADW Spring Profile
Oracle ADW 연동을 위한 별도의 Profile을 생성했습니다.  
설정을 위해서 wallet 파일을 압축해제한 경로와 wallet안에 있는 tnsnames.ora의 TNS Alias가 필요합니다.  
필자의 경우 다음과 같이 되어 있네요.  

**tnsnames.ora**
```
dwleeadw_high = (description= (address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=w0a8icio6wvena7_dwleeadw_high.adwc.oraclecloud.com))(security=(ssl_server_cert_dn=
        "CN=adwc.uscom-east-1.oraclecloud.com,OU=Oracle BMCS US,O=Oracle Corporation,L=Redwood City,ST=California,C=US"))   )

dwleeadw_low = (description= (address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=w0a8icio6wvena7_dwleeadw_low.adwc.oraclecloud.com))(security=(ssl_server_cert_dn=
        "CN=adwc.uscom-east-1.oraclecloud.com,OU=Oracle BMCS US,O=Oracle Corporation,L=Redwood City,ST=California,C=US"))   )

dwleeadw_medium = (description= (address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=w0a8icio6wvena7_dwleeadw_medium.adwc.oraclecloud.com))(security=(ssl_server_cert_dn=
        "CN=adwc.uscom-east-1.oraclecloud.com,OU=Oracle BMCS US,O=Oracle Corporation,L=Redwood City,ST=California,C=US"))   )
```

ADW 에서는 지정한 서비스 이름에 high, low, medium과 같이 성능과 컨커런시를 위한 3개의 옵션이 제공됩니다. 관련해서는 아래 참조하세요.  
> **ADW high, medium, low**  
> https://docs.oracle.com/en/cloud/paas/autonomous-data-warehouse-cloud/user/connect-predefined.html#GUID-9747539B-FD46-44F1-8FF8-F5AC650F15BE



이제 oracleadw라는 profile명을 가지는 설정 파일을 생성하고 다음과 같이 입력합니다.  
중요한 것은 JDBC Url에 TNS Alias와 TNS_ADMIN 부분에 압축 해제한 wallet 폴더의 경로를 적어주는 부분입니다.  

**application-oracleadw.properties**
```properties
spring.datasource.url=jdbc:oracle:thin:@dwleeadw_low?TNS_ADMIN=/home/opc/app/openapi-to-adw/src/main/resources/wallet
spring.datasource.username={username}
spring.datasource.password={password}
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
```
여기까지 Spring Boot와 ADW 설정하는 부분까지 살펴봤습니다. 다음에는 Spring Batch 설정한 부분에 대해서 정리할 예정입니다.