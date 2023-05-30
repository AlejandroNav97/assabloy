package com.globant.assa.util;

import com.globant.assa.constants.Constants;
import org.apache.commons.codec.binary.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class Util {

  public static String getCurrentTimeStamp() {
    SimpleDateFormat dateFormat = new SimpleDateFormat(Constants.DATE_FORMAT, Locale.US);
    dateFormat.setTimeZone(TimeZone.getTimeZone(Constants.TIME_ZONE));
    Date now = new Date();
    String date = dateFormat.format(now);
    return date;
  }

  public static String md5(String str) throws Exception {
    MessageDigest md = MessageDigest.getInstance(Constants.MD5);
    md.reset();
    md.update(str.getBytes(Constants.CHARSET));
    final byte[] digestArray = md.digest();
    String stringBase64 = Base64.encodeBase64String(digestArray);
    return stringBase64;
  }

  public static String sha1(String data, String key) throws Exception {
    Mac mac = Mac.getInstance(Constants.HMACSHA1);
    SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), Constants.HMACSHA1);
    mac.init(secretKey);
    return Base64.encodeBase64String(mac.doFinal(data.getBytes()));
  }

  public static String getTimeISO8601(LocalDateTime localDateTime) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(Constants.ISO8601_FORMAT);
    String formatDateTime = localDateTime.format(formatter);
    return formatDateTime;
  }

}
