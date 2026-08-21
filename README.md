# BYD Profile Hub v1

목표: 고객에게 `profile.vorainfo.com` 링크 하나를 보내면
프로필 → 상단 시승/상담폼 → 차량정보 → 전화/문자/카카오 상담으로 이어지는 모바일 세일즈 페이지.

## 데이터 흐름

고객
→ profile.vorainfo.com
→ 상단 상담폼
→ Google Apps Script Web App
→ Google Sheets `웹상담`
→ (선택) Telegram 즉시 알림
→ BYD Sales Hub에서 시트 데이터 통합

## 파일

- `index.html` : 프로필/상담/차량 카드
- `styles.css` : 모바일 UI
- `app.js` : 상담폼 제출, 유입경로 추적, 차량 선택
- `config.js` : Apps Script URL / 전화 / 카카오 링크
- `apps-script.gs` : Google Sheets 저장 + Telegram 알림 코드

## 1. Google Sheet 만들기

새 스프레드시트를 하나 생성합니다.
권장 이름: `BYD_Profile_Leads`

URL:
`https://docs.google.com/spreadsheets/d/여기가_SHEET_ID/edit`

`여기가_SHEET_ID` 부분을 복사합니다.

## 2. Apps Script 연결

스프레드시트 → 확장 프로그램 → Apps Script
→ 기본 코드를 지우고 `apps-script.gs` 전체 붙여넣기
→ `SHEET_ID`에 위 ID 입력
→ 저장

Telegram 알림도 사용할 경우:
- `BOT_TOKEN`
- `CHAT_ID`
를 입력합니다.

## 3. 웹 앱 배포

Apps Script:
배포 → 새 배포 → 유형: 웹 앱

- 실행 사용자: 나
- 액세스 권한: 모든 사용자

배포 후 나오는 `/exec` URL을 복사합니다.

## 4. 사이트 연결

`config.js`:

```js
formEndpoint: "https://script.google.com/macros/s/.../exec"
phone: "공개할 전화번호"
kakaoUrl: "카카오 상담 링크"
```

## 5. 로컬 테스트

VS Code Live Server로 `index.html`을 엽니다.

테스트 항목:
1. 상담폼 제출
2. Google Sheet에 1행 추가
3. Telegram 알림 도착
4. 차량 카드의 `이 차 상담하기` 클릭 시 상단 관심차종 자동 선택
5. `?src=kakao`, `?src=sms`, `?src=card` 유입경로 저장

예:
- `https://profile.vorainfo.com/?src=kakao`
- `https://profile.vorainfo.com/?src=sms`
- `https://profile.vorainfo.com/?src=card`
- `https://profile.vorainfo.com/?src=instagram`

## 6. GitHub Pages

이 폴더의 웹 파일을 GitHub 저장소 루트에 업로드:
`index.html`, `styles.css`, `app.js`, `config.js`

Settings → Pages → Deploy from branch → `main` / root

Cloudflare DNS에서 `profile.vorainfo.com`을 GitHub Pages에 연결한 후
GitHub Pages Custom Domain에 `profile.vorainfo.com` 입력.

## 다음 버전에서 할 일

- 공식 차량 이미지 적용
- 실제 프로필 사진 적용
- 차종별 상세 페이지
- 전시장/상담 위치
- 가격/프로모션 JSON 분리
- Sales Hub에 `웹상담` 탭 추가
- 상담 상태: 신규 → 연락완료 → 시승예정 → 견적 → 계약 → 출고


## V2 공개용 적용 완료

- 실제 프로필 사진 적용
- 전화/문자 버튼: 010-8685-0093
- 카카오채널: http://pf.kakao.com/_xlgGSX
- 기존 Google Apps Script 상담 수신 연결 유지
- BYD Korea 공식 차량 이미지 적용
- 공식 판매가격 및 핵심 제원 요약 적용
- 모델별 BYD Korea 공식 상세정보 링크 추가

### 공개 전 체크
1. Live Server에서 프로필 사진 확인
2. 5개 차량 이미지 로딩 확인
3. 전화/문자/카카오 버튼 확인
4. 상담폼 1건 테스트 → Google Sheets + Telegram 확인
5. 이상 없으면 GitHub Pages 배포

### 차량 이미지
BYD Korea 공식 웹사이트의 정적 이미지 URL을 직접 참조합니다.
BYD Korea가 이미지 경로를 변경하면 표시되지 않을 수 있습니다.


## V2.1 수정
- 차량 카드 이미지 영역 확대
- object-fit: contain 유지
- 휠/차량 하단 잘림 방지를 위해 overflow 및 높이 구조 수정


## V2.2 차량 이미지 크롭 방지
- 차량 이미지 영역의 고정 높이 제거
- aspect-ratio 제거
- max-height 제한 제거
- 이미지 원본 비율 그대로 자연 높이 표시
- 모바일에서 차량 폭 90%로 축소하고 하단 여백 확대
