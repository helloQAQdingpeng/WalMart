'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    categoryId: DataTypes.INTEGER,
    image: DataTypes.STRING,
    price: DataTypes.INTEGER,
    stock: DataTypes.INTEGER,
    body: DataTypes.TEXT,
    code: DataTypes.STRING
  }, {});
  Product.associate = function(models) {
    // associations can be defined here
    models.Product.belongsTo(models.Category)
  };
  return Product;
};