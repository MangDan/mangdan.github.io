---
title:  "[API Blueprint] Basic"
date:   2019-05-07 16:46
tags: ["Apiary", "API Blueprint"]
---

API Design Specification 중 하나인 API Blueprint의 가장 기본이 섹션들에 대해서 간단히 정리하였습니다.

> 본 블로그의 모든 포스트는 **macOS** 환경에서 테스트 및 작성되었습니다.  

# API Name and metadata


```markdown
FORMAT: 1A
HOST: http://polls.apiblueprint.org/

# 영화 API

최근 인기있는 **영화 정보**와 관련 **영화인**에 대한 정보를 제공하는 API
```

* **FORMAT: 1A** - API Blueprint의 버전입니다. 버전은 [공식 홈페이지](https://apiblueprint.org)에서 확인 가능합니다.  
* **HOST** - 실제 제공할 API의 Host입니다. 개발 전이라면 아직 Host가 없을 수 있기 때문에 기본 혹은 임의로 작성합니다. Production URL이 생기면 업데이트 합니다.
* **# {제목}** - 문서의 가장 큰 제목입니다. API 리소스들을 대표하는 이름으로 부여합니다.

# Resource Groups

```markdown
 # Group 영화 API

 # Group 영화인 API
```

* **# Group {그룹명}** - API Resource들을 그룹으로 나눌 수 있습니다. 예제에서는 영화 정보와 영화인 정보 제공으로 그룹핑하였습니다.

# Resource

```markdown
## 영화 정보 리소스 [/api/search/v1/movies]
```

* **## {리소스명} [리소스 URI]** - 각 API에 대한 대표 리소스를 표현합니다.

# Actions

```markdown
### 영화 조회 [GET /api/search/v1/movies{?title}]
영화명으로 영화를 검색하여 비스산 이름의 영화 리스트를 조회

### 영화 상세 조회 [GET /api/search/v1/movies/{id}]
영화 ID로 영화 상세 조회
```
액션은 GET,POST,PUT,DELETE와 같은 HTTP 메소드입니다.
* **### {액션명} [액션]** - 파라미터 없이 액션만 지정할 경우는 따로 Resource URI 지정하지 않습니다.
* **### {액션명} [액션 {Resource URI}/{?param1,param2}]** - Query Parameter를 지정할 경우 위 Resource에서 지정한 URI에 {?param1, param2}와 같이 지정해줍니다.
* **### {액션명} [액션 {Resource URI}/{param1}** - URI Path Parameter를 지정할 경우 위 Resource에서 지정한 URI에 {param1}과 같이 지정해줍니다.

# Request > Parameters

```markdown
+ Request
    + Parameters
        + id : 128 (number,required) - 영화 아이디
```

* Action이 GET일 경우 **+ Request** 하위에 **+ Parameters**를 입력하고 속성을 파라미터 정의합니다.
* 파라미터 속성은 **+ {속성명} : {기본값} ({타입}, {필수여부}) - {설명}**과 같이 정의합니다. 여기서 속성명을 제외한 나머지는 옵셔널입니다.

# Request > Headers/Body

```markdown
+ Request (application/json)

    + Headers

            api_key: asdfsdflksjdflkjsdf

    + Body
            {
                "id": 278
            }
```

* Action이 PUT 혹은 POST일 경우 Body에 데이터를 전달해야 하는 경우가 있습니다. Request로 전달할 Content-Type은 **+ Request (Content-Type)** 형태로 정의합니다. Header와 Body의 경우 **+ Headers**, **+ Body**를 선언합니다. Header는 **키: 값**으로 정의하고, Body는 JSON 샘플 또는 MSON (뒤에서 설명) 형태로 정의해줍니다.

> **+ Request** 다음 **+ Header** 가 한 줄 띄워서 작성되어 있습니다. API Blueprint에서의 기본 마크다운 스타일 규칙입니다. 이와 같이 기본 스타일에 맞춰서 들여쓰기와 띄워쓰기를 하는데, 꼭 이렇게 해야하는 것은 아니고 권장하는 스타일입니다. Apiary에서는 권장하는 스타일로 작성이 안된 부분은 Warning 메세지를 보여줍니다. 단순히 Warning이기 때문에 문서로 변환이 안되는 것은 아닙니다. 이러한 스타일은 문서의 가독성을 높이기 위해 권장 하는 부분으로, 유료 버전일 경우 (Standard, Enterprise) 스타일 규칙을 추가, 편집할 수 있습니다.

# Response > Headers/Body

```markdown
+ Response 200 (application/json)
    
    + Headers

        Location: /api/v1/movie/278

    + Body

            {
                "id": 278,
                "title": "쇼생크 탈출",
                "vote_count": 12728,
                "vote_average": 8.7,
                "poster_path": "/iZdih9zQAqxNadp0ScHyYRXsXLf.jpg",
                "release_date": "1995-01-28",
                "overview": "촉망받는 은행 간부 앤디 듀프레인(팀 로빈슨)은 아내와 그녀의 정부를 살해했다는 누명을 쓴다. 주변의 증언과 살해 현장의 그럴듯한 증거들로 그는 종신형을 선고받고 악질범들만 수용한다는 지옥같은 교도소 쇼생크로 향한다. 인간 말종 쓰레기들만 모인 그곳에서 그는 이루 말할 수 없는 억압과 짐승보다 못한 취급을 당한다. 그러던 어느 날, 간수의 세금을 면제받게 해 준 덕분에 그는 일약 교도소의 비공식 회계사로 일하게 된다. 그 와중에 교도소 소장은 죄수들을 이리저리 부리면서 검은 돈을 긁어 모으고 앤디는 이 돈을 세탁하여 불려주면서 그의 돈을 관리하는데..."
            }
```

* Response도 Request와 거의 비슷하지만, 응답에 대한 HTTP 코드를 정의해줘야 합니다.
* Headers와 Body는 Request와 동일합니다.

# Response Without a Body

```markdown
### 영화인 삭제 [DELETE]

+ Response 204
```

* Response 중에서 응답 Body가 없는 경우는 위와 같이 간단하게 작성합니ㅏㄷ. HTTP 204 코드는 컨텐츠가 없는 성공 코드 입니다.

# MSON (Markdown Syntax for Object Notation)

[MSON (Markdown Syntax for Object Notation)](https://apiblueprint.org/documentation/mson/specification.html)은 Request 혹은 Response의 Body의 JSON Structure를 쉽게 표현하기 위한 API Blueprint 스펙입니다. JSON보다 더 간결하고 읽기 쉬우며, 객체화가 가능하여 문서내에서 쉽게 재활용할 수 있습니다.

MSON은  데이터 구조를 객체형태로 정의해서 이를 Request 혹은 Response 에서 객체 이름을 참조하는 형태로 사용합니다.

MSON에서 객체를 정의할 때 다음과 같이 Data Structures 를 우선 선언해줍니다.
```markdown
# Data Structures
```

Data Structures 하위에 객체를 정의합니다. 문법은 **{객체명 (object)}** 로 정의하는데, object는 이것이 객체라는 것을 나타내 주는 부분으로 꼭 표기하지 않아도 됩니다.
```markdown
# Data Structures

## MoviePeople (object)
```

객체를 정의했으면, 멤버 속성을 정의합니다. 속성은 **+(혹은 -) 마크 + 속성명** 까지가 기본 필수항목이며, 이후 기본값, 유형, 필수 여부, 설명등이 포함될 수 있습니다. 문법은 다음과 같습니다.  
**+(-) {속성명} : {기본값} ({유형}, {필수여부}) - {설명}**

```markdown
# Data Structures

## MoviePeople (object)

## MoviePeopleMeta (object)
+ id : 10084614 (number, required) - 아이디
+ name : 프랭크 다라본트 (string, required) - 이름
+ role : 감독 (string, optional) - 역할
```

특정 객체에서 다른 객체를 상속받을 수 있습니다.
```markdown
# Data Structures

## MoviePeople (MoviePeopleMeta)
+ filmography : 쇼생크 탈출 (string, optional) - 필모그래피

## MoviePeopleMeta (object)
+ id : 10084614 (number, required) - 아이디
+ name : 프랭크 다라본트 (string, required) - 이름
+ role : 감독 (string, optional) - 역할
```

상속외에 Include 키워드를 사용해서 다른 객체를 포함할 수 있습니다.  
문법은 **Include + {객체명}** 입니다.

```markdown
# Data Structures

## MoviePeople (object)
+ Include MoviePeopleMeta
+ filmography : 쇼생크 탈출 (string, optional) - 필모그래피

## MoviePeopleMeta (object)
+ id : 10084614 (number, required) - 아이디
+ name : 프랭크 다라본트 (string, required) - 이름
+ role : 감독 (string, optional) - 역할
```

선언한 객체는 Request와 Response에서 + Attributes 섹션에서 사용합니다.  array 혹은 
```markdown
+ Response 200 (application/json)
    + Attributes (array[MoviePeopleMeta])

+ Response 200 (application/json)
    + Attributes (MoviePeople)
```

다음과 같은 구조입니다.  
<img src="../images/apiblueprint-mson-sample.png" width="60%">

이렇게 작성된 MSON은 문서상에서 JSON으로 변환되어 출력됩니다.  
<img src="../images/apiblueprint-mson-to-json.png" width="60%">

# API 문서
Apiary에서 API Blueprint로 문서 작성이 되면 우측에 HTML로 실시간 문서 변환이 이뤄집니다. API 타이틀, 설명, API Resource URI, Action, Parameter, Body, Header, Mock API Url에 대한 정보와 API 가상 테스트를 해볼 수 있는 기능을 포함해서 제공이 됩니다.

![](../images/apiblueprint-apidocument-sample.png)

# 마무리
Swagger와 RAML도 익숙해지면 Design First가 가능하겠지만, 아무래도 마크다운 포멧인 API Blueprint가 가장 심플해 보입니다. 복잡한 API 정의가 필요치 않다면 API Blueprint 사용을 권장합니다. 물론 Swagger등과 비교해서 디테일면에서 떨어지는 부분과 또 가장 아쉬운 부분중 하나는 소스와 동기화되어야 하는 부분인데, Swagger의 경우는 소스에서 바로 문서를 뽑아낼 수 있기 때문에 (Code First라고 볼 수 있습니다) 이런 방식으로 동기화할 수 있지만, API Blueprint는 Code First 어프로치가 어렵기 때문에 이런 방식으로 동기화 할 수 없습니다.  
이 부분을 보완할 수 있는 툴이 Apiary에서 개발한 오픈소스 API 문서 검증 툴인 [Dredd](https://dredd.org/en/latest/)를 활용하여 어느정도 커버 가능합니다. Dredd는 소스레벨이 아닌 실행 레벨에서 문서와 서비스간 일치 여부를 검증하는 툴이라고 볼 수 있습니다. Dredd를 통한 문서 검증 테스트 부분은 추후 포스트하도록 하겠습니다.

지금까지 간단하게 API Blueprint 스펙에 대해서 살펴봤습니다. 기본적인 부분만 살펴본것으로 실제 제공되는 섹션과 키워드는 이보다 훨씬 더 다양하게 많습니다. 전체 스펙은 https://apiblueprint.org에서 확인할 수 있습니다. 