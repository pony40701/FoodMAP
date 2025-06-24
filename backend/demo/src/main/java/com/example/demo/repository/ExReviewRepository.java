package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.dto.ExReviewProjection;
import com.example.demo.entity.Review;

@Repository
public interface ExReviewRepository extends JpaRepository<Review, Long> {

    @Query(value = """
        WITH RankedPhotos AS (
            SELECT
                id,
                review_id,
                image,
                ROW_NUMBER() OVER(PARTITION BY review_id ORDER BY id ASC) as rn
            FROM review_photos
        )
        SELECT DISTINCT
            r.id as reviewId,
            rp.image as image,
            u.id AS authorId,
            u.name AS authorName,
            u.avatar_url AS authorAvatar,
            rr.overall_score AS authorRating,
            rr.environment_score AS environmentScore,
            rr.service_score AS serviceScore,
            rr.taste_score AS tasteScore,
            rr.price_score AS priceScore,
            r.title AS reviewTitle,
            rest.name AS restaurantName,
            r.content_json AS contentJson,
            r.created_at AS reviewDate,
            rest.cuisine_type AS cuisineType,
            rs.total_views AS viewCount,
            rest.place_id as restaurantPlaceId,
            CASE WHEN uf.user_id IS NOT NULL THEN 1 ELSE 0 END AS isFavorited
        FROM reviews r
        LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
        LEFT JOIN review_ratings rr ON rr.review_id = r.id
        LEFT JOIN RankedPhotos rp ON rp.review_id = r.id AND rp.rn = 1
        LEFT JOIN review_stats rs ON rs.review_id = r.id
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN user_favorites uf ON uf.target_id = r.id AND uf.target_type = 'review' AND uf.user_id = :userId
        LEFT JOIN review_tags r_tag ON r_tag.review_id = r.id
        LEFT JOIN tags t ON t.id = r_tag.tag_id
        WHERE r.status = 'published'
        AND (:search IS NULL OR r.title LIKE CONCAT('%', :search, '%') OR rest.name LIKE CONCAT('%', :search, '%') OR u.name LIKE CONCAT('%', :search, '%') OR t.name LIKE CONCAT('%', :search, '%'))
        AND (:cuisineTypes IS NULL OR rest.cuisine_type IN (:cuisineTypes))
        ORDER BY
            CASE WHEN :sort = 'popular' THEN rs.total_views END DESC,
            r.created_at DESC
        LIMIT :limit OFFSET :offset
    """, nativeQuery = true)
    List<ExReviewProjection> findLatestReviews(
            @Param("limit") int limit,
            @Param("offset") int offset,
            @Param("sort") String sort,
            @Param("search") String search,
            @Param("cuisineTypes") List<String> cuisineTypes,
            @Param("userId") Long userId);

    @Query(value = """
        WITH RankedPhotos AS (
            SELECT
                id,
                review_id,
                image,
                ROW_NUMBER() OVER(PARTITION BY review_id ORDER BY id ASC) as rn
            FROM review_photos
        )
        SELECT
            r.id as reviewId,
            rp.image as image,
            u.id AS authorId,
            u.name AS authorName,
            u.avatar_url AS authorAvatar,
            rr.overall_score AS authorRating,
            rr.environment_score AS environmentScore,
            rr.service_score AS serviceScore,
            rr.taste_score AS tasteScore,
            rr.price_score AS priceScore,
            r.title AS reviewTitle,
            rest.name AS restaurantName,
            r.content_json AS contentJson,
            r.created_at AS reviewDate,
            rest.cuisine_type AS cuisineType,
            rs.total_views AS viewCount,
            rest.place_id as restaurantPlaceId,
            1 AS isFavorited
        FROM reviews r
        JOIN user_favorites uf ON r.id = uf.target_id AND uf.target_type = 'review'
        LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
        LEFT JOIN review_ratings rr ON rr.review_id = r.id
        LEFT JOIN RankedPhotos rp ON rp.review_id = r.id AND rp.rn = 1
        LEFT JOIN review_stats rs ON rs.review_id = r.id
        LEFT JOIN users u ON r.user_id = u.id
        WHERE uf.user_id = :userId
        ORDER BY uf.favorited_at DESC
    """, nativeQuery = true)
    List<ExReviewProjection> findFavoritedReviewsByUserId(@Param("userId") Long userId);

    @Query(value = """
        WITH RankedPhotos AS (
            SELECT
                id,
                review_id,
                image,
                ROW_NUMBER() OVER(PARTITION BY review_id ORDER BY id ASC) as rn
            FROM review_photos
        )
        SELECT
            r.id as reviewId,
            rp.image as image,
            u.id AS authorId,
            u.name AS authorName,
            u.avatar_url AS authorAvatar,
            rr.overall_score AS authorRating,
            rr.environment_score AS environmentScore,
            rr.service_score AS serviceScore,
            rr.taste_score AS tasteScore,
            rr.price_score AS priceScore,
            r.title AS reviewTitle,
            rest.name AS restaurantName,
            r.content_json AS contentJson,
            r.created_at AS reviewDate,
            rest.cuisine_type AS cuisineType,
            rs.total_views AS viewCount,
            rest.place_id as restaurantPlaceId,
            CASE WHEN uf.user_id IS NOT NULL THEN 1 ELSE 0 END AS isFavorited
        FROM reviews r
        LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
        LEFT JOIN review_ratings rr ON rr.review_id = r.id
        LEFT JOIN RankedPhotos rp ON rp.review_id = r.id AND rp.rn = 1
        LEFT JOIN review_stats rs ON rs.review_id = r.id
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN user_favorites uf ON uf.target_id = r.id AND uf.target_type = 'review' AND uf.user_id = :userId
        WHERE r.id = :reviewId AND r.status = 'published'
    """, nativeQuery = true)
    Optional<ExReviewProjection> findDetailsById(@Param("reviewId") Long reviewId, @Param("userId") Long userId);

} 