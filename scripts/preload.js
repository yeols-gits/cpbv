const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('versions', { versions: process.versions });

  // 전역 변수
  const comm_stats = {
    'year': ['연도', 'TEXT'],
    'name': ['이름', 'TEXT'],
    'type': ['종류' , 'TEXT'],
    'position': ['포지션', 'TEXT'],
    'hand': ['좌/우', 'TEXT'],
    'pow': ['파워', 'INTEGER'],
    'dex': ['정확', 'INTEGER'],
    'con': ['선구', 'INTEGER'],
    'int': ['인내', 'INTEGER'],
    'spd': ['주루', 'INTEGER'],
    'def': ['수비', 'INTEGER'],
    'etc': ['비고', 'TEXT'],
    'acq_type': ['획득방법', 'TEXT'],
  }

  const bat_columns = {
    ...comm_stats,
    'angle': ['발사각', 'INTEGER'],
    'pot_pow': ['풀스윙', 'INTEGER'],
    'pot_clu': ['클러치', 'INTEGER'],
    'pot_def': ['송구', 'INTEGER'],
    'hotcold_normal': ['노말존', 'INTEGER'],
    'hotcold_cold': ['콜드존', 'INTEGER'],
  };

  const pit_columns = {
    ...comm_stats,
    'pot_pow': ['장억', 'INTEGER'],
    'pot_clu': ['침착', 'INTEGER'],
    'pot_def': ['변화', 'INTEGER'],
  };

  const display_bat_stats = () => {
    const arr = {};
    for (const key in comm_stats) {
      arr[key] = comm_stats[key][0];
    }
    return {
      ...arr,
      'pot': '잠재',
      'hotcold': '핫콜존',
    }
  };

  const display_pit_stats = () => {
    const arr = {};
    for (const key in comm_stats) {
      arr[key] = comm_stats[key][0];
    }
    return {
      ...arr,
      'pot': '잠재',
    }
  };

  const type = {
    'G': '골글',
    'S': '시그',
    'I': '임팩',
    'SN': '시즌',
    'N': '국대', 
    'L': '라이브',
    'AL': '올스타'
  };

  const acq_type = {
    'A': '일반',
    'B': '영입',
    'C': '조합',
  };

  const team = {
    'kia': '기아',
    'samsung': '삼성',
    'lg': 'LG',
    'doosan': '두산',
    'kt': 'kt',
    'ssg': 'SSG',
    'lotte': '롯데',
    'hanhwa': '한화',
    'nc': 'NC',
    'kiwoom': '키움'
  };
  const position = {
    'C': '포수',
    '1B': '1루',
    '2B': '2루',
    '3B': '3루',
    'SS': '유격',
    'LF': '좌익',
    'CF': '중견',
    'RF': '우익',
    'DH': '지명',
    'SP': '선발',
    'RP': '중계',
    'CP': '마무리',
  };

const sessionData = {
  searchData : {},
  selectedPlayer : [],
};

contextBridge.exposeInMainWorld('commonData', {
    stats: (display_type) => { return display_type == 'P' ? display_pit_stats() : display_bat_stats() }, 
    getColumns: [ bat_columns, pit_columns ],
    columns: (display_type) => { return display_type == 'P' ? pit_columns : bat_columns },
    type: type,
    acq_type: acq_type,
    team: team,
    position: position,
    setSearchData: async(key, data) => {
      if(!data) data = (key == 'display_type' || key == 'useYn') ? '' : [];
      sessionData.searchData[key] = data 
    },
    getSearchData: (key) => { 
      if(!key) {
        return sessionData.searchData;
      } else {
        return sessionData.searchData[key];
      }
    },
    setPlayer: (data) => { 
      const targetIdx = sessionData.selectedPlayer.findIndex(e => e.idx === data.idx);
      if(targetIdx > -1) {
        sessionData.selectedPlayer.splice(targetIdx, 1);
      } else {
        sessionData.selectedPlayer.push(data);
      }
    },
    getSelectedPlayer: () => { return sessionData.selectedPlayer },
});

// 저장(스텟, 이미지)
contextBridge.exposeInMainWorld('commonApi', {
  saveJSON: (data) => ipcRenderer.send('save-json', data),
  onSaveReply: (callback) => ipcRenderer.on('save-json-reply', (event, response) => callback(response)),
  saveImage: (fileName, imageData) => ipcRenderer.invoke('save-image', { fileName, imageData }),
  search: () => {
    const columns = sessionData.searchData.display_type == 'P' ? pit_columns : bat_columns;
    return ipcRenderer.invoke('search', sessionData.searchData, columns);
  },
  addData: (data) => ipcRenderer.invoke('add-data', data),
  initData : () => { 
    sessionData.searchData = {
      display_type: 'B',
      team: [],
      position: [],
      year: [],
      type: [],
      useYn: 'Y',
    };
    sessionData.selectedPlayer = [];
    return sessionData;
  },
  openModal: (type) => ipcRenderer.send('open-modal', type),
  closeModal: () => ipcRenderer.send('close-modal'),
  moveModal: (deltaX, deltaY) => ipcRenderer.send('move-modal', {deltaX, deltaY}),
});

contextBridge.exposeInMainWorld('commonFunc', {
  null2Int: (value, defaultValue) => { 
    defaultValue = defaultValue || 0;
    return value === null || typeof value === 'undefined' || value == '' ? defaultValue : value; 
  },
  null2Str: (value, defaultValue) => { 
    defaultValue = defaultValue || '';
    return value === null || typeof value === 'undefined' ? defaultValue : value; 
  },
});

