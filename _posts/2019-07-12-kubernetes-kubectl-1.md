---
title:  "[Kubernetes] 자주 사용하는 명령어"
date:   2019-07-12 13:35
tags: ["Kubernetes", "kubectl"]
---

kubectl 명령어 중에서 자주 사용할 만한 명령어만 모아 봤습니다. 포스팅 내용은 "Kubernetes In Action"을 참고해서 작성되었습니다.

> 본 블로그의 모든 포스트는 **macOS** 환경에서 테스트 및 작성되었습니다.  

* Kubernetes Dashboard
    ```
    # kubectl proxy
    ```

    다음 주소로 접속합니다.
    ```
    http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#!/login
    ```

    첫 화면에서 kubeconfig 파일을 선택 후 로그인합니다. ($HOME/.kube/config)

* 클러스터 정보
    ```
    # kubectl cluster-info
    ```

* 노드 정보
    ```
    # kubectl get nodes
    ```
    
* 모든 리소스 출력
    ```
    # kubectl get all -A
    ```

* 특정 네임스페이스의 리소스 출력
    ```
    # kubectl get all -n 네임스페이스명(dhkim9)
    ```

* 특정 Pod의 상세 정보 (네임스페이스를 지정한 경우 -n 옵션 사용)
    ```
    # kubectl describe Pod명 -n 네임스페이스명(dhkim9)
    ```

* 특정 Pod 내부 접속 (네임스페이스를 지정한 경우 -n 옵션 사용)
    ```
    # kubectl exec -it Pod명 -n 네임스페이스명(dhkim9) -- /bin/bash
    ```

* 해당 네임스페이스를 갖는 모든 리소스 삭제
    ```
    # kubectl delete namespace 네임스페이스명(dhkim9)
    ```

* 특정 label 이름이 정의된 pod, service들 제거
    ```
    # kubectl delete pods,services -l name=label이름
    ```

* Pod의 로그 조회 (네임스페이스를 지정한 경우 -n 옵션 사용, -f 옵션은 tail)
    ```
    # kubectl logs -f Pod명 -n 네임스페이스명(dhkim9)
    ```

* Pod 스케일링 (네임스페이스를 지정한 경우 -n 옵션 사용)
    ```
    # kubectl scale Replica Set명 -n 네임스페이스명(dhkim9) --replicas=5
    ```