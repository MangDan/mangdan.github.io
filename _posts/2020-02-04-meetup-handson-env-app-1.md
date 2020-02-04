---
title:  "Vue/Vuetify와 Spring Boot을 사용하여 웹 애플리케이션 만들기 - 1"
date:   2020-02-04 10:39
tags: ["Spring Boot", "Oracle", "Vue", "Vuetify", "Vuex"]
---

회사에서 하는 실습 교육을 위해 실습에 필요한 환경을 참석자들에게 제공하기 위한 간단한 웹 애플리케이션을 Vue와 Spring Boot을 사용해서 만들어 봤다. 개인적으로 프론트엔드 프레임워크에 관심은 있지만, 기본적인 Javascript나 JQuery정도 알고 있는 수준이며, ES6 문법이나 최신 프레임워크(Vue, React.js와 같은)를 잘 모르는 상태에서 공부한다는 생각으로 한땀한땀 만들어봤다. 다시 삽질하지 않기 위해서 개발한 내용과 기억해야 할 부분들을 작성해 봤다. 내용이 길어서 백엔드와 프론트엔드 두 부분으로 나누어서 포스팅한다.

> 본 블로그의 모든 포스트는 **macOS** 환경에서 테스트 및 작성되었습니다.  

### 소스 공유
소스는 다음 [깃헙 저장소](https://github.com/MangDan/meetup-handson-env)에서 확인할 수 있다.

### 개발 프레임워크, DB, 인증
* Frontend Framework: Vue + Vuetify + Vuex
* Backend Framework: Spring Boot + JPA
* Database: Oracle
* Security: JWT (Json Web Token)

### 백엔드 서비스 설명
내용은 각 실습 참석자들이 실습에 사용하기 위한 환경 정보를 데이터베이스에서 처리하기 위한 서비스를 만들었다. 추가적으로 관리자 기능을 추가했는데, 관리자의 경우는 JWT 토큰을 사용해서 인증하는 방식을 사용했다. SpringBoot + JPA + Oracle 조합으로 개발했으며, 모든 데이터는 REST/JSON 으로 통신한다.

### Spring Boot 프로젝트 구조 및 소스 설명
```
.
├── pom.xml
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── oracle
│   │   │           ├── MeetupEnvApplication.java
│   │   │           └── meetup
│   │   │               ├── auth
│   │   │               │   └── config
│   │   │               │       ├── JwtAuthenticationEntryPoint.java
│   │   │               │       ├── JwtTokenUtil.java
│   │   │               │       └── WebSecurityConfig.java
│   │   │               ├── controller
│   │   │               │   ├── HandsOnEnvController.java
│   │   │               │   └── JwtAuthenticationController.java
│   │   │               ├── dto
│   │   │               │   ├── JwtRequest.java
│   │   │               │   ├── JwtResponse.java
│   │   │               │   ├── RefreshTokenDTO.java
│   │   │               │   └── UserDTO.java
│   │   │               ├── filter
│   │   │               │   ├── CorsFilter.java
│   │   │               │   └── JwtRequestFilter.java
│   │   │               ├── jpa
│   │   │               │   ├── HandsOnEnvRepository.java
│   │   │               │   ├── RefreshTokenRepository.java
│   │   │               │   └── UserRepository.java
│   │   │               ├── repository
│   │   │               │   └── entity
│   │   │               │       ├── HandsOnEnv.java
│   │   │               │       ├── RefreshTokenDAO.java
│   │   │               │       └── UserDAO.java
│   │   │               └── service
│   │   │                   ├── JwtAuthenticationService.java
│   │   │                   └── JwtUserDetailsService.java
│   │   └── resources
│   │       ├── application-oracle.properties
│   │       └── application.properties
```

#### Entity (DAO)
- HandsOnEnv.java  ---> 실습 환경 목록
- RefreshTokenDAO.java  ---> 관리자의 JWT Refresh Token을 저장
- UserDAO.java    ---> 관리자 저장 (Username, Password(암호화))

#### Repository
HandsOnEnvRepository.java
```java
/** 
* Username과 Email을 이용해서 사용자 조회
* Email 중복 등록 방지 목적
*/
@Repository
public interface HandsOnEnvRepository extends JpaRepository<HandsOnEnv, Integer> {
    public HandsOnEnv findByUsernameAndEmail(String username, String email);
}
```

RefreshTokenRepository.java
```java
/** 
* Username과 Refresh Token을 이용한 조회
* Refresh Token을 DB에 저장된 Refresh Token과 비교하여 검증
*/
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenDAO, String> {
    Optional<RefreshTokenDAO> findByUsernameAndRefreshToken(String username, String refreshToken);
}
```

UserRepository.java
```java
/** 
* Username으로 사용자 조회
* 사용자 조회, 등록된 사용자가 존재하는지 여부 확인
*/
@Repository
public interface UserRepository extends JpaRepository<UserDAO, Integer> {
    UserDAO findByUsername(String username);

    long countByUsername(String username);
}
```

#### DTO
- UserDTO.java  ---> 사용자(관리자)의 username과 password 정보를 담는다.
- RefreshTokenDTO.java ---> Refresh Token에 대한 검증을 위해 필요한 정보 (username, refresh token)를 담는다.
- JwtResponse.java ---> Token 정보 (Access Token, Refresh Token, Expires_in: 만료시까지 남은 시간(초), ErrorCode, ErrorMessage)

#### Filter
Filter는 Cors 설정을 위한 Filter와 JWT를 위한 필터가 있다. Cors Filter에는 모든 Origin과 Method를 허용하며, 토큰의 경우 Head Parameter 를 X-Authorization으로 받을것이므로 X-Authorization와 x-authorization도 포함했다.

CorsFilter.java
```java
@Component
public class CorsFilter implements javax.servlet.Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletResponse res = (HttpServletResponse) response;
        HttpServletRequest req = (HttpServletRequest) request;

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "HEAD, GET, POST, DELETE, PUT, OPTIONS, PATCH");
        res.setHeader("Access-Control-Expose-Headers", "X-Authorization, Authorization, X-Total-Count, Link");
        res.setHeader("Access-Control-Allow-Headers",
"Origin, X-Requested-With, Content-Type, Cache-Control, Accept, Accept-Encoding, Accept-Language, Host, Referer, Connection, User-Agent, authorization, x-authorization, sw-useragent, sw-version");

        if (req.getMethod().equals("OPTIONS")) {
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        chain.doFilter(request, response);
    }
}
```

JwtRequestFilter.java
```java
/**
* 토큰의 Claim 안에 User 정보를 가져와서 DB에 존재하는지 조회
* X-Authorization 헤더에 있는 토큰을 가져와서 검증, 사용자와 Token Expire 여부 조회
*/
@Component
public class JwtRequestFilter extends OncePerRequestFilter {
    static final String JWT_TOKEN_HEADER_PARAM = "X-Authorization";

    @Autowired
    private JwtUserDetailsService jwtUserDetailsService;
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        final String requestTokenHeader = request.getHeader(JWT_TOKEN_HEADER_PARAM);
        String username = null;
        String jwtToken = null;
        // JWT Token is in the form "Bearer token". Remove Bearer word and get only the Token
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);

            try {
                username = jwtTokenUtil.getUsernameFromToken(jwtToken);
            } catch (IllegalArgumentException e) {
                System.out.println("Unable to get JWT Token");
            } catch (ExpiredJwtException e) {
                System.out.println("JWT Token has expired");
            }
        } else {
            logger.warn("JWT Token does not begin with Bearer String");
        }
        // Once we get the token validate it.
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.jwtUserDetailsService.loadUserByUsername(username);
            // if token is valid configure Spring Security to manually set authentication
            if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                // After setting the Authentication in the context, we specify
                // that the current user is authenticated. So it passes the
                // Spring Security Configurations successfully.

 SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        chain.doFilter(request, response);
    }
}
```

#### Utility
Access Token, Refresh Token, Claims 및 토큰 검증을 위한 JWT 유틸리티

JwtTokenUtil.java
```java
/**
* 토큰의 Claim 안에 User 정보를 가져와서 DB에 존재하는지 조회
* X-Authorization 헤더에 있는 토큰을 가져와서 검증, 사용자와 Token Expire 여부 조회
*/
@Component
public class JwtTokenUtil implements Serializable {
    private static final long serialVersionUID = -2550185165626007488L;
    public static final long JWT_TOKEN_VALIDITY = 1 * (30 * 60); // 30m
    // public static final long JWT_TOKEN_VALIDITY = 10; // 1 min
    public static final long JWT_REFRESH_TOKEN_VALIDITY = 2 * (60 * 60 * 24); // 2 days

    @Value("${jwt.secret}")
    private String secret;

    // retrieve username from jwt token
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    // retrieve expiration date from jwt token
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    // retrieve expiration date from jwt token
    public String getExpiresIn(String token) {
        // System.out.println(Math.abs(getClaimFromToken(token,
        // Claims::getExpiration).getTime()
        // - new Date(System.currentTimeMillis()).getTime()));
        return Long.toString(Math.abs(getClaimFromToken(token, Claims::getExpiration).getTime() - new Date(System.currentTimeMillis()).getTime()) / 1000);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    // for retrieveing any information from token we will need the secret key
    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
    }

    // check if the token has expired
    public Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    // generate token for user
    public String generateToken(UserDetails userDetails) throws Exception {
        Map<String, Object> claims = new HashMap<>();
        return doGenerateToken(claims, userDetails.getUsername());
    }

    // generate token for user
    public String generateToken(String username) throws Exception {
        Map<String, Object> claims = new HashMap<>();
        return doGenerateToken(claims, username);
    }

    // generate refresh token for user
    public String generateRefreshToken(UserDetails userDetails) throws Exception {
        Map<String, Object> claims = new HashMap<>();
        return doGenerateRefreshToken(claims, userDetails.getUsername());
    }

    // generate refresh token for user
    public String generateRefreshToken(String username) throws Exception {
        Map<String, Object> claims = new HashMap<>();
        return doGenerateRefreshToken(claims, username);
    }

// while creating the token -
// 1. Define claims of the token, like Issuer, Expiration, Subject, and the ID
// 2. Sign the JWT using the HS512 algorithm and secret key.
// 3. According to JWS Compact
// Serialization(https://tools.ietf.org/html/draft-ietf-jose-json-web-signature-41#section-3.1)
// compaction of the JWT to a URL-safe string
    private String doGenerateToken(Map<String, Object> claims, String subject) throws Exception {
        return Jwts.builder().setClaims(claims).setSubject(subject).setIssuedAt(new Date(System.currentTimeMillis())).setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY * 1000)).signWith(SignatureAlgorithm.HS512, secret).compact();
    }

    private String doGenerateRefreshToken(Map<String, Object> claims, String subject) throws Exception {
        return Jwts.builder().setClaims(claims).setSubject(subject).setIssuedAt(new Date(System.currentTimeMillis())).setExpiration(new Date(System.currentTimeMillis() + JWT_REFRESH_TOKEN_VALIDITY * 1000)).signWith(SignatureAlgorithm.HS512, secret).compact();
    }

    // validate token
    public Boolean validateToken(String token, UserDetails userDetails) {
        // InvalidTokenException
        final String username = getUsernameFromToken(token);

        // if (!username.equals(userDetails.getUsername()))
        // throw new InvalidClaimException("");

        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
```

#### WebSecurity
Spring Security의 웹 보안 적용, configureGlobal에서 AuthenticationManagerBuilder를 주입 받는다. auth(AuthenticationManagerBuilder)를 이용해서 AuthenticationManager를 설정한다. 여기서는 UserDetailService를 이용하는데, DB에 저장된 사용자 정보를 이용해서 인증하기 위함이다. UserDetailService를 사용하기 위해서는 UserDetailService 인터페이스를 상속받아서 구현한 후 AuthenticationManagerBuilder에 전달해서 AuthenticationManager와 연결해줘야 한다. 여기서는 JwtUserDetailsService으로 구현해서 연결해 줬다.

WebSecurityConfig.java
```java
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    public static final String FORM_BASED_SIGNUP_ENTRY_POINT = "/api/auth/register";
    public static final String FORM_BASED_LOGIN_ENTRY_POINT = "/api/auth/login";
    public static final String NORMAL_USER_ENTRY_POINT = "/api/v1/meetup/**";
    public static final String TOKEN_BASED_AUTH_ENTRY_POINT = "/api/v1/admin/**";
    public static final String TOKEN_REFRESH_ENTRY_POINT = "/api/auth/token";

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    @Autowired
    private UserDetailsService jwtUserDetailsService;
    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        // configure AuthenticationManager so that it knows from where to load
        // user for matching credentials
        // Use BCryptPasswordEncoder
        auth.userDetailsService(jwtUserDetailsService).passwordEncoder(passwordEncoder());
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Override
    protected void configure(HttpSecurity httpSecurity) throws Exception {
        // cors
        httpSecurity.csrf().disable()
        // dont authenticate this particular request
        .authorizeRequests().antMatchers(FORM_BASED_LOGIN_ENTRY_POINT, FORM_BASED_SIGNUP_ENTRY_POINT,
TOKEN_REFRESH_ENTRY_POINT, NORMAL_USER_ENTRY_POINT).permitAll().
        // all other requests need to be authenticated
        anyRequest().authenticated().and().
        // make sure we use stateless session; session won't be used to
        // store user's state.
exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint).and().sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
.addFilterBefore(new CorsFilter(), ChannelProcessingFilter.class);
    }
}
```

#### Service
사용자(관리자) 조회, 사용자 저장, Refresh Token 저장, 사용자 존재 여부 확인 

JwtUserDetailsService.java
```java
@Service
public class JwtUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder bcryptEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        UserDAO user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), new ArrayList<>());
    }

    public long userCount(String username) {
        return userRepository.countByUsername(username);
    }

    public UserDAO save(UserDTO user) {
        UserDAO newUser = new UserDAO();
        newUser.setUsername(user.getUsername());
        newUser.setPassword(bcryptEncoder.encode(user.getPassword()));
        return userRepository.save(newUser);
    }

    public RefreshTokenDAO saveRefreshToken(RefreshTokenDAO refreshToken) {
        RefreshTokenDAO newRefreshTokenDAO = new RefreshTokenDAO();
        newRefreshTokenDAO.setUsername(refreshToken.getUsername());
        newRefreshTokenDAO.setRefreshToken(refreshToken.getRefreshToken());
        return refreshTokenRepository.save(refreshToken);
    }
}
```

#### Controller
실습 환경 리스트 및 정보를 REST/JSON으로 제공

HandsOnEnvController.java
```java
@RestController
@EnableAutoConfiguration
@CrossOrigin("*")
public class HandsOnEnvController {

    @Autowired
    HandsOnEnvRepository handsOnEnvRepository;

    Logger logger = LoggerFactory.getLogger(HandsOnEnvController.class);
    
    // 실습 환경 목록을 JSON으로 반환
    @RequestMapping(value = "/api/v1/meetup/envs", method = RequestMethod.GET)
    public List<HandsOnEnv> envs(Sort sort) throws Exception {
        List<HandsOnEnv> handsOnEnv = handsOnEnvRepository.findAll(sort);
        return handsOnEnv;
    }
    
    // 참석자가 실습 환경 신청을 한다. 
    @PostMapping(value = "/api/v1/meetup/env")
    public HandsOnEnv updateEnv(@RequestBody HandsOnEnv handsOnEnv) throws Exception {
        Optional<HandsOnEnv> handsOnEnvById = handsOnEnvRepository.findById(handsOnEnv.getNum());

        if (handsOnEnvById.isPresent()) {
            if (handsOnEnvById.get().getEmail() == null || handsOnEnvById.get().getEmail().isEmpty()) {
                return handsOnEnvRepository.save(handsOnEnv);
            } else {
                throw new Exception(handsOnEnvById.get().getUsername() + "님이 이미 등록하였습니다.");
            }
        } else {
            throw new Exception("Please submit with other email.");
        }
    }

    // 실습 환경 삭제 (관리자만, 토큰 필요)
    @RequestMapping(value = "/api/v1/admin/meetup/env/{num}", method = RequestMethod.DELETE)
    public void removeEnv(@PathVariable("num") int num) throws Exception {
        handsOnEnvRepository.deleteById(num);
    }

    // 실습 환경을 ID로 조회
    @RequestMapping(value = "/api/v1/meetup/env/{num}", method = RequestMethod.GET)
    public Optional<HandsOnEnv> getEnvById(@PathVariable("num") int num) throws Exception {
        return handsOnEnvRepository.findById(num);
    }

    // Username과 Email로 실습 환경 조회
    @RequestMapping(value = "/api/v1/meetup/env", method = RequestMethod.GET)
    public HandsOnEnv getEnv(@RequestParam("username") String username, @RequestParam("email") String email) throws Exception {
        return handsOnEnvRepository.findByUsernameAndEmail(username, email);
    }

    public static void main(String[] args) {
        SpringApplication.run(HandsOnEnvController.class, args);
    }
}
```

인증, 사용자(관리자) 등록, Access Token 검증, Refresh Token으로 Access Token 발급

JwtAuthenticationController.java
```java
@RestController
@CrossOrigin("*")
public class JwtAuthenticationController {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    @Autowired
    private JwtUserDetailsService userDetailsService;
    @Autowired
    private JwtAuthenticationService jwtAuthenticationService;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    // 최초 로그인 시 Access Token과 Refresh Token을 발급 받는다.
    @RequestMapping(value = "/api/auth/login", method = RequestMethod.POST)
    public ResponseEntity<?> createAuthenticationToken(@RequestBody UserDTO authenticationRequest) throws Exception {
        authenticate(authenticationRequest.getUsername(),authenticationRequest.getPassword());
        userDetailsService.loadUserByUsername(authenticationRequest.getUsername());

    return ResponseEntity.ok(jwtAuthenticationService.getTokens(authenticationRequest.getUsername()));
    }

    // Access Token이 만료되었을 경우 Refresh Token을 활용하여 신규 Access Token과 Refresh Token을 재발급한다.
    @RequestMapping(value = "/api/auth/token", method = RequestMethod.POST)
    public ResponseEntity<?> createAuthenticationTokenByRefreshToken(@RequestBody     Map<String, Object> data) throws Exception {

        String username = (data.get("username") == null ? "" : (String) data.get("username"));
        String refreshToken = (data.get("refresh_token") == null ? "" : (String) data.get("refresh_token"));


        Optional<RefreshTokenDAO> verifiedRefreshTokenDAO = refreshTokenRepository
.findByUsernameAndRefreshToken(username, refreshToken);

        if (verifiedRefreshTokenDAO.isPresent()) {
            return ResponseEntity.ok(jwtAuthenticationService.getTokens(verifiedRefreshTokenDAO.get().getUsername()));
        } else {
            return ResponseEntity.ok(new JwtResponse(null, null, null, "502", "INVALID_REFRESH_TOKEN"));
        }
    }
    
    // Access Token의 Claims 정보를 반환한다.
    @RequestMapping(value = "/api/auth/claims", method = RequestMethod.POST)
    public ResponseEntity<?> getAllClaimsFromToken(@RequestHeader(value = "X-Authorization") String access_token, @RequestBody Map<String, Object> data) throws Exception {
    String username = (data.get("username") == null ? "" : (String) data.get("username"));

    if (access_token.startsWith("Bearer")) {
        access_token = access_token.substring(7);
    }

    // Claims claims = jwtTokenUtil.getAllClaimsFromToken(access_token);

    if (!username.equals(""))
        return ResponseEntity.ok(jwtTokenUtil.getAllClaimsFromToken(access_token));
    else
        throw new UsernameNotFoundException("Username not found!!!");
    }

    // 신규 사용자를 등록한다.이 때 Refresh Toke도 같이 저장한다.
    @RequestMapping(value = "/api/auth/register", method = RequestMethod.POST)
    public ResponseEntity<?> saveUser(@RequestBody UserDTO user) throws Exception {

        long userCount = userDetailsService.userCount(user.getUsername());

        if (userCount > 0) {
            throw new Exception("Sorry... Already username taken!");
        }

        userDetailsService.save(user);    // 사용자 저장
        return ResponseEntity.ok(jwtAuthenticationService.getTokens(user.getUsername()));
    }

    // 인증
    private void authenticate(String username, String password) throws Exception {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
    }
}
```

#### Spring Boot 서비스 시작
```shell
$ cd meetup-handson-env-backend
$ mvn spring-boot:run
```

#### REST 서비스
실습 환경 리스트 반환
> http://localhost:8000/api/v1/meetup/envs?sort=num,asc
```json
==응답==
[{"num":1,"osuser":"user1","username":"오라클","email":"oracle123@oracle.com","tenant":"meetup101","region":"ap-seoul-1","cloud_account":"oracle.testa1@gmail.com","cloud_account_pw":"Welcome123##","handson_doc_url":"https://github.com/MangDan/meetup-200118-iac","key_download_url":"https://objectstorage.ap-seoul-1.oraclecloud.com/p/q5QvhgdGpV5hakDgZXzjS-acLFR8oa3knciiVSS8CPg/n/apackrsct01/b/bucket-20190614-1639/o/sshkeys.zip","env_ip":"132.145.82.236","env_name":"handson-1"},{"num":2,"osuser":"user2","username":"아무게","email":"a@a.com","tenant":"meetup102","region":"ap-seoul-1","cloud_account":"datatwin2019@gmail.com","cloud_account_pw":"Welcome123##","handson_doc_url":"https://github.com/MangDan/meetup-200118-iac","key_download_url":"https://objectstorage.ap-seoul-1.oraclecloud.com/p/q5QvhgdGpV5hakDgZXzjS-acLFR8oa3knciiVSS8CPg/n/apackrsct01/b/bucket-20190614-1639/o/sshkeys.zip","env_ip":"132.145.82.236","env_name":"handson-1"},{"num":3,"osuser":"user3","username":null,"email":null,"tenant":"meetup103","region":"ap-seoul-1","cloud_account":"datatwin2020@gmail.com","cloud_account_pw":"Welcome123##","handson_doc_url":"https://github.com/MangDan/meetup-200118-iac","key_download_url":"https://objectstorage.ap-seoul-1.oraclecloud.com/p/q5QvhgdGpV5hakDgZXzjS-acLFR8oa3knciiVSS8CPg/n/apackrsct01/b/bucket-20190614-1639/o/sshkeys.zip","env_ip":"132.145.82.236","env_name":"handson-1"}
...
]
```

실습자가 환경 요청 (이름과 이메일 업데이트)
> http://140.238.20.170:8000/api/v1/meetup/env
```json
==요청/응답==
{
    "num": 3,
    "osuser": "user3",
    "username": "홍길동",
    "email": "gildong.hong@oracle.com",
    "tenant": "meetup103",
    "region": "ap-seoul-1",
    "cloud_account": "datatwin2020@gmail.com",
    "cloud_account_pw": "Welcome123##",
    "handson_doc_url": "https://github.com/MangDan/meetup-200118-iac",
    "key_download_url": "https://objectstorage.ap-seoul-1.oraclecloud.com/p/q5QvhgdGpV5hakDgZXzjS-acLFR8oa3knciiVSS8CPg/n/apackrsct01/b/bucket-20190614-1639/o/sshkeys.zip",
    "env_ip": "132.145.82.236",
    "env_name": "handson-1"
}
```

번호로 실습 환경 조회
> http://140.238.20.170:8000/api/v1/meetup/env/3
```json
==응답==
{
    "num": 3,
    "osuser": "user3",
    "username": "홍길동",
    "email": "gildong.hong@oracle.com",
    "tenant": "meetup103",
    "region": "ap-seoul-1",
    "cloud_account": "datatwin2020@gmail.com",
    "cloud_account_pw": "Welcome123##",
    "handson_doc_url": "https://github.com/MangDan/meetup-200118-iac",
    "key_download_url": "https://objectstorage.ap-seoul-1.oraclecloud.com/p/q5QvhgdGpV5hakDgZXzjS-acLFR8oa3knciiVSS8CPg/n/apackrsct01/b/bucket-20190614-1639/o/sshkeys.zip",
    "env_ip": "132.145.82.236",
    "env_name": "handson-1"
}
```

username과 이메일로 실습 환경 조회
> http://140.238.20.170:8000/api/v1/meetup/env?username=홍길동&email=gildong.hong@oracle.com
```json
==응답==
{
    "num": 3,
    "osuser": "user3",
    "username": "홍길동",
    "email": "gildong.hong@oracle.com",
    "tenant": "meetup103",
    "region": "ap-seoul-1",
    "cloud_account": "datatwin2020@gmail.com",
    "cloud_account_pw": "Welcome123##",
    "handson_doc_url": "https://github.com/MangDan/meetup-200118-iac",
    "key_download_url": "https://objectstorage.ap-seoul-1.oraclecloud.com/p/q5QvhgdGpV5hakDgZXzjS-acLFR8oa3knciiVSS8CPg/n/apackrsct01/b/bucket-20190614-1639/o/sshkeys.zip",
    "env_ip": "132.145.82.236",
    "env_name": "handson-1"
}
```

관리자 등록
> http://140.238.20.170:8000/api/auth/register
```json
==요청==
{"username":"admin1@oracle.com","password":"welcome1"}

==응답==
{
    "access_token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbjFAb3JhY2xlLmNvbSIsImV4cCI6MTU4MDc5OTI3MSwiaWF0IjoxNTgwNzk5MjYxfQ.WYVcf_TsT1fI_l5gZCxmf_PvpIlWzWY9-WpMlPIoq6yNtDBTHsnGqBt5tpwMtbHNoMcbiUCFKbNCXWBYcnqpKw",
    "refresh_token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbjFAb3JhY2xlLmNvbSIsImV4cCI6MTU4MDk3MjA2MSwiaWF0IjoxNTgwNzk5MjYxfQ.brEMrnW1918qQeCGkn7RkcGwlIBcR3nS_TLBDMSQjfulA0zHIx5QrkiBw6dCu8AmjU2kiGKISLB46wQ4b74oIA",
    "errorCode": "00",
    "errorMessage": "SUCCESS",
    "expires_in": "1799"
}
```

관리자 로그인
> http://localhost:8000/api/auth/login
```json
==요청==
{"username":"admin1@oracle.com","password":"welcome1"}

==응답==
{
    "access_token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbjFAb3JhY2xlLmNvbSIsImV4cCI6MTU4MDgwMTIzNSwiaWF0IjoxNTgwNzk5NDM1fQ.y6zKMNo1ii6NkGEnSB96izwYpqzKB_KhxsxSuZnKwXhR3OIfr63X3YZ9C6IzTjEpsn9e_JaTAANLkFO9hf50Ww",
    "refresh_token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbjFAb3JhY2xlLmNvbSIsImV4cCI6MTU4MDk3MjIzNSwiaWF0IjoxNTgwNzk5NDM1fQ.8tAV0KDv1HbHFPkDvgB-VdyN7Qwa9My0852iyoNnJcnFPtGsCOp8J-PUMwkjl9JZKUqAo1a8i8XWYer_ODUBtg",
    "errorCode": "00",
    "errorMessage": "SUCCESS",
    "expires_in": "1799"
}
```

Access Token으로 부터 디코딩된 Claim 정보 획득
> http://localhost:8000/api/auth/claims
```json
==요청==
{"username":"admin1@oracle.com"}

==응답==
{"sub":"admin1@oracle.com","exp":1580801235,"iat":1580799435}
```

실습환경 신규/업데이트/컬럼 업데이트
> http://localhost:8000/api/v1/admin/meetup/env/reset
```json
==요청/응답==
{
    "num": null,
    "osuser": "user51",
    "username": "",
    "email": "",
    "tenant": "meetup-local",
    "region": "ap-seoul-1",
    "cloud_account": "aaa@oracle.com",
    "cloud_account_pw": "Welcome123##",
    "handson_doc_url": "http://문서",
    "key_download_url": "aaa.key",
    "env_ip": "http://localhost",
    "env_name": "local"
}
```

Backend의 경우는 크게 어려움 없이 진행했지만, 몇가지 진행하면서 부딪혔던 문제들은 다음과 같다.
1. DAO에서 일부 값을 넘기지 않은 필드 (null)에 대해서 업데이트 시 항목에서 제외하고 싶은데...
> updatable = false, insertable = false 와 같이 주면 되겠지만, 경우에 따라서 값이 있을 경우와 없을 경우가 있는데 값이 없을 경우 (null 혹은 빈 값)에 JPA 업데이트에서 해당 컬럼을 제외하려면 어떻게 해야 하는건지 모르겠다. 직접 커스텀 쿼리를 만들어서 하면 될까? 

2. filter에서 발생하는 에러에 메시지를 달아서 클라이언트로 전달하는 방법
> JwsRequestFilter.java 에서 아래와 같이 Catch에서 Throw Exception("오류 이유")를 하고 싶은데, 클라이언트로 전달이 안된다. https://stackoverflow.com/questions/44040703/spring-how-to-make-a-filter-throw-a-custom-exception ==> 여기서는 Filter에서 처리는 어렵고, 오직 Controller와 Service에서 처리만 가능하다고 하는데... 
```java
if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
    jwtToken = requestTokenHeader.substring(7);


    try {
        username = jwtTokenUtil.getUsernameFromToken(jwtToken);
    } catch (IllegalArgumentException e) {
        System.out.println("Unable to get JWT Token");
    } catch (ExpiredJwtException e) {
        System.out.println("JWT Token has expired");
    }
...
```
Filter에서 발생하는 오류는 WebSecurityConfig에서 자동으로 JwtAuthenticationEntryPoint로 전달되고 여기서 응답으로 오류를 발생시키는데, 중요한건 Filter에서 발생한 오류의 정보를 JwtAuthenticationEntryPoint로 넘기는 방법을 찾지 못했다.
```java
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint, Serializable {
    private static final long serialVersionUID = -7858869558953243875L;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
        AuthenticationException authException) throws IOException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
    }
}
```