package com.cctrs.backend.controller;

import com.cctrs.backend.dto.ApiResponse;
import com.cctrs.backend.model.Question;
import com.cctrs.backend.repository.QuestionRepository;
import com.cctrs.backend.service.EmailService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class QuestionController {

    private final QuestionRepository questionRepository;
    private final EmailService emailService;

    public QuestionController(QuestionRepository questionRepository, EmailService emailService) {
        this.questionRepository = questionRepository;
        this.emailService = emailService;
    }

    // PUBLIC — anyone can submit a question
    @PostMapping("/public/questions")
    public ApiResponse<Question> submitQuestion(@RequestBody Question question) {
        if (question.getEmail() == null || question.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (question.getQuestion() == null || question.getQuestion().isBlank()) {
            throw new IllegalArgumentException("Question is required");
        }
        Question saved = questionRepository.save(question);
        return ApiResponse.success("Question submitted successfully", saved);
    }

    // PUBLIC — user checks their own questions by email
    @GetMapping("/public/questions")
    public ApiResponse<List<Question>> getMyQuestions(@RequestParam String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        List<Question> questions = questionRepository.findByEmail(email.trim().toLowerCase());
        return ApiResponse.success("Questions fetched", questions);
    }

    // ADMIN — get all questions
    @GetMapping("/admin/questions")
    public ApiResponse<List<Question>> getAllQuestions() {
        return ApiResponse.success("All questions", questionRepository.findAll());
    }

    // ADMIN — answer a question and send email
    @PostMapping("/admin/questions/{id}/answer")
    public ApiResponse<String> answerQuestion(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String answer = body.get("answer");
        if (answer == null || answer.isBlank()) {
            throw new IllegalArgumentException("Answer is required");
        }
        Question question = questionRepository.findById(id);
        if (question == null) {
            throw new IllegalArgumentException("Question not found");
        }
        questionRepository.answerQuestion(id, answer);
        // Send email to user
        emailService.sendQuestionAnswerEmail(question.getEmail(), question.getName(), question.getQuestion(), answer);
        return ApiResponse.success("Answer sent successfully", null);
    }
}
