package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "review_tags")
public class ReviewTag {
    @EmbeddedId
    private ReviewTagId id;

    @ManyToOne
    @MapsId("reviewId")
    @JoinColumn(name = "review_id")
    private Review review;

    @ManyToOne
    @MapsId("tagId")
    @JoinColumn(name = "tag_id")
    private Tag tag;

    public ReviewTag() {}
    
    public ReviewTag(Review review, Tag tag) {
        this.review = review;
        this.tag = tag;
        this.id = new ReviewTagId(review.getId().intValue(), tag.getId().intValue());
    }

    public ReviewTagId getId() { return id; }
    public void setId(ReviewTagId id) { this.id = id; }
    public Review getReview() { return review; }
    public void setReview(Review review) { this.review = review; }
    public Tag getTag() { return tag; }
    public void setTag(Tag tag) { this.tag = tag; }
} 