package com.example.foodmap.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ReviewTagId implements Serializable {
    private Integer reviewId;
    private Integer tagId;

    public ReviewTagId() {}
    
    public ReviewTagId(Integer reviewId, Integer tagId) {
        this.reviewId = reviewId;
        this.tagId = tagId;
    }

    public Integer getReviewId() { return reviewId; }
    public void setReviewId(Integer reviewId) { this.reviewId = reviewId; }
    public Integer getTagId() { return tagId; }
    public void setTagId(Integer tagId) { this.tagId = tagId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ReviewTagId)) return false;
        ReviewTagId that = (ReviewTagId) o;
        return Objects.equals(reviewId, that.reviewId) && 
               Objects.equals(tagId, that.tagId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(reviewId, tagId);
    }
} 