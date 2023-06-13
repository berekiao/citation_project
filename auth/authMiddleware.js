const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    res.redirect('/login');
  }

  try {
    // Vérifiez et décodez le jeton d'authentification
    const decoded = jwt.verify(token, 'secret_key');

    // Ajoutez les informations d'authentification à l'objet de requête pour une utilisation ultérieure
    req.userId = decoded.userId;

    // Passez à l'étape suivante du middleware
    next();
  } catch (error) {
    console.error('Erreur lors de la vérification du jeton d\'authentification :', error);
    res.redirect('/login');
  }
}

module.exports = authMiddleware;
