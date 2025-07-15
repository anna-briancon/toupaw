const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Meal extends Model {
    static associate(models) {
      Meal.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
    }
  }
  Meal.init({
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
    food_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
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
    modelName: 'Meal',
    tableName: 'meals',
    underscored: true,
    timestamps: true,
  });
  return Meal;
}; 