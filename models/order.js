'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    userId: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    out_trade_no: DataTypes.STRING
  }, {});
  Order.associate = function(models) {
    // associations can be defined here
    models.Order.hasMany(models.Order_product);
    models.Order.belongsTo(models.User);
  };
  return Order;
};