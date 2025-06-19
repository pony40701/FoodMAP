package com.example.demo.dto;

import java.util.Date;

public class ExReviewDTO {
    private Long reviewId;
    private Integer reviewPhotoId;
    private String reviewImage;
    private String authorName;
    private Double authorRating;
    private String reviewTitle;
    private String restaurantName;
    private String contentJson;
    private Date reviewDate;
    private String cuisineType;
    private Integer viewCount;
    private boolean isFavorited;

    // Constructors
    public ExReviewDTO() {}

    public ExReviewDTO(Long reviewId, Integer reviewPhotoId, String reviewImage, String authorName, Double authorRating, String reviewTitle,
                       String restaurantName, String contentJson, Date reviewDate, String cuisineType, Integer viewCount, boolean isFavorited) {
        this.reviewId = reviewId;
        this.reviewPhotoId = reviewPhotoId;
        this.reviewImage = reviewImage;
        this.authorName = authorName;
        this.authorRating = authorRating;
        this.reviewTitle = reviewTitle;
        this.restaurantName = restaurantName;
        this.contentJson = contentJson;
        this.reviewDate = reviewDate;
        this.cuisineType = cuisineType;
        this.viewCount = viewCount;
        this.isFavorited = isFavorited;
    }

    // Getters and Setters
    public Long getReviewId() {
        return reviewId;
    }

    public void setReviewId(Long reviewId) {
        this.reviewId = reviewId;
    }

    public Integer getReviewPhotoId() {
        return reviewPhotoId;
    }

    public void setReviewPhotoId(Integer reviewPhotoId) {
        this.reviewPhotoId = reviewPhotoId;
    }

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

    public String getContentJson() {
        return contentJson;
    }

    public void setContentJson(String contentJson) {
        this.contentJson = contentJson;
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

    public boolean isFavorited() {
        return isFavorited;
    }

    public void setFavorited(boolean favorited) {
        isFavorited = favorited;
    }
} 