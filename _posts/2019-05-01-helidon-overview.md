---
title:  "[Helidon] Overview"
date:   2019-05-01 08:00
tags: ["Microservice", "Helidon", "Oracle"]
---

[Helidon](https://helidon.io)은 Eclispe의 [Microprofile](https://microprofile.io)과 Reactive Programming을 지원하기 위해 오라클에서 개발한 마이크로서비스 개발 프레임워크입니다.  
이번 포스트에서는 간단히 Helidon이 무엇이고, 어떻게 시작하는지 살펴보겠습니다.

> 본 블로그의 모든 포스트는 **macOS** 환경에서 테스트 및 작성되었습니다.  

# Helidon Overview

Helidon은 오라클에서 개발한 마이크로서비스 개발을 돕기위한 오픈소스 프레임워크입니다. 
[Helidon 홈페이지](https://helidon.io)와 [Helidon GitHub](https://github.com/oracle/helidon)에서 관련 정보를 얻으실 수 있습니다.  
Helidon은 Eclipse Microprofile 스펙을 구현한 Helidon MP와, Reactive 방식을 지원하는 Helidon SE 두가지 방식의 프레임워크를 제공합니다.

> 참고로 Helidon은 그리스어로 **제비**라는 뜻을 가지고 있습니다. **제비**는 작고 빠르며, 효율적으로 비행하는 새들 중 하나입니다. 마이크로 서비스 개발을 위한 프레임워크로써 적절하게 표현하는 이름인 것 같습니다.

<img src="../images/microprofile.png" width="40%">

MicroProfile은 Eclipse Foundation에서 2016년에 발표한 Microservice 개발을 위한 JavaEE 기반의 마이크로 서비스 개발 스펙으로, 2016년 9월에 최소한의 REST 구현을 위한 컴포넌트(CDI, JSON-P, JAX-RS)를 가지고 1.0이 발표되었습니다. 2018년 6월에 2.0이 정식 릴리즈되었으며, JSON-B 1.0이 포함되면서 총 12개의 컴포넌트를 제공하게 되었습니다.  
2019년 2월에 2.2 버전이 나왔는데 2.2버전에서는 새로 추가된 내용은 없지만, Open Tracing, Open API, REST Client, Fault Tolerance가 업데이트되었습니다.  
Helidon MP(Microprofile)는 이 Microprofile에 대한 구현체로 현재 Microprofile 2.2의 Open Tracing 1.3 까지만 지원합니다. (Open API 1.1, REST Client 1.2, Config 1.3 은 조만간 지원된다고 하네요.)

<img src="../images/microprofile-2.2-spec.png" width="80%">

Reactive Programming은 논블록킹, 비동기 애플리케이션을 개발할 수 있는 함수형 프로그래밍 방식입니다. Helidon SE는 JVM상에서 Reactive 방식의 애플리케이션을 개발, 실행할 수 있는 마이크로 서비스 개발 프레임워크입니다. 비슷한 프레임워크으로는 Spring Reactor, Micronaut, javalin 등이 있습니다. Nodejs, RxJava도 마찬가지 입니다.

[참고] [SYS4U OPEN WIKI - Reactive Programming 개요](http://wiki.sys4u.co.kr/pages/viewpage.action?pageId=8552930)

Helidon은 다음과 같이 기본 Helidon SE에 Helidon MP가 구현된 형태로 제공됩니다.  
Cloud Integration 부분은 Oracle에서 제공하는 여러 Cloud Service와 통합하기 위해 CDI 형태로 기능을
포함하여 제공되는 부분입니다. 현재는 Object Storage만 정식으로 지원하고 있지만, 향후 IDCS등과 통합될 예정이라고 합니다. Helidon SE, MP 둘 다 Cloud Integration 기능을 사용할 수 있습니다.

<img src="../images/helidon-architecture.png" width="80%">

Helidon에서 제공하는 컴포넌트들입니다.  MicroProfile은 위에서 언급했다시피 Open API 1.1, REST Client 1.2, Config 1.3을 제외하고 지원합니다. 몇가지 중요한 부분만 정리하겠습니다.
* MicroProfile은 기본적으로 Metrics, Health, Tracing 기능을 포함하기 때문에, Helidon MP의 경우 별도의 설정 없이도, 위 기능이 활성화 됩니다.  
* Helidon SE의 경우는 Metrics, Tracing, Health 부분이 별도로 구현되어 Main 함수내에 라우팅 형태로 포함되어 있습니다.  
* Metrics는 Prometheus 포멧과 JSON 포멧을 모두 지원합니다.
* Tracing은 기본 Tracing과 함께 Zipkin Tracing도 같이 포함됩니다.
* Extensions는 CDI 기능으로 특정 서비스 혹은 기능을 Inject하여 간편하게 사용할 수 있도록 제공되는 부분입니다. 현재 HikariCP, Jedis, Oracle Object Storage가 포함됩니다.
* WebServer는 Helidon SE에서 라이팅, 비동기 기능 구현을 위해 제공되는 부분이고, Security는 JWT, OAuth, Basic Auth, Google Auth, Oracle IDCS등을 사용할 수 있도록 기능을 제공합니다.
* Helidon은 MP의 경우 기본적으로 MicroProfile 스타일의 Config 설정을 지원하지만, Helidon 만의 Config 기능도 제공합니다. 파일 형식은 properties, yaml, json, hocon (simple json) 4가지 형식을 기본 지원하며, 런타임 로딩, 오버라이드등 여러가지 기능을 포함하고 있습니다. 

<img src="../images/helidon-components.png" width="80%">

## Helidon Hello World

Helidon SE와 Helidon MP의 기본 코딩 스타일을 보겠습니다.  
SE는 함수형 프로그래밍 방식이며, MP는 선언형 프로그래밍 방식입니다. JavaEE에 익숙한 개발자분들은 Helidon MP를 선호할 것 같고, Nodejs나 RxJava, Micronaut와 같은 기술에 더 익숙하신 분들은 Helidon SE의 코딩 방식을 더 선호할 것으로 보입니다.

Helidon SE Hello World
```java
Routing routing = Routing.builder()
        .get("/hello", (req, res) -> res.send("Hello World"))
        .build();
        
        WebServer.create(routing)
        .start();
```

Helidon MP Hello World
```java
@Path("hello")
@ApplicationScoped
public class HelloWorld {	
    @GET 	
    public String hello() {
        return "Hello World";	
    }
}
```

## Quickstart
Helidon은 Maven generate를 통해서 기본 Helidon Project를 구성할 수 있습니다. (Spring initializr 와 비슷)  
아래 DarchetypeVersion은 상시로 바뀌기 때문에 버전이 올라가서 Generate 실패가 발생할 수 있는데 이 경우 [Helidon 공식 홈페이지](https://helidon.io) 를 참조하세요.  

> 이 작업을 위해서는 기본적으로 Apache Maven이 필요합니다.  
[여기](https://maven.apache.org/download.cgi)에서 운영체제에 맞는 버전으로 다운로드 받아서 설치합니다. (압축 해제하고, bin 디렉토를 Path에 잡아주면 끝!)

설치가 완료되면 다음과 같이 실행합니다.

Helidon SE Quickstart
```
mvn archetype:generate -DinteractiveMode=false -DarchetypeGroupId=io.helidon.archetypes -DarchetypeArtifactId=helidon-quickstart-se -DarchetypeVersion=1.0.3 -DgroupId=io.helidon.examples -DartifactId=quickstart-se -Dpackage=io.helidon.examples.quickstart.se
```

Helidon MP Quickstart
```
mvn archetype:generate -DinteractiveMode=false -DarchetypeGroupId=io.helidon.archetypes -DarchetypeArtifactId=helidon-quickstart-se -DarchetypeVersion=1.0.3 -DgroupId=io.helidon.examples -DartifactId=quickstart-se -Dpackage=io.helidon.examples.quickstart.se
```

DartifactId에 지정한 이름으로 프로젝트가 생성됐을 겁니다.  
해당 프로젝트 폴더에서 다음과 같이 실행하면 jar내에 내장되어 있는 서버에 의해서 서비스가 실행됩니다.  
참고로 현재 Helidon은 [Netty](https://netty.io)기반의 웹서버에서 구동됩니다.

Buld & Run
```
cd quickstart-se(mp)
mvn package
Java –jar target/quickstart-se(mp).jar
```

Try
```
curl -X GET http://localhost:8080/greet
{"message":"Hello World!"}

curl -X GET http://localhost:8080/greet/Joe
{"message":"Hello Joe!"}

curl -X PUT -H "Content-Type: application/json" -d '{"greeting" : "Hola"}' http://localhost:8080/greet/greeting

curl -X GET http://localhost:8080/greet/Jose
{"message":"Hola Jose!"}
```
