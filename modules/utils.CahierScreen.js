//*-----------------------------Modify reddux--------------------------------*//

import {
  addRecette,
  addImage,
  addNotes,
  addCategory,
  getId,
} from '../reducers/recette';
/**
 * Modify recette reddux.
 *
 * @param {function} dispatch
 * @param {object} recette
 */
export const modifyRecetteReducer = (recette, dispatch) => {
  dispatch(getId(recette._id));
  dispatch(addImage(recette.image));
  dispatch(addNotes(recette.notes));
  dispatch(addCategory(recette.categorie));
  dispatch(addRecette(formatRecette(recette)));
};
//*-----------------------FORMAT FOR REDUXX MINDEE FORMAT-----------------------------
export const formatRecette = (recette) => {
  const formattedRecette = {
    cuissontime: { value: recette.tempsCuisson },
    ingredients: recette.ingredients.map((ingredient) => ({
      ingredient: ingredient.ingredient,
      quantite: ingredient.quantite,
      unite: ingredient.unite,
    })),
    nombrepersonnes: { value: recette.nombrePersonnes },
    preparation: recette.preparation.map((step) => ({
      consigne: step.consigne,
      index: step.index,
    })),
    preparationtime: { value: recette.tempsPreparation },
    titre: { value: recette.titre },
  };
  return formattedRecette;
};
