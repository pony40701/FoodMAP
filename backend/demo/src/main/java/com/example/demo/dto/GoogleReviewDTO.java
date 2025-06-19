package com.example.demo.dto;

import java.util.Date;

public class GoogleReviewDTO {
    private String authorName;
    private Double rating;
    private String text;
    private Date timeCreated;
    private String profilePhotoUrl;

    public GoogleReviewDTO() {}

    public GoogleReviewDTO(String authorName, Double rating, String text, Date timeCreated, String profilePhotoUrl) {
        this.authorName = authorName;
        this.rating = rating;
        this.text = text;
        this.timeCreated = timeCreated;
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public Date getTimeCreated() { return timeCreated; }
    public void setTimeCreated(Date timeCreated) { this.timeCreated = timeCreated; }
    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
} 