package com.bank.controller;

import com.bank.dto.TransactionDto;
import com.bank.entity.Transaction;
import com.bank.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/deposit")
    public ResponseEntity<String> deposit(@RequestBody TransactionDto transactionDto, Authentication authentication) {
        String response = transactionService.deposit(transactionDto, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<String> withdraw(@RequestBody TransactionDto transactionDto, Authentication authentication) {
        String response = transactionService.withdraw(transactionDto, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/transfer")
    public ResponseEntity<String> transfer(@RequestBody TransactionDto transactionDto, Authentication authentication) {
        String response = transactionService.transfer(transactionDto, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/history/{accountNumber}")
    public ResponseEntity<List<Transaction>> getHistory(@PathVariable String accountNumber, Authentication authentication) {
        List<Transaction> history = transactionService.getTransactionHistory(accountNumber, authentication.getName());
        return new ResponseEntity<>(history, HttpStatus.OK);
    }
}
