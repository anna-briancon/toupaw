const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class NotificationSettings extends Model {
    static associate(models) {
      NotificationSettings.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  NotificationSettings.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false, // 'walk', 'meal', 'health', etc.
    },
    times: {
      type: DataTypes.TEXT, // Stocké en TEXT, stringifié JSON
      allowNull: false,
      defaultValue: '[]',
      get() {
        const raw = this.getDataValue('times');
        try { return JSON.parse(raw); } catch { return []; }
      },
      set(val) {
        this.setDataValue('times', JSON.stringify(val || []));
      }
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'NotificationSettings',
    tableName: 'notification_settings',
    underscored: true,
    timestamps: true,
  });
  return NotificationSettings;
}; 