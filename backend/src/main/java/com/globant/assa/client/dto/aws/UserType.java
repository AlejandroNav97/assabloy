package com.globant.assa.client.dto.aws;

import lombok.Getter;
import lombok.Setter;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;

import java.util.List;

@Getter
@Setter
public class UserType {

  private List<AttributeType> attributes;

}
