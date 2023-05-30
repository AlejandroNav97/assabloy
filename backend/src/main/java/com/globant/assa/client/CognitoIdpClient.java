package com.globant.assa.client;

import com.globant.assa.constants.Constants;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ListUsersRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ListUsersResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UserType;

@Component
public class CognitoIdpClient {

  @Value("${cognitoidp.region}")
  private String region;

  @Value("${cognitoidp.pool}")
  private String userPoolId;

  public UserType getUserTypeBtId(String userId) {
    CognitoIdentityProviderClient cognitoClient = CognitoIdentityProviderClient.builder()
        .region(Region.of(region))
        .build();
      ListUsersResponse response = cognitoClient
          .listUsers(
              ListUsersRequest.builder().userPoolId(userPoolId)
                  .filter(String.format(Constants.SUB_FILTER, userId))
                  .build());
      return response.users().get(0);
  }

}
