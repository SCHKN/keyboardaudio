export const REQUEST_SDK = "REQUEST_SDK";
export const FETCH_SDK_SUCCESS = "FETCH_SDK_SUCCESS";
export const FETCH_SDK_ERROR = "FETCH_SDK_ERROR";

export const requestSDK = () => {
  return {
    type: REQUEST_SDK
  };
};

export const fetchSDKSuccess = json => {
  return {
    type: FETCH_SDK_SUCCESS,
    payload: json
  };
};

export const fetchSDKError = error => {
  return {
    type: FETCH_SDK_ERROR,
    error
  };
};
