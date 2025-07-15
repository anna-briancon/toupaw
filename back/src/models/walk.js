const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Walk extends Model {
    static associate(models) {
      Walk.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
    }
  }
  Walk.init({
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
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    distance_m: {
      type: DataTypes.FLOAT,
    },
    elevation_m: {
      type: DataTypes.FLOAT,
    },
    geojson_path: {
      type: DataTypes.TEXT,
    },
    note: {
      type: DataTypes.TEXT,
    },
    events: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Walk',
    tableName: 'walks',
    underscored: true,
    timestamps: true,
  });
  return Walk;
}; 