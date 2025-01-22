const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const iconv = require('iconv-lite');

let mainWindow, db;
const dbPath = path.join(__dirname, 'data.sqlite3');
const scripts = path.join(__dirname, 'scripts');
const views = path.join(__dirname, 'views');
app.whenReady().then(async () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 820,
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
  mainWindow.loadFile(path.join(views, 'home.html'));

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

ipcMain.on('save-json', async (event, data) => {
    const data_keys = Object.keys(data);
    // for (let key of data_keys) {
    //     if(data[key] == null || data[key] == '' || typeof data[key] == 'undefined') {
    //         event.reply('save-json-reply', { success: false, message: `${key} 데이터오류` });
    //         return;
    //     }
    // }
    let tableName = (data.position == 'P') ? 'pitchers' : 'batters';
    
    // DB Insert
    const workType = data.workType;
    let query = ``;
    switch(workType) {
      case "insert":
        query = `INSERT INTO batters 
        ( YEAR, NAME, TYPE, POSITION,
         POW, DEX, CON, INT, SPD, DEF,
         POT_POW, POT_CLU, POT_DEF,
         HAND, ETC)
        VALUES (
          '2024', '강민호', 'golden', 'C',
          68, 71, 72, 57, 55, 78,
          4, 4, 4,
          'R', '4성'
        )`
        break;
      case "search": 
        break;
    }
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
  query += `
          use_yn
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
        console.log(rows);
        if(err) {
          reject(err);
        } else {
          resolve(rows);
        } 
      })
    })
  });
});