const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class HealthEvent extends Model {
    static associate(models) {
      HealthEvent.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
    }
  }
  HealthEvent.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'pets', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('vaccination', 'vet_visit', 'medication', 'deworming', 'soins'),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
    },
    document_url: {
      type: DataTypes.STRING,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recurrence: {
      type: DataTypes.STRING,
      allowNull: true,
      // valeurs possibles: 'none', '1y', '3m', '1m', etc.
    },
    group_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'HealthEvent',
    tableName: 'health_events',
    underscored: true,
    timestamps: true,
  });
  return HealthEvent;
}; 