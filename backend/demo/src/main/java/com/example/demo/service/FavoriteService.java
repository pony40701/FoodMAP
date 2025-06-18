package com.example.demo.service;

import com.example.demo.repository.UserFavoriteRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FavoriteService {
    @Autowired
    private UserFavoriteRepository favoritesRepo;

    @Autowired
    private ObjectMapper objectMapper;

    public List<Map<String, Object>> getFavoriteRestaurants(Long userId) {
        List<String> rawList = favoritesRepo.findFavoriteJsonRawByUserId(userId);
        return rawList.stream().map(json -> {
            try {
                // 將原始 JSON 轉成 Map
                return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            }
        }).collect(Collectors.toList());
    }
}