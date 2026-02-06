# Google Cloud Console 설정 가이드

구글 로그인을 구현하려면 사용자님이 직접 Google Developers Console에서 클라이언트 ID를 생성해야 합니다.

## ✅ 1단계: 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.
2. 상단 프로젝트 선택 메뉴에서 **새 프로젝트(New Project)**를 클릭하고 이름을 정합니다 (예: `safety-inspection-app`).

## ✅ 2단계: OAuth 동의 화면 구성
1. 왼쪽 메뉴에서 **API 및 서비스 > OAuth 동의 화면**으로 이동합니다.
2. **User Type**을 **외부(External)**로 선택하고 **만들기**를 클릭합니다.
3. 앱 이름, 사용자 지원 이메일(`giunganm14@gmail.com`), 개발자 연락처 등을 입력하고 저장합니다. (나머지 단계는 기본값으로 넘어가도 됩니다.)

## ✅ 3단계: 사용자 인증 정보(Client ID) 생성
1. 왼쪽 메뉴에서 **API 및 서비스 > 사용자 인증 정보**로 이동합니다.
2. 상단 **+ 사용자 인증 정보 만들기 > OAuth 클라이언트 ID**를 클릭합니다.
3. **애플리케이션 유형**을 **웹 애플리케이션**으로 선택합니다.
4. **이름**을 입력합니다 (예: `Safety App Web Client`).
5. **승인된 JavaScript 출처**에 다음을 추가합니다:
   - `http://localhost:5000`
   - (나중에 배포할 실제 도메인 주소)
6. **승인된 리디렉션 URI**는 일단 비워두거나 `http://localhost:5000/auth/callback` 등을 추가합니다 (현재는 프론트엔드 처리 방식이므로 출처만 중요합니다).
7. **만들기**를 클릭하면 **클라이언트 ID**가 나타납니다.

---

## 🔑 클라이언트 ID를 알려주세요!
생성된 `Client ID` (예: `12345678-hash.apps.googleusercontent.com`)를 저에게 알려주시면 코드에 바로 적용해 드릴 수 있습니다.
또는 제가 코드를 미리 작성해둘 테니 나중에 직접 입력하셔도 됩니다.
