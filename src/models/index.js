import Sequelize from 'sequelize';

const env = process.env.NODE_ENV || 'development';
const { database, username, password } = require('../config/config.js')[env];

const sequelize = new Sequelize(database, username, password, {
  dialect: 'postgres',
  operatorsAliases: Sequelize.Op,
  define: { underscored: false },
});

const models = {
  User: sequelize.import('./user'),
};

Object.keys(models).forEach(modelName => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;
