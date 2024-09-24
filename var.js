const urlBackend = 'http://192.168.1.183:3000';

const mindeeResponse = {
  cuissontime: { value: '10 min' },
  ingredients: [
    { ingredient: 'pois chiches', quantite: '250', unite: 'g' },
    { ingredient: 'ail', quantite: '2', unite: 'gousses' },
    { ingredient: 'oignon', quantite: null, unite: null },
    { ingredient: 'cuisine soja', quantite: '20', unite: 'cl' },
    { ingredient: 'farine', quantite: '3', unite: 'cs' },
    { ingredient: 'curcuma en poudre', quantite: null, unite: null },
    { ingredient: 'huile de colza', quantite: '4', unite: 'cs' },
    { ingredient: 'piment de Cayenne en poudre', quantite: null, unite: null },
    { ingredient: 'persil', quantite: null, unite: null },
    { ingredient: 'sel', quantite: null, unite: null },
    { ingredient: 'poivre', quantite: null, unite: null },
  ],
  nombrepersonnes: { value: '4' },
  preparation: [
    {
      consigne:
        "Faire revenir l'oignon émincé et l'ail à la poêle avec un filet d'huile d'olive.",
      index: '1',
    },
    {
      consigne:
        "Mixer les pois chiches égouttés avec la cuisine soja jusqu'à obtenir une texture granuleuse.",
      index: '2',
    },
    {
      consigne:
        'Mettre les pois chiches dans un saladier et ajouter le mélange oignon/ail, le curcuma, le piment, le persil haché ainsi que le sel et le poivre. Et pour finir, ajouter la farine.',
      index: '3',
    },
    {
      consigne:
        'Former des palets puis faire dorer sur une poêle huilée pendant quelques minutes de chaque côté.',
      index: '4',
    },
    { consigne: "Servir immédiatement accompagnées d'une salade.", index: '5' },
  ],
  preparationtime: { value: '15 min' },
  titre: { value: 'Croquettes de pois chiches' },
};

export { urlBackend, mindeeResponse };
