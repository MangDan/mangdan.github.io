---
title:  "[Terraform] Terraform with OCI 2탄"
date:   2019-12-13 10:39
tags: ["Terraform", "OCI", "Infrastructure as Code"]
---

Oracle Cloud Infrastructure (이하 OCI)는 코드로 인프라를 관리하기 위한 도구로 Terraform을 지원합니다. Terraform을 로컬에 설치해서 사용할수도 있지만, OCI에서 UI로 제공하는 Resource Manager라는 기능을 통해서도 Terraform을 사용할 수 있습니다. 첫번째로 Terraform에 대해서 알아보고 기본적인 환경 구성을 해보도록 하겠습니다.

> 본 블로그의 모든 포스트는 **macOS** 환경에서 테스트 및 작성되었습니다.  

### 실제로 사용해보자!
Github을 통해서 Terraform Sample을 아래 Github Repository로 제공한다. URL로 접속해서 zip 파일로 다운로드 받거나, git이 설치되어 있을경우에는 git clone으로 다운로드 받는다.
> git clone https://github.com/MangDan/Infrastructure-as-Code

다운로드 받은 프로젝트 폴더의 구조는 다음과 같다.

```
.
├── oci
│   └── module_examples
│       ├── evn
│       │   ├── {tenancy}.{region}.tfvars
│       │   └── danskbb.ap-seoul-1.tfvars
│       ├── provider.tf
│       ├── main.tf
│       ├── vars.tf
│       ├── workspace
│       ├── modules
│       │   ├── adb
│       │   │   ├── main.tf
│       │   │   ├── datasources.tf
│       │   │   ├── vars.tf
│       │   │   └── outputs.tf
│       │   ├── compartment
│       │   │   ├── main.tf
│       │   │   ├── datasources.tf
│       │   │   ├── vars.tf
│       │   │   └── outputs.tf
│       │   ├── compute
│       │   │   ├── main.tf
│       │   │   ├── datasources.tf
│       │   │   ├── vars.tf
│       │   │   └── outputs.tf
│       │   ├── container
│       │   │   ├── main.tf
│       │   │   ├── datasources.tf
│       │   │   ├── vars.tf
│       │   │   └── outputs.tf
│       │   ├── dbsystem
│       │   │   ├── main.tf
│       │   │   ├── datasources.tf
│       │   │   ├── vars.tf
│       │   │   └── outputs.tf
│       │   ├── functions
│       │   │   ├── main.tf
│       │   │   ├── datasources.tf
│       │   │   ├── vars.tf
│       │   │   └── outputs.tf
│       │   ├── group
│       │   │   ├── main.tf
│       │   │   ├── datasources.tf
│       │   │   ├── vars.tf
│       │   │   └── outputs.tf
│       │   ├── policy
│       │   │   ├── main.tf
│       │   │   ├── datasources.tf
│       │   │   ├── vars.tf
│       │   │   └── outputs.tf
│       │   └── vcn
│       │       ├── main.tf
│       │       ├── datasources.tf
│       │       ├── vars.tf
│       │       └── outputs.tf
│       └── run_tf.sh
└──
```

...