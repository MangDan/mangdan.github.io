---
title:  "[Helidon] Helidon SE + GraalVM"
date:   2019-05-02 08:00
tags: ["Microservice", "Helidon", "Oracle", "GraalVM"]
---

[Helidon](https://helidon.io) 1.0.3 버전에서는 GraalVM의 Native Image를 정식으로 지원하게 되었습니다.  
정확히는 현재 Helidon SE에서만 지원됩니다.  
이번 포스트에서는 Helidon SE에서 어떠한 방식으로 GraalVM의 Native Image를 지원하는지 알아보겠습니다.

> 본 블로그의 모든 포스트는 **macOS** 환경에서 테스트 및 작성되었습니다.  

### GraalVM

GraalVM은 Oracle Labs에서 개발된 오픈소스로 고성능 JIT Compiler, Native 컴파일러, Polygrot 특징을 가지는 가상 머신입니다.  
[참조] [TAEWAN.KIM 블로그 - Cloud Native Java:GraalVM](http://taewan.kim/post/graalvm_seminar/)

GraalVM은 애플리케이션과 함께 미리 native-image로 구성하여 실행할 수 있는데, 클래스로드나 힙에 대한 초기화등의 서버 기동 시 필요한 작업들이 미리 이미지화 되어 동작하기 때문에 기존 JVM 방식에 비해서 작은 메모리와 빠른 시작이 가능하다는 장점이 있습니다. 컨테이너 이미지화 할 경우 실행을 위한 Java runtime이 포함되지 않기 때문에 컨테이너 이미지 사이즈도 크지 않다는 장점이 있습니다. 최적화된 사이즈의 컨테이너 이미지는 클라우드 환경에 적절하다고 볼 수 있습니다.

### Helidon SE에서 GraalVM 지원

Helidon 1.0.3 버전(정확히는 SE만)부터 GraalVM의 native-image 기능을 정식 지원합니다.  
macOS 환경에서 Helidon SE Quickstart로 생성된 프로젝트를 이미지화 하여 가동할 경우, 대략 가동 시간은 10ms, 사이즈는 21MB 정도로 기존 JVM 방식으로 구동할 때 보다 매우 빠르게 시작하고 사이즈도 작습니다.

물론 꼭 좋은점만 있는건 아닙니다. 트레이드오프가 있는데, native-image는 기존 JVM 혹은 native-image가 아닌 일반적으로 사용하는 GraalVM 보다 GC이 성능이 떨어집니다. 따라서, 오랜 시간동안 꾸준히 동작해야 하는 작업에는 어울리지 않습니다. 가령 배치작업이라든지, 특정 이벤트를 지속적으로 리스닝하는 형태의 서비스 같은 경우가 예가 될 수 있을겁니다.  
하지만, 단시간 동작하는 형태 (단순히 요청/응답, serverless 함수 같은...)라면 GraalVM의 native-image가 좋은 선택이 될 수 있습니다.  
빠른 가동 시간과 적은 사이즈, 단발성 요청/응답을 처리하는 서비스는 GraalVM의 native-image, 오랜 시간동안 지속적인 운영을 위한 성능이 필요하면 기존 JVM 혹은 GraalVM without native-image가 맞습니다.

### 환경 구성 및 테스트

#### GraalVM 설치
다음 위치에서 GraalVM을 다운로드 받고 적당한 위치에 압축을 해제합니다.
https://medium.com/oracledevs/helidon-flies-faster-with-graalvm-eea85287d2dc

해제한 후에 GRAALVM_HOME을 설정합니다.
```
export GRAALVM_HOME=~/graalvm-ce-1.0.0-rc13/Contents/Home
```

#### Helidon SE 프로젝트 준비

Maven generate로 Helidon SE 프로젝트를 생성합니다.
```
mvn archetype:generate -DinteractiveMode=false -DarchetypeGroupId=io.helidon.archetypes -DarchetypeArtifactId=helidon-quickstart-se -DarchetypeVersion=1.0.3 -DgroupId=io.helidon.examples -DartifactId=quickstart-se -Dpackage=io.helidon.examples.quickstart.se
```

#### 프로젝트 빌드
프로젝트 빌드를 할 때 다음과 같이 실행합니다. 실행하면 target 폴더내에 프로젝트 이름.jar 형태의 native-image가 생성됩니다.
```
mvn package -Pnative-image
```

#### 실행
```
./target/helidon-quickstart
```

#### 테스트
```
curl -X GET http://localhost:8080/greet
{"message":"Hello World!"}

curl -X GET http://localhost:8080/greet/Joe
{"message":"Hello Joe!"}

curl -X PUT -H "Content-Type: application/json" -d '{"greeting" : "Hola"}' http://localhost:8080/greet/greeting

curl -X GET http://localhost:8080/greet/Jose
{"message":"Hola Jose!"}
```