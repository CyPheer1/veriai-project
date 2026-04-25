package com.example.backendjava.service;

import com.example.backendjava.entity.SubmissionSourceType;
import com.example.backendjava.entity.UserPlan;
import com.example.backendjava.exception.ApiException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
public class FileExtractionService {

    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024L * 1024L;

    public ExtractedContent extractText(MultipartFile file, UserPlan userPlan) {
        if (userPlan != UserPlan.PRO) {
            throw new ApiException(HttpStatus.FORBIDDEN, "File upload is only available for PRO plan users");
        }

        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is required");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "File exceeds 10MB limit");
        }

        String filename = file.getOriginalFilename() == null ? "uploaded-file" : file.getOriginalFilename();
        String lowerName = filename.toLowerCase(Locale.ROOT);

        SubmissionSourceType sourceType;
        String text;

        try {
            if (lowerName.endsWith(".pdf")) {
                sourceType = SubmissionSourceType.PDF;
                text = extractPdfText(file);
            } else if (lowerName.endsWith(".docx")) {
                sourceType = SubmissionSourceType.DOCX;
                text = extractDocxText(file);
            } else {
                throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only PDF and DOCX files are supported");
            }
        } catch (IOException ex) {
            log.warn("File extraction failed: {}", ex.getMessage());
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Unable to extract text from uploaded file");
        }

        String normalizedText = text == null ? "" : text.trim();
        if (normalizedText.isBlank()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "The uploaded file does not contain extractable text");
        }

        return new ExtractedContent(sourceType, filename, normalizedText);
    }

    private String extractPdfText(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractDocxText(MultipartFile file) throws IOException {
        try (InputStream in = file.getInputStream();
             XWPFDocument document = new XWPFDocument(in);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }
}
