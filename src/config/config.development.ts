export default {
  rootRoleId: 1,
  jwt: {
    secret: process.env.JWT_SECRET || '123456',
  },
  database: {
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: '12345678',
    database: 'nestadmin',
    synchronize: true,
    logging: false,
    timezone: '+08:00', // 东八区
  },
  redis: {
    host: '127.0.0.1', // default value
    port: 6379, // default value
    password: '',
    db: 0,
  },
};
