# MUTESOUND AWS WordPress Automation

이 문서는 `mutesound_aws_wordpress_manual_v2.pdf` 흐름을 자동화용으로 바꾼 실행 가이드입니다.

## 핵심 판단

PDF 매뉴얼의 AWS 서버, 고정 IP, DNS, HTTPS 순서는 그대로 사용합니다.

단, 이미지 업로드와 Elementor HTML 붙여넣기는 사용하지 않습니다. 이 프로젝트는 이미 워드프레스 플러그인 패키지를 갖고 있어서, 워드프레스에서는 `mutesound-landing.zip`을 업로드하고 `[mutesound_landing]` 쇼트코드만 넣는 방식이 더 안전합니다.

## 자동화 파일

- `tools/aws-wordpress-setup.mjs`: AWS Lightsail/Route 53 보조 자동화 CLI
- `tools/mutesound-aws-wordpress.config.example.json`: 설정 템플릿
- `wordpress/mutesound-landing.zip`: 워드프레스 업로드용 플러그인

## 사전 준비

1. AWS 계정과 결제 카드
2. AWS CLI 설치 및 로그인
3. `mutesound.co.kr` 도메인 관리 권한
4. SSL 인증서 발급용 이메일 주소

AWS CLI는 아래 명령이 성공해야 합니다.

```bash
aws sts get-caller-identity
```

## 설정 파일 만들기

```bash
cp tools/mutesound-aws-wordpress.config.example.json tools/mutesound-aws-wordpress.config.json
```

`tools/mutesound-aws-wordpress.config.json`에서 필요한 값을 확인합니다.

- `region`: 기본값 `ap-northeast-2`
- `availabilityZone`: 기본값 `ap-northeast-2a`
- `bundleId`: 기본값 `nano_3_0`
- `sshKeyPath`: 선택값. 비워두면 Lightsail 기본 SSH 키를 `tmp/keys`에 내려받아 사용
- `route53HostedZoneId`: Route 53을 쓰는 경우에만 입력
- `sslEmail`: 인증서용 이메일

실제 설정 파일은 `.gitignore`에 들어가므로 GitHub에 올라가지 않습니다.

## 로컬 점검

```bash
node tools/aws-wordpress-setup.mjs check
node tools/aws-wordpress-setup.mjs plan
node tools/aws-wordpress-setup.mjs wordpress
```

`plan`은 실제 AWS 리소스를 만들지 않고 실행될 명령만 보여줍니다.

## AWS 리소스 생성

실제 생성은 비용이 발생할 수 있으므로 아래처럼 명시 승인값을 넣어야 합니다.

```bash
MUTESOUND_AWS_APPROVE_COSTS=yes node tools/aws-wordpress-setup.mjs apply --execute
```

자동화되는 작업:

1. Lightsail WordPress 인스턴스 생성
2. Static IP 생성
3. Static IP를 인스턴스에 연결
4. HTTP 80, HTTPS 443 포트 열기
5. 현재 인스턴스와 IP 상태 출력

## DNS 설정

Route 53을 쓰고 `route53HostedZoneId`를 설정했다면:

```bash
node tools/aws-wordpress-setup.mjs dns --execute
```

Route 53이 아니라 가비아/후이즈/호스팅케이알 같은 외부 도메인 관리 서비스를 쓰면:

```bash
node tools/aws-wordpress-setup.mjs dns
```

출력되는 A 레코드를 도메인 관리 화면에 직접 입력합니다.

```text
A  @    Static IP
A  www  Static IP
```

DNS가 반영된 뒤 아래 주소가 워드프레스 기본 화면으로 열려야 합니다.

```text
http://mutesound.co.kr
http://www.mutesound.co.kr
```

## 워드프레스 자동 적용

AWS 인스턴스와 Static IP가 준비되면 아래 명령으로 플러그인 설치, 홈페이지 생성, 첫 화면 지정, 사이트 제목 설정까지 처리합니다.

```bash
node tools/aws-wordpress-setup.mjs deploy-wordpress --execute
```

자동화되는 작업:

1. `wordpress/mutesound-landing.zip` 재생성
2. Lightsail 서버로 zip 업로드
3. WP-CLI로 플러그인 강제 설치/활성화
4. `mutesound-landing` 페이지 생성 또는 갱신
5. 해당 페이지를 워드프레스 첫 화면으로 지정
6. 기본 샘플 페이지 삭제
7. 서버 PHP 문법 검사

## HTTPS와 도메인 마무리

`mutesound.co.kr`, `www.mutesound.co.kr`의 A 레코드가 모두 Static IP로 바뀐 뒤 실행합니다.

`sslEmail`이 실제 이메일이어야 합니다.

```bash
node tools/aws-wordpress-setup.mjs finish-domain --execute
```

자동화되는 작업:

1. DNS가 Static IP를 바라보는지 확인
2. Bitnami `bncert-tool`을 unattended 모드로 실행
3. HTTP → HTTPS 리다이렉트 설정
4. non-www → www 리다이렉트 설정
5. 워드프레스 `home`, `siteurl`을 `https://www.mutesound.co.kr`로 변경

수동으로 확인하거나 문제가 있을 때 서버에서 직접 볼 명령:

```bash
cat bitnami_application_password
sudo /opt/bitnami/bncert-tool
```

도메인은 아래처럼 입력합니다.

```text
mutesound.co.kr www.mutesound.co.kr
```

완료 기준:

```text
https://www.mutesound.co.kr
```

주소가 보안 경고 없이 열려야 합니다.

## 상태 확인

```bash
node tools/aws-wordpress-setup.mjs status
```

확인할 것:

- Lightsail 인스턴스가 `running`
- Static IP가 attached
- `mutesound.co.kr`, `www.mutesound.co.kr`이 Static IP로 resolve
- `https://www.mutesound.co.kr`이 정상 표시
- PC/모바일에서 메뉴, 갤러리, 상담 폼, 영상이 보임

## 참고한 공식 문서

- AWS CLI Lightsail `create-instances`
- AWS CLI Lightsail `allocate-static-ip`
- AWS CLI Lightsail `attach-static-ip`
- AWS CLI Lightsail `open-instance-public-ports`
- AWS CLI Route 53 `change-resource-record-sets`
- AWS CLI Route 53 `resource-record-sets-changed` waiter
