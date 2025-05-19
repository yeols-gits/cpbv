import React from 'react';
import './squad.css';

const Squad = () => {
  return (
    <div className="player-div">
      <span className="pos c"><button>포수</button></span>
      <span className="pos b1"><button>1루</button></span>
      <span className="pos b2"><button>2루</button></span>
      <span className="pos b3"><button>3루</button></span>
      <span className="pos ss"><button>유격</button></span>
      <span className="pos lf"><button>좌익</button></span>
      <span className="pos cf"><button>중견</button></span>
      <span className="pos rf"><button>우익</button></span>
      <span className="pos dh"><button>지명</button></span>
    </div>
  );
};

export default Squad;
