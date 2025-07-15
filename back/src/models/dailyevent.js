const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DailyEvent extends Model {
    static associate(models) {
      DailyEvent.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
    }
  }
  DailyEvent.init({
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
      type: DataTypes.ENUM('pee', 'poo', 'drink', 'sleep'),
      allowNull: false,
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'DailyEvent',
    tableName: 'daily_events',
    underscored: true,
    timestamps: true,
  });
  return DailyEvent;
}; 