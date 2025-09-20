module.exports = {
  root: __dirname,
  db: {
      database: 'medicappdb', 
      username: 'root', 
      password:'jorge007',
 
      options: {
          host: 'localhost',
          port: 3306, 
          ssl: {
              rejectUnauthorized: false,
          },
      },
  },
};
