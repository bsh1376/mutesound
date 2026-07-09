# MUTESOUND Landing Page

MUTESOUND 음악 학원, 연습실 전문 방음 시공 랜딩페이지입니다.

## 로컬에서 확인

정적 HTML이라 별도 빌드 없이 열 수 있습니다. 로컬 서버로 확인하려면:

```bash
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173`을 엽니다.

## 워드프레스에 올리기

가장 쉬운 방식은 준비된 워드프레스 플러그인을 업로드하는 것입니다.

1. 워드프레스 관리자에서 `플러그인 > 새로 추가 > 플러그인 업로드`로 이동합니다.
2. `wordpress/mutesound-landing.zip`을 업로드하고 활성화합니다.
3. 새 페이지를 만들고 쇼트코드 블록에 아래 한 줄을 넣습니다.

```text
[mutesound_landing]
```

자세한 절차는 `wordpress/README.md`에 정리했습니다.

## 파일 구조

- `index.html`: GitHub Pages 또는 단독 호스팅용 원본 HTML
- `assets/`: 로고, OG 이미지, 명함 이미지
- `uploads/`: 시공 포트폴리오 사진
- `DESIGN.md`: 페이지 디자인 시스템
- `tools/build-wordpress-plugin.mjs`: 워드프레스 플러그인 재생성 스크립트
- `wordpress/mutesound-landing.zip`: 워드프레스 업로드용 플러그인 압축 파일

## 수정 후 워드프레스 패키지 다시 만들기

```bash
node tools/build-wordpress-plugin.mjs
cd wordpress
zip -qr mutesound-landing.zip mutesound-landing
```
