var express = require('express');

var app = express();

const port = 3000;
const bodyParser = require('body-parser');
const connection = require('./conf');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// récupération de l'ensemble des données

app.get('/series', (req, res) => {
  connection.query(`SELECT * FROM series`, (err, results) => {
    if (err) {
      res.status(500).send('Error retrieving series');
    } else {
      res.json(results);
    }
  });
});

// récupération de données light

app.get('/series/name', (req, res) => {
  connection.query(`SELECT name, rating FROM series`, (err, results) => {
    if (err) {
      res.status(500).send(`Error retrieving series' names`);
    } else {
      res.json(results);
    }
  });
});

// filtre sur rating

app.get('/series/pick', (req, res) => {
  let sql = `SELECT * FROM series`;
  let sqlValues = [];
  if (req.query.rating) {
    sql += ` WHERE rating = ?`;
    sqlValues.push(req.query.rating);
  }
  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      res.status(500).send(`Error retrieving serie`);
    } else if (sqlValues.length = 0) {
      res.status(404).send(`No series matching params`);
    } else {
      res.json(results)
    }
  });
});

// filtre 'commence par'

app.get('/series/select', (req, res) => {
  let sql = `SELECT * FROM series`;
  let sqlValues = [];
  if (req.query.name) {
    sql += ` WHERE name LIKE '${req.query.name}%'`;
    sqlValues.push(req.query.name);
    console.log(req.query.name);
  }
  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      res.status(500).send(`Error retrieving series`);
    } else if (sqlValues.length = 0) {
      res.status(404).send(`No series matching your request`);
    } else {
      res.json(results);
    }
  });
});

// filtre 'contient'
app.get('/series/into', (req, res) => {
  let sql = `SELECT * FROM series`;
  let sqlValues = [];
  if (req.query.name) {
    sql += ` WHERE name LIKE '%${req.query.name}%'`;
    sqlValues.push(req.query.name);
    console.log(req.query.name);
  }
  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      res.status(500).send(`Error retrieving series`);
    } else if (sqlValues.length = 0) {
      res.status(404).send(`No series matching your request`);
    } else {
      res.json(results);
    }
  });
});

//filtre 'plus grand que', 'plus petit que'

app.get('/series/date', (req, res) => {
  let sql = `SELECT * FROM series`;
  let sqlValues = [];
  if (req.query.gt) {
    sql += ` WHERE release_date > ?`;
    sqlValues.push(req.query.gt);
  }
  if (req.query.lt) {
    sql += ` WHERE release_date < ?`;
    sqlValues.push(req.query.lt);
  }
  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      res.status(500).send(`Error while sorting series`);
    } else {
      res.json(results);
    }
  });
});

// données ordonnées
app.get('/series/ordered', (req, res) => {
  let sql = `SELECT * FROM series`;
  const sqlValues = [];
  if (req.query.ord) {
    sql += ` ORDER BY name ${req.query.ord}`;
    sqlValues.push(req.query.ord);
  }
  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      res.status(500).send('Error retrieving series');
    } else {
      res.json(results);
    }
  });
});

// sauvegarde d'une nouvelle entité

app.post('/series/new', (req,res) => {
  const formData = req.body;
  connection.query('INSERT INTO series SET ?', formData, err => {
    if (err) {
      res.status(500).send('Error creating a new serie');
    } else {
      res.status(201).send('Your new serie has been created');
    }
  });
});

// modification d'une entité

app.put('/series/change/:id', (req, res) => {
  const idSerie = req.params.id;
  const formData= req.body;
  connection.query('UPDATE series SET ? WHERE id = ?', [formData, idSerie], err => {
    if (err) {
      res.status(500).send(`Error editing serie ${idSerie}`)
    } else {
      res.status(200).send(`The serie has been updated`);
    }
  });
});

// Toggle bool

app.put('/series/toggle', (req, res) => {
  connection.query(`UPDATE series SET has_been_watched = NOT has_been_watched`, err => {
    if (err) {
      res.status(500).send(`Oopsie`);
    } else {
      res.status(200).send(`you got toggled`)
    }
  });
});

// delete entité
app.delete('/series/:id', (req, res) => {
  const idSerie = req.params.id;
  connection.query(`DELETE FROM series WHERE id = ?`, [idSerie], err => {
    if (err) {
      res.status(500).send(`Error deleting serie`);
    } else if (!idSerie) {
      res.status(412).send(`This serie's id does not exist`);
    } else if (idSerie) {
      res.status(200).send(`Supression was effective`);
    }
  });
});

//delete false boolean
app.delete('/series/not', (req, res) => {
  connection.query(`DELETE FROM series WHERE has_been_watched = 0 `, err => {
    if (err) {
      res.status(500).send(`Error deleting serie`);
    } else {
      res.status(200).send(`Suppression was effective`);
    }
  })
})



app.listen(port, err => {
  if (err)  {
    throw new Error('Something strange happened');
  }
  console.log(`Server is listening on ${port}`);
});