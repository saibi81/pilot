# 견적서 자동 생성기 (UFTR-1~12)

서버 설치 없이 실행하는 **한국어 견적서 편집 및 PDF 출력 프로그램**입니다. CSI-Vision Jira **UFTR-1** 에픽의 1차 MVP 개발용입니다.

## 사용 방법

1. 이 저장소의 `quote-generator/index.html` 파일을 다운로드한 후 Chrome 또는 Edge에서 엽니다.
2. 공급자, 수신처, 발행일, 품목·단가, VAT 유형, 비고를 입력합니다.
3. 우측 A4 미리보기를 확인하고 **인쇄 / PDF 저장**을 눌러 PDF로 저장합니다.
4. **JSON 저장 / JSON 불러오기**로 견적 데이터를 백업·복원합니다.

> 별도 서버, 로그인, npm 설치는 필요하지 않습니다. Node.js는 개발자가 테스트를 실행할 때만 필요합니다.

## 기능 및 Jira 추적

| 기능 | 관련 Jira |
| --- | --- |
| 공급자 정보, 직인 이미지 등록 | [UFTR-2](https://csi-vision.atlassian.net/browse/UFTR-2) |
| 견적 기본정보 및 수신자 관리 | [UFTR-3](https://csi-vision.atlassian.net/browse/UFTR-3) |
| 품목 추가·수정·삭제, 월정액/수량/정액 | [UFTR-4](https://csi-vision.atlassian.net/browse/UFTR-4) |
| 합계, VAT 포함/별도/면세, 한글 금액 | [UFTR-5](https://csi-vision.atlassian.net/browse/UFTR-5) |
| 실시간 A4 미리보기 | [UFTR-6](https://csi-vision.atlassian.net/browse/UFTR-6) |
| PDF 저장 및 인쇄 | [UFTR-7](https://csi-vision.atlassian.net/browse/UFTR-7) |
| 비고 및 계약 조건 | [UFTR-8](https://csi-vision.atlassian.net/browse/UFTR-8) |
| 브라우저 자동 저장, JSON 백업·복원 | [UFTR-9](https://csi-vision.atlassian.net/browse/UFTR-9) |
| 기술 설계 / QA / 설명서 | [UFTR-10](https://csi-vision.atlassian.net/browse/UFTR-10), [UFTR-11](https://csi-vision.atlassian.net/browse/UFTR-11), [UFTR-12](https://csi-vision.atlassian.net/browse/UFTR-12) |

## 기준 견적서 계산

- 생성형 AI 이용료: `44,000원 × 12개월 × 5개 = 2,640,000원`
- 통합 관리비: `110,000원`
- **견적 총액(VAT 포함): 2,750,000원**
- **한글 금액: 일금 이백칠십오만원정**

VAT 포함 입력 금액에 VAT를 중복 가산하지 않습니다. VAT 별도 시에는 입력 금액에 10%를 별도로 계산하고, 면세 시에는 부가세를 0원으로 처리합니다.

## 소스 구성

```text
quote-generator/
├── index.html               # 오프라인으로 실행 가능한 단일 페이지 앱
├── src/core.js              # 계산/JSON 검증 함수 (독립 테스트용)
├── tests/core.test.js       # Node.js 자동 테스트
├── docs/PRD-summary.md      # MVP 요구사항 요약
├── package.json
└── README.md
```

`index.html`은 독립 실행을 위해 UI 계산 함수를 포함하고 있습니다. `src/core.js`는 동일 규칙의 재사용 가능한 검증 모듈이며, UI와 모듈을 통합하는 리팩터링은 후속 과제로 관리합니다.

## 테스트

Node.js 18 이상에서 프로젝트 폴더 안에서 실행합니다.

```bash
npm test
```

계산·한글 금액·VAT 분기·비정상 JSON에 대한 7개 테스트가 포함됩니다. **브라우저 실제 렌더링, 직인 이미지, 다중 페이지 PDF 인쇄는 추가 수동 QA 대상**입니다.

## 주의사항

- 공개 저장소의 예시 견적정보는 모두 공개됩니다. 실제 고객 개인정보, 계정, 직인 원본 등은 커밋하지 마세요.
- 자동 저장 데이터는 실행 브라우저에만 남으므로 공용 PC 사용에 주의해야 합니다.
- 작성한 견적서를 발행하기 전에 공급자 정보, 금액 및 PDF 출력 결과를 확인하세요.
- 로그인, 서버 DB, 승인 워크플로, 발송 자동화 등은 이번 MVP에 포함하지 않습니다.

## 이슈 관리

- [Jira UFTR-1 에픽](https://csi-vision.atlassian.net/browse/UFTR-1)
- [UFTR 프로젝트 백로그](https://csi-vision.atlassian.net/jira/software/projects/UFTR/boards/187/backlog)
