package com.globant.assa.client;

import com.globant.assa.client.dto.assaclient.Endpoint;
import com.globant.assa.client.dto.assaclient.ErrorResponse;
import com.globant.assa.client.dto.assaclient.Invitation;
import com.globant.assa.constants.Constants;
import com.globant.assa.constants.HttpHeaders;
import com.globant.assa.exception.AssaClientException;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.Base64Utils;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static java.nio.charset.StandardCharsets.UTF_8;

@Component
@Log4j2
public class AssaCredentialClient {

  @Value("${assacredential.api.baseUrl}")
  private String url;

  @Value("${assacredential.api.username}")
  private String username;

  @Value("${assacredential.api.password}")
  private String password;

  public Invitation endpointInvitation(Endpoint endpoint){
   WebClient webClient = WebClient.create(url);
   return webClient.post()
       .uri(Constants.ENDPOINT_INVITATION)
       .header(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_JSON_ASSA)
       .header(HttpHeaders.ACCEPT, Constants.APPLICATION_JSON_ASSA)
       .header(HttpHeaders.AUTHORIZATION, Constants.BASIC.concat(Base64Utils
           .encodeToString((String.format("%s:%s",username, password)).getBytes(UTF_8))))
       .body(Mono.just(endpoint), Endpoint.class)
       .exchangeToMono(this::handleResponse)
       .block();

  }

  public void deleteEndpoint(String endpoint){
    WebClient webClient = WebClient.create(url);
    webClient.delete()
        .uri(String.format("%s%s",Constants.ENDPOINT, endpoint))
        .header(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_JSON_ASSA)
        .header(HttpHeaders.ACCEPT, Constants.APPLICATION_JSON_ASSA)
        .header(HttpHeaders.AUTHORIZATION, Constants.BASIC.concat(Base64Utils
            .encodeToString((String.format("%s:%s",username, password)).getBytes(UTF_8))))
        .exchangeToMono(this::handleResponseVoid)
        .block();
  }

  private Mono<Invitation> handleResponse(ClientResponse clientResponse)
  {
    log.info("handleResponse status: {}", clientResponse.statusCode());
    if (clientResponse.statusCode().is4xxClientError())
    {
      return clientResponse.bodyToMono(ErrorResponse.class)
          .flatMap(response -> {
            log.error(response.getDeveloperMessage());
            throw new AssaClientException(response.getCode(), response.getMessage());
          });
    }
    else if (clientResponse.statusCode().is5xxServerError()){
      return clientResponse.bodyToMono(ErrorResponse.class)
          .flatMap(response -> {
            log.error(response.getDeveloperMessage());
            throw new AssaClientException(response.getCode(), response.getMessage());
          });
    }
    return clientResponse.bodyToMono(Invitation.class);
  }

  private Mono<Void> handleResponseVoid(ClientResponse clientResponse)
  {
    log.info("handleResponseVoid status: {}", clientResponse.statusCode());
    if (clientResponse.statusCode().is4xxClientError())
    {
      return clientResponse.bodyToMono(ErrorResponse.class)
          .flatMap(response -> {
            throw new AssaClientException(response.getCode(), response.getMessage());
          });
    }
    else if (clientResponse.statusCode().is5xxServerError()){
      return clientResponse.bodyToMono(ErrorResponse.class)
          .flatMap(response -> {
            log.error(response.getDeveloperMessage());
            throw new AssaClientException(response.getCode(), response.getMessage());
          });
    }
    return clientResponse.bodyToMono(Void.class);
  }


}



