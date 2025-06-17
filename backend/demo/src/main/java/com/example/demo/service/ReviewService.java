package com.example.foodmap.service;

import com.example.foodmap.dto.ReviewRequestDto;
import com.example.foodmap.dto.ReviewStatsDto;
import com.example.foodmap.dto.UserReviewStatsDto;
import com.example.foodmap.dto.ReviewStatsDetailDto;
import com.example.foodmap.entity.*;
import com.example.foodmap.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import java.util.*;
import lombok.extern.slf4j.Slf4j;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private ReviewPhotoRepository reviewPhotoRepository;
    @Autowired
    private ReviewRatingRepository reviewRatingRepository;
    @Autowired
    private TagRepository tagRepository;
    @Autowired
    private ReviewTagRepository reviewTagRepository;
    @Autowired
    private ReviewStatsRepository reviewStatsRepository;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Integer createReview(ReviewRequestDto dto) {
        // 1. 新增評論
        Review review = new Review();
        review.setTitle(dto.getTitle());
        review.setContentJson(dto.getContent_json());
        review.setStatus(dto.getStatus());
        review.setCreatedAt(java.time.LocalDateTime.now());
        review.setUpdatedAt(java.time.LocalDateTime.now());
        review = reviewRepository.save(review);
        log.info("新增評論：id={}, 標題={}, 狀態={}", review.getId(), review.getTitle(), review.getStatus());

        // 2. 處理評分
        saveReviewRating(dto.getRatings(), review);

        // 3. 處理照片
        saveReviewPhotos(dto.getPhotos(), review);

        // 4. 處理標籤
        saveReviewTags(dto.getTags(), review);

        // 5. 如果是發布狀態，建立統計資料
        if ("published".equals(dto.getStatus())) {
            createReviewStats(review);
        }

        return review.getId().intValue();
    }

    private void saveReviewRating(ReviewRequestDto.ReviewRatingsDto ratingsDto, Review review) {
        ReviewRating rating = new ReviewRating();
        rating.setReview(review);
        rating.setEnvironmentScore(ratingsDto.getEnvironment_score());
        rating.setServiceScore(ratingsDto.getService_score());
        rating.setTasteScore(ratingsDto.getTaste_score());
        rating.setPriceScore(ratingsDto.getPrice_score());
        rating.setOverallScore(ratingsDto.getOverall_score());
        reviewRatingRepository.save(rating);
        log.info("儲存評論評分：reviewId={}", review.getId());
    }

    private void saveReviewPhotos(List<String> photoUrls, Review review) {
        for (String url : photoUrls) {
            ReviewPhoto photo = new ReviewPhoto();
            photo.setReview(review);
            photo.setImageUrl(url);
            reviewPhotoRepository.save(photo);
        }
        log.info("儲存評論照片：reviewId={}, 照片數量={}", review.getId(), photoUrls.size());
    }

    private void saveReviewTags(List<String> tagNames, Review review) {
        for (String tagName : tagNames) {
            // 檢查標籤是否存在，不存在則新增
            Tag tag = tagRepository.findByName(tagName)
                .orElseGet(() -> {
                    Tag newTag = new Tag();
                    newTag.setName(tagName);
                    return tagRepository.save(newTag);
                });

            // 建立評論-標籤關聯
            ReviewTag reviewTag = new ReviewTag(review, tag);
            reviewTagRepository.save(reviewTag);
        }
        log.info("儲存評論標籤：reviewId={}, 標籤數量={}", review.getId(), tagNames.size());
    }

    private void createReviewStats(Review review) {
        ReviewStats stats = new ReviewStats();
        stats.setReview(review);
        stats.setTotalViews(0);
        stats.setTotalFavorites(0);
        reviewStatsRepository.save(stats);
        log.info("建立評論統計：reviewId={}", review.getId());
    }

    // 查詢用戶的草稿列表
    public List<Review> getDraftsByUserId(Integer userId) {
        List<Review> drafts = reviewRepository.findByUserIdAndStatus(userId.intValue(), "draft");
        log.info("查詢用戶草稿：userId={}, 草稿數量={}", userId, drafts.size());
        return drafts;
    }

    // 查詢單篇草稿詳細資料
    public ReviewRequestDto getDraftDetail(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId.intValue())
                .orElseThrow(() -> new RuntimeException("草稿不存在"));

        if (!"draft".equals(review.getStatus())) {
            throw new RuntimeException("只能編輯草稿");
        }

        ReviewRequestDto dto = new ReviewRequestDto();
        dto.setId(review.getId().intValue());
        dto.setTitle(review.getTitle());
        dto.setContent_json(review.getContentJson());
        dto.setStatus(review.getStatus());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());

        // 設置評分
        ReviewRating rating = reviewRatingRepository.findById(reviewId.intValue())
                .orElseThrow(() -> new RuntimeException("評分資料不存在"));
        ReviewRequestDto.ReviewRatingsDto ratingsDto = new ReviewRequestDto.ReviewRatingsDto();
        ratingsDto.setEnvironment_score(rating.getEnvironmentScore());
        ratingsDto.setService_score(rating.getServiceScore());
        ratingsDto.setTaste_score(rating.getTasteScore());
        ratingsDto.setPrice_score(rating.getPriceScore());
        ratingsDto.setOverall_score(rating.getOverallScore());
        dto.setRatings(ratingsDto);

        // 設置照片
        List<ReviewPhoto> photos = reviewPhotoRepository.findByReviewId(reviewId.intValue());
        dto.setPhotos(photos.stream()
                .map(ReviewPhoto::getImageUrl)
                .collect(Collectors.toList()));

        // 設置標籤
        List<ReviewTag> tags = reviewTagRepository.findByReviewId(reviewId.intValue());
        dto.setTags(tags.stream()
                .map(tag -> tag.getTag().getName())
                .collect(Collectors.toList()));

        return dto;
    }

    // 更新草稿
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Integer updateDraft(Integer reviewId, ReviewRequestDto dto) {
        Review review = reviewRepository.findById(reviewId.intValue())
            .orElseThrow(() -> new RuntimeException("草稿不存在"));

        if (!"draft".equals(review.getStatus())) {
            throw new RuntimeException("只能編輯草稿");
        }

        // 更新基本資訊
        review.setTitle(dto.getTitle());
        review.setContentJson(dto.getContent_json());
        review.setUpdatedAt(java.time.LocalDateTime.now());
        review = reviewRepository.save(review);
        log.info("更新草稿基本資訊：reviewId={}", reviewId);

        // 更新評分
        updateReviewRating(reviewId, dto.getRatings());

        // 更新照片
        updateReviewPhotos(reviewId, dto.getPhotos());

        // 更新標籤
        updateReviewTags(reviewId, dto.getTags());

        return review.getId().intValue();
    }

    private void updateReviewRating(Integer reviewId, ReviewRequestDto.ReviewRatingsDto ratingsDto) {
        ReviewRating rating = reviewRatingRepository.findById(reviewId.intValue())
            .orElseThrow(() -> new RuntimeException("評分資料不存在"));

        rating.setEnvironmentScore(ratingsDto.getEnvironment_score());
        rating.setServiceScore(ratingsDto.getService_score());
        rating.setTasteScore(ratingsDto.getTaste_score());
        rating.setPriceScore(ratingsDto.getPrice_score());
        rating.setOverallScore(ratingsDto.getOverall_score());
        reviewRatingRepository.save(rating);
        log.info("更新草稿評分：reviewId={}", reviewId);
    }

    private void updateReviewPhotos(Integer reviewId, List<String> photoUrls) {
        // 刪除舊照片
        reviewPhotoRepository.deleteByReviewId(reviewId.intValue());
        
        // 新增新照片
        Review review = reviewRepository.findById(reviewId.intValue())
            .orElseThrow(() -> new RuntimeException("草稿不存在"));
        for (String url : photoUrls) {
            ReviewPhoto photo = new ReviewPhoto();
            photo.setReview(review);
            photo.setImageUrl(url);
            reviewPhotoRepository.save(photo);
        }
        log.info("更新草稿照片：reviewId={}, 照片數量={}", reviewId, photoUrls.size());
    }

    private void updateReviewTags(Integer reviewId, List<String> tagNames) {
        // 刪除舊標籤
        reviewTagRepository.deleteByReviewId(reviewId.intValue());
        
        // 新增新標籤
        Review review = reviewRepository.findById(reviewId.intValue())
            .orElseThrow(() -> new RuntimeException("草稿不存在"));
        for (String tagName : tagNames) {
            Tag tag = tagRepository.findByName(tagName)
                .orElseGet(() -> {
                    Tag newTag = new Tag();
                    newTag.setName(tagName);
                    return tagRepository.save(newTag);
                });

            ReviewTag reviewTag = new ReviewTag(review, tag);
            reviewTagRepository.save(reviewTag);
        }
        log.info("更新草稿標籤：reviewId={}, 標籤數量={}", reviewId, tagNames.size());
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Integer publishDraft(Integer draftId, boolean deleteDraft) {
        // 1. 取得草稿資料
        Review draft = reviewRepository.findById(draftId.intValue())
                .orElseThrow(() -> new RuntimeException("草稿不存在"));

        if (!"draft".equals(draft.getStatus())) {
            throw new RuntimeException("只能發布草稿");
        }

        // 2. 建立新的發布文章
        Review publishedReview = new Review();
        publishedReview.setTitle(draft.getTitle());
        publishedReview.setContentJson(draft.getContentJson());
        publishedReview.setStatus("published");
        publishedReview.setCreatedAt(java.time.LocalDateTime.now());
        publishedReview.setUpdatedAt(java.time.LocalDateTime.now());
        publishedReview = reviewRepository.save(publishedReview);
        log.info("發布草稿：draftId={}, newReviewId={}", draftId, publishedReview.getId());

        // 3. 複製評分資料
        ReviewRating draftRating = reviewRatingRepository.findById(draftId.intValue())
                .orElseThrow(() -> new RuntimeException("草稿評分資料不存在"));
        ReviewRating publishedRating = new ReviewRating();
        publishedRating.setReview(publishedReview);
        publishedRating.setEnvironmentScore(draftRating.getEnvironmentScore());
        publishedRating.setServiceScore(draftRating.getServiceScore());
        publishedRating.setTasteScore(draftRating.getTasteScore());
        publishedRating.setPriceScore(draftRating.getPriceScore());
        publishedRating.setOverallScore(draftRating.getOverallScore());
        reviewRatingRepository.save(publishedRating);

        // 4. 複製照片資料
        List<ReviewPhoto> draftPhotos = reviewPhotoRepository.findByReviewId(draftId.intValue());
        for (ReviewPhoto draftPhoto : draftPhotos) {
            ReviewPhoto publishedPhoto = new ReviewPhoto();
            publishedPhoto.setReview(publishedReview);
            publishedPhoto.setImageUrl(draftPhoto.getImageUrl());
            reviewPhotoRepository.save(publishedPhoto);
        }

        // 5. 複製標籤資料
        List<ReviewTag> draftTags = reviewTagRepository.findByReviewId(draftId.intValue());
        for (ReviewTag draftTag : draftTags) {
            ReviewTag publishedTag = new ReviewTag(publishedReview, draftTag.getTag());
            reviewTagRepository.save(publishedTag);
        }

        // 6. 建立統計資料
        createReviewStats(publishedReview);

        // 7. 如果選擇刪除草稿，則刪除草稿及其相關資料
        if (deleteDraft) {
            reviewTagRepository.deleteByReviewId(draftId.intValue());
            reviewPhotoRepository.deleteByReviewId(draftId.intValue());
            reviewRatingRepository.deleteById(draftId.intValue());
            reviewRepository.deleteById(draftId.intValue());
            log.info("刪除草稿：draftId={}", draftId);
        }

        return publishedReview.getId().intValue();
    }

    // 查詢用戶的已發布文章列表
    public List<ReviewRequestDto> getPublishedReviewsByUserId(Integer userId) {
        List<Review> reviews = reviewRepository.findByUserIdAndStatus(userId.intValue(), "published");
        log.info("查詢用戶已發布文章：userId={}, 文章數量={}", userId, reviews.size());
        
        return reviews.stream().map(review -> {
            ReviewRequestDto dto = new ReviewRequestDto();
            dto.setId(review.getId().intValue());
            dto.setTitle(review.getTitle());
            dto.setContent_json(review.getContentJson());
            dto.setStatus(review.getStatus());
            dto.setCreatedAt(review.getCreatedAt());
            dto.setUpdatedAt(review.getUpdatedAt());

            // 設置評分
            ReviewRating rating = reviewRatingRepository.findById(review.getId())
                    .orElseThrow(() -> new RuntimeException("評分資料不存在"));
            ReviewRequestDto.ReviewRatingsDto ratingsDto = new ReviewRequestDto.ReviewRatingsDto();
            ratingsDto.setEnvironment_score(rating.getEnvironmentScore());
            ratingsDto.setService_score(rating.getServiceScore());
            ratingsDto.setTaste_score(rating.getTasteScore());
            ratingsDto.setPrice_score(rating.getPriceScore());
            ratingsDto.setOverall_score(rating.getOverallScore());
            dto.setRatings(ratingsDto);

            // 設置照片
            List<ReviewPhoto> photos = reviewPhotoRepository.findByReviewId(review.getId().intValue());
            dto.setPhotos(photos.stream()
                    .map(ReviewPhoto::getImageUrl)
                    .collect(Collectors.toList()));

            // 設置標籤
            List<ReviewTag> tags = reviewTagRepository.findByReviewId(review.getId().intValue());
            dto.setTags(tags.stream()
                    .map(tag -> tag.getTag().getName())
                    .collect(Collectors.toList()));

            return dto;
        }).collect(Collectors.toList());
    }

    // 刪除已發布文章
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deletePublishedReview(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId.intValue())
                .orElseThrow(() -> new RuntimeException("文章不存在"));

        if (!"published".equals(review.getStatus())) {
            throw new RuntimeException("只能刪除已發布的文章");
        }

        // 刪除相關資料
        reviewTagRepository.deleteByReviewId(reviewId.intValue());
        reviewPhotoRepository.deleteByReviewId(reviewId.intValue());
        reviewRatingRepository.deleteById(reviewId.intValue());
        reviewStatsRepository.deleteByReviewId(reviewId.intValue());
        reviewRepository.deleteById(reviewId.intValue());
        
        log.info("刪除已發布文章：reviewId={}", reviewId);
    }

    // 編輯已發布文章 - 模式1：儲存為新草稿
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Integer editAsNewDraft(Integer publishedId, ReviewRequestDto dto, boolean deletePublished) {
        // 1. 檢查原始文章
        Review publishedReview = reviewRepository.findById(publishedId.intValue())
                .orElseThrow(() -> new RuntimeException("文章不存在"));

        if (!"published".equals(publishedReview.getStatus())) {
            throw new RuntimeException("只能編輯已發布的文章");
        }

        // 2. 建立新草稿
        Review newDraft = new Review();
        newDraft.setTitle(dto.getTitle());
        newDraft.setContentJson(dto.getContent_json());
        newDraft.setStatus("draft");
        newDraft.setCreatedAt(java.time.LocalDateTime.now());
        newDraft.setUpdatedAt(java.time.LocalDateTime.now());
        newDraft = reviewRepository.save(newDraft);
        log.info("建立新草稿：publishedId={}, newDraftId={}", publishedId, newDraft.getId());

        // 3. 複製評分資料
        ReviewRating publishedRating = reviewRatingRepository.findById(publishedId.intValue())
                .orElseThrow(() -> new RuntimeException("評分資料不存在"));
        ReviewRating newRating = new ReviewRating();
        newRating.setReview(newDraft);
        newRating.setEnvironmentScore(dto.getRatings().getEnvironment_score());
        newRating.setServiceScore(dto.getRatings().getService_score());
        newRating.setTasteScore(dto.getRatings().getTaste_score());
        newRating.setPriceScore(dto.getRatings().getPrice_score());
        newRating.setOverallScore(dto.getRatings().getOverall_score());
        reviewRatingRepository.save(newRating);

        // 4. 複製照片資料
        for (String photoUrl : dto.getPhotos()) {
            ReviewPhoto photo = new ReviewPhoto();
            photo.setReview(newDraft);
            photo.setImageUrl(photoUrl);
            reviewPhotoRepository.save(photo);
        }

        // 5. 複製標籤資料
        for (String tagName : dto.getTags()) {
            Tag tag = tagRepository.findByName(tagName)
                    .orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setName(tagName);
                        return tagRepository.save(newTag);
                    });
            ReviewTag reviewTag = new ReviewTag(newDraft, tag);
            reviewTagRepository.save(reviewTag);
        }

        // 6. 如果選擇刪除原始文章，則刪除原始文章及其相關資料
        if (deletePublished) {
            reviewTagRepository.deleteByReviewId(publishedId.intValue());
            reviewPhotoRepository.deleteByReviewId(publishedId.intValue());
            reviewRatingRepository.deleteById(publishedId.intValue());
            reviewStatsRepository.deleteByReviewId(publishedId.intValue());
            reviewRepository.deleteById(publishedId.intValue());
            log.info("刪除原始文章：publishedId={}", publishedId.intValue());
        }

        return newDraft.getId().intValue();
    }

    // 編輯已發布文章 - 模式2：直接更新
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Integer updatePublishedReview(Integer reviewId, ReviewRequestDto dto) {
        // 1. 檢查文章
        Review review = reviewRepository.findById(reviewId.intValue())
                .orElseThrow(() -> new RuntimeException("文章不存在"));

        if (!"published".equals(review.getStatus())) {
            throw new RuntimeException("只能編輯已發布的文章");
        }

        // 2. 更新基本資訊
        review.setTitle(dto.getTitle());
        review.setContentJson(dto.getContent_json());
        review.setUpdatedAt(java.time.LocalDateTime.now());
        review = reviewRepository.save(review);
        log.info("更新已發布文章基本資訊：reviewId={}", reviewId);

        // 3. 更新評分
        ReviewRating rating = reviewRatingRepository.findById(reviewId.intValue())
                .orElseThrow(() -> new RuntimeException("評分資料不存在"));
        rating.setEnvironmentScore(dto.getRatings().getEnvironment_score());
        rating.setServiceScore(dto.getRatings().getService_score());
        rating.setTasteScore(dto.getRatings().getTaste_score());
        rating.setPriceScore(dto.getRatings().getPrice_score());
        rating.setOverallScore(dto.getRatings().getOverall_score());
        reviewRatingRepository.save(rating);

        // 4. 更新照片
        reviewPhotoRepository.deleteByReviewId(reviewId.intValue());
        for (String photoUrl : dto.getPhotos()) {
            ReviewPhoto photo = new ReviewPhoto();
            photo.setReview(review);
            photo.setImageUrl(photoUrl);
            reviewPhotoRepository.save(photo);
        }

        // 5. 更新標籤
        reviewTagRepository.deleteByReviewId(reviewId.intValue());
        for (String tagName : dto.getTags()) {
            Tag tag = tagRepository.findByName(tagName)
                    .orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setName(tagName);
                        return tagRepository.save(newTag);
                    });
            ReviewTag reviewTag = new ReviewTag(review, tag);
            reviewTagRepository.save(reviewTag);
        }

        return review.getId().intValue();
    }

    // 查詢用戶的文章數據
    public List<ReviewStatsDto> getReviewStatsByUserId(Integer userId) {
        // 1. 查詢用戶的所有已發布文章
        List<Review> publishedReviews = reviewRepository.findByUserIdAndStatus(userId.intValue(), "published");
        log.info("查詢用戶已發布文章：userId={}, 文章數量={}", userId, publishedReviews.size());

        // 2. 查詢每篇文章的統計資料
        return publishedReviews.stream().map(review -> {
            ReviewStatsDto dto = new ReviewStatsDto();
            dto.setReviewId(review.getId());
            dto.setTitle(review.getTitle());
            dto.setCreatedAt(review.getCreatedAt());
            dto.setUpdatedAt(review.getUpdatedAt());

            // 查詢統計資料
            ReviewStats stats = reviewStatsRepository.findById(review.getId())
                    .orElseGet(() -> {
                        // 如果沒有統計資料，建立一個新的
                        ReviewStats newStats = new ReviewStats();
                        newStats.setReview(review);
                        newStats.setTotalViews(0);
                        newStats.setTotalFavorites(0);
                        return reviewStatsRepository.save(newStats);
                    });

            dto.setTotalViews(stats.getTotalViews());
            dto.setTotalFavorites(stats.getTotalFavorites());

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public UserReviewStatsDto getUserReviewStats(Integer userId) {
        log.info("獲取用戶 {} 的文章統計", userId);
        
        // 獲取用戶所有已發布的文章
        List<Review> reviews = reviewRepository.findByUserIdAndStatus(userId.intValue(), "published");
        if (reviews.isEmpty()) {
            return new UserReviewStatsDto(userId, 0, 0, 0);
        }
        
        // 計算總覽數據
        Integer totalViews = reviewStatsRepository.sumTotalViewsByUserId(userId.intValue());
        Integer totalFavorites = reviewStatsRepository.sumTotalFavoritesByUserId(userId.intValue());
        Integer totalReviews = reviewStatsRepository.countByUserId(userId.intValue());
        
        return new UserReviewStatsDto(userId, totalViews, totalFavorites, totalReviews);
    }
    
    @Transactional
    public ReviewStatsDetailDto getReviewStatsDetail(Integer reviewId) {
        log.info("獲取文章 {} 的統計詳情", reviewId);
        
        Review review = reviewRepository.findById(reviewId.intValue())
            .orElseThrow(() -> new RuntimeException("文章不存在"));
            
        if (!"published".equals(review.getStatus())) {
            throw new RuntimeException("文章未發布");
        }
        
        // 獲取文章統計數據
        ReviewStats stats = reviewStatsRepository.findById(reviewId.intValue())
            .orElseGet(() -> {
                ReviewStats newStats = new ReviewStats();
                newStats.setReview(review);
                return reviewStatsRepository.save(newStats);
            });
        
        // 獲取用戶總覽數據
        Integer userTotalViews = reviewStatsRepository.sumTotalViewsByUserId(review.getUser().getId());
        Integer userTotalFavorites = reviewStatsRepository.sumTotalFavoritesByUserId(review.getUser().getId());
        Integer userTotalReviews = reviewStatsRepository.countByUserId(review.getUser().getId());
        
        // 構建返回數據
        ReviewStatsDetailDto dto = new ReviewStatsDetailDto();
        dto.setReviewId(review.getId());
        dto.setTitle(review.getTitle());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());
        dto.setTotalViews(stats.getTotalViews());
        dto.setTotalFavorites(stats.getTotalFavorites());
        dto.setUserTotalViews(userTotalViews);
        dto.setUserTotalFavorites(userTotalFavorites);
        dto.setUserTotalReviews(userTotalReviews);
        
        return dto;
    }

    @Transactional
    public void incrementViewCount(Integer reviewId) {
        log.info("增加文章 {} 的瀏覽次數", reviewId);
        
        ReviewStats stats = reviewStatsRepository.findById(reviewId.intValue())
            .orElseGet(() -> {
                Review review = reviewRepository.findById(reviewId.intValue())
                    .orElseThrow(() -> new RuntimeException("文章不存在"));
                ReviewStats newStats = new ReviewStats();
                newStats.setReview(review);
                return reviewStatsRepository.save(newStats);
            });
        
        stats.setTotalViews(stats.getTotalViews() + 1);
        reviewStatsRepository.save(stats);
    }

    @Transactional
    public void incrementFavoriteCount(Integer reviewId) {
        log.info("增加文章 {} 的收藏次數", reviewId);
        
        ReviewStats stats = reviewStatsRepository.findById(reviewId.intValue())
            .orElseGet(() -> {
                Review review = reviewRepository.findById(reviewId.intValue())
                    .orElseThrow(() -> new RuntimeException("文章不存在"));
                ReviewStats newStats = new ReviewStats();
                newStats.setReview(review);
                return reviewStatsRepository.save(newStats);
            });
        
        stats.setTotalFavorites(stats.getTotalFavorites() + 1);
        reviewStatsRepository.save(stats);
    }

    @Transactional
    public void decrementFavoriteCount(Integer reviewId) {
        log.info("減少文章 {} 的收藏次數", reviewId);
        
        ReviewStats stats = reviewStatsRepository.findById(reviewId.intValue())
            .orElseThrow(() -> new RuntimeException("文章統計不存在"));
        
        if (stats.getTotalFavorites() > 0) {
            stats.setTotalFavorites(stats.getTotalFavorites() - 1);
            reviewStatsRepository.save(stats);
        }
    }
}
