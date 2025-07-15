const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Weight extends Model {
    static associate(models) {
      Weight.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
    }
  }
  Weight.init({
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
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Weight',
    tableName: 'weights',
    underscored: true,
    timestamps: true,
  });
  return Weight;
}; 