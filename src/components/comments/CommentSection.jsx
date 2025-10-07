import { useState, useEffect } from "react";
import {
  getCommentsByPost,
  createComment,
  deleteComment,
  updateComment,
  toggleCommentLike,
  getReplies,
} from "../../api/services/CommentService";
import "../../styles/CommentSection.css";

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 댓글 목록 가져오기
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await getCommentsByPost(postId);
        if (res.success) setComments(res.data || []);
      } catch (err) {
        console.error("❌ 댓글 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  // ✅ 댓글 작성
  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await createComment(postId, newComment);
      if (res.success) {
        setComments((prev) => [...prev, res.data]);
        setNewComment("");
      }
    } catch (err) {
      alert("댓글 등록 실패");
    }
  };

  // ✅ 댓글 삭제
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

  // ✅ 댓글 수정
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

  // ✅ 댓글 좋아요
  const handleLike = async (id) => {
    try {
      const res = await toggleCommentLike(id);
      if (res.success) {
        // 프론트 단에서 즉시 반영
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
    <div className="comment-section">
      <h3>댓글 {comments.length}개</h3>

      {comments.map((c) => (
        <div key={c.id} className="comment-item">
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
              <button onClick={() => handleEdit(c.id)}>저장</button>
              <button onClick={() => setEditingId(null)}>취소</button>
            </>
          ) : (
            <p className="comment-text">{c.comments}</p>
          )}

          <div className="comment-actions">
            <button onClick={() => handleLike(c.id)}>
              👍 {c.likeCount || 0}
            </button>
            <button onClick={() => setEditingId(c.id)}>✏️ 수정</button>
            <button onClick={() => handleDelete(c.id)}>🗑 삭제</button>
          </div>
        </div>
      ))}

      <div className="comment-input">
        <textarea
          placeholder="댓글을 입력하세요..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={handleSubmit}>등록</button>
      </div>
    </div>
  );
}
