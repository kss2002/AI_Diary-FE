import { useState, useEffect } from 'react';
import { Globe, Lock } from 'lucide-react';
import '../styles/DiaryEntry.css';
import { HappyCat, SadCat, AngryCat, NeutralCat } from './EmotionCatIcons';

const DiaryEntry = ({ date, initialEmotion, initialContent, onSave }) => {
  const [emotion, setEmotion] = useState(initialEmotion || 'neutral');
  const [content, setContent] = useState(initialContent || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isPublic, setIsPublic] = useState(false); 

  useEffect(() => {
    setEmotion(initialEmotion || 'neutral');
    setContent(initialContent || '');
    setIsSaved(false);
    setIsPublic(false); 
  }, [date, initialEmotion, initialContent]);

  const handleSave = () => {
    onSave(date, emotion, content, isPublic);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('ko-KR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="diary-entry cute-diary">
      <h2 className="cute-title">{formatDateForDisplay(date)}</h2>

      <div className="emotion-selector">
        <h3 className="cute-label">오늘 당신의 감정은?</h3>
        <div className="emotion-buttons cute-emotion-buttons">
          <button
            className={`emotion-btn cute-emotion-btn ${emotion === 'happy' ? 'selected' : ''}`}
            onClick={() => setEmotion('happy')}
            type="button"
          >
            <span className="icon-wrap">
              <HappyCat />
            </span>
            <span>행복해요</span>
          </button>
          <button
            className={`emotion-btn cute-emotion-btn ${emotion === 'sad' ? 'selected' : ''}`}
            onClick={() => setEmotion('sad')}
            type="button"
          >
            <span className="icon-wrap">
              <SadCat />
            </span>
            <span>슬퍼요</span>
          </button>
          <button
            className={`emotion-btn cute-emotion-btn ${emotion === 'angry' ? 'selected' : ''}`}
            onClick={() => setEmotion('angry')}
            type="button"
          >
            <span className="icon-wrap">
              <AngryCat />
            </span>
            <span>화났어요</span>
          </button>
          <button
            className={`emotion-btn cute-emotion-btn ${emotion === 'neutral' ? 'selected' : ''}`}
            onClick={() => setEmotion('neutral')}
            type="button"
          >
            <span className="icon-wrap">
              <NeutralCat />
            </span>
            <span>그럭저럭</span>
          </button>
        </div>
      </div>

      <div className="entry-content">
        <h3 className="cute-label">다이어리</h3>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="오늘 이런 일이 있었어..."
          rows={10}
          className="cute-textarea"
        />
      </div>


      <div className="entry-actions">
        <button
          className={`privacy-toggle ${isPublic ? 'public' : 'private'}`}
          onClick={() => setIsPublic((prev) => !prev)}
          type="button"
          aria-pressed={isPublic}
        >
          {isPublic ? <Globe size={18} /> : <Lock size={18} />}
          {isPublic ? '전체공개' : '나만보기(비공개)'}
        </button>

        <button
          className="save-btn cute-save-btn"
          onClick={handleSave}
          type="button"
        >
          작성완료
        </button>
        {isSaved && (
          <span className="save-message cute-save-message">
            저장되었어요 😊
          </span>
        )}
      </div>
    </div>
  );
};

export default DiaryEntry;
