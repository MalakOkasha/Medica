package com.example.demo.controller;

import com.example.demo.model.ActionLog;
import com.example.demo.service.ActionLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/action-logs")
public class ActionLogController {

    @Autowired
    private final ActionLogService actionLogService;

    @Autowired
    public ActionLogController(ActionLogService actionLogService) {
        this.actionLogService = actionLogService;
    }

    // Retrieve all action logs
    @GetMapping
    public ResponseEntity<List<ActionLog>> getAllActionLogs() {
        try {
            System.out.println("GET request received for /api/action-logs");
            List<ActionLog> actionLogs = actionLogService.getAllActionLogs();
            return ResponseEntity.ok(actionLogs);
        } catch (RuntimeException e) {
            // Handle the exception and return an error response
            return ResponseEntity.status(500).body(null);
        }
    }

    // Retrieve action logs by specific username
    @GetMapping("/user/{username}")
    public ResponseEntity<List<ActionLog>> getActionLogsByUser(@PathVariable String username) {
        try {
            List<ActionLog> actionLogs = actionLogService.getActionLogsByUser(username);
            return ResponseEntity.ok(actionLogs);
        } catch (RuntimeException e) {
            // Handle the exception and return an error response
            return ResponseEntity.status(500).body(null);
        }
    }
}
