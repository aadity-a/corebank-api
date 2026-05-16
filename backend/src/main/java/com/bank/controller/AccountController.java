package com.bank.controller;

import com.bank.entity.Account;
import com.bank.service.AccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/create")
    public ResponseEntity<Account> createAccount(Authentication authentication) {
        // authentication.getName() returns the email (username) from JWT token
        Account account = accountService.createAccount(authentication.getName());
        return new ResponseEntity<>(account, HttpStatus.CREATED);
    }

    @GetMapping("/my-account")
    public ResponseEntity<Account> getMyAccount(Authentication authentication) {
        Account account = accountService.getMyAccount(authentication.getName());
        if (account == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(account, HttpStatus.OK);
    }

    @GetMapping("/balance/{accountNumber}")
    public ResponseEntity<BigDecimal> getBalance(@PathVariable String accountNumber, Authentication authentication) {
        BigDecimal balance = accountService.getBalance(accountNumber, authentication.getName());
        return new ResponseEntity<>(balance, HttpStatus.OK);
    }
}
