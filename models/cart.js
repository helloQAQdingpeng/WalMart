'use strict';
module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    productId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    number: DataTypes.INTEGER
  }, {});
  Cart.associate = function(models) {
    // associations can be defined here
    models.Cart.belongsTo(models.Product);
  };
  return Cart;
};