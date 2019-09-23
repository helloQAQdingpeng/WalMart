'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order_product = sequelize.define('Order_product', {
    productId: DataTypes.INTEGER,
    orderId: DataTypes.INTEGER,
    number: DataTypes.INTEGER
  }, {});
  Order_product.associate = function(models) {
    // associations can be defined here

    models.Order_product.belongsTo(models.Product);
    models.Order_product.belongsTo(models.Order);
  };
  return Order_product;
};