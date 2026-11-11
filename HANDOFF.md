# MUTESOUND 사이트 인수인계 (Claude용)

> 작성일: 2026-11-11
> 읽는 대상: 대표님이 쓰시는 Claude
> 목적: 지금 사이트가 왜 안 열리는지 파악하고, AWS를 다시 설정해 `https://www.mutesound.co.kr`을 되살리기

이 문서를 처음부터 끝까지 읽은 뒤 작업을 시작하세요. 대표님께는 전문용어 대신 쉬운 말로 설명하고, 돈이 드는 작업(AWS 리소스 생성 등)은 하기 전에 반드시 대표님께 확인을 받으세요.

---

## 1. 한 줄 요약

**사이트가 죽었어요.** 도메인(mutesound.co.kr)은 여전히 예전 서버 IP `15.165.22.158`을 가리키는데, 지금 그 IP는 **다른 회사(cashwalk) 서버**가 쓰고 있어요. 그래서 접속하면 보안 경고가 뜨고, MUTESOUND 페이지 대신 엉뚱한 에러가 나와요.

비유하면, 이사 간 집 주소로 아직 우편이 가는데 그 집에 이미 다른 사람이 살고 있는 상황이에요.

---

## 2. 프로젝트 개요

- **무엇:** 음악학원·연습실 방음 시공 업체 MUTESOUND의 랜딩페이지(홈페이지 한 장)
- **원본 코드:** 이 폴더 (`/Users/bin/Documents/mutesound`)
- **GitHub:** `https://github.com/bsh1376/mutesound` (main 브랜치, 마지막 커밋 2026-07-14 "Integrate WordPress SEO hooks", push 완료)
- **도메인:** `mutesound.co.kr`, `www.mutesound.co.kr` (가비아에서 관리, 네임서버 = gabia)
- **호스팅 구조:** AWS Lightsail 서울 리전(`ap-northeast-2a`)의 WordPress(Bitnami) 서버 1대 + 고정 IP(Static IP 이름 `mutesound-ip`)
- **WordPress 구성:**
  - 자체 플러그인 `mutesound-landing` (버전 1.0.6). 첫 화면에 랜딩페이지를 통째로 띄움
  - SEO 플러그인 Rank Math, 보안 플러그인 Wordfence
- **상담 폼:** Web3Forms로 이메일 전송 (키는 `index.html` 안에 있음)

### 폴더 구조

| 경로 | 내용 |
|---|---|
| `index.html` | 랜딩페이지 원본 (모든 수정은 여기서 시작) |
| `DESIGN.md` | 디자인 시스템 (색, 글꼴 규칙) |
| `assets/`, `uploads/` | 로고, OG 이미지, 시공 사진 약 100장 |
| `wordpress/mutesound-landing/` | WordPress 플러그인 소스 |
| `wordpress/mutesound-landing.zip` | WordPress에 올리는 플러그인 파일 |
| `tools/build-wordpress-plugin.mjs` | `index.html` → 플러그인 재생성 |
| `tools/aws-wordpress-setup.mjs` | AWS 서버 생성부터 HTTPS까지 자동화 스크립트 |
| `docs/aws-wordpress-automation.md` | 위 스크립트 상세 사용법 (**반드시 읽기**) |
| `.omo/evidence/` | 지난 코드 검토·QA 기록 |
| `tmp/backups/` | 2026-07-14 서버 백업 (git에 없음, 이 Mac에만 있음) |
| `tmp/keys/` | 옛 서버 SSH 키 (git에 없음, 이 Mac에만 있음) |
| `tools/mutesound-aws-wordpress.config.json` | 실제 설정값 (git에 없음) |

---

## 3. 지금까지 한 일 (타임라인)

| 날짜 | 한 일 |
|---|---|
| 2026-07-06 | 디자인 시스템 작성, 정적 HTML 랜딩페이지 제작, WordPress 플러그인화 |
| 2026-07-09 | 모바일 수정, 공유 미리보기(OG), AWS 자동화 스크립트, 첫 배포 |
| 2026-07-14 | 실제 도메인으로 운영 전환, Rank Math + Wordfence 적용, 백업 2개 생성 |
| 2026-07-14 이후 | 작업 기록 없음 |
| 2026-11-11 | 점검 결과 사이트 다운 확인 (아래 4번) |

---

## 4. 2026-11-11 점검 결과 (증거)

```text
$ dig +short mutesound.co.kr www.mutesound.co.kr
15.165.22.158
15.165.22.158          ← 7월에 쓰던 고정 IP와 같음

$ curl -I http://mutesound.co.kr/
Server: awselb/2.0     ← Lightsail WordPress가 아니라 AWS 로드밸런서가 응답

$ openssl s_client ... (www.mutesound.co.kr:443)
Subject: CN=test.townwalk.hub.cashwalk.com   ← 남의 회사 인증서
Issuer:  Amazon RSA 2048 M04

$ curl -k https://www.mutesound.co.kr/
{"error":{"type":"NotFoundError","code":210,"message":"제공할 데이터가 없습니다."}}
```

### 추정 원인 (아직 AWS 계정 안에서 확인 못 함)

7월 이후 어느 시점에 **Lightsail 고정 IP가 해제됐거나 서버가 삭제**됐고(결제 문제, 계정 정리, 체험 종료 등), AWS가 그 IP를 다른 고객에게 다시 할당했을 가능성이 커요. 가비아 DNS는 옛 IP를 그대로 가리키고 있어요.

점검 당시 이 Mac의 AWS CLI 로그인은 만료 상태(`Your session has expired`)라 계정 내부는 보지 못했어요.

---

## 5. 해야 할 일 (순서대로)

### 5-1. AWS 계정 상태 확인 (먼저)

```bash
aws sts get-caller-identity
aws lightsail get-instances --region ap-northeast-2 --query "instances[].{name:name,state:state.name,ip:publicIpAddress}" --output table
aws lightsail get-static-ips --region ap-northeast-2 --query "staticIps[].{name:name,ip:ipAddress,attached:attachedTo}" --output table
```

결과에 따라 갈래가 나뉘어요.

- **A. 서버가 살아 있음** → 새 고정 IP를 만들어 붙이고(5-3), DNS만 바꾸면(5-4) 끝. 데이터 복구 불필요.
- **B. 서버가 없음** → 새로 만들고(5-2) 백업으로 복구(5-5).
- **C. 계정 자체가 다르거나 정지됨** → 대표님께 어떤 AWS 계정을 쓸지 확인하고 B로 진행.

※ 7월에 쓰던 IP `15.165.22.158`은 이미 남이 쓰고 있으니 **되찾을 수 없어요.** 새 IP를 받아야 해요.

### 5-2. 서버 새로 만들기 (B, C의 경우 / 비용 발생 → 대표님 확인 필수)

자세한 내용은 `docs/aws-wordpress-automation.md`를 따르세요. 요약:

```bash
cd /Users/bin/Documents/mutesound
node tools/aws-wordpress-setup.mjs check
node tools/aws-wordpress-setup.mjs plan      # 실제로 만들지 않고 계획만 출력
MUTESOUND_AWS_APPROVE_COSTS=yes node tools/aws-wordpress-setup.mjs apply --execute
```

- 설정 파일 `tools/mutesound-aws-wordpress.config.json`의 `sslEmail`이 아직 `you@example.com`이에요. **대표님께 실제 이메일을 받아 바꾸세요.** (인증서 만료 알림이 가는 주소)
- 서버 사양 기본값은 `nano_3_0`(가장 작은 요금제)예요.
- 예전 SSH 키(`tmp/keys/`)는 옛 서버용이라 새 서버에는 안 맞을 수 있어요. 스크립트가 새 기본 키를 `tmp/keys`에 받아와요.

### 5-3. 고정 IP (A의 경우 서버는 그대로 두고 이것만)

`apply` 스크립트가 고정 IP 생성과 연결까지 해줘요. 서버가 이미 있다면 수동으로:

```bash
aws lightsail allocate-static-ip --static-ip-name mutesound-ip-2 --region ap-northeast-2
aws lightsail attach-static-ip --static-ip-name mutesound-ip-2 --instance-name <인스턴스이름> --region ap-northeast-2
```

**주의:** 고정 IP는 서버에 붙어 있는 동안은 무료지만, 서버와 분리된 채로 두면 요금이 붙고, 해제하면 다시는 못 돌려받아요. 이번 사고가 바로 그 경우일 수 있어요.

### 5-4. 가비아 DNS 바꾸기 (대표님이 직접 하셔야 함)

DNS는 Route 53이 아니라 **가비아**에 있어요. 가비아 관리 화면에서 아래 두 줄을 새 고정 IP로 바꿔야 해요. Claude가 대신 로그인할 수 없으니 대표님께 화면을 안내해 드리세요.

```text
A  @    <새 고정 IP>
A  www  <새 고정 IP>
```

반영 확인:

```bash
dig +short mutesound.co.kr www.mutesound.co.kr
```

### 5-5. WordPress 내용 올리기

**새 서버라면** 둘 중 하나를 골라요.

1. **간단 복구 (추천):** 랜딩페이지는 플러그인 하나로 완성되므로, 스크립트로 바로 다시 깔기
   ```bash
   node tools/aws-wordpress-setup.mjs deploy-wordpress --execute
   ```
   플러그인 설치, 첫 화면 지정, 사이트 제목까지 자동이에요. 그 뒤 Rank Math와 Wordfence는 WordPress 관리자에서 다시 설치해야 해요.
2. **완전 복구:** `tmp/backups/mutesound-post-hardening-20260714-2348/`에 UpdraftPlus 형식 백업(db, plugins, themes, uploads, others)이 있어요. 새 WordPress에 UpdraftPlus를 설치하고 이 파일들을 올리면 7월 14일 상태 그대로 돌아와요. 같은 폴더의 `wp-config.php`, `wordpress.htaccess`, `wordfence-waf.php`는 참고용으로만 보고, DB 비밀번호 등은 새 서버 값을 쓰세요(옛 값을 덮어쓰지 말 것).
   - 그 전 백업: `tmp/backups/mutesound-pre-seo-security-20260714-2330/` (SEO·보안 플러그인 적용 전, SQL + 파일 tar.gz)

### 5-6. HTTPS 마무리

DNS가 새 IP를 가리키는 게 확인된 뒤에만 실행하세요.

```bash
node tools/aws-wordpress-setup.mjs finish-domain --execute
node tools/aws-wordpress-setup.mjs status
```

### 5-7. 완료 기준

- `https://www.mutesound.co.kr`이 보안 경고 없이 열림
- `http://mutesound.co.kr` → `https://www.mutesound.co.kr`로 이동
- PC·모바일에서 메뉴, 시공 사진 갤러리, 영상, FAQ, 상담 폼이 보임
- 상담 폼으로 테스트 접수 1건 보내서 대표님 메일로 도착하는지 확인
- `https://www.mutesound.co.kr/sitemap_index.xml` 200 응답

---

## 6. 사이트 복구 후 남은 코드 숙제

2026-07-14 코드 검토(`.omo/evidence/mutesound-wordpress-seo-security-gate-review.md`) 결과는 **"보완 필요"**였고, 아직 고치지 않았어요.

1. **(중요) 페이지 출력 방식:** `wordpress/mutesound-landing/mutesound-landing.php` 마지막 줄
   ```php
   add_action('template_redirect', 'mutesound_landing_render_full_page', 0);
   ```
   이 함수가 우선순위 0에서 페이지를 다 그린 뒤 `exit`로 끝내 버려서, 뒤에 실행돼야 할 WordPress 기본 처리, Rank Math 일부, **Wordfence 보안 기록**이 실행되지 않아요. WordPress 권장 방식인 `template_include` 필터로 바꿔서 별도 템플릿 파일을 쓰게 해야 해요.
2. **(사소) 75번째 줄** `remove_action('rank_math/head', '_wp_render_title_tag', 1);`은 아무 효과가 없는 코드라 지우면 돼요.

수정 후 플러그인 재생성과 배포:

```bash
node tools/build-wordpress-plugin.mjs
cd wordpress && zip -qr mutesound-landing.zip mutesound-landing && cd ..
node tools/aws-wordpress-setup.mjs deploy-wordpress --execute
```

`deploy-wordpress`는 GitHub의 raw zip 주소(`pluginZipUrl`)도 설정에 갖고 있으니, zip을 바꿨다면 커밋과 push도 함께 해야 어긋나지 않아요.

---

## 7. 주의사항

- **비밀 정보:** `tmp/keys/`(SSH 키), `tools/mutesound-aws-wordpress.config.json`, `tmp/backups/`의 `wp-config.php`는 절대 GitHub에 올리거나 채팅에 내용을 붙이지 마세요. 이미 `.gitignore`에 들어가 있어요.
- **백업과 키는 이 Mac에만 있어요.** 대표님이 다른 컴퓨터에서 작업하신다면, 이 폴더의 `tmp/` 전체를 안전한 방법(USB, 암호 걸린 압축 등)으로 옮겨야 해요. GitHub에서 clone만 하면 백업은 없어요. 그 경우에는 5-5의 "간단 복구"로 가면 돼요.
- **재발 방지:** 고정 IP는 서버에서 떼지 말 것, AWS 결제 카드 만료와 결제 실패 알림을 대표님 메일로 받도록 설정할 것을 권해 드리세요.
- **비용:** Lightsail `nano_3_0`는 월 소액 정액제예요. 새로 만들기 전 대표님께 금액을 확인받으세요.
