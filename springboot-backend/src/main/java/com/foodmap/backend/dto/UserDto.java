package com.foodmap.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.io.Serializable;

@Data
public class UserDto implements Serializable {
    
    @JsonProperty("id")
    private Integer id;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("avatarUrl")
    private String avatarUrl;
    
    public UserDto() {
    }
    
    public UserDto(Integer id, String name, String email, String avatarUrl) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatarUrl = avatarUrl;
    }
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
} 