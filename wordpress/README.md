# MUTESOUND WordPress Upload Guide

## 가장 쉬운 진행 방법

1. 워드프레스 관리자에 로그인합니다.
2. `플러그인 > 새로 추가 > 플러그인 업로드`로 이동합니다.
3. `wordpress/mutesound-landing.zip` 파일을 업로드하고 활성화합니다.
4. `페이지 > 새로 추가`에서 새 페이지를 만듭니다.
5. 본문에 쇼트코드 블록을 추가하고 아래 한 줄을 입력합니다.

```text
[mutesound_landing]
```

6. 페이지를 공개한 뒤 모바일과 데스크톱에서 상담 폼, 메뉴, 갤러리, 영상 섹션을 확인합니다.

## 포함된 파일

- `mutesound-landing/mutesound-landing.php`: 워드프레스 쇼트코드 플러그인
- `mutesound-landing/templates/landing.html`: 페이지 본문 HTML
- `mutesound-landing/assets/mutesound.css`: 워드프레스용으로 범위를 제한한 CSS
- `mutesound-landing/assets/mutesound.js`: 갤러리, 영상, FAQ, 상담 폼 동작
- `mutesound-landing/assets/`, `mutesound-landing/uploads/`: 로고와 시공 사진
- `shortcode-preview.html`: 워드프레스 없이 쇼트코드 출력 형태를 확인하는 로컬 미리보기

## 수정이 필요할 때

원본은 루트의 `index.html`입니다. 원본을 수정한 뒤 아래 명령으로 워드프레스 플러그인 파일을 다시 만들 수 있습니다.

```bash
node tools/build-wordpress-plugin.mjs
cd wordpress
zip -qr mutesound-landing.zip mutesound-landing
```

## 운영 전 확인할 것

- 실제 사용할 도메인이 정해지면 `index.html`의 canonical, OG URL을 도메인에 맞게 바꿉니다.
- 상담 폼은 Web3Forms `access_key`로 전송됩니다. 수신 이메일이 올바른지 실제 테스트 접수를 한 번 보내 확인합니다.
- 워드프레스 테마가 페이지 폭을 제한하면, 해당 페이지 템플릿을 `전체 폭` 또는 `빈 페이지`로 바꾸는 편이 좋습니다.
