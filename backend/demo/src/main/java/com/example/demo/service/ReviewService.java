package com.example.demo.service;

import com.example.demo.dto.ReviewRequestDto;
import com.example.demo.dto.ReviewStatsDto;
import com.example.demo.dto.UserReviewStatsDto;
import com.example.demo.dto.ReviewStatsDetailDto;
import com.example.demo.dto.ReviewDraftDto;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
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
        try {
            log.info("創建新評論：userId={}, title={}, contentLength={}, newImages={}, existingPhotos={}, existingImageInfo={}", 
                dto.getUserId(), 
                dto.getTitle(),
                dto.getContent_json() != null ? dto.getContent_json().length() : 0,
                dto.getPhotoData() != null ? dto.getPhotoData().size() : 0,
                dto.getPhotos() != null ? dto.getPhotos().size() : 0,
                dto.getExistingImageInfo() != null ? dto.getExistingImageInfo().size() : 0);
            
            if (dto.getContent_json() != null && dto.getContent_json().length() > 50000) {
                log.warn("評論內容過長：{} 字符", dto.getContent_json().length());
            }
            
            // 1. 建立評論
            Review review = new Review();
            User user = new User();
            user.setId(dto.getUserId().longValue());
            review.setUser(user);
            
            Restaurant restaurant = new Restaurant();
            restaurant.setId(dto.getRestaurantId());
            review.setRestaurant(restaurant);
            
            review.setTitle(dto.getTitle());
            review.setContentJson(dto.getContent_json());
            review.setStatus(dto.getStatus());
            review.setCreatedAt(java.time.LocalDateTime.now());
            review.setUpdatedAt(java.time.LocalDateTime.now());
            review = reviewRepository.save(review);
            log.info("評論建立成功：reviewId={}", review.getId());

            // 2. 儲存評分
            saveReviewRating(dto.getRatings(), review);

            // 3. 儲存新圖片數據
            if (dto.getPhotoData() != null && !dto.getPhotoData().isEmpty()) {
                saveReviewPhotoData(dto.getPhotoData(), review);
            }
            
            // 4. 處理已存在的圖片ID
            if (dto.getPhotos() != null && !dto.getPhotos().isEmpty()) {
                for (String photoId : dto.getPhotos()) {
                    if (photoId.matches("\\d+")) {
                        // 從原始圖片複製數據
                        Optional<ReviewPhoto> originalPhotoOpt = reviewPhotoRepository.findById(Integer.parseInt(photoId));
                        if (originalPhotoOpt.isPresent()) {
                            ReviewPhoto originalPhoto = originalPhotoOpt.get();
                            
                            ReviewPhoto photo = new ReviewPhoto();
                            photo.setReview(review);
                            photo.setImageUrl(originalPhoto.getImageUrl());
                            photo.setImage(originalPhoto.getImage()); // 複製圖片數據
                            photo.setImageWidth(originalPhoto.getImageWidth()); // 複製原始寬度
                            photo.setImageHeight(originalPhoto.getImageHeight()); // 複製原始高度
                            
                            // 如果有existingImageInfo，使用新的尺寸信息覆蓋原始信息
                            if (dto.getExistingImageInfo() != null && dto.getExistingImageInfo().containsKey(photoId)) {
                                ReviewRequestDto.PhotoData imageInfo = dto.getExistingImageInfo().get(photoId);
                                if (imageInfo.getSize() != null) {
                                    photo.setImageWidth(imageInfo.getSize().getWidth());
                                    photo.setImageHeight(imageInfo.getSize().getHeight());
                                    log.info("使用existingImageInfo更新複製圖片的大小信息：photoId={}, width={}, height={}", 
                                        photoId, imageInfo.getSize().getWidth(), imageInfo.getSize().getHeight());
                                }
                            }
                            
                            ReviewPhoto savedPhoto = reviewPhotoRepository.save(photo);
                            
                            // 替換已存在圖片的佔位符
                            String contentJson = review.getContentJson();
                            if (contentJson != null) {
                                String oldPlaceholder = String.format("[IMAGE_PLACEHOLDER_%s]", photoId);
                                String newPlaceholder = String.format("[IMAGE_PLACEHOLDER_%d]", savedPhoto.getId());
                                if (contentJson.contains(oldPlaceholder)) {
                                    contentJson = contentJson.replace(oldPlaceholder, newPlaceholder);
                                    review.setContentJson(contentJson);
                                    log.info("替換已存在圖片佔位符：{} -> {}", oldPlaceholder, newPlaceholder);
                                }
                            }
                            
                            log.info("複製外部圖片：originalId={}, newId={}, hasImageData={}", 
                                photoId, savedPhoto.getId(), savedPhoto.getImage() != null && savedPhoto.getImage().length > 0);
                        } else {
                            log.warn("跳過不存在的圖片ID：{}", photoId);
                        }
                    }
                }
                
                // 保存更新後的內容
                reviewRepository.save(review);
            }

            // 5. 儲存標籤
            saveReviewTags(dto.getTags(), review);

            // 6. 如果是發布狀態，建立統計資料
            if ("published".equals(dto.getStatus())) {
                createReviewStats(review);
            }

            return review.getId().intValue();
        } catch (Exception e) {
            log.error("創建評論時發生錯誤：", e);
            throw new RuntimeException("創建評論失敗：" + e.getMessage());
        }
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
        // 處理舊的URL格式（向後兼容）
        for (String url : photoUrls) {
            ReviewPhoto photo = new ReviewPhoto();
            photo.setReview(review);
            photo.setImageUrl(url);
            reviewPhotoRepository.save(photo);
        }
        log.info("儲存評論照片：reviewId={}, 照片數量={}", review.getId(), photoUrls.size());
    }

    private void saveReviewPhotoData(List<ReviewRequestDto.PhotoData> photoDataList, Review review) {
        // 處理新的圖片數據
        if (photoDataList != null && !photoDataList.isEmpty()) {
            for (int i = 0; i < photoDataList.size(); i++) {
                ReviewRequestDto.PhotoData photoData = photoDataList.get(i);
                ReviewPhoto photo = new ReviewPhoto();
                photo.setReview(review);
                photo.setImageUrl(photoData.getFileName()); // 使用檔名作為URL
                photo.setImage(photoData.getImageData()); // 儲存圖片數據
                
                // 保存圖片大小信息
                if (photoData.getSize() != null) {
                    photo.setImageWidth(photoData.getSize().getWidth());
                    photo.setImageHeight(photoData.getSize().getHeight());
                }
                
                ReviewPhoto savedPhoto = reviewPhotoRepository.save(photo);
                
                // 在HTML內容中插入圖片佔位符
                String contentJson = review.getContentJson();
                if (contentJson != null) {
                    String placeholder = String.format("[NEW_IMAGE_PLACEHOLDER_%d]", i);
                    String imagePlaceholder = String.format("[IMAGE_PLACEHOLDER_%d]", savedPhoto.getId());
                    contentJson = contentJson.replace(placeholder, imagePlaceholder);
                    review.setContentJson(contentJson);
                }
            }
        }
        
        // 保存更新後的內容
        if (!photoDataList.isEmpty()) {
            reviewRepository.save(review);
        }
        
        log.info("儲存評論圖片數據：reviewId={}, 圖片數量={}", review.getId(), photoDataList.size());
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
    public List<ReviewDraftDto> getDraftsByUserId(Integer userId) {
        List<Review> drafts = reviewRepository.findByUserIdAndStatus(userId.intValue(), "draft");
        log.info("查詢用戶草稿：userId={}, 草稿數量={}", userId, drafts.size());
        
        return drafts.stream().map(draft -> {
            ReviewDraftDto dto = new ReviewDraftDto();
            dto.setId(draft.getId().intValue());
            dto.setUserId(userId);
            dto.setRestaurantId(draft.getRestaurant().getId());
            dto.setTitle(draft.getTitle());
            dto.setContentJson(draft.getContentJson());
            dto.setStatus(draft.getStatus());
            dto.setCreatedAt(draft.getCreatedAt());
            dto.setUpdatedAt(draft.getUpdatedAt());

            // 設置評分
            ReviewRating rating = reviewRatingRepository.findById(draft.getId().intValue())
                    .orElseThrow(() -> new RuntimeException("評分資料不存在"));
            ReviewDraftDto.ReviewRatingsDto ratingsDto = new ReviewDraftDto.ReviewRatingsDto();
            ratingsDto.setEnvironmentScore(rating.getEnvironmentScore());
            ratingsDto.setServiceScore(rating.getServiceScore());
            ratingsDto.setTasteScore(rating.getTasteScore());
            ratingsDto.setPriceScore(rating.getPriceScore());
            ratingsDto.setOverallScore(rating.getOverallScore());
            dto.setRatings(ratingsDto);

            // 設置照片
            List<ReviewPhoto> photos = reviewPhotoRepository.findByReviewId(draft.getId().intValue());
            dto.setPhotos(photos.stream()
                    .filter(photo -> photo.getImage() != null && photo.getImage().length > 0)
                    .map(photo -> photo.getId().toString())
                    .collect(Collectors.toList()));

            // 設置標籤
            List<ReviewTag> tags = reviewTagRepository.findByReviewId(draft.getId().intValue());
            dto.setTags(tags.stream()
                    .map(tag -> tag.getTag().getName())
                    .collect(Collectors.toList()));

            return dto;
        }).collect(Collectors.toList());
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
        dto.setUserId(review.getUser().getId().intValue());
        dto.setRestaurantId(review.getRestaurant().getId());
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

        // 設置照片 - 只返回有圖片數據的照片
        List<ReviewPhoto> photos = reviewPhotoRepository.findByReviewId(reviewId.intValue());
        dto.setPhotos(photos.stream()
                .filter(photo -> photo.getImage() != null && photo.getImage().length > 0)
                .map(photo -> photo.getId().toString())
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
        try {
            log.info("更新草稿：reviewId={}, title={}, contentLength={}, newImages={}, existingPhotos={}", 
                reviewId,
                dto.getTitle(),
                dto.getContent_json() != null ? dto.getContent_json().length() : 0,
                dto.getPhotoData() != null ? dto.getPhotoData().size() : 0,
                dto.getPhotos() != null ? dto.getPhotos().size() : 0);
            
            Review review = reviewRepository.findById(reviewId.intValue())
                .orElseThrow(() -> new RuntimeException("草稿不存在"));

            if (!"draft".equals(review.getStatus())) {
                throw new RuntimeException("只能編輯草稿");
            }

            // 更新基本資訊
            review.setTitle(dto.getTitle());

            // 設置用戶和餐廳
            User user = new User();
            user.setId(dto.getUserId().longValue());
            review.setUser(user);
            
            Restaurant restaurant = new Restaurant();
            restaurant.setId(dto.getRestaurantId());
            review.setRestaurant(restaurant);

            // 先設置原始內容（包含佔位符）
            review.setContentJson(dto.getContent_json());
            review.setUpdatedAt(java.time.LocalDateTime.now());
            review = reviewRepository.save(review);
            log.info("更新草稿基本資訊：reviewId={}", reviewId);

            // 更新評分
            updateReviewRating(reviewId, dto.getRatings());

            // 更新照片 - 處理新圖片和已存在圖片，並替換佔位符
            updateReviewPhotosAndData(reviewId, dto.getPhotoData(), dto.getPhotos(), dto.getExistingImageInfo());

            // 更新標籤
            updateReviewTags(reviewId, dto.getTags());

            return review.getId().intValue();
        } catch (Exception e) {
            log.error("更新草稿時發生錯誤：reviewId={}", reviewId, e);
            throw new RuntimeException("更新草稿失敗：" + e.getMessage());
        }
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

    private void updateReviewPhotosAndData(Integer reviewId, List<ReviewRequestDto.PhotoData> photoDataList, List<String> photoUrls, Map<String, ReviewRequestDto.PhotoData> existingImageInfo) {
        log.info("開始更新草稿照片：reviewId={}, 新圖片數量={}, 已存在圖片數量={}, 圖片大小信息數量={}", 
            reviewId, 
            photoDataList != null ? photoDataList.size() : 0,
            photoUrls != null ? photoUrls.size() : 0,
            existingImageInfo != null ? existingImageInfo.size() : 0);
        
        // 獲取當前草稿
        Review review = reviewRepository.findById(reviewId.intValue())
            .orElseThrow(() -> new RuntimeException("草稿不存在"));
        
        // 獲取當前內容
        String contentJson = review.getContentJson();
        boolean contentUpdated = false;
        
        log.info("原始內容長度：{}", contentJson != null ? contentJson.length() : 0);
        if (contentJson != null) {
            log.info("原始內容預覽：{}", contentJson.substring(0, Math.min(200, contentJson.length())));
        }
        
        // 獲取當前草稿的所有照片
        List<ReviewPhoto> existingPhotos = reviewPhotoRepository.findByReviewId(reviewId.intValue());
        log.info("當前草稿照片數量：{}", existingPhotos.size());
        
        // 創建一個集合來跟踪需要保留的照片ID
        Set<Integer> photosToKeep = new HashSet<>();
        
        // 處理新的圖片數據
        if (photoDataList != null && !photoDataList.isEmpty()) {
            log.info("處理新圖片數據，數量：{}", photoDataList.size());
            for (int i = 0; i < photoDataList.size(); i++) {
                ReviewRequestDto.PhotoData photoData = photoDataList.get(i);
                ReviewPhoto photo = new ReviewPhoto();
                photo.setReview(review);
                photo.setImageUrl(photoData.getFileName()); // 使用檔名作為URL
                photo.setImage(photoData.getImageData()); // 儲存圖片數據
                
                // 保存圖片大小信息
                if (photoData.getSize() != null) {
                    photo.setImageWidth(photoData.getSize().getWidth());
                    photo.setImageHeight(photoData.getSize().getHeight());
                    log.info("保存新圖片大小信息：{}x{}", photoData.getSize().getWidth(), photoData.getSize().getHeight());
                }
                
                ReviewPhoto savedPhoto = reviewPhotoRepository.save(photo);
                photosToKeep.add(savedPhoto.getId());
                
                // 在HTML內容中插入圖片佔位符
                if (contentJson != null) {
                    String placeholder = String.format("[NEW_IMAGE_PLACEHOLDER_%d]", i);
                    String imagePlaceholder = String.format("[IMAGE_PLACEHOLDER_%d]", savedPhoto.getId());
                    contentJson = contentJson.replace(placeholder, imagePlaceholder);
                    contentUpdated = true;
                    log.info("替換新圖片佔位符：{} -> {}", placeholder, imagePlaceholder);
                }
            }
        }
        
        // 處理已存在的圖片ID - 改為智能更新而不是重新創建
        if (photoUrls != null && !photoUrls.isEmpty()) {
            log.info("處理已存在圖片ID：{}", photoUrls);
            for (String photoId : photoUrls) {
                log.info("處理圖片ID：{}", photoId);
                // 如果是圖片ID（已存在的圖片），檢查是否屬於當前草稿
                if (photoId.matches("\\d+")) {
                    Integer photoIdInt = Integer.parseInt(photoId);
                    
                    // 檢查這個圖片是否已經屬於當前草稿
                    Optional<ReviewPhoto> existingPhotoOpt = existingPhotos.stream()
                        .filter(photo -> photo.getId().equals(photoIdInt))
                        .findFirst();
                    
                    if (existingPhotoOpt.isPresent()) {
                        // 圖片已經屬於當前草稿，更新其大小信息
                        ReviewPhoto existingPhoto = existingPhotoOpt.get();
                        photosToKeep.add(existingPhoto.getId());
                        
                        // 如果有existingImageInfo，更新圖片的大小和對齊信息
                        if (existingImageInfo != null && existingImageInfo.containsKey(photoId)) {
                            ReviewRequestDto.PhotoData imageInfo = existingImageInfo.get(photoId);
                            if (imageInfo.getSize() != null) {
                                existingPhoto.setImageWidth(imageInfo.getSize().getWidth());
                                existingPhoto.setImageHeight(imageInfo.getSize().getHeight());
                                log.info("更新已存在圖片的大小信息：photoId={}, width={}, height={}", 
                                    photoId, imageInfo.getSize().getWidth(), imageInfo.getSize().getHeight());
                            }
                            reviewPhotoRepository.save(existingPhoto);
                        }
                        
                        log.info("保留已存在的圖片：photoId={}, hasImageData={}", 
                            existingPhoto.getId(), existingPhoto.getImage() != null && existingPhoto.getImage().length > 0);
                    } else {
                        // 圖片不屬於當前草稿，需要從其他地方複製
                        Optional<ReviewPhoto> originalPhotoOpt = reviewPhotoRepository.findById(photoIdInt);
                        if (originalPhotoOpt.isPresent()) {
                            ReviewPhoto originalPhoto = originalPhotoOpt.get();
                            
                            ReviewPhoto photo = new ReviewPhoto();
                            photo.setReview(review);
                            photo.setImageUrl(originalPhoto.getImageUrl());
                            photo.setImage(originalPhoto.getImage()); // 複製圖片數據
                            
                            // 如果有existingImageInfo，使用新的尺寸信息覆蓋原始信息
                            if (existingImageInfo != null && existingImageInfo.containsKey(photoId)) {
                                ReviewRequestDto.PhotoData imageInfo = existingImageInfo.get(photoId);
                                if (imageInfo.getSize() != null) {
                                    photo.setImageWidth(imageInfo.getSize().getWidth());
                                    photo.setImageHeight(imageInfo.getSize().getHeight());
                                    log.info("使用existingImageInfo更新複製圖片的大小信息：photoId={}, width={}, height={}", 
                                        photoId, imageInfo.getSize().getWidth(), imageInfo.getSize().getHeight());
                                }
                            }
                            
                            ReviewPhoto savedPhoto = reviewPhotoRepository.save(photo);
                            photosToKeep.add(savedPhoto.getId());
                            
                            // 替換已存在圖片的佔位符
                            if (contentJson != null) {
                                String oldPlaceholder = String.format("[IMAGE_PLACEHOLDER_%s]", photoId);
                                String newPlaceholder = String.format("[IMAGE_PLACEHOLDER_%d]", savedPhoto.getId());
                                log.info("檢查佔位符：{} 是否存在於內容中", oldPlaceholder);
                                if (contentJson.contains(oldPlaceholder)) {
                                    contentJson = contentJson.replace(oldPlaceholder, newPlaceholder);
                                    contentUpdated = true;
                                    log.info("替換已存在圖片佔位符：{} -> {}", oldPlaceholder, newPlaceholder);
                                } else {
                                    log.warn("佔位符 {} 不存在於內容中", oldPlaceholder);
                                }
                            }
                            
                            log.info("複製外部圖片：originalId={}, newId={}, hasImageData={}", 
                                photoId, savedPhoto.getId(), savedPhoto.getImage() != null && savedPhoto.getImage().length > 0);
                        } else {
                            log.warn("跳過不存在的圖片ID：{}", photoId);
                        }
                    }
                } else {
                    log.warn("無效的圖片ID格式：{}", photoId);
                }
            }
        }
        
        // 刪除不再需要的舊照片
        for (ReviewPhoto existingPhoto : existingPhotos) {
            if (!photosToKeep.contains(existingPhoto.getId())) {
                reviewPhotoRepository.delete(existingPhoto);
                log.info("刪除不再需要的舊照片：photoId={}", existingPhoto.getId());
            }
        }
        
        // 保存更新後的內容
        if (contentUpdated) {
            review.setContentJson(contentJson);
            reviewRepository.save(review);
            log.info("更新草稿內容，包含圖片佔位符替換，新內容長度：{}", contentJson.length());
            log.info("新內容預覽：{}", contentJson.substring(0, Math.min(200, contentJson.length())));
        } else {
            log.info("內容沒有變更，跳過保存");
        }
        
        int totalPhotos = (photoDataList != null ? photoDataList.size() : 0) + (photoUrls != null ? photoUrls.size() : 0);
        log.info("更新草稿照片完成：reviewId={}, 新圖片={}, 已存在圖片={}, 總數={}", 
            reviewId, 
            photoDataList != null ? photoDataList.size() : 0,
            photoUrls != null ? photoUrls.size() : 0,
            totalPhotos);
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
        publishedReview.setUser(draft.getUser());  // 設置用戶
        publishedReview.setRestaurant(draft.getRestaurant());  // 設置餐廳
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
            publishedPhoto.setImage(draftPhoto.getImage()); // 複製圖片數據
            publishedPhoto.setImageWidth(draftPhoto.getImageWidth()); // 複製圖片寬度
            publishedPhoto.setImageHeight(draftPhoto.getImageHeight()); // 複製圖片高度
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
            dto.setUserId(userId);
            dto.setRestaurantId(review.getRestaurant().getId());
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

            // 設置照片 - 只返回有圖片數據的照片
            List<ReviewPhoto> photos = reviewPhotoRepository.findByReviewId(review.getId().intValue());
            dto.setPhotos(photos.stream()
                    .filter(photo -> photo.getImage() != null && photo.getImage().length > 0)
                    .map(photo -> photo.getId().toString())
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

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deleteDraftReview(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId.intValue())
                .orElseThrow(() -> new RuntimeException("草稿不存在"));

        if (!"draft".equals(review.getStatus())) {
            throw new RuntimeException("只能刪除草稿");
        }

        // 刪除相關資料
        reviewTagRepository.deleteByReviewId(reviewId.intValue());
        reviewPhotoRepository.deleteByReviewId(reviewId.intValue());
        reviewRatingRepository.deleteById(reviewId.intValue());
        reviewRepository.deleteById(reviewId.intValue());
        
        log.info("刪除草稿：reviewId={}", reviewId);
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
        newDraft.setUser(publishedReview.getUser());
        newDraft.setRestaurant(publishedReview.getRestaurant());
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
        List<ReviewPhoto> publishedPhotos = reviewPhotoRepository.findByReviewId(publishedId.intValue());
        for (ReviewPhoto publishedPhoto : publishedPhotos) {
            ReviewPhoto newPhoto = new ReviewPhoto();
            newPhoto.setReview(newDraft);
            newPhoto.setImageUrl(publishedPhoto.getImageUrl());
            newPhoto.setImage(publishedPhoto.getImage()); // 複製圖片數據
            newPhoto.setImageWidth(publishedPhoto.getImageWidth()); // 複製圖片寬度
            newPhoto.setImageHeight(publishedPhoto.getImageHeight()); // 複製圖片高度
            reviewPhotoRepository.save(newPhoto);
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

        // 設置用戶和餐廳
        User user = new User();
        user.setId(dto.getUserId().longValue());
        review.setUser(user);
        
        Restaurant restaurant = new Restaurant();
        restaurant.setId(dto.getRestaurantId());
        review.setRestaurant(restaurant);
      
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

        // 4. 更新照片 - 專門處理已發布文章的圖片更新
        updatePublishedReviewPhotos(reviewId, dto.getPhotoData(), dto.getPhotos(), dto.getContent_json(), dto.getExistingImageInfo());

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

    /**
     * 專門處理已發布文章的圖片更新
     */
    private void updatePublishedReviewPhotos(Integer reviewId, List<ReviewRequestDto.PhotoData> photoDataList, 
                                           List<String> photoUrls, String contentJson, Map<String, ReviewRequestDto.PhotoData> existingImageInfo) {
        log.info("開始更新已發布文章圖片：reviewId={}, 新圖片數量={}, 已存在圖片數量={}", 
            reviewId, 
            photoDataList != null ? photoDataList.size() : 0,
            photoUrls != null ? photoUrls.size() : 0);
        
        // 獲取當前文章的所有圖片
        List<ReviewPhoto> existingPhotos = reviewPhotoRepository.findByReviewId(reviewId.intValue());
        log.info("當前文章圖片數量：{}", existingPhotos.size());
        
        // 記錄需要保留的圖片ID
        Set<Integer> photosToKeep = new HashSet<>();
        boolean contentUpdated = false;
        
        // 處理新的圖片數據
        if (photoDataList != null && !photoDataList.isEmpty()) {
            log.info("處理新圖片數據，數量：{}", photoDataList.size());
            for (int i = 0; i < photoDataList.size(); i++) {
                ReviewRequestDto.PhotoData photoData = photoDataList.get(i);
                ReviewPhoto photo = new ReviewPhoto();
                photo.setReview(reviewRepository.findById(reviewId.intValue()).orElseThrow());
                photo.setImageUrl(photoData.getFileName()); // 使用檔名作為URL
                photo.setImage(photoData.getImageData()); // 儲存圖片數據
                
                // 保存圖片大小信息
                if (photoData.getSize() != null) {
                    photo.setImageWidth(photoData.getSize().getWidth());
                    photo.setImageHeight(photoData.getSize().getHeight());
                }
                
                ReviewPhoto savedPhoto = reviewPhotoRepository.save(photo);
                photosToKeep.add(savedPhoto.getId());
                
                // 在HTML內容中插入圖片佔位符
                if (contentJson != null) {
                    String placeholder = String.format("[NEW_IMAGE_PLACEHOLDER_%d]", i);
                    String imagePlaceholder = String.format("[IMAGE_PLACEHOLDER_%d]", savedPhoto.getId());
                    contentJson = contentJson.replace(placeholder, imagePlaceholder);
                    contentUpdated = true;
                    log.info("替換新圖片佔位符：{} -> {}", placeholder, imagePlaceholder);
                }
            }
        }
        
        // 處理已存在的圖片ID
        if (photoUrls != null && !photoUrls.isEmpty()) {
            log.info("處理已存在圖片ID：{}", photoUrls);
            for (String photoId : photoUrls) {
                log.info("處理圖片ID：{}", photoId);
                // 如果是圖片ID（已存在的圖片），檢查是否屬於當前文章
                if (photoId.matches("\\d+")) {
                    Integer photoIdInt = Integer.parseInt(photoId);
                    
                    // 檢查這個圖片是否已經屬於當前文章
                    Optional<ReviewPhoto> existingPhotoOpt = existingPhotos.stream()
                        .filter(photo -> photo.getId().equals(photoIdInt))
                        .findFirst();
                    
                    if (existingPhotoOpt.isPresent()) {
                        // 圖片已經屬於當前文章，保留它
                        ReviewPhoto existingPhoto = existingPhotoOpt.get();
                        photosToKeep.add(existingPhoto.getId());
                        
                        // 如果有existingImageInfo，更新圖片的大小和對齊信息
                        if (existingImageInfo != null && existingImageInfo.containsKey(photoId)) {
                            ReviewRequestDto.PhotoData imageInfo = existingImageInfo.get(photoId);
                            if (imageInfo.getSize() != null) {
                                existingPhoto.setImageWidth(imageInfo.getSize().getWidth());
                                existingPhoto.setImageHeight(imageInfo.getSize().getHeight());
                                log.info("更新已存在圖片的大小信息：photoId={}, width={}, height={}", 
                                    photoId, imageInfo.getSize().getWidth(), imageInfo.getSize().getHeight());
                            }
                            reviewPhotoRepository.save(existingPhoto);
                        }
                        
                        log.info("保留已存在的圖片：photoId={}, hasImageData={}", 
                            existingPhoto.getId(), existingPhoto.getImage() != null && existingPhoto.getImage().length > 0);
                    } else {
                        // 圖片不屬於當前文章，需要從其他地方複製
                        Optional<ReviewPhoto> originalPhotoOpt = reviewPhotoRepository.findById(photoIdInt);
                        if (originalPhotoOpt.isPresent()) {
                            ReviewPhoto originalPhoto = originalPhotoOpt.get();
                            
                            ReviewPhoto photo = new ReviewPhoto();
                            photo.setReview(reviewRepository.findById(reviewId.intValue()).orElseThrow());
                            photo.setImageUrl(originalPhoto.getImageUrl());
                            photo.setImage(originalPhoto.getImage()); // 複製圖片數據
                            photo.setImageWidth(originalPhoto.getImageWidth()); // 複製圖片寬度
                            photo.setImageHeight(originalPhoto.getImageHeight()); // 複製圖片高度
                            
                            // 如果有existingImageInfo，使用新的尺寸信息覆蓋原始信息
                            if (existingImageInfo != null && existingImageInfo.containsKey(photoId)) {
                                ReviewRequestDto.PhotoData imageInfo = existingImageInfo.get(photoId);
                                if (imageInfo.getSize() != null) {
                                    photo.setImageWidth(imageInfo.getSize().getWidth());
                                    photo.setImageHeight(imageInfo.getSize().getHeight());
                                    log.info("使用existingImageInfo更新複製圖片的大小信息：photoId={}, width={}, height={}", 
                                        photoId, imageInfo.getSize().getWidth(), imageInfo.getSize().getHeight());
                                }
                            }
                            
                            ReviewPhoto savedPhoto = reviewPhotoRepository.save(photo);
                            photosToKeep.add(savedPhoto.getId());
                            
                            // 替換已存在圖片的佔位符
                            if (contentJson != null) {
                                String oldPlaceholder = String.format("[IMAGE_PLACEHOLDER_%s]", photoId);
                                String newPlaceholder = String.format("[IMAGE_PLACEHOLDER_%d]", savedPhoto.getId());
                                log.info("檢查佔位符：{} 是否存在於內容中", oldPlaceholder);
                                if (contentJson.contains(oldPlaceholder)) {
                                    contentJson = contentJson.replace(oldPlaceholder, newPlaceholder);
                                    contentUpdated = true;
                                    log.info("替換已存在圖片佔位符：{} -> {}", oldPlaceholder, newPlaceholder);
                                } else {
                                    log.warn("佔位符 {} 不存在於內容中", oldPlaceholder);
                                }
                            }
                            
                            log.info("複製外部圖片：originalId={}, newId={}, hasImageData={}", 
                                photoId, savedPhoto.getId(), savedPhoto.getImage() != null && savedPhoto.getImage().length > 0);
                        } else {
                            log.warn("跳過不存在的圖片ID：{}", photoId);
                        }
                    }
                } else {
                    log.warn("無效的圖片ID格式：{}", photoId);
                }
            }
        }
        
        // 刪除不再需要的舊照片
        for (ReviewPhoto existingPhoto : existingPhotos) {
            if (!photosToKeep.contains(existingPhoto.getId())) {
                reviewPhotoRepository.delete(existingPhoto);
                log.info("刪除不再需要的舊照片：photoId={}", existingPhoto.getId());
            }
        }
        
        // 保存更新後的內容
        if (contentUpdated) {
            Review updatedReview = reviewRepository.findById(reviewId.intValue()).orElseThrow();
            updatedReview.setContentJson(contentJson);
            reviewRepository.save(updatedReview);
            log.info("更新已發布文章內容，包含圖片佔位符替換，新內容長度：{}", contentJson.length());
            log.info("新內容預覽：{}", contentJson.substring(0, Math.min(200, contentJson.length())));
        } else {
            log.info("內容沒有變更，跳過保存");
        }
        
        int totalPhotos = (photoDataList != null ? photoDataList.size() : 0) + (photoUrls != null ? photoUrls.size() : 0);
        log.info("更新已發布文章照片完成：reviewId={}, 新圖片={}, 已存在圖片={}, 總數={}", 
            reviewId, 
            photoDataList != null ? photoDataList.size() : 0,
            photoUrls != null ? photoUrls.size() : 0,
            totalPhotos);
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
        Integer userTotalViews = reviewStatsRepository.sumTotalViewsByUserId(review.getUser().getId().intValue());
        Integer userTotalFavorites = reviewStatsRepository.sumTotalFavoritesByUserId(review.getUser().getId().intValue());
        Integer userTotalReviews = reviewStatsRepository.countByUserId(review.getUser().getId().intValue());
        
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

    // 獲取評論圖片數據
    public byte[] getReviewPhotoData(Integer photoId) {
        try {
            ReviewPhoto photo = reviewPhotoRepository.findById(photoId)
                    .orElseThrow(() -> new RuntimeException("圖片不存在"));
            
            if (photo.getImage() != null && photo.getImage().length > 0) {
                log.info("獲取圖片數據：photoId={}, 大小={} bytes", photoId, photo.getImage().length);
                return photo.getImage();
            } else {
                log.warn("圖片數據為空：photoId={}", photoId);
                return null;
            }
        } catch (Exception e) {
            log.error("獲取圖片數據時發生錯誤：photoId={}", photoId, e);
            throw new RuntimeException("獲取圖片失敗：" + e.getMessage());
        }
    }
    
    public Map<String, Object> getReviewPhotoInfo(Integer photoId) {
        try {
            ReviewPhoto photo = reviewPhotoRepository.findById(photoId)
                    .orElseThrow(() -> new RuntimeException("圖片不存在"));
            
            Map<String, Object> photoInfo = new HashMap<>();
            photoInfo.put("id", photo.getId());
            photoInfo.put("imageUrl", photo.getImageUrl());
            photoInfo.put("width", photo.getImageWidth());
            photoInfo.put("height", photo.getImageHeight());
            photoInfo.put("hasImageData", photo.getImage() != null && photo.getImage().length > 0);
            
            log.info("獲取圖片信息：photoId={}, width={}, height={}", 
                photoId, photo.getImageWidth(), photo.getImageHeight());
            return photoInfo;
        } catch (Exception e) {
            log.error("獲取圖片信息時發生錯誤：photoId={}", photoId, e);
            throw new RuntimeException("獲取圖片信息失敗：" + e.getMessage());
        }
    }
}