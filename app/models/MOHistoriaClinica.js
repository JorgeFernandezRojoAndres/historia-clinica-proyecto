const { Sequelize } = require('sequelize');
const connection = require('./database');

const sequelize = new Sequelize(connection);
const Paciente = require('./Paciente');

const HistoriaClinica = sequelize.define('HistoriaClinica', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pacienteId: {
    type: DataTypes.INTEGER,
    references: {
      model: Paciente,
      key: 'id'
    }
  },
  detalles: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  medicamentos: {
    type: DataTypes.STRING
  },
  alergias: {
    type: DataTypes.STRING
  },
  condicionActual: {
    type: DataTypes.STRING
  },
  pruebasDiagnosticas: {
    type: DataTypes.STRING
  },
  fechaProximaCita: {
    type: DataTypes.DATE
  }
});

HistoriaClinica.belongsTo(Paciente, { foreignKey: 'pacienteId' });

module.exports = HistoriaClinica;