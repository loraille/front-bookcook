import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: {
    id: null,
    mindeeInfo: {},
    image: null,
    notes: null,
    category: {},
  },
};

export const recetteSlice = createSlice({
  name: 'recette',
  initialState,
  reducers: {
    getId: (state, action) => {
      state.value.id = action.payload;
    },
    addRecette: (state, action) => {
      state.value.mindeeInfo = action.payload;
    },
    addImage: (state, action) => {
      state.value.image = action.payload;
    },
    addNotes: (state, action) => {
      state.value.notes = action.payload;
    },
    addCategory: (state, action) => {
      state.value.category = action.payload;
    },
  },
});

export const { addRecette, addImage, addNotes, addCategory, getId } =
  recetteSlice.actions;
export default recetteSlice.reducer;
