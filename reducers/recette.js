import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: {
    mindeeInfo: {},
    image: null,
    notes: null,
    category: null,
  },
};

export const recetteSlice = createSlice({
  name: 'recette',
  initialState,
  reducers: {
    addRecette: (state, action) => {
      state.value.mindeeInfo = action.payload;
    },
    addImage: (state, action) => {
      state.value.image = action.payload.image;
    },
    addNotes: (state, action) => {
      state.value.notes = action.payload.notes;
    },
    addCategory: (state, action) => {
      state.value.category = action.payload.category;
    },
  },
});

export const { addRecette, addImage, addNotes, addCategory } =
  recetteSlice.actions;
export default recetteSlice.reducer;
