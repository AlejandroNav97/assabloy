package com.globant.assa.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globant.assa.client.dto.assaclient.*;
import com.globant.assa.constants.Constants;
import com.globant.assa.constants.HttpHeaders;
import com.globant.assa.exception.AssaClientException;
import com.globant.assa.util.Util;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@Log4j2
public class AssaVisionlineClient {



  @Value("${assavisionline.api.baseUrl}")
  private String url;

  @Autowired
  private WebClient webClient;

  @SneakyThrows
  public Session createSession(User user){
    ObjectMapper objectMapper = new ObjectMapper();
    String jsonBody =  objectMapper.writeValueAsString(user);
    return webClient.post()
        .uri(String.format("%s%s%s",url, Constants.BASE_API_PATH ,Constants.PATH_SESSIONS))
        .header(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_JSON)
        .header(HttpHeaders.ACCEPT, Constants.APPLICATION_JSON)
        .header(HttpHeaders.DATE, Util.getCurrentTimeStamp())
        .header(HttpHeaders.CONTENT_MD5,  Util.md5(jsonBody))
        .body(Mono.just(user), User.class)
        .retrieve()
        .bodyToMono(Session.class)
        .block();
  }

  @SneakyThrows
  public void deleteSession(Session session) {
    String toSign = new StringBuilder()
        .append(HttpMethod.DELETE.name())
        .append(Constants.NEW_LINE)
        .append(Constants.NEW_LINE)
        .append(Constants.NEW_LINE)
        .append(Util.getCurrentTimeStamp())
        .append(Constants.NEW_LINE)
        .append(String.format("%s%s%s",Constants.BASE_API_PATH, Constants.PATH_SESSIONS, session.getId()))
        .toString();
    String signed = Util.sha1(toSign, session.getAccessKey());
    webClient.delete()
        .uri(String.format("%s%s%s%s",url, Constants.BASE_API_PATH, Constants.PATH_SESSIONS, session.getId()))
        .header(HttpHeaders.DATE, Util.getCurrentTimeStamp())
        .header(HttpHeaders.AUTHORIZATION, String.format(Constants.AUTHORIZATION_AWS, session.getId(), signed))
        .retrieve()
        .bodyToMono(Void.class)
        .block();
  }

  @SneakyThrows
  public Credential issueKey(Session session,
                             String action,
                             boolean override,
                             Card card){
    String actionPath = "";
    String actionPathToSign = "";
    if(override){
      actionPath = String.format(Constants.CARDS_PATH, url.concat(Constants.BASE_API_PATH), action, true) ;
      actionPathToSign = String.format(Constants.CARDS_PATH,
          Constants.BASE_API_PATH ,action, true);
    }
    else{
      actionPath = String.format(Constants.CARDS_JOINER_PATH, url.concat(Constants.BASE_API_PATH), action, true) ;
      actionPathToSign = String.format(Constants.CARDS_JOINER_PATH,
          Constants.BASE_API_PATH ,action, true);
    }

    ObjectMapper objectMapper = new ObjectMapper();
    String jsonBody = objectMapper.writeValueAsString(card);
    String toSign = new StringBuilder()
        .append(HttpMethod.POST.name())
        .append(Constants.NEW_LINE)
        .append(Util.md5(jsonBody))
        .append(Constants.NEW_LINE)
        .append(Constants.APPLICATION_JSON)
        .append(Constants.NEW_LINE)
        .append(Util.getCurrentTimeStamp())
        .append(Constants.NEW_LINE)
        .append(actionPathToSign)
        .toString();

    String signed = Util.sha1(toSign,session.getAccessKey());
    log.info("issuing key path: {}", actionPath);
    log.info("issuing key: {}", actionPathToSign);
    log.info(card);
    return webClient.post()
        .uri(actionPath)
        .header(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_JSON)
        .header(HttpHeaders.ACCEPT, Constants.APPLICATION_JSON)
        .header(HttpHeaders.DATE, Util.getCurrentTimeStamp())
        .header(HttpHeaders.CONTENT_MD5,  Util.md5(jsonBody))
        .header(HttpHeaders.AUTHORIZATION, String.format(Constants.AUTHORIZATION_AWS, session.getId(), signed))
        .body(Mono.just(card), Credential.class)
        .exchangeToMono(this::handleResponse)
        .block();
  }

  @SneakyThrows
  public Door checkOut(Session session,
                             String room,
                             CheckOut checkOut){
    ObjectMapper objectMapper = new ObjectMapper();
    String jsonBody = objectMapper.writeValueAsString(checkOut);
    String toSign = new StringBuilder()
        .append(HttpMethod.POST.name())
        .append(Constants.NEW_LINE)
        .append(Util.md5(jsonBody))
        .append(Constants.NEW_LINE)
        .append(Constants.APPLICATION_JSON)
        .append(Constants.NEW_LINE)
        .append(Util.getCurrentTimeStamp())
        .append(Constants.NEW_LINE)
        .append(String.format(Constants.DOORS_PATH,
            Constants.BASE_API_PATH ,room))
        .toString();

    String signed = Util.sha1(toSign,session.getAccessKey());

    return webClient.post()
        .uri(String.format(Constants.DOORS_PATH, url + Constants.BASE_API_PATH, room))
        .header(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_JSON)
        .header(HttpHeaders.ACCEPT, Constants.APPLICATION_JSON)
        .header(HttpHeaders.DATE, Util.getCurrentTimeStamp())
        .header(HttpHeaders.CONTENT_MD5,  Util.md5(jsonBody))
        .header(HttpHeaders.AUTHORIZATION, String.format(Constants.AUTHORIZATION_AWS, session.getId(), signed))
        .body(Mono.just(checkOut), CheckOut.class)
        .exchangeToMono(this::handleCheckoutResponse)
        .block();
  }

  private Mono<Credential> handleResponse(ClientResponse clientResponse)
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
    return clientResponse.bodyToMono(Credential.class);
  }

  private Mono<Door> handleCheckoutResponse(ClientResponse clientResponse)
  {
    log.info("handleCheckoutResponse status: {}", clientResponse.statusCode());
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
    return clientResponse.bodyToMono(Door.class);
  }

}
