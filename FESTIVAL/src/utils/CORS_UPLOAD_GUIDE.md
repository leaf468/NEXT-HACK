# Firebase Storage Upload with CORS Protection

이 가이드는 CORS 에러를 우회하면서 Firebase Storage에 파일을 업로드하는 방법을 설명합니다.

## 유틸리티 함수 사용법

### 1. 단일 파일 업로드

```javascript
import { uploadFileAndGetUrl } from '../utils/uploadFile';

// 파일 업로드 예제
const handleUpload = async (file) => {
  try {
    // 파일 경로 설정 (원하는 경로로 변경 가능)
    const path = `images/${Date.now()}_${file.name}`;
    
    // 파일 업로드하고 CORS 보호된 URL 받기
    const url = await uploadFileAndGetUrl(file, path);
    
    console.log('업로드 완료, URL:', url);
    // URL을 사용하여 이미지 표시 또는 데이터베이스에 저장
    
    return url;
  } catch (error) {
    console.error('업로드 실패:', error);
  }
};
```

### 2. 여러 파일 업로드

```javascript
import { uploadMultipleFiles } from '../utils/uploadFile';

// 여러 파일 업로드 예제
const handleMultipleUpload = async (files) => {
  try {
    // 기본 경로 설정
    const basePath = 'gallery';
    
    // 여러 파일 업로드 및 URL 배열 받기
    const urls = await uploadMultipleFiles(files, basePath);
    
    console.log('모든 파일 업로드 완료, URLs:', urls);
    // URL 배열을 데이터베이스에 저장하거나 UI에 표시
    
    return urls;
  } catch (error) {
    console.error('다중 업로드 실패:', error);
  }
};
```

## 작동 방식

이 유틸리티 함수는 다음과 같은 방식으로 CORS 에러를 방지합니다:

1. Firebase Storage에 파일을 업로드합니다.
2. 다운로드 URL을 가져옵니다.
3. URL에 타임스탬프 쿼리 파라미터(`&t={timestamp}`)를 추가하여 캐시를 무력화합니다.
4. 이 방식으로 브라우저가 매번 새 요청을 보내도록 하여 CORS 에러를 방지합니다.

## 예제 컴포넌트

프로젝트에 포함된 `FileUploadExample.jsx` 컴포넌트는 이 유틸리티 함수들을 사용하는 방법을 보여줍니다. 이 컴포넌트를 참조하여 자신의 코드에서 파일 업로드를 구현할 수 있습니다.

## CORS 설정 (추가 보안)

현재 `cors.json` 파일은 모든 오리진(`"*"`)에서의 접근을 허용하도록 설정되어 있습니다. 프로덕션 환경에서는 특정 도메인만 허용하도록 설정하는 것이 보안상 더 좋습니다.

```json
[
  {
    "origin": ["https://your-app-domain.com", "http://localhost:5173"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

Firebase CLI를 사용하여 CORS 설정을 업데이트하려면:

```bash
firebase login
firebase storage:cors set cors.json
```