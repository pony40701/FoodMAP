package com.example.demo.dto;

import java.util.Date;

public interface ExReviewProjection {
    Long getReviewId();
    byte[] getImage();
    String getAuthorName();
    String getAuthorAvatar();
    Double getAuthorRating();
    String getReviewTitle();
    String getRestaurantName();
    String getContentJson();
    Date getReviewDate();
    String getCuisineType();
    Integer getViewCount();
    Integer getIsFavorited();
    String getRestaurantPlaceId();
} 