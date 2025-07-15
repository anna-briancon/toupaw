module.exports = (app, router) => {
  require('./testAssociations')(app, router);
  require('./pet')(app, router);
  // Ajoute ici d'autres controllers si besoin
}; 