const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Reminder extends Model {
    static associate(models) {
      Reminder.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
    }
  }
  Reminder.init({
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Reminder',
    tableName: 'reminders',
    underscored: true,
    timestamps: true,
  });
  return Reminder;
}; 