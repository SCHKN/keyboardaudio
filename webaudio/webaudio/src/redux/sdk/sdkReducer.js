import {
  requestSDK,
  fetchSDKSuccess,
  fetchSDKError,
  REQUEST_SDK,
  FETCH_SDK_SUCCESS,
  FETCH_SDK_ERROR
} from "./sdkActions";
import axios from "axios";

const sdk = (state = {}, action) => {
  switch (action.type) {
    case REQUEST_SDK:
      return {
        ...state,
        loading: true
      };

    case FETCH_SDK_SUCCESS:
      return {
        ...state,
        loading: false,
        ...action.payload
      };
    case FETCH_SDK_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error
      };
    default:
      return state;
  }
};

export const fetchSDK = () => {
  return dispatch => {
    dispatch(requestSDK());
    axios
      .get(`http://localhost:54235/razer/chromasdk/`)
      .then(response => dispatch(fetchSDKSuccess(response.data)))
      .catch(err =>
        dispatch(
          fetchSDKError(
            "SDK could not be retrieved. Make sure that you have Razer Synapse first."
          )
        )
      );
  };
};

export default sdk;
