package com.bank.service;

import com.bank.entity.Account;
import com.bank.entity.User;
import com.bank.repository.AccountRepository;
import com.bank.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountService(AccountRepository accountRepository, UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    public Account createAccount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Account account = new Account();
        account.setUser(user);
        // Generate a random 10-digit account number for simplicity
        account.setAccountNumber(String.valueOf(Math.abs(UUID.randomUUID().getMostSignificantBits())).substring(0, 10));
        account.setBalance(BigDecimal.ZERO);

        return accountRepository.save(account);
    }

    public BigDecimal getBalance(String accountNumber, String userEmail) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        if (!account.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        
        return account.getBalance();
    }

    public Account getMyAccount(String userEmail) {
        return accountRepository.findFirstByUser_Email(userEmail).orElse(null);
    }
}
