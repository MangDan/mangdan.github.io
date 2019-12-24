---
title:  "[Terraform] Terraform with OCI 1탄"
date:   2019-12-24 22:34
tags: ["Terraform", "OCI", "Infrastructure as Code"]
---

Oracle Cloud Infrastructure (이하 OCI)는 코드로 인프라를 관리하기 위한 도구로 Terraform을 지원합니다. Terraform을 로컬에 설치해서 사용할수도 있지만, OCI에서 UI로 제공하는 Resource Manager라는 기능을 통해서도 Terraform을 사용할 수 있습니다. 첫번째로 Terraform에 대해서 알아보고 기본적인 환경 구성을 해보도록 하겠습니다.

> 본 블로그의 모든 포스트는 **macOS** 환경에서 테스트 및 작성되었습니다.  

### Infrastructure as Code?
Infrastructure as Code (이하 IaC)는 인프라의 리소스인 네트워크 자원(예: 로드발란서), 컴퓨트(VM, 베어메탈등), 스토리지(오브젝트 스토리지, 블록 볼륨등)을 각 클라우드 벤더에서 제공하는 GUI에서 클릭으로 생성하는 방식이 아닌 구성 파일과 이를 실행하기 위한 코드(일종의 스크립트)를 활용하여 인프라 리소스를 자동으로 처리하는 방식으로 **인프라를 코드화** 하는 개념입니다. 간단한 리소스 관리는 GUI를 통해 충분히 쉽게 구성 가능하지만, 점점 인프라의 환경이 복잡해지면 휴먼 에러도 생기고, 관리에 많은 시간적 비용이 발생하기 때문에 이러한 인프라 자동화 기법이 생기게 되었습니다. 인프라 사용자들, 특히 개발자들에게 익숙한 코드를 사용하여, 직접 필요한 리소스들을 패키징해서 한번에 빠르게 구성하여 운영하고 파기할 수 있기 때문에 요즘 개발자들이 꼭 갖춰야 하는 DevOps에 반드시 필요한 요소라고 볼 수 있습니다. Infrastructure as Code를 지향하는 여러 관점의 다양한 도구들이 있는데, 여기서는 인프라 리소스 관리 및 프로비저닝에 효과적인 도구인 Terraform을 사용합니다.

<!--
### Without IaC
IaC가 없다면 여러가지 인프라 리소스 관리, 프로비저닝 작업을 한땀한땀 클릭 및 메뉴얼 구성을 해야 하는데, 이런 경우 보통 발생하는 문제 혹은 실수의 예는 다음과 같다.

* Human Errors
* Taking a long time to 
* 


서버 교체 시 AWS 인스턴스에 Block Storage를 Mount 하는것을 깜빡하여 용량 부족으로 인스턴스가 죽음
방화벽 포트 관리 실수로 인스턴스간 네트워크 오류 발생
약 10여대의 인스턴스로 이루어진 분산 스토리지 시스템을 SSH로 일일이 접속하여 배포하는 과정에서 주요 스텝을 빠뜨려 여러번 다시 배포
API 서버를 Dev, Staging, Production 등의 환경으로 나누어 셋팅 후 각 환경별로 다른 설정을 적용하여 환경마다 서버가 다르게 동작
-->

### Terraform이란?
Terraform은 Hashicorp에서 개발한 인프라스트럭처 관리를 위한 오픈소스 소프트웨어로, 인프라스트럭처를 코드로서 관리 및 프로비저닝하는 개념인 Ifrastructure as Code (IaC)를 지향하는 도구입니다. Terraform에서는 HCL(Hachicorp Configuration Language)라는 설정 언어를 이용해서 인프라스트럭처를 정의합니다.

OCI에 대한 Terraform Provider에 대한 가이드는 아래 페이지를 참고합니다.
> https://www.terraform.io/docs/providers/oci/index.html

### HCL(Hachicorp Configuration Language)
Terraform에서는 HCL(Hachicorp Configuration Language)이라는 설정 언어를 사용해서 정의합니다. JSON 형식도 지원히지만, 일반적으로 HCL을 더 선호하는 편이며, 여기서는 HCL을 사용해서 작성합니다. 그리고 이러한 구성 파일을 실제로 실행하는 것은 각 클라우드 벤더에서 Terraform과는 별도로 제공하는 Provider Plugin을 통해 실행됩니다.

#### Resources and Modules
HCL에서는 생성할 자원들을 Resource로 정의하며, 이러한 Resource들을 그룹으로 묶어서 관리하는 Module이라는 개념이 있습니다. Module은 의무적으로 사용할 필요는 없고 특정 Resource들을 그룹으로 묶어서 관리하고자 할 경우 사용하면 됩니다. 

#### Blocks
HCL의 가장 기본적인 형태입니다. HCL에서는 하나의 문장 단위를 Block이라 부릅니다. Block은 Block Type, Block Lable, Block Body (Identifier, Argument, expression)등으로 이뤄집니다

```terraform
resource "aws_vpc" "main" {
  cidr_block = var.base_cidr_block
}

<BLOCK TYPE> "<BLOCK LABEL>" "<BLOCK LABEL>" {
  # Block body
  <IDENTIFIER> = <EXPRESSION> # Argument
}
```

Block Type은 해당 Block이 어떤 역할을 하는지 구분해주는 것으로 블록의 역할에 따라 provider, resource, data, variable, output등이 있습니다. expression은 해당 블록에 전달하기 위한 Argument를 표현하며, 다양한 수식과 문법, 타입을 제공합니다. Expression에 대한 자세한 내용은 아래 가이드르 참조합니다.
> https://www.terraform.io/docs/configuration/expressions.html

### .tfstate
Terraform을 실행하면 인프라에 여러가지 리소스가 생성되는데, 이때 Terraform은 .tfstate 파일을 로컬에 생성합니다. 이 파일은 JSON 포멧으로 작성되어 있는데, 사용자가 작성한 테라폼 구성들과 실제 인프라의 상태를 매핑한 내용이 기록되어 있습니다. Terraform을 실행할때마다 프로바이더의 최신 인프라 상태를 조회해서 .tfstate 파일을 업데이트 하게 됩니다. 즉, .tfstate 파일을 보면 특정 시점에 해당하는 인프라의 상태를 알수 있습니다.

### Terraform Remote State
.tfstate 파일은 로컬에 생성되는데, 개인이 Terraform을 통해 인프라를 관리하면 문제 없겠지만 보통은 여러 사용자 혹은 여러 팀들이 같이 구성하기 때문에 이러한 .tfstate 파일을 각자의 로컬에 관리하게 되면, 자신이 반영한 상태만 알수 있기 때문에 전체 인프라의 상태를 알 수 없고, 결국 효율적으로 관리하기 어렵게 됩니다. 또한 개인 혹은 한팀에서 tfstate을 관리하면, 하나의 tfstate파일에 모든 내용이 기술되기 때문에 내용도 많아지게 되고, Terraform을 실행하는 속도도 느려질수 밖에 없어집니다. 따라서 개인 혹은 팀별로 Terraform을 적용할 때 마다 매번 tfstate 파일을 Remote Storage에 올려놓고 이를 공유해서 사용하는 것이 좋고, Terraform 팀에서도 이 방식을 권장하고 있습니다. 물론 다른 사람이 생성한 리소스(예: 특정 Virtual Cloud Network)를 참조하여 Resource를 구성하고자 할 때에도 이 Terraform Remote State를 사용하여 해당 리소스의 데이터를 가져올 수 있습니다.

> 참고: Terraform은 하나의 폴더에 구성할 리소스를 HCL로 정의한 .tf 파일들을 실행하는데, 다른 폴더 혹은 다른 사람이 생성한 리소스를 실행하는 시점에 동적으로 정보를 참조하기 어렵습니다. 물론 해당 리소스의 유니크한 ID, OCI에서는 OCID를 직접 콘솔에서 찾아서 지정하면 되지만, 매번 하는것은 귀찮은 작업입니다. 하지만 이 Remote State를 사용하면, 다른 사람이 구성한 VCN의 ID를 가져와서 이를 참조할 수 있습니다.

<!--
Remote State 참조: https://blog.outsider.ne.kr/1303
-->

### Workspace
Terraform에서는 여러개의 서로 다른 환경별로 코드를 공유해서 사용할 수 있는 Workspace라는 기능을 제공합니다. 이 기능은 Terraform을 실행하고 나오는 결과인 .tfstate 파일을 각 환경별로 구분해서 관리해줍니다. 이 기능을 잘 활용하면 여러 클라우드 환경에 동시에 프로비저닝할 수도 있습니다. (쉘등을 활용, 뒤에서 간단히 소개)

***

### Terraform 설치
그럼, 먼저 설치를 해보도록 하겠습니다. macOS에서는 간단히 Homebrew를 사용해서 설치할 수 있습니다.
```
$ brew install terraform
```

Windows에서의 설치는 아래 페이지를 참조합니다.
> https://www.vasos-koupparis.com/terraform-getting-started-install/

### Terraform Provider와 환경 설정
먼저 아무 위치에 폴더를 하나 생성 (예: erraform_test)하고, provider.tf 파일을 하나 만든 후 다음과 같이 가장 기본이 되는 Block Type인 provider를 정의합니다. 각 벤더별로 Provider 구성 방법이 있는데 자세한 내용은 아래 페이지를 참조하시면 됩니다.
> https://www.terraform.io/docs/providers/index.html

> 파일 이름에 대한 규칙이 따로 있는것은 아닙니다. Terraform은 파일내에 정의된 Block Type을 사용하지 파일의 이름을 가지고 판단하지 않습니다. 단, 파일의 확장자는 .tf로 지정해야 하고, 가시성을 위해서 파일 이름을 보고 어떤 동작을 하는지 알 수 있도록 지정하는 것이 좋습니다.

*** provider.tf***
```terraform
provider "oci" {
  tenancy_ocid     = "${var.tenancy_ocid}"
  user_ocid        = "${var.user_ocid}"
  fingerprint      = "${var.fingerprint}"
  private_key_path = "${var.private_key_path}"
  region           = "${var.region}"
}
```

oci provider를 정의했는데, 5개의 변수를 사용하고 있습니다. 각 변수 선언은 variable 이라는 Block Type을 사용해서 작성합니다. 파일 이름은 vars.tf로 해서 provider.tf와 같은 폴더 위치(프로젝트 폴더, 여기서는 terraform_test)에 저장합니다.
> Terraform은 특정 디렉토리에 있는 모든 .tf 파일을 읽어서 리소스를 생성, 수정, 삭제 작업을 진행합니다. 여러개의 .tf 파일이 있다 하더라도 실행 순서를 따로 정의하지 않는데, 각 정의된 리소스가 서로 간접적으로 의존관계가 생기며, 이런 의존 관계를 바탕으로 실행 순서를 결정합니다.

```terraform
variable "tenancy_ocid" {}
variable "user_ocid" {}
variable "fingerprint" {}
variable "private_key_path" {}
variable "region" {}
```

Provider에서 사용할 변수가 선언되어 있는데, 각 편수에 기본값을 직접 할당할 수도 있지만, 보통 환경 변수를 활용하거나, .tfvars 파일을 만들어서 관리할 수 있습니다. 환경 변수로 설정할 경우는 아래 내용을 ~/.bash_profile에 다음과 같이 설정하고 다시 적용합니다.

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

.tfvars 라는 파일을 이용할수도 있는데 사용법은 다음과 같습니다. 우선 vars.tfvars 파일을 만든 후 다음과 같이 추가합니다.
> tenancy_ocid, user_ocid, fingerprint, private_key_path, region등의 정보 획득은 [[Oracle Cloud] OCI-CLI 설치](https://mangdan.github.io/oci-cli-install/) 를 참고합니다.

```terraform
tenancy_ocid     = <value>
user_ocid        = <value>
fingerprint      = <value>
private_key_path = <value>
region           = <value>
```

Terraform에서 .tfvars를 사용할 경우 실행 시 다음과 같이 옵션을 지정합니다. 아래는 plan을 실행할 때 vars.tfvars 환경 변수 파일을 사용한 예시입니다.
```
$ terraform plan -var-file=vars.tfvars
```

### Terraform Init
Provider와 변수 설정이 완료되면 Terraform 초기화를 하는데, 구성한 Provider 설정으로 관련 플러그인을 .terraform 경로에 다운로드 받게 됩니다. Module 혹은 Workspace를 사용한 경우에도 관련된 필요한 파일을 .terraform 폴더에 생성합니다. 뒤에 다시 언급하겠지만, Module을 추가할 때마다 초기화를 해줘야 합니다. 초기화는 .tf 파일들이 있는 폴더에서 다음 명령어를 입력하면 됩니다.

```terraform
$ terraform init
```

명령어를 실행하면 해당 폴더에 .terraform 폴더가 생성되며, plugins 폴더가 생성됩니다. terraform-provider-oci_v3.54.0_x4 즉 oci terraform plugin 버전이 3.54.0 인 것을 알수 있습니다.

```
drwxr-xr-x  3 DonghuKim  staff        96 12  4 18:31 ..
-rwxr-xr-x  1 DonghuKim  staff  79132160 12  4 18:31 terraform-provider-oci_v3.54.0_x4
-rwxr-xr-x  1 DonghuKim  staff  25457368 12  4 18:31 terraform-provider-random_v2.2.1_x4
drwxr-xr-x  6 DonghuKim  staff       192 12 12 16:51 .
-rwxr-xr-x  1 DonghuKim  staff  23091640 12 12 16:51 terraform-provider-null_v2.1.2_x4
-rwxr-xr-x  1 DonghuKim  staff       237 12 12 16:51 lock.json
```

### Terraform plan
plan 명령어는 현재 정의되어있는 리소스들을 해당 프로바이더에 적용했을 때 Terraform에 의해서 수행될 작업에 대한 계획을 보여줍니다. .tf의 내용을 기반으로 구성 내용에 대한 유효성 검사및 리소스 생성, 수정, 삭제할 리소스들이 잘 반여될 수 있는지를 현재의 인프라 상태와 비교해서 보여주는데, plan을 통해서 실제 인프라에 영향을 주지 않으면서, 어떤 내용들이 변화되고 영향을 받는지 알 수 있습니다.
실행 명령은 다음과 같습니다.

```
$ terraform plan

$ terraform plan -var-file=vars.tfvars # tfvars 파일을 사용한 경우
```

### Terraform apply
plan을 통해서 예상한 plan 결과를 확인하게 되면, 실제 반영을 해서 인프라의 정보를 구성 파일(.tf)의 정보와 일치되도록 실제 인프라에 반영하는데 이 과정이 apply 입니다. 실행 명령은 다음과 같습니다. apply를 실행하면 중간에 approve 하는 과정이 있는데, apply를 실행한 후에 plan 결과를 먼저 보여준 후 그 결과에 대해 승인(yes)해야 apply를 진행하게 됩니다.
> apply를 실행할 때 다음 옵션을 통해 auto approve를 할 수 있습니다.  
> ```
> $ terraform apply --auto-approve
> ```

```
$ terraform apply

$ terraform apply -var-file=vars.tfvars # tfvars 파일을 사용한 경우
```

### workspace 생성/선택/삭제
앞서 설명한 workspace를 생성, 목록, 선택, 삭제하는 명령어입니다. new 명령어로 프로젝트 폴더에서 workspace를 생성하면 **terraform.tfstate.d** 폴더가 자동으로 생성되며, 하위에 workspace 이름으로 폴더가 생성됩니다. 각 workspace 폴더안에 .tfstate 파일이 생성됩니다.

```
$ terraform workspace new <workspace 이름> # workspace 생성

$ terraform workspace list # workspace 목록

$ terraform workspace select <workspace 이름> # workspace 선택

$ terraform workspace delete <workspace 이름> # workspace 삭제

$ terraform workspace show # 현재 선택된 workspace 보기
```

다음 포스트에서는 실제 OCI 환경에서 다양한 리소스를 구성하는 부분을 직접 진행해 보고자 합니다. 현재 Module, Workspace등의 개념을 포함하고, 멀티 Tenancy, 멀티 Region에 동시에 구성할 수 있도록 작업중인데, 작업이 완료되면 바로 포스팅하도록 하겠습니다.