import express from "express"
import bodyParser from 'body-parser';
import { sequelize } from './db_connect.ts';

const port = 5000
const app = express()

// DB Connect
sequelize
  .authenticate()
  .then(() => {
    console.log('Database online.');
  })
  .catch(() => {
    console.log('Database failed to connect.');
  })

// API Routes

app.get("/api", (req, res) => {
  res.send("Hello World!")
})

// DB Sync
sequelize
  .sync({ force: false })
  .then(() => {
    console.log('Database synced.');
  })
  .catch(() => {
    console.log('Database failed to sync.');
  })

// Flush the database (for testing purposes)
app.get('/flush', (req, res) => {
  // Drop all tables in the database
  sequelize
    .drop({ cascade: true })
    .then(() => {
      console.log('All tables dropped successfully');
      res.send('database flushed');
    })
    .catch(error => {
      console.error('Error dropping tables:', error);
      res.send('error flushing database');
    });
});

// API Start
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
