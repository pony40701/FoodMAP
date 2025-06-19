package com.example.demo.dto;

import java.util.Date;

public interface ExReviewProjection {
    Long getReviewId();
    Integer getReviewPhotoId();
    String getReviewImage();
    String getAuthorName();
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