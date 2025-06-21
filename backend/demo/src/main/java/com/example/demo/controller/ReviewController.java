package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.ReviewDraftDto;
import com.example.demo.dto.ReviewRequestDto;
import com.example.demo.dto.ReviewStatsDetailDto;
import com.example.demo.dto.ReviewStatsDto;
import com.example.demo.dto.UserReviewStatsDto;
import com.example.demo.entity.ReviewPhoto;
import com.example.demo.service.ReviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewRequestDto requestDto) {
        try {
            log.info("創建新評論：userId={}, title={}, contentLength={}", 
                requestDto.getUserId(), 
                requestDto.getTitle(),
                requestDto.getContent_json() != null ? requestDto.getContent_json().length() : 0);
            
            if (requestDto.getContent_json() != null && requestDto.getContent_json().length() > 10000) {
                log.warn("評論內容過長：{} 字符", requestDto.getContent_json().length());
            }
            
            Integer result = reviewService.createReview(requestDto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("創建評論時發生錯誤：", e);
            return ResponseEntity.badRequest()
                .body("錯誤詳情: " + e.getMessage() + "\n堆疊追蹤: " + e.getStackTrace()[0]);
        }
    }

    @GetMapping("/drafts/{userId}")
    public ResponseEntity<List<ReviewDraftDto>> getDraftsByUserId(@PathVariable Integer userId) {
        log.info("獲取用戶草稿：userId={}", userId);
        return ResponseEntity.ok(reviewService.getDraftsByUserId(userId));
    }

    @GetMapping("/drafts/{reviewId}/detail")
    public ResponseEntity<ReviewRequestDto> getDraftDetail(@PathVariable Integer reviewId) {
        log.info("獲取草稿詳情：reviewId={}", reviewId);
        return ResponseEntity.ok(reviewService.getDraftDetail(reviewId));
    }

    @PutMapping("/drafts/{reviewId}")
    public ResponseEntity<?> updateDraft(
            @PathVariable Integer reviewId,
            @RequestBody ReviewRequestDto requestDto) {
        try {
            log.info("更新草稿：reviewId={}, title={}, contentLength={}, newImages={}, existingPhotos={}", 
                reviewId,
                requestDto.getTitle(),
                requestDto.getContent_json() != null ? requestDto.getContent_json().length() : 0,
                requestDto.getPhotoData() != null ? requestDto.getPhotoData().size() : 0,
                requestDto.getPhotos() != null ? requestDto.getPhotos().size() : 0);
            
            if (requestDto.getContent_json() != null && requestDto.getContent_json().length() > 10000) {
                log.warn("草稿內容過長：{} 字符", requestDto.getContent_json().length());
            }
            
            return ResponseEntity.ok(reviewService.updateDraft(reviewId, requestDto));
        } catch (Exception e) {
            log.error("更新草稿時發生錯誤：reviewId={}", reviewId, e);
            return ResponseEntity.badRequest()
                .body("錯誤詳情: " + e.getMessage() + "\n堆疊追蹤: " + e.getStackTrace()[0]);
        }
    }

    @PostMapping("/drafts/{draftId}/publish")
    public ResponseEntity<Integer> publishDraft(
            @PathVariable Integer draftId,
            @RequestParam(defaultValue = "false") boolean deleteDraft) {
        log.info("發布草稿：draftId={}, deleteDraft={}", draftId, deleteDraft);
        return ResponseEntity.ok(reviewService.publishDraft(draftId, deleteDraft));
    }

    @GetMapping("/user/{userId}/published")
    public ResponseEntity<List<ReviewRequestDto>> getPublishedReviewsByUserId(@PathVariable Integer userId) {
        log.info("獲取用戶已發布評論：userId={}", userId);
        return ResponseEntity.ok(reviewService.getPublishedReviewsByUserId(userId));
    }

    @DeleteMapping("/published/{reviewId}")
    public ResponseEntity<Void> deletePublishedReview(@PathVariable Integer reviewId) {
        log.info("刪除已發布評論：reviewId={}", reviewId);
        reviewService.deletePublishedReview(reviewId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/Draft/{reviewId}")
    public ResponseEntity<Void> deleteDraftReview(@PathVariable Integer reviewId) {
        log.info("刪除草稿：reviewId={}", reviewId);
        reviewService.deleteDraftReview(reviewId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/published/{publishedId}/edit-as-draft")
    public ResponseEntity<Integer> editAsNewDraft(
            @PathVariable Integer publishedId,
            @RequestBody ReviewRequestDto requestDto,
            @RequestParam(defaultValue = "false") boolean deletePublished) {
        log.info("將已發布評論轉為草稿：publishedId={}, deletePublished={}", publishedId, deletePublished);
        return ResponseEntity.ok(reviewService.editAsNewDraft(publishedId, requestDto, deletePublished));
    }

    @PutMapping("/published/{reviewId}")
    public ResponseEntity<Integer> updatePublishedReview(
            @PathVariable Integer reviewId,
            @RequestBody ReviewRequestDto requestDto) {
        log.info("更新已發布評論：reviewId={}", reviewId);
        return ResponseEntity.ok(reviewService.updatePublishedReview(reviewId, requestDto));
    }

    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<List<ReviewStatsDto>> getReviewStatsByUserId(@PathVariable Integer userId) {
        log.info("獲取用戶評論統計：userId={}", userId);
        return ResponseEntity.ok(reviewService.getReviewStatsByUserId(userId));
    }

    @GetMapping("/user/{userId}/overview")
    public ResponseEntity<UserReviewStatsDto> getUserReviewStats(@PathVariable Integer userId) {
        log.info("獲取用戶評論總覽：userId={}", userId);
        return ResponseEntity.ok(reviewService.getUserReviewStats(userId));
    }

    @GetMapping("/{reviewId}/stats")
    public ResponseEntity<ReviewStatsDetailDto> getReviewStatsDetail(@PathVariable Integer reviewId) {
        log.info("獲取評論統計詳情：reviewId={}", reviewId);
        return ResponseEntity.ok(reviewService.getReviewStatsDetail(reviewId));
    }

    @PostMapping("/{reviewId}/view")
    public ResponseEntity<Void> incrementViewCount(@PathVariable Integer reviewId) {
        log.info("增加評論瀏覽次數：reviewId={}", reviewId);
        reviewService.incrementViewCount(reviewId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{reviewId}/favorite")
    public ResponseEntity<Void> incrementFavoriteCount(@PathVariable Integer reviewId) {
        log.info("增加評論收藏次數：reviewId={}", reviewId);
        reviewService.incrementFavoriteCount(reviewId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{reviewId}/favorite")
    public ResponseEntity<Void> decrementFavoriteCount(@PathVariable Integer reviewId) {
        log.info("減少評論收藏次數：reviewId={}", reviewId);
        reviewService.decrementFavoriteCount(reviewId);
        return ResponseEntity.ok().build();
    }

    // 獲取評論圖片
    @GetMapping("/photos/{photoId}")
    public ResponseEntity<byte[]> getReviewPhoto(@PathVariable Integer photoId) {
        try {
            log.info("獲取評論圖片：photoId={}", photoId);
            byte[] imageData = reviewService.getReviewPhotoData(photoId);
            if (imageData != null && imageData.length > 0) {
                return ResponseEntity.ok()
                    .header("Content-Type", "image/jpeg") // 預設為JPEG
                    .body(imageData);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("獲取評論圖片時發生錯誤：photoId={}", photoId, e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 獲取評論圖片信息（包含大小）
    @GetMapping("/photos/{photoId}/info")
    public ResponseEntity<Map<String, Object>> getReviewPhotoInfo(@PathVariable Integer photoId) {
        try {
            log.info("獲取評論圖片信息：photoId={}", photoId);
            Map<String, Object> photoInfo = reviewService.getReviewPhotoInfo(photoId);
            if (photoInfo != null) {
                return ResponseEntity.ok(photoInfo);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("獲取評論圖片信息時發生錯誤：photoId={}", photoId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    // 上傳單張評論圖片
    @PostMapping("/photos/upload")
    public ResponseEntity<Map<String, String>> uploadReviewPhoto(@RequestParam("image") MultipartFile imageFile) {
        try {
            log.info("上傳評論圖片: {}", imageFile.getOriginalFilename());
            ReviewPhoto savedPhoto = reviewService.saveSinglePhoto(imageFile);
            String location = "/api/reviews/photos/" + savedPhoto.getId();
            
            Map<String, String> response = new HashMap<>();
            response.put("location", location);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("上傳圖片時發生錯誤:", e);
            return ResponseEntity.badRequest().build();
        }
    }
} 