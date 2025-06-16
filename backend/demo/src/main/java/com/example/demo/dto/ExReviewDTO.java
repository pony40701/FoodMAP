package com.example.demo.dto;

import java.util.Date;

public class ExReviewDTO {
    private String reviewImage;
    private String authorName;
    private Double authorRating;
    private String reviewTitle;
    private String restaurantName;
    private Date reviewDate;
    private String cuisineType;
    private Integer viewCount;

    // Constructors
    public ExReviewDTO() {}

    public ExReviewDTO(String reviewImage, String authorName, Double authorRating, String reviewTitle,
                       String restaurantName, Date reviewDate, String cuisineType, Integer viewCount) {
        this.reviewImage = reviewImage;
        this.authorName = authorName;
        this.authorRating = authorRating;
        this.reviewTitle = reviewTitle;
        this.restaurantName = restaurantName;
        this.reviewDate = reviewDate;
        this.cuisineType = cuisineType;
        this.viewCount = viewCount;
    }

    // Getters and Setters
    public String getReviewImage() {
        return reviewImage;
    }

    public void setReviewImage(String reviewImage) {
        this.reviewImage = reviewImage;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public Double getAuthorRating() {
        return authorRating;
    }

    public void setAuthorRating(Double authorRating) {
        this.authorRating = authorRating;
    }

    public String getReviewTitle() {
        return reviewTitle;
    }

    public void setReviewTitle(String reviewTitle) {
        this.reviewTitle = reviewTitle;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public Date getReviewDate() {
        return reviewDate;
    }

    public void setReviewDate(Date reviewDate) {
        this.reviewDate = reviewDate;
    }

    public String getCuisineType() {
        return cuisineType;
    }

    public void setCuisineType(String cuisineType) {
        this.cuisineType = cuisineType;
    }

    public Integer getViewCount() {
        return viewCount;
    }

    public void setViewCount(Integer viewCount) {
        this.viewCount = viewCount;
    }
} 