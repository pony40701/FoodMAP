package com.example.demo.controller;

import com.example.demo.dto.ReviewRequestDto;
import com.example.demo.dto.ReviewStatsDto;
import com.example.demo.dto.ReviewStatsDetailDto;
import com.example.demo.dto.UserReviewStatsDto;
import com.example.demo.entity.Review;
import com.example.demo.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Integer> createReview(@RequestBody ReviewRequestDto requestDto) {
        log.info("創建新評論：userId={}", requestDto.getUserId());
        return ResponseEntity.ok(reviewService.createReview(requestDto));
    }

    @GetMapping("/drafts/{userId}")
    public ResponseEntity<List<Review>> getDraftsByUserId(@PathVariable Integer userId) {
        log.info("獲取用戶草稿：userId={}", userId);
        return ResponseEntity.ok(reviewService.getDraftsByUserId(userId));
    }

    @GetMapping("/drafts/{reviewId}/detail")
    public ResponseEntity<ReviewRequestDto> getDraftDetail(@PathVariable Integer reviewId) {
        log.info("獲取草稿詳情：reviewId={}", reviewId);
        return ResponseEntity.ok(reviewService.getDraftDetail(reviewId));
    }

    @PutMapping("/drafts/{reviewId}")
    public ResponseEntity<Integer> updateDraft(
            @PathVariable Integer reviewId,
            @RequestBody ReviewRequestDto requestDto) {
        log.info("更新草稿：reviewId={}", reviewId);
        return ResponseEntity.ok(reviewService.updateDraft(reviewId, requestDto));
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
} 