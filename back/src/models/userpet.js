module.exports = (sequelize, DataTypes) => {
  const UserPet = sequelize.define('UserPet', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    pet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Pets',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'member'
    }
  }, {
    tableName: 'UserPets',
    timestamps: false
  });

  // Ajout des associations explicites
  UserPet.associate = (models) => {
    UserPet.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
    UserPet.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'Pet' });
  };

  return UserPet;
}; 