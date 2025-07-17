const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pet extends Model {
    static associate(models) {
      Pet.belongsToMany(models.User, {
        through: models.UserPet,
        foreignKey: 'pet_id',
        otherKey: 'user_id',
        as: 'users',
      });
      Pet.hasMany(models.HealthEvent, { foreignKey: 'pet_id', as: 'healthEvents' });
      Pet.hasMany(models.Meal, { foreignKey: 'pet_id', as: 'meals' });
      Pet.hasMany(models.Walk, { foreignKey: 'pet_id', as: 'walks' });
      Pet.hasMany(models.DailyEvent, { foreignKey: 'pet_id', as: 'dailyEvents' });
      Pet.hasMany(models.Reminder, { foreignKey: 'pet_id', as: 'reminders' });
      Pet.hasMany(models.Photo, { foreignKey: 'pet_id', as: 'photos' });
      Pet.hasMany(models.Weight, { foreignKey: 'pet_id', as: 'weights' });
      Pet.hasMany(models.Symptom, { foreignKey: 'pet_id', as: 'symptoms' });
    }
  }
  Pet.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    species: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    breed: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photo_url: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['male', 'female', 'other', null]]
      }
    },
  }, {
    sequelize,
    modelName: 'Pet',
    tableName: 'pets',
    underscored: true,
    timestamps: true,
  });
  return Pet;
}; 