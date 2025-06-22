package com.example.demo.service;

import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.demo.dto.ExReviewDTO;
import com.example.demo.dto.ExReviewProjection;
import com.example.demo.repository.ExReviewRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ExReviewService {

    @Autowired
    private ExReviewRepository exReviewRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Value("${app.web.base-url}")
    private String webBaseUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ExReviewDTO> getLatestReviews(int limit, int offset, String sort, String search, List<String> cuisineTypes, Long userId) {
        List<String> effectiveCuisineTypes = (cuisineTypes == null || cuisineTypes.isEmpty()) ? null : cuisineTypes;
        String effectiveSearch = (search == null || search.trim().isEmpty()) ? null : search;

        List<ExReviewProjection> projections = exReviewRepository.findLatestReviews(limit, offset, sort, effectiveSearch, effectiveCuisineTypes, userId);
        return projections.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ExReviewDTO getReviewById(Long id, Long userId) {
        // userId can be null if the user is not logged in.
        // The repository query is designed to handle a null userId.
        Optional<ExReviewProjection> projection = exReviewRepository.findDetailsById(id, userId);
        return projection.map(this::convertToDto).orElse(null);
    }

    private ExReviewDTO convertToDto(ExReviewProjection projection) {
        String imageBase64 = null;
        if (projection.getImage() != null) {
            imageBase64 = Base64.getEncoder().encodeToString(projection.getImage());
        }

        String updatedContentJson = rewriteImageUrls(projection.getContentJson());

        return new ExReviewDTO(
            projection.getReviewId(),
            imageBase64,
            projection.getAuthorName(),
            projection.getAuthorAvatar(),
            projection.getAuthorRating(),
            projection.getReviewTitle(),
            projection.getRestaurantName(),
            updatedContentJson,
            projection.getReviewDate(),
            projection.getCuisineType(),
            projection.getViewCount(),
            projection.getIsFavorited() != null && projection.getIsFavorited() == 1,
            projection.getRestaurantPlaceId(),
            projection.getEnvironmentScore(),
            projection.getServiceScore(),
            projection.getTasteScore(),
            projection.getPriceScore()
        );
    }

    private String rewriteImageUrls(String contentJson) {
        if (contentJson == null || contentJson.isEmpty()) {
            return contentJson;
        }
        // 使用正規表示式尋找所有 src="/api/reviews/photos/..." 的圖片路徑
        // 並在前面加上 webBaseUrl 來建立一個絕對路徑
        try {
            Pattern pattern = Pattern.compile("src=\"(/api/reviews/photos/\\d+)\"");
            Matcher matcher = pattern.matcher(contentJson);
            StringBuffer sb = new StringBuffer();
            while (matcher.find()) {
                String relativePath = matcher.group(1);
                String absoluteUrl = webBaseUrl + relativePath;
                matcher.appendReplacement(sb, "src=\"" + absoluteUrl + "\"");
            }
            matcher.appendTail(sb);
            return sb.toString();
        } catch (Exception e) {
            System.err.println("在 contentJson 中重寫圖片 URL 時發生錯誤: " + e.getMessage());
            return contentJson; // 發生錯誤時返回原始內容
        }
    }
} 