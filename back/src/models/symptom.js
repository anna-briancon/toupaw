const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Symptom extends Model {
    static associate(models) {
      Symptom.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
    }
  }
  Symptom.init({
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    intensity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Symptom',
    tableName: 'symptoms',
    underscored: true,
    timestamps: true,
  });
  return Symptom;
}; 