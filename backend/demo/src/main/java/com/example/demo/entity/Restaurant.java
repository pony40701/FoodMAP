package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "google_restaurants")
public class Restaurant {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(name = "place_id")
private String placeId;

private String name;

private String address;

private Float rating;
@Column(name = "review_count")
private Integer reviewCount;
@Column(name = "created_at")
private java.sql.Timestamp createdAt;
@Column(name = "types")
private String types;
@Column(name ="description")
private String description;

@Column(name = "latitude")
private Double latitude;

@Column(name = "longitude")
private Double longitude;

public Long getId() {
	return id;
}
public void setId(Long id) {
	this.id = id;
}
public String getPlaceId() {
	return placeId;
}
public void setPlaceId(String placeId) {
	this.placeId = placeId;
}
public String getName() {
	return name;
}
public void setName(String name) {
	this.name = name;
}
public String getAddress() {
	return address;
}
public void setAddress(String address) {
	this.address = address;
}
public Float getRating() {
	return rating;
}
public void setRating(Float rating) {
	this.rating = rating;
}
public Integer getReviewCount() {
	return reviewCount;
}
public void setReviewCount(Integer reviewCount) {
	this.reviewCount = reviewCount;
}
public java.sql.Timestamp getCreatedAt() {
	return createdAt;
}
public void setCreatedAt(java.sql.Timestamp createdAt) {
	this.createdAt = createdAt;
}

public Double getAverageRating() {
    return rating != null ? Double.valueOf(rating) : null;
}
public String getTypes() {
	return types;
}
public void setTypes(String types) {
	this.types = types;
}
public String getDescription() {
	return description;
}
public void setDescription(String description) {
	this.description = description;
}

public Double getLatitude() {
	return latitude;
}
public void setLatitude(Double latitude) {
	this.latitude = latitude;
}
public Double getLongitude() {
	return longitude;
}
public void setLongitude(Double longitude) {
	this.longitude = longitude;
}





}
