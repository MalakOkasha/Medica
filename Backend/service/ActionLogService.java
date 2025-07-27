package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.repository.ActionLogRepository;
import com.example.demo.model.ActionLog;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActionLogService {

    @Autowired
    private ActionLogRepository actionLogRepository;

    private static final Logger logger = LoggerFactory.getLogger(ActionLogService.class);
    public void logAction(String action, String details, String username, Long userId) {
        try {
            // Create the ActionLog entity
            ActionLog log = new ActionLog();
            log.setAction(action);
            log.setDetails(details);
            log.setUsername(username);
            log.setUserId(userId); // Set the user ID
            log.setTimestamp(LocalDateTime.now());

            // Save the entity - Hibernate will automatically assign the ID
            actionLogRepository.save(log);

        } catch (Exception e) {
            // Handle any exceptions that may occur
            logger.error("Error saving action log: {}", e.getMessage());
            throw new RuntimeException("Error saving action log", e);
        }
    }

    // Retrieve all action logs (for displaying in frontend, for example)
    public List<ActionLog> getAllActionLogs() {
        try {
            return actionLogRepository.findAll();
        } catch (Exception e) {
            logger.error("Error retrieving action logs: {}", e.getMessage());
            throw new RuntimeException("Error retrieving action logs", e);
        }
    }

    // Retrieve action logs for a specific user
    public List<ActionLog> getActionLogsByUser(String username) {
        try {
            return actionLogRepository.findByUsername(username);
        } catch (Exception e) {
            logger.error("Error retrieving action logs for user {}: {}", username, e.getMessage());
            throw new RuntimeException("Error retrieving action logs for user", e);
        }
    }
}
