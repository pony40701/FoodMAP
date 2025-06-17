package com.example.demo.dto;

import java.sql.Timestamp;

public class RestaurantListDTO {

	private String name; 
	private String address;
	private Double averageRating;
	private Integer reviewCount;
	private String placeId;
	private Timestamp createdAt;
	private String description;
	private String types;
	private String photoUrl;
	private Double latitude;
	private Double longitude;
	
	public RestaurantListDTO() {}
	
	public RestaurantListDTO(String name, String address,
			Double averageRating, Integer reviewCount, String placeId,
			Timestamp createdAt, String description, String types, String photoUrl,
			Double latitude, Double longitude) {
				this.name = name;
				this.address = address;
				this.averageRating = averageRating;
				this.reviewCount = reviewCount;
				this.placeId = placeId;
				this.createdAt = createdAt;
				this.description = description;
				this.types = types;
				this.photoUrl = photoUrl;
				this.latitude = latitude;
				this.longitude = longitude;
	}

	public Timestamp getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Timestamp createdAt) {
		this.createdAt = createdAt;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getTypes() {
		return types;
	}

	public void setTypes(String types) {
		this.types = types;
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

	public Double getAverageRating() {
		return averageRating;
	}

	public void setAverageRating(Double averageRating) {
		this.averageRating = averageRating;
	}

	public Integer getReviewCount() {
		return reviewCount;
	}

	public void setReviewCount(Integer reviewCount) {
		this.reviewCount = reviewCount;
	}

	public String getPlaceId() {
		return placeId;
	}

	public void setPlaceId(String placeId) {
		this.placeId = placeId;
	}

	public String getPhotoUrl() {
		return photoUrl;
	}

	public void setPhotoUrl(String photoUrl) {
		this.photoUrl = photoUrl;
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
