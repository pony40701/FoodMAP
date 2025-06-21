package com.example.demo.service;

import java.io.IOException;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    public byte[] store(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("無法儲存空檔案");
            }
            return file.getBytes();
        } catch (IOException e) {
            throw new RuntimeException("檔案讀取失敗", e);
        }
    }
}
