export const imgReducer = (state, action) => {
    switch (action.type) {
      case "STACK_TOKEN":
        return { ...state, token: state.token.concat(action.token) };
      case "FETCHING_TOKEN":
        return { ...state, fetching: action.fetching };
      default:
        return state;
    }
  };

 export const pageReducer = (state, action) => {
    switch (action.type) {
      case "ADVANCE_PAGE":
        return { ...state, page: state.page + 1 };
      default:
        return state;
    }
  };