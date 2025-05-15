const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const iconv = require('iconv-lite');

let mainWindow, modalWindow, db;
const dbPath = path.join(__dirname, 'data.sqlite3');
const scripts = path.join(__dirname, 'scripts');
const views = path.join(__dirname, 'views');

const windowWidth = 900;
const windowHeight = 820;

app.whenReady().then(async () => {
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    resizable: false,
    webPreferences: {
      preload: path.join(scripts, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
    },
  });

  db = new sqlite3.Database(dbPath, (err) => {
    if(err) {
      console.log(err.message);
      return;
    }
    console.log('DB connecting success');
  });
  // mainWindow.loadFile(path.join(views, 'home.html'));
  mainWindow.loadFile(path.join(views, 'squad.jsx'));

  const arrColumns = await mainWindow.webContents.executeJavaScript('commonData.getColumns');
  const batColumns = arrColumns[0];
  const pitColumns = arrColumns[1];
  
  let createQuery = `CREATE TABLE IF NOT EXISTS batters (
    idx INTEGER PRIMARY KEY AUTOINCREMENT, `;
  for(const key in batColumns) {
    createQuery += `${key} ${batColumns[key][1]}, `;
  }
  createQuery += `display_yn TEXT);`;
  createQuery += ` CREATE TABLE IF NOT EXISTS pitchers (
    idx INTEGER PRIMARY KEY AUTOINCREMENT, `
    for(const key in pitColumns) {
      createQuery += `${key} ${pitColumns[key][1]}, `;
    }
  createQuery += `display_yn TEXT);`;
  db.run(createQuery, (err) => { 
    if(err) {
      console.log(err);
    }
  });
  mainWindow.on('closed', () => {
    db.close((err) => {
      if(err) console.log(err);
        else console.log('data closed Success');
    })
  })
});

ipcMain.handle('add-data', async (data) => {
  let tableName = (data.position == 'P') ? 'pitchers' : 'batters';
  
  // DB Insert
  const workType = data.workType;
  let query = `INSERT INTO batters 
  ( YEAR, NAME, TYPE, POSITION,
   POW, DEX, CON, INT, SPD, DEF,
   POT_POW, POT_CLU, POT_DEF,
   HAND, ETC)
  VALUES ()`;
  switch(workType) {
    case "insert":
      
      break;
    case "search": 
      break;
  }
  return new Promise((resolve, reject) => {
    db.run(query, (err) => { if(err) reject(err)
                              else resolve();})
  })
});

ipcMain.handle('search', async (event, data, columns) => {
  const table = data.display_type == 'P' ? 'pitchers' : 'batters';
  let query = `
   SELECT idx,`;
  for(const key in columns) {
    query += ` ${key},`;
  }
  if(data.display_type == 'B') {
    query += ` hotcold_normal || '-' || hotcold_cold AS hotcold,`;
  }
  query += `
          pot_pow || ' / ' || pot_clu || ' / ' || pot_def AS pot
        , use_yn
        , display_yn 
        , exist_yn
     FROM ${table}
    WHERE display_yn = 'Y'
      `;
  for(const key in data) {
    if(Array.isArray(data[key]) && data[key].length > 0) {
      query += ` AND ${key} IN ('${data[key].join("','")}')`;
    }
  }
  query += `
    ORDER BY idx
    LIMIT 300`;
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all(query, (err, rows) => {
        if(err) {
          reject(err);
        } else {
          resolve(rows);
        } 
      })
    })
  });
});

ipcMain.on('open-modal', (event, type) => {
  modalWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    width: windowWidth,
    height: 400,
    resizable: false,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(scripts, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
    }
  });

  modalWindow.loadFile(path.join(views, 'modal', `${type}.html`));
})

ipcMain.on('close-modal', (event) => {
  if(modalWindow) {
    modalWindow.close();
  }
})

ipcMain.on('move-modal', (event, {deltaX, deltaY}) => {
  const {x, y, width, height} = mainWindow.getBounds(); // 현재 창 위치 가져오기
  modalWindow.setBounds({
    x: deltaX - x,
    y: deltaY - y,
    width: width,
    height: height,
  });
})