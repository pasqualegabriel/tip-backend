'use strict';

module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define(
    'request',
    {
      fileNumber: {
        allowNull: false,
        type: DataTypes.STRING,
        field: 'file_number'
      },
      univesityOrigin: {
        allowNull: false,
        type: DataTypes.STRING,
        field: 'univesity_origin'
      },
      subjectOrigin: {
        allowNull: false,
        type: DataTypes.STRING,
        field: 'subject_origin'
      },
      subjectUnq: {
        allowNull: false,
        type: DataTypes.STRING,
        field: 'subject_unq'
      },
      equivalence: {
        allowNull: false,
        type: DataTypes.STRING,
        defaultValue: 'SIN EVALUAR'
      },
      year: {
        allowNull: false,
        type: DataTypes.INTEGER
      }
    },
    {
      underscored: true,
      tableName: 'requests'
    }
  );
  Request.associate = function(models) {
    models.request.belongsTo(models.file, { foreignKey: 'fk_fileid', targetKey: 'id' });
  };
  return Request;
};