package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.dto.ExReviewProjection;
import com.example.demo.entity.User;

@Repository
public interface ExReviewRepository extends JpaRepository<User, Long> {

    @Query(value = """
        SELECT
            r.id as reviewId,
            rp.image as image,
            u.name AS authorName,
            u.avatar_url AS authorAvatar,
            rr.overall_score AS authorRating,
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
        LEFT JOIN review_photos rp ON rp.review_id = r.id AND rp.id = (SELECT MIN(id) FROM review_photos WHERE review_id = r.id)
        LEFT JOIN review_stats rs ON rs.review_id = r.id
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN user_favorites uf ON uf.target_id = r.id AND uf.target_type = 'review' AND uf.user_id = :userId
        WHERE r.status = 'published'
        AND (:search IS NULL OR r.title LIKE CONCAT('%', :search, '%') OR rest.name LIKE CONCAT('%', :search, '%'))
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

} 