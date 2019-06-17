---
title:  "[Oracle Cloud] OCI-CLI 설치"
date:   2019-04-26 08:00
tags: ["Oracle Cloud"]
---

OCI-CLI는 Oracle Cloud Infrastructure 관리 기능을 제공하는 CLI 도구입니다.  
이번 포스팅에서는 OCI-CLI를 설치하고 구성하는 방법에 대해서 살펴보도록 하겠습니다.

> 본 블로그의 모든 포스트는 **macOS** 환경에서 테스트 및 작성되었습니다.  

### 설치
먼저 터미널을 열고 다음과 같이 입력해서 OCI-CLI를 설치합니다.  
Windows는 Powershell 에서 실행합니다.

MacOS, Linux, and Unix
```
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
```

Windows (관리자 모드로 Powershell 콘솔을 열고 실행)
```
Set-ExecutionPolicy RemoteSigned

powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.ps1'))"
```

설치가 시작되면 설치 경로를 입력하라고 나오는데, 기본 경로로 설치해도 되지만, 여기서는 다음과 같이 임의의 경로로 지정해서 설치했습니다.
```
* /Users/DonghuKim/Software/oracle/oci-cli
* /Users/DonghuKim/oracle/oci-cli-bin
* /Users/DonghuKim/oracle/oci-cli-bin/oci-cli-scripts
```

설치가 완료되면 bash_profile에 다음과 같은 내용이 추가됩니다.  
macOS 환경 기준이므로, Windows의 경우는 확인이 필요합니다.
```
[[ -e "/Users/DonghuKim/Software/oracle/oci-cli/lib/oracle-cli/lib/python3.6/site-packages/oci_cli/bin/oci_autocomplete.sh" ]] && source "/Users/DonghuKim/Software/oracle/oci-cli/lib/oracle-cli/lib/python3.6/site-packages/oci_cli/bin/oci_autocomplete.sh"
 
export PATH=/Users/DonghuKim/oracle/oci-cli-bin:$PATH
```

### 설정
oci 설치가 완료되면 Oracle Cloud 연결을 위한 정보를 셋업해야 합니다.  
아래 명령어를 실행합니다.

```
oci setup config
```

oci setup을 위해 몇가지 정보가 필요합니다.  
첫 번째는 oci config 저장 위치입니다. 저는 기본 경로로 지정했습니다.
```
/Users/{name}/.oci
```

두 번째는 User OCID와 Tenancy OCID가 필요합니다.  
Oracle Cloud Console에서 본인 계정에 대한 OCID와 Tenancy OCID를 확인한 후 동일하게 입력합니다.

User OCID
![](../assets/images/oci-user-ocid.png)

Tenancy OCID
![](../assets/images/oci-tenancy-ocid.png)

세 번째는 OCI 사용자 계정에 OCI API를 사용하기 위한 Public Key를 입력해야 합니다.

ssh-keygen으로 생성합니다.
```
ssh-keygen -t rsa
```
![](../assets/images/ssh-keygen2.png)

Public Key의 내용을 복사해서 OCI Console의 API Key에 Public Key를 등록합니다.
![](../assets/images/oci-add-public-key-for-api.png)

여기까지 OCI-CLI 설치 및 환경 구성을 모두 마쳤습니다.  
OCI-CLI를 통해서 간단하게는 Oracle Object Storage에 파일을 업로드 하는 것을 포함해서, 전반적인 Infra 관리를 할 수 있습니다.