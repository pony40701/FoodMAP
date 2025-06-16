package com.example.demo.dto;

import java.util.Date;

public interface ExReviewProjection {
    String getReviewImage();
    String getAuthorName();
    Double getAuthorRating();
    String getReviewTitle();
    String getRestaurantName();
    Date getReviewDate();
    String getCuisineType();
    Integer getViewCount();
} 