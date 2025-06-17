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
            rp.image_url AS reviewImage,
            u.name AS authorName,
            rr.overall_score AS authorRating,
            r.title AS reviewTitle,
            rest.name AS restaurantName,
            r.content_json AS contentJson,
            r.created_at AS reviewDate,
            rest.cuisine_type AS cuisineType,
            rs.total_views AS viewCount
        FROM reviews r
        JOIN restaurants rest ON r.restaurant_id = rest.id
        JOIN review_ratings rr ON rr.review_id = r.id
        JOIN review_photos rp ON rp.review_id = r.id
        JOIN review_stats rs ON rs.review_id = r.id
        JOIN users u ON r.user_id = u.id
        WHERE r.status = 'published'
        AND (:search IS NULL OR r.title LIKE CONCAT('%', :search, '%') OR rest.name LIKE CONCAT('%', :search, '%'))
        ORDER BY r.created_at DESC
        LIMIT :limit OFFSET :offset
    """, nativeQuery = true)
    List<ExReviewProjection> findLatestReviews(
            @Param("limit") int limit,
            @Param("offset") int offset,
            @Param("search") String search);

} 