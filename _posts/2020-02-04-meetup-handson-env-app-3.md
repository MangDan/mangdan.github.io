---
title:  "Vue/Vuetify와 Spring Boot을 사용하여 웹 애플리케이션 만들기 - 3"
date:   2020-02-04 10:39
tags: ["Spring Boot", "Oracle", "Vue", "Vuetify", "Vuex"]
---

전 포스트에 이어서 마지막으로 EnvSearch(실습 환경 검색) Vue 컴포넌트와 JWT에 대해서 정리한다.

> 본 블로그의 모든 포스트는 **macOS** 환경에서 테스트 및 작성되었습니다.  

### 소스 공유
소스는 다음 [깃헙 저장소](https://github.com/MangDan/meetup-handson-env)에서 확인할 수 있다.

### EnvSearch.vue
EnvSearch 컴포넌트의 최종 결과 화면은 다음과 같다. 간단히 실습 환경을 사용하는 실습자가 자신이 신청한 실습 환경을 조회하는 화면이다. 신청자명과 이메일로 조회를 하며, 상단 **실습환경 접속방법** 버튼을 통해 간단히 실습 환경에 접속하는 가이드 팝업을 보여준다.

<img src="../assets/images/vue-env-search.png" width="400px">


#### EnvSearch > v-chip, v-form, v-alert
Vuetify의 컴포넌트중 위 3개의 UI 컴포넌트를 추가로 사용했다. v-chip은 간단한 정보를 보여주는 작은 조각 같은 것으로, 버튼과 비슷하다. 여기선 버튼 대용으로 사용해봤다.

v-chips 예제

<img src="../assets/images/vuetify-chip-examples.png" width="400px">

v-form은 입력 폼이다. 뒤에 메소드에서 보겠지만, v-form을 사용하면, form validation을 할 때 코드를 단순화 할 수 있다.

v-alert는 폼에서 입력한 정보를 제출할 때 발생한 오류를 보여준다. 예를들면 조회한 정보가 없는 경우라던지, 벡엔드 서비스에 문제가 생긴 경우를 들수 있다.

폼에서는 username(신청자 이름)과 email(신청자 이메일)을 입력하고 조회를 하면 신청한 정보를 가져온다. 조회 클릭 이벤트는 searchEnvFromForm 메소드와 연결되어 있으며, 당연히 axios를 통해서 서비스를 호출하여 정보를 가져온다.

```html
<EnvDetail ref="envDetail" v-if="showEnv" />
<v-container v-else fluid>
  <v-row>
    <v-col cols="12">
      <v-card class="d-flex pa-2 justify-center" style="box-shadow: none;">
        <v-form style="width:70%" ref="form" lazy-validation>
          <v-text-field
            v-model="username"
            :counter="10"
            :rules="nameRules"
            label="Name"
            required
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-text-field v-model="email" :rules="emailRules" label="E-mail" required></v-text-field>
          <v-alert dense outlined type="error" v-model="alert" dismissible>
            <h3 class="title">Oops!</h3>
            <div v-text="errmsg"></div>
          </v-alert>

          <div class="text-right">
            <v-btn rounded color="primary" @click="searchEnvFromForm">Search</v-btn>
          </div>
        </v-form>
      </v-card>
    </v-col>
  </v-row>
</v-container>
```

조회 버튼을 클릭하면 아래 메소드를 호출하며, 성공적으로 데이터를 가져올 경우 showEnv를 업데이트하여 EnvDetail 컴포넌트가 렌더링 되도록 한다. 이때 바로 EnvDetail 컴포넌트의 데이터에 접근하기 위해 refs(id 같은)를 사용해서 접근하여 데이터를 넘겼다. 사실 하위 컴포넌트로 데이터를 전송하는 방법은 EventBus를 사용하던가, Props를 사용하는 것이 일반적인 것 같은데, 이렇게 컴포넌트의 refs를 통해 직접 접근도 되는데, 머가 다른걸까?  setTimeout을 사용한 것은 EnvDetail 컴포넌트가 렌더링 되지 않은 상태에서 EnvDetail의 Data에 접근할 수 없기 때문에 약 0.3초 정도 지연시간을 줘서 렌더링이 되면 전달하도록 했다. (만약 0.3초내로 해당 컴포넌트가 렌더링 되지 않는다면???)

```javascript
searchEnvFromForm() {
  if (this.$refs.form.validate()) {
    this.alert = false;

    this.$axios({
      method: "get",
      url:
        "/api/v1/meetup/env?username=" +
        this.username +
        "&email=" +
        this.email,
      headers: { "Content-Type": "application/json" }
    })
      .then(result => {
        if (result.data == "") {
          this.alert = true;
          this.errmsg =
            this.username + "님이 신청한 정보가 없습니다. 다시 신청하세요.";
        } else {
          this.showEnv = true;

          setTimeout(
            function() {
              if (this.$refs.envDetail)
                this.$refs.envDetail.env = result.data;
              if (this.$refs.envDetail)
                this.$refs.envDetail.listType = this.listType;
            }.bind(this),
            300
          );

          //this.$EventBus.$emit("displayEnv", this.listType, result.data);
        }
      })
      .catch(error => {
        console.log(error);
      });
  }
}
```

어쨋든 조회한 내용은 EnvDetail 컴포넌트에서 보여주는데, EnvDetail은 전 포스팅에서 다뤘기 때문에 넘어가도록 하겠다.

#### SearchEnv.vue > JSON Web Token (JWT)과 Vuex
관리자 기능을 추가하기로 결정하고, 인증 방식은 JWT를 사용하기로 결정했다. 관리자 기능은 그냥 실습 환경 정보를 관리자가 수정이나 삭제, 추가를 할 수 있는 기능이다.

#### SearchEnv.vue > UI
일단 다음과 같이 관리자 등록 및 로그인을 위한 UI가 필요할 것이다.
<img src="../assets/images/vue-meetupenv-admin-login.png" width="400px">

로그인을 하면 **실습 환경 업데이트** 라는 v-chip이 보이고, 옆에 숫자는 토큰의 만료 시간을 실시간으로 보여주도록 했다.
<img src="../assets/images/vue-meetupenv-logged.png" width="400px">

해당 버튼(chip)을 클릭하면, 다음과 같이 실습 환경 목록을 보여준다. 이 화면에서 변경, 수정, 삭제가 가능하도록 했다. 물론 컬럼 단위의 수정 기능도 추가했다.
<img src="../assets/images/vue-meetupenv-admin-update.png" width="400px">

#### SearchEnv.vue > JWT 토큰
관리자 로그인을 하면 응답으로 다음과 같은 메시지를 받는다. access_token은 30분, refresh_token은 2일후에 만료된다. 


```json
==응답==
{
    "access_token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbjFAb3JhY2xlLmNvbSIsImV4cCI6MTU4MDgwMTIzNSwiaWF0IjoxNTgwNzk5NDM1fQ.y6zKMNo1ii6NkGEnSB96izwYpqzKB_KhxsxSuZnKwXhR3OIfr63X3YZ9C6IzTjEpsn9e_JaTAANLkFO9hf50Ww",
    "refresh_token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbjFAb3JhY2xlLmNvbSIsImV4cCI6MTU4MDk3MjIzNSwiaWF0IjoxNTgwNzk5NDM1fQ.8tAV0KDv1HbHFPkDvgB-VdyN7Qwa9My0852iyoNnJcnFPtGsCOp8J-PUMwkjl9JZKUqAo1a8i8XWYer_ODUBtg",
    "errorCode": "00",
    "errorMessage": "SUCCESS",
    "expires_in": "1799"
}
```

access_token은 실제 백엔드 서비스를 호출할 때마다(관리자만 사용하는 서비스로 한정, 이 부분은 백엔드 서비스에서 설정) 헤더에 실어서 전달해야 하며, refresh_token은 access_token이 만료되면, access_token을 재발급 받기위해 사용한다. 이는 access_token이 유출되었을 경우를 대비해서 access_token의 유효시간을 짧게 잡은 것이고, 이후 만료가 다가올때마다 refresh_token을 이용해서 재발급을 받도록 하기 위함이다. 만료 시간이 다가오면 다음과 같은 팝업을 자동으로 띄워줄 것이다.
![](../assets/images/vue-admin-meetupenv-refresh-token.png)

#### SearchEnv.vue > JWT 토큰 저장
클라이언트에서 access_token과 refresh_token을 가져오면 이를 클라이언트의 로컬에 저장해야 하는데, Vuex는 메모리에 저장하는 것이라, 페이지를 리프레시하면 토큰 정보가 사라져서 로그아웃 된다. 모바일 앱이라면 괜찮지만, 웹의 경우는 이 부분이 좀 문제가 되는 것 같다. 어쨋든 페이지 리프레시가 일어나도 토큰 정보를 가지고 있기 위해서는 다른 저장소를 사용해야 하는데, 여기서는 SessionStorage를 사용했다. 하지만 보안을 위해서라면, SesstionStorage나 LocalStorage가 아닌 다른 방식을 취하는게 맞는것 같다. 구글링을 해보니, 아래 블로그에서 HttpOnly Cookie를 사용하라는 내용이 있다. 
> https://blog.hasura.io/best-practices-of-using-jwt-with-graphql/#refresh_token_persistance

HttpOnly 쿠키는 누군가에 의해서 쿠키를 탈취당하는 것을 막기 위한 방법인데, 물론 이 방법도 우회하는 방법이 있는 것 같다. 그래도 웹에서 JWT를 사용한다면, 이 방법이 가장 좋은 방법으로 보인다.
> https://webhack.dynu.net/?idx=20161110.002

로그인을 하면, Vuex의 mutations의 loginToken을 호출하고, 여기서 sessionStorage에 저장한다. 리프레시가 일어나도 state는 sessionStorage에서 토큰을 가져온다.

```javascript
state: {
    access_token: sessionStorage.getItem("access_token"),
    refresh_token: sessionStorage.getItem("refresh_token"),
    expires_in: "",
    claims: JSON.parse(sessionStorage.getItem("claims")),
    intervalId: null
...
mutations: {
    loginToken(state, data) {
      /* eslint-disable no-console */
      //console.log(data);

      sessionStorage.setItem("access_token", data.access_token);
      sessionStorage.setItem("refresh_token", data.refresh_token);

      state.access_token = data.access_token;
      state.refresh_token = data.refresh_token;
      state.expires_in = data.expires_in;
    }
```

Vuex의 actions에는 하나의 action이 있는데, 로그인을 하거나 토큰을 리프레시할 경우 호출된다. 이 메소드는 토큰의 남은 시간을 초 단위로 clip에 뿌려준다.

<img src="../assets/images/vue-admin-meetupenv-token-time.png" width="200px">

```javascript
setJwtExpiresIn(context) {
  if (context.state.claims != null && context.state.claims.exp != undefined) {
    var intervalId = setInterval(() => {
      let expires_in = (context.state.claims.exp - Math.floor(new Date().getTime() / 1000) < 0 ? "" : context.state.claims.exp - Math.floor(new Date().getTime() / 1000));
      context.commit('setJwtExpiresIn', expires_in)
    }, 1000)

    context.commit("setIntervalId", intervalId);
  }
}
```

#### SearchEnv.vue > v-data-table, v-edit-dialog
clip 버튼을 클릭하면, 다음과 같이 실습 환경 목록을 보여준다. 이 화면에서 변경, 수정, 삭제가 가능하도록 했는데, 컬럼 단위의 수정도 가능하도록 작업했다. Vuetify에 보면 v-data-table(목록)과 v-edit-dailog(컬럼 단위 수정)를 사용했다.

<img src="../assets/images/vue-meetupenv-admin-update.png" width="400px">

아래는 실습 환경 정보를 envs 데이터에 담아서 보여주는 내용이다. 
```html
<v-dialog v-model="updateEnvDialog" scrollable>
  <v-data-table
    height="400px"
    fixed-header
    :headers="envHeaders"
    :items="envs"
    :items-per-page="10"
    :sort-by.sync="updateEnvSortBy"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>실습 환경 업데이트</v-toolbar-title>
        <v-spacer></v-spacer>
```

각 컬럼 단위의 업데이트를 위한 내용이다. v-edit-dialog는 save, cancel, close에 대한 이벤트 핸들러를 추가할 수 있다. save가 일어나면, 바로 axios를 통해 REST 서비스를 호출해서 업데이트 하게 된다.

<img src="../assets/images/vue-admin-meetupenv-column-update.png" width="300px">

```html
<template v-slot:item.osuser="props">
  <v-edit-dialog
    :return-value.sync="props.item.num"
    @save="updateColunm(props.item)"
    @cancel="cancelUpdateColunm"
    @close="closeSaveColunm"
  >
    {{ props.item.num }}
    <template v-slot:input>
      <v-text-field v-model="props.item.num" label="Edit" single-line counter></v-text-field>
    </template>
  </v-edit-dialog>
</template>
```

이 외에 해당 로우 데이터를 전체 수정하는 부분과 삭제에 대한 부분이 있는데, 전체적인 소스에 대한 내용 정리는 여기까지 하겠다.

로우 데이터 전체 업데이트

<img src="../assets/images/vue-admin-meetupenv-row-update.png" width="300px">

로우 데이터 전체 업데이트

<img src="../assets/images/vue-admin-meetupenv-row-delete.png" width="300px">

### 정리
Vue와 Vuetify를 사용해서 개발을 해본 느낌은 일단 상대적으로 다른 프레임워크에 비해 쉬워보인다는 것이다. 사실 예전에 Knockout.js라는 MVVM 프레임워크를 사용해본 경험이 아주 약간 있는데, 이 보다는 훨씬 쉽고 간결한 느낌을 받았다. React.js는 아직 사용해보지 못해서 상대적으로 얼마나 배우기 쉬운지 잘 모르겠다. Vuetify 또한 굉장히 다양하면서도 완성도 높은 UI 컴포넌트들을 제공해서 기본적인 웹 애플리케이션 개발을 위해 충분히 사용할만 하다는 느낌을 받았다. 어려웠던 점은 컴포넌트간에 데이터를 주고받는 방식과 ES6문법, 특히 화살표 함수에 익숙하지 않아서 익숙해지는데 약간 시간이 걸렸던 부분이나, this 키워드가 Promise와 setTimeout과 같은 곳에서 사용할 때 잘 몰라서 삽질한 부분, Vue의 라이프사이클을 잘 이해 못해서 헤맨 부분 정도인것 같다. 

요즘 프론트엔드 프레임워크의 대표주자로 React와 Vue 얘기들을 많이 하는데, 일단 Vue로 프론트엔드 프레임워크에 대한 감을 얼추 잡았으니, 다음은 React로 도전해봐야겠다.

### 참고한 블로그
* https://medium.com/witinweb/vue-js-%EB%9D%BC%EC%9D%B4%ED%94%84%EC%82%AC%EC%9D%B4%ED%81%B4-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-7780cdd97dd4
* https://beomy.tistory.com/47
* https://joshua1988.github.io/web-development/vuejs/vuex-start/#vuex%EB%9E%80
* https://blog.hasura.io/best-practices-of-using-jwt-with-graphql/#refresh_token_persistance