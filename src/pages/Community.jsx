import React, { useState } from 'react';
import { dummyData } from '../data/community';
import CommunityDetail from '../components/comments/CommunityDetail';
import '../styles/Community.css';

const Community = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const itemsPerPage = 16;

  const filteredData = dummyData.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  //  게시글 클릭 시 상세 보기로 전환
  const handlePostClick = (item) => {
    setSelectedPost(item);
  };

  //  상세 보기 → 목록으로 돌아가기
  const handleBackToList = () => {
    setSelectedPost(null);
  };

  //  상세 페이지 표시
  if (selectedPost) {
    return <CommunityDetail post={selectedPost} onBack={handleBackToList} />;
  }

  return (
    <div className="community-container">
      <div className="community-header">
        <button className="write-diary-button">일기 쓰기</button>
        <div className="search-bar">
          <input
            type="text"
            placeholder="제목, 닉네임으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>검색</button>
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="diary-grid">
        {currentItems.map((item) => (
          <div
            key={item.id}
            className="diary-card"
            onClick={() => handlePostClick(item)} 
          >
            <div className="diary-card-header">
              <span className="diary-author">{item.author}</span>
              <span className="diary-date">{item.date}</span>
            </div>
            <hr />
            <div className="diary-card-body">
              <h3 className="diary-title">{item.title}</h3>
              <p className="diary-content">{item.content}</p>
            </div>
            <div className="diary-card-footer">
              <span className="diary-views">조회수 {item.views}</span>
              {item.isPopular && <span className="popular-badge">인기</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={currentPage === number ? 'active' : ''}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Community;
