import React from 'react';
import './css/squad.css'; // 스타일 경로는 그대로 유지

const Squad = () => {
  return (
    <div className="player-div">
      <span className="pos c">포수</span>
      <span className="pos b1">1루</span>
      <span className="pos b2">2루</span>
      <span className="pos b3">3루</span>
      <span className="pos ss">유격</span>
      <span className="pos lf">좌익</span>
      <span className="pos cf">중견</span>
      <span className="pos rf">우익</span>
      <span className="pos dh">지명</span>
    </div>
  );
};

export default Squad;