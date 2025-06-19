package com.example.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private final Path uploadDir = Paths.get("uploads");
    private final String baseUrl = "http://localhost:8080";

    public String storeFile(MultipartFile file) {
        try {
            // 確保目標目錄存在
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filepath = this.uploadDir.resolve(filename);
            Files.write(filepath, file.getBytes());
            return baseUrl + "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("檔案儲存失敗", e);
        }
    }
}
