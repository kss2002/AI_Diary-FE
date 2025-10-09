import api from '../config/axios.js';
import { handleApiError } from '../config/errorHandler.js';

// 1. 댓글 조회
export const getCommentsByPost = async (postId) => {
  try {
    const res = await api.get(`/v1/comments/posts/${postId}`);
    return res.data;
  } catch (err) {
    console.error("❌ 댓글 조회 실패:", err);
    return handleApiError(err);
  }
};

// 2. 댓글 작성
export const createComment = async (postId, commentText) => {
  try {
    const body = { comments: commentText };
    const res = await api.post(`/v1/comments/posts/${postId}`, body);
    return res.data;
  } catch (err) {
    console.error("❌ 댓글 작성 실패:", err);
    return handleApiError(err);
  }
};

// 3. 댓글 수정
export const updateComment = async (commentId, newText) => {
  try {
    const res = await api.put(`/v1/comments/${commentId}`, {
      comments: newText,
    });
    return res.data;
  } catch (err) {
    console.error("❌ 댓글 수정 실패:", err);
    return handleApiError(err);
  }
};

// 4. 댓글 삭제
export const deleteComment = async (commentId) => {
  try {
    const res = await api.delete(`/v1/comments/${commentId}`);
    return res.data;
  } catch (err) {
    console.error("❌ 댓글 삭제 실패:", err);
    return handleApiError(err);
  }
};

// 5. 대댓글 조회
export const getReplies = async (commentId) => {
  try {
    const res = await api.get(`/v1/comments/${commentId}/replies`);
    return res.data;
  } catch (err) {
    console.error("❌ 대댓글 조회 실패:", err);
    return handleApiError(err);
  }
};

// 6. 댓글 좋아요/취소
export const toggleCommentLike = async (commentId) => {
  try {
    const res = await api.post(`/v1/comments/${commentId}/like`);
    return res.data;
  } catch (err) {
    console.error("❌ 댓글 좋아요 실패:", err);
    return handleApiError(err);
  }
};
