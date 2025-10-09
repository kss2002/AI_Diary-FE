// CommunityDetail.jsx
import '../../styles/CommunityDetail.css';
import CommentSection from '../comments/CommentSection';

export default function CommunityDetail({ post, onBack }) {
  return (
    <div className="community-detail">
      <button onClick={onBack} className="back-button">
        ← 목록으로
      </button>

      <div className="community-detail-header">
        <h2 className="community-title">{post.title}</h2>
        <div className="community-meta">
          <span className="author">작성자: {post.author}</span>
          <span className="date">작성일: {post.date}</span>
        </div>
      </div>

      <hr />
      <p className="community-content">{post.content}</p>
      <hr />

      {/* ✅ 댓글 섹션 */}
      <CommentSection postId={post.id} />
    </div>
  );
}
