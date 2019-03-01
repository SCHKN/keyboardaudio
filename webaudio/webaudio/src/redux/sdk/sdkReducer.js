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

const razerSDKUrl = "http://localhost:54235/razer/chromasdk/";

export const fetchSDK = () => {
  return dispatch => {
    dispatch(requestSDK());
    axios
      .get(razerSDKUrl)
      .then(response => {
        const sdkInfo = response.data;
        dispatch(fetchSDKSuccess(sdkInfo));
        // Asking the SDK for a new session
        dispatch(fetchNewSession());
      })
      .catch(err =>
        dispatch(
          fetchSDKError(
            "SDK could not be retrieved. Do you have Razer Synapse?"
          )
        )
      );
  };
};

// Fetching a new session from the Razer SDK
const fetchNewSession = () => {
  return dispatch => {
    axios
      .post(razerSDKUrl, {
        title: "Razer Audio Visualizer",
        description: "Probably the coolest app ever.",
        author: {
          name: "SCHKN",
          contact: "www.schkn.io"
        },
        device_supported: [
          "keyboard",
          "mouse",
          "headset",
          "mousepad",
          "keypad",
          "chromalink"
        ],
        category: "application"
      })
      .then(response => {
        const sessionInfo = response.data;
        dispatch(fetchSDKSuccess(sessionInfo));
        dispatch(maintainConnection(sessionInfo.uri));
      })
      .catch(err =>
        dispatch(
          fetchSDKError(
            "No new session could be retrieved. Contact the developer."
          )
        )
      );
  };
};

const maintainConnection = sessionUri => {
  return dispatch => {
    setInterval(() => {
      axios
        .put(sessionUri + "/heartbeat")
        .then(response => {
          const tick = response.data;
          dispatch(fetchSDKSuccess(tick));
        })
        .catch(err =>
          dispatch(
            fetchSDKError(
              "The connection to the instance has died unexpectedly"
            )
          )
        );
    }, 1000);
  };
};

export default sdk;
