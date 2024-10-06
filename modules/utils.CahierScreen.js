export const regle3 = (recette, nbrePerson) => {
  const ingredients = recette.ingredients;
  const modifier = nbrePerson / Number(recette.nombrePersonnes);

  for (let qt of ingredients) {
    if (qt.quantite !== null) {
      qt.quantite = Number(qt.quantite);
      qt.quantite *= modifier;
      qt.quantite = String(qt.quantite);
    }
  }
  return ingredients;
};
