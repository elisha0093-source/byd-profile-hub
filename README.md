# BYD Personal Sales Landing v3

고객 전환 중심 개인영업 랜딩페이지입니다.

기존 Google Sheets + Telegram 상담 수신 구조를 유지합니다.

배포 시 기존 GitHub Pages 저장소 루트의 index.html / styles.css / app.js를 교체하세요. config.js와 assets 폴더는 유지합니다.


## V3.1 변경
- 메인 히어로 이미지를 `assets/byd-hero-16x9.jpg`로 변경
- 히어로 표시비율 16:9 고정
- 상단 아래에 실제 클릭 가능한 `시승·상담 신청` 버튼 추가
- 카카오 버튼을 `https://pf.kakao.com/_xlgGSX/chat` 1:1 채팅창으로 연결
- 모바일에서는 두 CTA 버튼을 2열로 표시


## V3.2 상단 히어로 정리
- 히어로 이미지는 `assets/byd-hero-wide.jpg`
- 이미지 안에는 BYD 로고, 5개 차종, 핵심 기술 영역까지만 표시
- 이름/상담/카카오 CTA가 들어간 하단 이미지 영역 제거
- 히어로 아래 별도 상담폼과 중복되지 않도록 이미지 전용 구조로 변경
- `aspect-ratio:16/9` 제거, 원본 가로 비율 그대로 표시
- 카카오 채팅 URL은 `https://pf.kakao.com/_xlgGSX/chat`
