---
title:  "[Terraform] Terraform with OCI"
date:   2019-12-13 10:39
tags: ["Terraform", "OCI", "Infrastructure as Code"]
---

Oracle Cloud Infrastructure (이하 OCI)는 코드로 인프라를 관리하기 위한 도구로 Terraform을 지원한다. Terraform을 로컬에 설치해서 사용할수도 있지만, OCI에서 UI로 제공하는 Resource Manager라는 기능을 통해서도 Terraform을 사용할 수 있다. 여기서는 로컬에 Terraform을 구성하고, 일부 리소스를 직접 프로비저닝을 해본다.

> 본 블로그의 모든 포스트는 **macOS** 환경에서 테스트 및 작성되었습니다.  

### Terraform
Terraform은 Hashicorp에서 개발한 인프라스트럭처 관리를 위한 오픈소스 소프트웨어로, 인프라스트럭처를 코드로서 관리 및 프로비저닝하는 개념인 Ifrastructure as Code (IaC)를 지향하는 도구라고 볼 수 있다. Terraform에서는 HCL(Hachicorp Configuration Language)라는 설정 언어를 이용해서 인프라스트럭처를 정의한다.

OCI에 대한 Terraform Provider에 대한 가이드는 아래 페이지를 참고한다.
> https://www.terraform.io/docs/providers/oci/index.html

***

### Terraform 설치
macOS에서는 간단히 Homebrew를 사용해서 설치할 수 있다.
```
$ brew install terraform
```

Windows에서의 설치는 아래 페이지를 참조한다.
> https://www.vasos-koupparis.com/terraform-getting-started-install/

### HCL(Hachicorp Configuration Language)
Terraform에서는 HCL(Hachicorp Configuration Language)이라는 설정 언어를 사용해서 정의한다. JSON 형식도 지원히지만, 일반적으로 HCL을 더 선호하는 편이며, 여기서는 HCL을 사용해서 작성한다.

#### Resources and Modules
HCL에서는 생성할 자원들을 Resource로 정의하며, 이러한 Resource들을 그룹으로 묶어서 관리하는 Module이라는 개념이 있다. Module은 의무적으로 사용할 필요는 없고 특정 Resource들을 그룹으로 묶어서 관리하고자 할 경우 사용하면 된다. 

#### Blocks
HCL의 가장 기본적인 형태다. HCL에서는 하나의 문장 단위를 Block이라 부른다. Block은 Block Type, Block Lable, Block Body (Identifier, Argument, expression 등으로 이뤄진다.)

```terraform
resource "aws_vpc" "main" {
  cidr_block = var.base_cidr_block
}

<BLOCK TYPE> "<BLOCK LABEL>" "<BLOCK LABEL>" {
  # Block body
  <IDENTIFIER> = <EXPRESSION> # Argument
}
```

Block Type은 해당 Block이 어떤 역할을 하는지 구분해주는 것으로 블록의 역할에 따라 provider, resource, data, variable, output등이 있다. expression은 해당 블록에 전달하기 위한 Argument를 표현하며, 다양한 수식과 문법, 타입을 제공한다. Expression에 대한 자세한 내용은 아래 가이드르 참조한다.
> https://www.terraform.io/docs/configuration/expressions.html

### Workspace
Terraform에서는 여러개의 서로 다른 환경별로 코드를 공유해서 사용할 수 있는 Workspace라는 기능을 제공한다. 이 기능은 Terraform을 실행하고 나오는 결과인 .tfstate 파일을 각 환경별로 구분해서 관리해준다. 이 기능을 잘 활용하면 여러 클라우드 환경에 동시에 프로비저닝할 수도 있다. (쉘등을 활용, 뒤에서 간단히 소개)

### .tfstate
???



### Terraform Provider와 환경 설정
가장 기본이 되는 Block Type인 provider를 우선 정의한다. 각 벤더별로 Provider 구성 방법이 있는데 자세한 내용은 아래 페이지를 참조한다.
> https://www.terraform.io/docs/providers/index.html

아래는 OCI Provider에 대한 내용이다. 이렇게 작성한 후 provider.tf 라는 이름으로 저장한다.
> 파일 이름에 대한 규칙이 따로 있는것은 아니다. Terraform은 파일내에 정의된 Block Type으로 판단한다. 단, 파일의 확장자는 .tf로 지정해야 한다. 파일 이름은 단지 가시성 확보 차원에서만 필요하다.

```terraform
provider "oci" {
  tenancy_ocid     = "${var.tenancy_ocid}"
  user_ocid        = "${var.user_ocid}"
  fingerprint      = "${var.fingerprint}"
  private_key_path = "${var.private_key_path}"
  region           = "${var.region}"
}
```
oci provider를 정의했는데, 5개의 변수를 사용하고 있다. 각 변수 선언은 variable 이라는 Block Type을 사용해서 작성한다. 파일 이름은 vars.tf로 해서 provider.tf와 같은 폴더 위치(프로젝트 폴더)에 저장한다.
> Terraform은 특정 디렉토리에 있는 모든 .tf 파일을 읽어서 리소스를 생성, 수정, 삭제 작업을 진행한다. 여러개의 .tf 파일이 있다 하더라도 실행 순서를 따로 정의하지 않는데, 각 정의된 리소스가 서로 간접적으로 의존관계가 생기며, 이런 의존 관계를 바탕으로 실행 순서를 결정한다.

```terraform
variable "tenancy_ocid" {}
variable "user_ocid" {}
variable "fingerprint" {}
variable "private_key_path" {}
variable "region" {}
```

Provider에서 사용할 변수가 선언되어 있는데, 각 편수에 기본값을 직접 할당할 수도 있지만, 보통 환경 변수를 활용하거나, .tfvars 파일을 만들어서 관리할 수 있다. 환경 변수로 설정할 경우는 아래 내용을 ~/.bash_profile에 다음과 같이 설정하고 다시 적용한다.

```shell
export TF_VAR_tenancy_ocid=<value>
export TF_VAR_user_ocid=<value>
export TF_VAR_fingerprint=<value>
export TF_VAR_private_key_path=<value>
export TF_VAR_region=<value>
```

```shell
$ source ~/.bas_profile
```

.tfvars 라는 파일을 이용할수도 있는데 사용법은 다음과 같다. 우선 vars.tfvars 파일을 만든 후 다음과 같이 추가한다.
> tenancy_ocid, user_ocid, fingerprint, private_key_path, region등의 정보 획득은 [[Oracle Cloud] OCI-CLI 설치](https://mangdan.github.io/oci-cli-install/) 를 참고한다.

```terraform
tenancy_ocid     = <value>
user_ocid        = <value>
fingerprint      = <value>
private_key_path = <value>
region           = <value>
```

Terraform에서 .tfvars를 사용할 경우 실행 시 다음과 같이 옵션을 지정해준다. 아래는 plan을 실행할 때 vars.tfvars 환경 변수 파일을 사용한 예시이다.
```
$ terraform plan -var-file=vars.tfvars
```

### Terraform Init
Provider와 변수 설정이 완료되면 Terraform 초기화를 하는데, 구성한 Provider 설정으로 관련 플러그인을 .terraform 경로에 다운로드 받는다. Module 혹은 Workspace를 사용한 경우에도 관련된 필요한 파일을 .terraform 폴더에 생성한다. 뒤에 다시 언급하겠지만, Module을 추가할 때마다 초기화를 해줘야 한다. 초기화는 .tf 파일들이 있는 폴더에서 다음 명령어를 입력하면 된다.

```terraform
$ terraform init
```

명령어를 실행하면 해당 폴더에 .terraform 폴더가 생성되며, plugins 폴더가 생성된다. terraform-provider-oci_v3.54.0_x4 즉 oci terraform plugin 버전이 3.54.0 인 것을 알수 있다.

```
drwxr-xr-x  3 DonghuKim  staff        96 12  4 18:31 ..
-rwxr-xr-x  1 DonghuKim  staff  79132160 12  4 18:31 terraform-provider-oci_v3.54.0_x4
-rwxr-xr-x  1 DonghuKim  staff  25457368 12  4 18:31 terraform-provider-random_v2.2.1_x4
drwxr-xr-x  6 DonghuKim  staff       192 12 12 16:51 .
-rwxr-xr-x  1 DonghuKim  staff  23091640 12 12 16:51 terraform-provider-null_v2.1.2_x4
-rwxr-xr-x  1 DonghuKim  staff       237 12 12 16:51 lock.json
```

### Terraform plan
plan 명령어는 현재 정의되어있는 리소스들을 해당 프로바이더에 적용했을 때 Terraform에 의해서 수행될 작업에 대한 계획을 보여준다. .tf의 내용을 기반으로 구성 내용에 대한 유효성 검사및 리소스 생성, 수정, 삭제할 리소스들이 잘 반여될 수 있는지를 현재의 인프라 상태와 비교해서 보여준다. plan을 통해서 실제 인프라에 영향을 주지 않으면서, 어떤 내용들이 변화되고 영향을 받는지 알 수 있다.
실행 명령은 다음과 같다.

```
$ terraform plan

$ terraform plan -var-file=vars.tfvars # tfvars 파일을 사용한 경우
```

### Terraform apply
plan을 통해서 예상한 plan 결과를 확인하게 되면, 실제 반영을 해서 인프라의 정보를 구성 파일(.tf)의 정보와 일치되도록 실제 인프라에 반영하는데 이 과정이 apply다. 실행 명령은 다음과 같다. apply를 실행하면 중간에 approve 하는 과정이 있는데, apply를 실행한 후에 plan 결과를 먼저 보여준 후 그 결과에 대해 승인(yes)해야 apply를 진행한다.
> apply를 실행할 때 다음 옵션을 통해 auto approve를 할 수 있다.  
> ```
> $ terraform apply --auto-approve
> ```

```
$ terraform apply

$ terraform apply -var-file=vars.tfvars # tfvars 파일을 사용한 경우
```

### workspace 생성/선택/삭제
앞서 설명한 workspace를 생성, 목록, 선택, 삭제하는 명령어이다. new 명령어로 프로젝트 폴더에서 workspace를 생성하면 **terraform.tfstate.d** 폴더가 자동으로 생성되며, 하위에 workspace 이름으로 폴더가 생성된다. 각 workspace 폴더안에 .tfstate 파일이 생성된다.

```
$ terraform workspace new <workspace 이름> # workspace 생성

$ terraform workspace list # workspace 목록

$ terraform workspace select <workspace 이름> # workspace 선택

$ terraform workspace delete <workspace 이름> # workspace 삭제

$ terraform workspace show # 현재 선택된 workspace 보기
```

### 실제로 사용해보자!
Github을 통해서 Terraform Sample을 아래 Github Repository로 제공한다. URL로 접속해서 zip 파일로 다운로드 받거나, git이 설치되어 있을경우에는 git clone으로 다운로드 받는다.
> git clone https://github.com/MangDan/Infrastructure-as-Code

다운로드 받은 프로젝트 폴더의 구조는 다음과 같다.

```
.
├── helloworld-func-{unique-value}
│   ├── func.yaml
│   ├── pom.xml
│   └── src
│       └── main/java/com/example/fn
│           └── HelloFunction.java
│       └── test/java/com/example/fn
│           └── HelloFunctionTest.java
└──
```

...