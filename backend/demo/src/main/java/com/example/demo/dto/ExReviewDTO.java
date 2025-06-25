package com.example.demo.dto;

import java.util.Date;

public class ExReviewDTO {
    private Long reviewId;
    private Long authorId;
    private String imageBase64;
    private String authorName;
    private String authorAvatar;
    private Double authorRating;
    private String reviewTitle;
    private String restaurantName;
    private String contentJson;
    private Date reviewDate;
    private String cuisineType;
    private Integer viewCount;
    private boolean isFavorited;
    private String restaurantPlaceId;
    private Integer environmentScore;
    private Integer serviceScore;
    private Integer tasteScore;
    private Integer priceScore;
    private java.util.List<String> tags;

    // Constructors
    public ExReviewDTO() {}

    public ExReviewDTO(Long reviewId, Long authorId, String imageBase64, String authorName, String authorAvatar, Double authorRating, String reviewTitle,
                       String restaurantName, String contentJson, Date reviewDate, String cuisineType, Integer viewCount, boolean isFavorited, String restaurantPlaceId,
                       Integer environmentScore, Integer serviceScore, Integer tasteScore, Integer priceScore, java.util.List<String> tags) {
        this.reviewId = reviewId;
        this.authorId = authorId;
        this.imageBase64 = imageBase64;
        this.authorName = authorName;
        this.authorAvatar = authorAvatar;
        this.authorRating = authorRating;
        this.reviewTitle = reviewTitle;
        this.restaurantName = restaurantName;
        this.contentJson = contentJson;
        this.reviewDate = reviewDate;
        this.cuisineType = cuisineType;
        this.viewCount = viewCount;
        this.isFavorited = isFavorited;
        this.restaurantPlaceId = restaurantPlaceId;
        this.environmentScore = environmentScore;
        this.serviceScore = serviceScore;
        this.tasteScore = tasteScore;
        this.priceScore = priceScore;
        this.tags = tags;
    }

    // Getters and Setters
    public Long getReviewId() {
        return reviewId;
    }

    public void setReviewId(Long reviewId) {
        this.reviewId = reviewId;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorAvatar() {
        return authorAvatar;
    }

    public void setAuthorAvatar(String authorAvatar) {
        this.authorAvatar = authorAvatar;
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

    public String getRestaurantPlaceId() {
        return restaurantPlaceId;
    }

    public void setRestaurantPlaceId(String restaurantPlaceId) {
        this.restaurantPlaceId = restaurantPlaceId;
    }

    public Integer getEnvironmentScore() {
        return environmentScore;
    }

    public void setEnvironmentScore(Integer environmentScore) {
        this.environmentScore = environmentScore;
    }

    public Integer getServiceScore() {
        return serviceScore;
    }

    public void setServiceScore(Integer serviceScore) {
        this.serviceScore = serviceScore;
    }

    public Integer getTasteScore() {
        return tasteScore;
    }

    public void setTasteScore(Integer tasteScore) {
        this.tasteScore = tasteScore;
    }

    public Integer getPriceScore() {
        return priceScore;
    }

    public void setPriceScore(Integer priceScore) {
        this.priceScore = priceScore;
    }

    public java.util.List<String> getTags() {
        return tags;
    }

    public void setTags(java.util.List<String> tags) {
        this.tags = tags;
    }
} 