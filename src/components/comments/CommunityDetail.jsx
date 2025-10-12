import { useState, useEffect } from "react";
import {
  getCommentsByPost,
  createComment,
  deleteComment,
  updateComment,
  toggleCommentLike,
} from "../../api/services/CommentService";
import {
  Heart,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import "../../styles/CommunityDetail.css";

export default function CommunityDetail({ post, onBack }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);

  // 댓글 불러오기
  useEffect(() => {
    if (!post?.id) return; 
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await getCommentsByPost(post.id);
        if (res.success) setComments(res.data || []);
      } catch (err) {
        console.error("댓글 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [post]);

  // 댓글 작성
  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await createComment(post.id, newComment);
      if (res.success) {
        setComments((prev) => [...prev, res.data]);
        setNewComment("");
      }
    } catch (err) {
      alert("댓글 등록 실패");
    }
  };

  // 댓글 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await deleteComment(id);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      alert("댓글 삭제 실패");
    }
  };

  //  댓글 수정
  const handleEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      const res = await updateComment(id, editText);
      if (res.success) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, comments: editText } : c))
        );
        setEditingId(null);
        setEditText("");
      }
    } catch {
      alert("댓글 수정 실패");
    }
  };

  //  댓글 좋아요
  const handleLike = async (id) => {
    try {
      const res = await toggleCommentLike(id);
      if (res.success) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  likeCount: (c.likeCount || 0) + (res.data?.liked ? 1 : -1),
                }
              : c
          )
        );
      }
    } catch {
      alert("좋아요 실패");
    }
  };

  if (loading) return <p>댓글을 불러오는 중...</p>;

  return (
    <div className="community-detail">
      {/* 뒤로가기 */}
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={18} /> 목록으로
      </button>

      {/* 게시글 본문 */}
      <div className="community-detail-header">
        <h2 className="community-title">{post.title}</h2>
        <div className="community-meta">
          <span>{post.author}</span>
          <span>{post.date}</span>
        </div>
      </div>

      <div className="community-content">{post.content}</div>

      {/* 댓글 섹션 */}
      <div className="comment-section">
        <h3>댓글 {comments.length}개</h3>

        {comments.map((c) => (
          <div
            key={c.id}
            className={`comment-item ${editingId === c.id ? "editing" : ""}`}
          >
            <div className="comment-header">
              <strong>{c.writerNickname}</strong>
              <span className="comment-time">
                {new Date(c.createdAt).toLocaleString("ko-KR")}
              </span>
            </div>

            {editingId === c.id ? (
              <>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="comment-edit-actions">
                  <button className="save-btn" onClick={() => handleEdit(c.id)}>
                    <CheckCircle2 size={16} />
                    저장
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setEditingId(null)}
                  >
                    <XCircle size={16} />
                    취소
                  </button>
                </div>
              </>
            ) : (
              <p className="comment-text">{c.comments}</p>
            )}

            {/* 액션 버튼(좋아요, 삭제 등) 영역 */}
            <div className="comment-actions">
              {/* 좋아요 */}
              <button
                className="like-btn"
                onClick={() => handleLike(c.id)}
                title="좋아요"
              >
                <Heart size={16} />
                <span>{c.likeCount || 0}</span>
              </button>

              {/* 수정 */}
              <button
                className="edit-btn"
                onClick={() => {
                  setEditingId(c.id);
                  setEditText(c.comments);
                }}
              >
                <Edit3 size={16} />
                <span>수정</span>
              </button>

              {/* 삭제 */}
              <button
                className="delete-btn"
                onClick={() => handleDelete(c.id)}
              >
                <Trash2 size={16} />
                <span>삭제</span>
              </button>
            </div>
          </div>
        ))}

        {/*  댓글 입력창 */}
        <div className="comment-input">
          <textarea
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className="comment-submit-btn" onClick={handleSubmit}>
            <CheckCircle2 size={16} /> 등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
