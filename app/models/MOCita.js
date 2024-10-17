const { Sequelize } = require('sequelize');
const connection = require('./database');

const sequelize = new Sequelize(connection);
const Paciente = require('./Paciente');
const Medico = require('./Medico');

const Cita = sequelize.define('Cita', {
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
  medicoId: {
    type: DataTypes.INTEGER,
    references: {
      model: Medico,
      key: 'id'
    }
  },
  fechaHora: {
    type: DataTypes.DATE,
    allowNull: false
  },
  motivoConsulta: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

Cita.belongsTo(Paciente, { foreignKey: 'pacienteId' });
Cita.belongsTo(Medico, { foreignKey: 'medicoId' });

module.exports = Cita;