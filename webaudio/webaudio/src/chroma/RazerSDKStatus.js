import React from "react";
import { Segment } from "semantic-ui-react";

const RazerSDKStatus = ({ sdk }) => {
    console.log(sdk)
    return (
    <div>
      {sdk.loading ? (
        <Segment loading>Loading the SDK...</Segment>
      ) : sdk.error ? (
        <Segment inverted color="red">
          {sdk.error}
        </Segment>
      ) : (
        <Segment inverted color="green">
          Your computer is equipped with the Razer SDK
        </Segment>
      )}
      
    </div>
  );
};

export default RazerSDKStatus;
