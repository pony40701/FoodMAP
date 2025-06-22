package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ExReviewDTO;
import com.example.demo.service.ExReviewService;

@RestController
@RequestMapping("/api")
public class ExReviewController {

    @Autowired
    private ExReviewService exReviewService;

    @GetMapping("/ex-reviews")
    public ResponseEntity<List<ExReviewDTO>> getLatestReviews(
            @RequestParam(defaultValue = "6") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> cuisineTypes,
            @RequestParam(required = false) Long userId) {
        List<ExReviewDTO> reviews = exReviewService.getLatestReviews(limit, offset, sort, search, cuisineTypes, userId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/ex-reviews/{id}")
    public ResponseEntity<ExReviewDTO> getReviewById(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        ExReviewDTO review = exReviewService.getReviewById(id, userId);
        if (review != null) {
            return ResponseEntity.ok(review);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
} 