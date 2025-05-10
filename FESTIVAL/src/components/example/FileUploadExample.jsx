import React, { useState } from 'react';
import { uploadFileAndGetUrl, uploadMultipleFiles } from '../../utils/uploadFile';

const FileUploadExample = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 단일 파일 선택 핸들러
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 다중 파일 선택 핸들러
  const handleMultipleFileChange = (e) => {
    if (e.target.files) {
      setMultipleFiles(Array.from(e.target.files));
    }
  };

  // 단일 파일 업로드 핸들러
  const handleSingleUpload = async () => {
    if (!selectedFile) {
      setError('파일을 선택해주세요');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // 파일 업로드 경로 설정 (사용자 ID나 다른 식별자로 경로 지정 가능)
      const path = `uploads/${selectedFile.name}`;
      
      // 업로드 및 URL 가져오기
      const url = await uploadFileAndGetUrl(selectedFile, path);
      
      setUploadedUrl(url);
    } catch (err) {
      console.error('업로드 실패:', err);
      setError('파일 업로드 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 다중 파일 업로드 핸들러
  const handleMultipleUpload = async () => {
    if (!multipleFiles.length) {
      setError('파일을 선택해주세요');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // 기본 업로드 경로 설정
      const basePath = 'uploads/multi';
      
      // 여러 파일 업로드 및 URL 가져오기
      const urls = await uploadMultipleFiles(multipleFiles, basePath);
      
      setUploadedUrls(urls);
    } catch (err) {
      console.error('다중 업로드 실패:', err);
      setError('파일 업로드 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="file-upload-example">
      <h2>파일 업로드 예제</h2>
      
      {/* 단일 파일 업로드 섹션 */}
      <div className="upload-section">
        <h3>단일 파일 업로드</h3>
        <input 
          type="file" 
          onChange={handleFileChange} 
          disabled={isLoading}
        />
        <button 
          onClick={handleSingleUpload} 
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? '업로드 중...' : '업로드'}
        </button>
        
        {uploadedUrl && (
          <div className="preview">
            <p>업로드된 파일 URL:</p>
            <a href={uploadedUrl} target="_blank" rel="noreferrer">{uploadedUrl}</a>
            
            {/* 이미지인 경우 미리보기 표시 */}
            {selectedFile && selectedFile.type.startsWith('image/') && (
              <div className="image-preview">
                <h4>이미지 미리보기</h4>
                <img src={uploadedUrl} alt="업로드된 이미지" style={{ maxWidth: '300px' }} />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 다중 파일 업로드 섹션 */}
      <div className="upload-section">
        <h3>다중 파일 업로드</h3>
        <input 
          type="file" 
          multiple 
          onChange={handleMultipleFileChange} 
          disabled={isLoading}
        />
        <button 
          onClick={handleMultipleUpload} 
          disabled={!multipleFiles.length || isLoading}
        >
          {isLoading ? '업로드 중...' : '다중 업로드'}
        </button>
        
        {uploadedUrls.length > 0 && (
          <div className="multi-preview">
            <p>업로드된 파일 URL:</p>
            <ul>
              {uploadedUrls.map((url, index) => (
                <li key={index}>
                  <a href={url} target="_blank" rel="noreferrer">{url}</a>
                </li>
              ))}
            </ul>
            
            {/* 이미지 미리보기 */}
            <div className="image-previews">
              <h4>이미지 미리보기</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {uploadedUrls.map((url, index) => {
                  const file = multipleFiles[index];
                  if (file && file.type.startsWith('image/')) {
                    return (
                      <img 
                        key={index} 
                        src={url} 
                        alt={`업로드된 이미지 ${index + 1}`} 
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }} 
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 에러 메시지 */}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default FileUploadExample;