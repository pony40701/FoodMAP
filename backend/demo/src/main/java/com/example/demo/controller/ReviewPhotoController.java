package com.example.demo.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.ReviewPhoto;
import com.example.demo.repository.ReviewPhotoRepository;

@RestController
@RequestMapping("/api/reviews/photos")
@CrossOrigin(
    origins = {"http://127.0.0.1:5500", "http://localhost:5500"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET},
    allowCredentials = "true",
    maxAge = 3600
)
public class ReviewPhotoController {

    @Autowired
    private ReviewPhotoRepository reviewPhotoRepository;

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getReviewPhoto(@PathVariable Integer id) {
        Optional<ReviewPhoto> reviewPhotoOptional = reviewPhotoRepository.findById(id);

        if (reviewPhotoOptional.isPresent()) {
            ReviewPhoto reviewPhoto = reviewPhotoOptional.get();
            if (reviewPhoto.getImage() != null && reviewPhoto.getImage().length > 0) {
                // For now, we assume JPEG. A more robust solution would store content type in the DB.
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG) 
                        .body(reviewPhoto.getImage());
            }
        }
        return ResponseEntity.notFound().build();
    }
} 