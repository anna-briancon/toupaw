const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserPet extends Model {
    static associate(models) {
      // Associations handled in User and Pet
    }
  }
  UserPet.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'users', key: 'id' },
    },
    pet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'pets', key: 'id' },
    },
    role: {
      type: DataTypes.ENUM('owner', 'partner', 'pet_sitter'),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'UserPet',
    tableName: 'user_pets',
    underscored: true,
    timestamps: true,
  });
  return UserPet;
}; 