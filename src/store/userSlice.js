import { createSlice } from '@reduxjs/toolkit';

const Localuser = JSON.parse(localStorage.getItem('user'));
console.log("loc user",Localuser)
const initialState = {
    user: Localuser || null,
    isAuthenticated: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            state.user = action.payload;   // e.g. { id, name, email }
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
