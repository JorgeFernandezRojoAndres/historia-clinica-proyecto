module.exports = {
  root: __dirname,
  db: {
      database: 'medicappdb', 
      username: 'root', 
      password: '', 
      options: {
          host: 'localhost',
          port: 3306, 
          ssl: {
              rejectUnauthorized: false,
          },
      },
  },
};
