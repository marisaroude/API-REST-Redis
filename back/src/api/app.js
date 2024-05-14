const express = require('express');
const connectDb = require('../config/db');
const getList = require('../functions/functions');
const cors = require('cors');


var app = express();

app.use(cors());

app.get('/', async (req, res) => {
  res.send('<h1>Hello Welcome to Redis </h1>');
});
 
//ruta para agregar personajes
//http://localhost:3000/add?episode=1&name=yoda
app.get('/add', async (req, res) => {
  try {
    const con = await connectDb(); 

    const episode = req.query.episode;
    const characterName = req.query.name;

    await con.lPush(episode, characterName);

    res.send('OK');
  } catch (error) {
    console.error('Error to add character:', error);
    res.status(500).send('Error server' );
  }
});

//ruta para quitar un personaje de un episodio
app.get('/remove', async (req, res) => {
  try {
    const con = await connectDb(); 

    const episode = req.query.episode;
    const characterName = req.query.name;

    await con.lRem(episode, 0, characterName);

    res.send('OK');
  } catch (error) {
    console.error('Error to remove character:', error);
    res.status(500).send('Error server');
  }
});
//ruta para listar personajes de un episodio
app.get('/list-episode', async (req, res) => {
  let lista = [];
  try {
    const con = await connectDb(); 
    const episode = req.query.episode;
    lista = await getList(con, episode); 
    res.json(lista);
  } catch (error) {
    console.error('Error to get list of characters:', error);
    res.status(500).json({ error: 'Error server' });
  }
});




////////////////////////////////////////////////////////////

// http://localhost:3000/add-chapter?season=season1&chapter=1
app.get('/add-chapter', async (req, res) => {
  try {
    const con = await connectDb(); 
    const {season, chapter} = req.query;
    await con.lPush(season, chapter);
    res.json({ message: `Chapter: ${chapter} (season: ${season}) added successfully.` }); 
  } catch (error) {
    console.error('Error to add character:', error);
    res.status(500).send('Error server' );
  }
});

// http://localhost:3000/list-chapters?season=season1
app.get('/list-chapters', async (req, res) => {
  let list = [];
  try {
    const con = await connectDb(); 
    const {season} = req.query;
    list = await getList(con, season); 
    res.json(list);
  } catch (error) {
    console.error('Error to get list of chapters:', error);
    res.status(500).json({ error: 'Error server' });
  }
});


app.get('/reserve-chapter', async (req, res) => {
  try {
    const con = await connectDb(); 
    const {season, chapter} = req.query;
    const key = `${season}.${chapter}`;
    await con.setEx(key, 240, 'reserved');
    res.send({message: `Chapter: ${key} reserved successfully.`});
  } catch (error) {
    console.error('Error to reserve chapter:', error);
    res.status(500).json({ error: 'Error server' });
  }
});

app.get('/list-reserved', async (req, res) => {
  try {
    const con = await connectDb(); 
    const { season } = req.query;
    const pattern = `${season}.*`;
    const keys = await con.keys(pattern);
    const reservedChapters = [];
    for (const key of keys) {
      const chapterStatus = await con.get(key);
      if (chapterStatus === 'reserved') {
        const chapter = key.split('.')[1]; // Obtener el número del capítulo desde el nombre de la clave
        const timeLeft = await con.pTTL(key);
        reservedChapters.push({ chapter, timeLeft });
      }
    }
    res.json(reservedChapters);
  } catch (error) {
    console.error('Error listing reserved chapters:', error);
    res.status(500).json({ error: 'Error server' });
  }
});


app.get('/payment-chapter', async (req, res) => {
  try {
    const con = await connectDb(); 
    const {season, chapter, price} = req.query;
    const key = `${season}.${chapter}`;

    if (!price) throw Error;

    await con.setEx(key, 86400, 'rented');
    res.send({message : `Chapter: ${key} rented successfully.`});
  } catch (error) {
    console.error('Error to pay reserve:', error);
    res.status(500).json({ error: 'Error server' });
  }
});

app.get('/list-rented', async (req, res) => {
  try {
    const con = await connectDb(); 
    const { season } = req.query;
    const pattern = `${season}.*`;
    const keys = await con.keys(pattern);
    const rentedChapters = [];
    for (const key of keys) {
      const chapterStatus = await con.get(key);
      if (chapterStatus === 'rented') {
        const chapter = key.split('.')[1]; // Obtener el número del capítulo desde el nombre de la clave
        const timeLeft = await con.pTTL(key);
        rentedChapters.push({ chapter, timeLeft });
      }
    }
    res.json(rentedChapters);
  } catch (error) {
    console.error('Error listing rented chapters:', error);
    res.status(500).json({ error: 'Error server' });
  }
});
app.listen(3001,() => {
  console.log('server is live on port 3001');
});
