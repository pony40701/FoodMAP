package com.example.demo.dto;

import java.util.Date;

public interface ExReviewProjection {
    Long getReviewId();
    byte[] getImage();
    String getAuthorName();
    byte[] getAuthorAvatar();
    Long getAuthorId();
    Double getAuthorRating();
    String getReviewTitle();
    String getRestaurantName();
    String getContentJson();
    Date getReviewDate();
    String getCuisineType();
    Integer getViewCount();
    Integer getIsFavorited();
    String getRestaurantPlaceId();
    Integer getEnvironmentScore();
    Integer getServiceScore();
    Integer getTasteScore();
    Integer getPriceScore();
    String getAuthorUsername();
} 